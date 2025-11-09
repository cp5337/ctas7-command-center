/// Markdown Table Prettifier
/// Makes tables more readable for humans, compatible with Markdown writer plugin
use regex::Regex;

#[derive(Debug, Clone)]
pub struct TablePrettifier {
    remove_trailing_border: bool,
    right_pad_last_column: bool,
}

impl Default for TablePrettifier {
    fn default() -> Self {
        Self {
            remove_trailing_border: true,
            right_pad_last_column: false,
        }
    }
}

impl TablePrettifier {
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Prettify all tables in markdown content
    pub fn prettify(&self, content: &str) -> String {
        let mut result = String::new();
        let mut in_code_block = false;
        let mut in_ignore_block = false;
        let mut current_table: Vec<String> = Vec::new();
        let mut indent = String::new();
        
        for line in content.lines() {
            // Check for code blocks
            if line.trim_start().starts_with("```") {
                in_code_block = !in_code_block;
                result.push_str(line);
                result.push('\n');
                continue;
            }
            
            // Check for ignore blocks
            if line.contains("<!-- markdown-table-prettify-ignore-start -->") {
                in_ignore_block = true;
                result.push_str(line);
                result.push('\n');
                continue;
            }
            if line.contains("<!-- markdown-table-prettify-ignore-end -->") {
                in_ignore_block = false;
                result.push_str(line);
                result.push('\n');
                continue;
            }
            
            // Skip if in code or ignore block
            if in_code_block || in_ignore_block {
                result.push_str(line);
                result.push('\n');
                continue;
            }
            
            // Detect table rows (must contain |)
            let trimmed = line.trim_start();
            if trimmed.contains('|') && !trimmed.starts_with("<!--") {
                // Capture indentation
                if current_table.is_empty() {
                    indent = line.chars()
                        .take_while(|c| c.is_whitespace())
                        .collect();
                }
                current_table.push(line.to_string());
            } else {
                // End of table - prettify and flush
                if !current_table.is_empty() {
                    let prettified = self.prettify_table(&current_table, &indent);
                    result.push_str(&prettified);
                    current_table.clear();
                    indent.clear();
                }
                result.push_str(line);
                result.push('\n');
            }
        }
        
        // Handle trailing table
        if !current_table.is_empty() {
            let prettified = self.prettify_table(&current_table, &indent);
            result.push_str(&prettified);
        }
        
        result
    }
    
    /// Prettify a single table
    fn prettify_table(&self, lines: &[String], indent: &str) -> String {
        if lines.is_empty() {
            return String::new();
        }
        
        // Parse table structure
        let rows: Vec<Vec<String>> = lines
            .iter()
            .map(|line| self.parse_row(line))
            .collect();
        
        if rows.is_empty() {
            return lines.join("\n") + "\n";
        }
        
        // Determine column count
        let col_count = rows.iter().map(|r| r.len()).max().unwrap_or(0);
        
        // Calculate column widths
        let mut col_widths = vec![0; col_count];
        for row in &rows {
            for (i, cell) in row.iter().enumerate() {
                col_widths[i] = col_widths[i].max(cell.len());
            }
        }
        
        // Detect if table has borders
        let has_leading_border = lines[0].trim_start().starts_with('|');
        let has_trailing_border = lines[0].trim_end().ends_with('|');
        
        // Detect alignment row (second row with dashes and colons)
        let alignment_row_idx = rows.iter().position(|row| {
            row.iter().all(|cell| {
                let trimmed = cell.trim();
                !trimmed.is_empty() && trimmed.chars().all(|c| c == '-' || c == ':')
            })
        });
        
        // Parse alignment
        let alignments = if let Some(idx) = alignment_row_idx {
            self.parse_alignments(&rows[idx])
        } else {
            vec![Alignment::Left; col_count]
        };
        
        // Build prettified table
        let mut result = String::new();
        
        for (row_idx, row) in rows.iter().enumerate() {
            result.push_str(indent);
            
            if has_leading_border {
                result.push('|');
            }
            
            for (col_idx, cell) in row.iter().enumerate() {
                let width = if col_idx == col_count - 1 && !self.right_pad_last_column {
                    cell.len() // Don't pad last column
                } else {
                    col_widths[col_idx]
                };
                
                let aligned = if Some(row_idx) == alignment_row_idx {
                    // Alignment row - preserve colons
                    self.align_separator(cell, width, &alignments[col_idx])
                } else {
                    // Data row
                    self.align_cell(cell, width, &alignments[col_idx])
                };
                
                result.push(' ');
                result.push_str(&aligned);
                result.push(' ');
                
                if col_idx < col_count - 1 {
                    result.push('|');
                }
            }
            
            if has_trailing_border || (has_leading_border && self.remove_trailing_border) {
                result.push('|');
            }
            
            result.push('\n');
        }
        
        result
    }
    
    /// Parse a table row into cells
    fn parse_row(&self, line: &str) -> Vec<String> {
        let trimmed = line.trim();
        let content = trimmed.trim_start_matches('|').trim_end_matches('|');
        
        content
            .split('|')
            .map(|cell| cell.trim().to_string())
            .collect()
    }
    
    /// Parse alignment from separator row
    fn parse_alignments(&self, row: &[String]) -> Vec<Alignment> {
        row.iter()
            .map(|cell| {
                let trimmed = cell.trim();
                let starts_colon = trimmed.starts_with(':');
                let ends_colon = trimmed.ends_with(':');
                
                match (starts_colon, ends_colon) {
                    (true, true) => Alignment::Center,
                    (false, true) => Alignment::Right,
                    _ => Alignment::Left,
                }
            })
            .collect()
    }
    
    /// Align cell content
    fn align_cell(&self, content: &str, width: usize, alignment: &Alignment) -> String {
        let content_len = content.len();
        if content_len >= width {
            return content.to_string();
        }
        
        let padding = width - content_len;
        
        match alignment {
            Alignment::Left => {
                format!("{}{}", content, " ".repeat(padding))
            }
            Alignment::Right => {
                format!("{}{}", " ".repeat(padding), content)
            }
            Alignment::Center => {
                let left_pad = padding / 2;
                let right_pad = padding - left_pad;
                format!("{}{}{}", " ".repeat(left_pad), content, " ".repeat(right_pad))
            }
        }
    }
    
    /// Align separator row (preserve colons)
    fn align_separator(&self, content: &str, width: usize, alignment: &Alignment) -> String {
        let trimmed = content.trim();
        let starts_colon = trimmed.starts_with(':');
        let ends_colon = trimmed.ends_with(':');
        
        let dash_count = width.saturating_sub(
            if starts_colon { 1 } else { 0 } + if ends_colon { 1 } else { 0 }
        );
        
        let mut result = String::new();
        if starts_colon {
            result.push(':');
        }
        result.push_str(&"-".repeat(dash_count));
        if ends_colon {
            result.push(':');
        }
        
        result
    }
}

#[derive(Debug, Clone, Copy)]
enum Alignment {
    Left,
    Center,
    Right,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_basic_table() {
        let input = "| Name | Age | City |\n|---|---|---|\n| Alice | 30 | NYC |\n| Bob | 25 | LA |";
        let prettifier = TablePrettifier::new();
        let result = prettifier.prettify(input);
        
        assert!(result.contains("Alice"));
        assert!(result.contains("NYC"));
    }
    
    #[test]
    fn test_alignment() {
        let input = "| Left | Center | Right |\n|:---|:---:|---:|\n| A | B | C |";
        let prettifier = TablePrettifier::new();
        let result = prettifier.prettify(input);
        
        assert!(result.contains(":---"));
        assert!(result.contains(":---:"));
        assert!(result.contains("---:"));
    }
}

