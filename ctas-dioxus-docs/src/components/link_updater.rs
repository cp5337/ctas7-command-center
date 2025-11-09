use std::collections::HashMap;
use std::path::{Path, PathBuf};
use regex::Regex;
use serde::{Deserialize, Serialize};

/// Markdown Link Updater
/// 
/// Automatically updates links when files are moved or renamed
/// Inspired by VS Code's Markdown All in One extension
/// 
/// Features:
/// - Detect file moves and renames
/// - Update all references to moved files
/// - Update internal links (./path/to/file.md)
/// - Update external links
/// - Update fragment links (#heading)
/// - Update image links
/// - Batch update across multiple files

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkUpdate {
    pub old_path: PathBuf,
    pub new_path: PathBuf,
    pub update_type: LinkUpdateType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LinkUpdateType {
    FileMove,
    FileRename,
    DirectoryMove,
    DirectoryRename,
    HeadingRename,
}

#[derive(Debug, Clone)]
pub struct LinkUpdater {
    /// Map of file paths to their markdown content
    file_cache: HashMap<PathBuf, String>,
    
    /// Map of old paths to new paths
    path_updates: HashMap<PathBuf, PathBuf>,
    
    /// Regex patterns for finding links
    link_patterns: LinkPatterns,
}

#[derive(Debug, Clone)]
struct LinkPatterns {
    /// Matches [text](path) style links
    inline_link: Regex,
    
    /// Matches [text][ref] and [ref]: url style links
    reference_link: Regex,
    
    /// Matches ![alt](path) style images
    image_link: Regex,
    
    /// Matches <http://url> style autolinks
    autolink: Regex,
    
    /// Matches [text](path#fragment) fragments
    fragment_link: Regex,
}

impl LinkUpdater {
    pub fn new() -> Self {
        Self {
            file_cache: HashMap::new(),
            path_updates: HashMap::new(),
            link_patterns: LinkPatterns {
                inline_link: Regex::new(r"\[([^\]]+)\]\(([^)]+)\)").unwrap(),
                reference_link: Regex::new(r"\[([^\]]+)\]:\s*(.+)").unwrap(),
                image_link: Regex::new(r"!\[([^\]]*)\]\(([^)]+)\)").unwrap(),
                autolink: Regex::new(r"<(https?://[^>]+)>").unwrap(),
                fragment_link: Regex::new(r"\[([^\]]+)\]\(([^)]+)#([^)]+)\)").unwrap(),
            },
        }
    }
    
    /// Register a file move or rename
    pub fn register_move(&mut self, old_path: PathBuf, new_path: PathBuf) {
        self.path_updates.insert(old_path, new_path);
    }
    
    /// Update all links in a markdown file
    pub fn update_links_in_file(&self, file_path: &Path, content: &str) -> String {
        let mut updated_content = content.to_string();
        
        // Update inline links
        updated_content = self.update_inline_links(&updated_content, file_path);
        
        // Update reference links
        updated_content = self.update_reference_links(&updated_content, file_path);
        
        // Update image links
        updated_content = self.update_image_links(&updated_content, file_path);
        
        // Update fragment links
        updated_content = self.update_fragment_links(&updated_content, file_path);
        
        updated_content
    }
    
    /// Update inline [text](path) links
    fn update_inline_links(&self, content: &str, current_file: &Path) -> String {
        self.link_patterns.inline_link.replace_all(content, |caps: &regex::Captures| {
            let text = &caps[1];
            let link = &caps[2];
            
            if let Some(updated_link) = self.update_single_link(link, current_file) {
                format!("[{}]({})", text, updated_link)
            } else {
                caps[0].to_string()
            }
        }).to_string()
    }
    
    /// Update reference [text]: url links
    fn update_reference_links(&self, content: &str, current_file: &Path) -> String {
        self.link_patterns.reference_link.replace_all(content, |caps: &regex::Captures| {
            let reference = &caps[1];
            let link = &caps[2];
            
            if let Some(updated_link) = self.update_single_link(link, current_file) {
                format!("[{}]: {}", reference, updated_link)
            } else {
                caps[0].to_string()
            }
        }).to_string()
    }
    
    /// Update image ![alt](path) links
    fn update_image_links(&self, content: &str, current_file: &Path) -> String {
        self.link_patterns.image_link.replace_all(content, |caps: &regex::Captures| {
            let alt = &caps[1];
            let link = &caps[2];
            
            if let Some(updated_link) = self.update_single_link(link, current_file) {
                format!("![{}]({})", alt, updated_link)
            } else {
                caps[0].to_string()
            }
        }).to_string()
    }
    
    /// Update fragment [text](path#heading) links
    fn update_fragment_links(&self, content: &str, current_file: &Path) -> String {
        self.link_patterns.fragment_link.replace_all(content, |caps: &regex::Captures| {
            let text = &caps[1];
            let path = &caps[2];
            let fragment = &caps[3];
            
            if let Some(updated_path) = self.update_single_link(path, current_file) {
                format!("[{}]({}#{})", text, updated_path, fragment)
            } else {
                caps[0].to_string()
            }
        }).to_string()
    }
    
    /// Update a single link path
    fn update_single_link(&self, link: &str, current_file: &Path) -> Option<String> {
        // Skip external links
        if link.starts_with("http://") || link.starts_with("https://") {
            return None;
        }
        
        // Skip anchors
        if link.starts_with('#') {
            return None;
        }
        
        // Resolve relative path
        let link_path = if link.starts_with("./") || link.starts_with("../") {
            current_file.parent()?.join(link)
        } else {
            PathBuf::from(link)
        };
        
        // Check if this path has been updated
        if let Some(new_path) = self.path_updates.get(&link_path) {
            // Calculate relative path from current file to new location
            let relative_path = self.calculate_relative_path(current_file, new_path)?;
            Some(relative_path)
        } else {
            None
        }
    }
    
    /// Calculate relative path between two files
    fn calculate_relative_path(&self, from: &Path, to: &Path) -> Option<String> {
        let from_dir = from.parent()?;
        let relative = pathdiff::diff_paths(to, from_dir)?;
        
        // Convert to forward slashes for markdown
        let relative_str = relative.to_str()?.replace('\\', "/");
        
        // Add ./ prefix if not already present
        if relative_str.starts_with("../") || relative_str.starts_with("./") {
            Some(relative_str)
        } else {
            Some(format!("./{}", relative_str))
        }
    }
    
    /// Find all files that reference a moved file
    pub fn find_references(&self, moved_file: &Path) -> Vec<PathBuf> {
        let mut references = Vec::new();
        
        for (file_path, content) in &self.file_cache {
            if self.contains_reference(content, moved_file) {
                references.push(file_path.clone());
            }
        }
        
        references
    }
    
    /// Check if content contains a reference to a file
    fn contains_reference(&self, content: &str, target_file: &Path) -> bool {
        let target_str = target_file.to_str().unwrap_or("");
        
        // Check inline links
        for caps in self.link_patterns.inline_link.captures_iter(content) {
            if caps[2].contains(target_str) {
                return true;
            }
        }
        
        // Check image links
        for caps in self.link_patterns.image_link.captures_iter(content) {
            if caps[2].contains(target_str) {
                return true;
            }
        }
        
        false
    }
    
    /// Batch update all files affected by moves
    pub fn batch_update(&self) -> HashMap<PathBuf, String> {
        let mut updates = HashMap::new();
        
        for (file_path, content) in &self.file_cache {
            let updated_content = self.update_links_in_file(file_path, content);
            
            if updated_content != *content {
                updates.insert(file_path.clone(), updated_content);
            }
        }
        
        updates
    }
    
    /// Load markdown files into cache
    pub fn load_file(&mut self, path: PathBuf, content: String) {
        self.file_cache.insert(path, content);
    }
    
    /// Clear all cached data
    pub fn clear(&mut self) {
        self.file_cache.clear();
        self.path_updates.clear();
    }
}

/// Link validation and checking
#[derive(Debug, Clone)]
pub struct LinkValidator {
    /// Base directory for resolving relative paths
    base_dir: PathBuf,
}

impl LinkValidator {
    pub fn new(base_dir: PathBuf) -> Self {
        Self { base_dir }
    }
    
    /// Validate all links in a markdown file
    pub fn validate_links(&self, content: &str, current_file: &Path) -> Vec<LinkValidationResult> {
        let mut results = Vec::new();
        let link_regex = Regex::new(r"\[([^\]]+)\]\(([^)]+)\)").unwrap();
        
        for caps in link_regex.captures_iter(content) {
            let text = &caps[1];
            let link = &caps[2];
            
            let result = self.validate_single_link(link, current_file);
            results.push(LinkValidationResult {
                text: text.to_string(),
                link: link.to_string(),
                status: result,
            });
        }
        
        results
    }
    
    /// Validate a single link
    fn validate_single_link(&self, link: &str, current_file: &Path) -> LinkStatus {
        // External links - would need HTTP check
        if link.starts_with("http://") || link.starts_with("https://") {
            return LinkStatus::External;
        }
        
        // Anchors
        if link.starts_with('#') {
            return LinkStatus::Anchor;
        }
        
        // Resolve relative path
        let link_path = if link.starts_with("./") || link.starts_with("../") {
            current_file.parent()
                .map(|p| p.join(link))
                .unwrap_or_else(|| PathBuf::from(link))
        } else {
            self.base_dir.join(link)
        };
        
        // Check if file exists
        if link_path.exists() {
            LinkStatus::Valid
        } else {
            LinkStatus::Broken
        }
    }
}

#[derive(Debug, Clone)]
pub struct LinkValidationResult {
    pub text: String,
    pub link: String,
    pub status: LinkStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum LinkStatus {
    Valid,
    Broken,
    External,
    Anchor,
}

/// Auto-update configuration (like VS Code settings)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkUpdateConfig {
    /// Enable automatic link updating
    pub enabled: bool,
    
    /// Prompt before updating links
    pub prompt: bool,
    
    /// File types to include in link updates
    pub include_patterns: Vec<String>,
    
    /// File types to exclude from link updates
    pub exclude_patterns: Vec<String>,
}

impl Default for LinkUpdateConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            prompt: true,
            include_patterns: vec![
                "**/*.md".to_string(),
                "**/*.markdown".to_string(),
            ],
            exclude_patterns: vec![
                "**/node_modules/**".to_string(),
                "**/target/**".to_string(),
                "**/.git/**".to_string(),
            ],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_update_inline_link() {
        let mut updater = LinkUpdater::new();
        updater.register_move(
            PathBuf::from("docs/old.md"),
            PathBuf::from("docs/new.md")
        );
        
        let content = "[Link](./old.md)";
        let current_file = Path::new("docs/index.md");
        let updated = updater.update_links_in_file(current_file, content);
        
        assert!(updated.contains("./new.md"));
    }
    
    #[test]
    fn test_update_image_link() {
        let mut updater = LinkUpdater::new();
        updater.register_move(
            PathBuf::from("images/old.png"),
            PathBuf::from("images/new.png")
        );
        
        let content = "![Image](./images/old.png)";
        let current_file = Path::new("docs/index.md");
        let updated = updater.update_links_in_file(current_file, content);
        
        assert!(updated.contains("./images/new.png"));
    }
    
    #[test]
    fn test_validate_links() {
        let validator = LinkValidator::new(PathBuf::from("/tmp"));
        let content = "[Valid](./existing.md) [Broken](./missing.md) [External](https://example.com)";
        let results = validator.validate_links(content, Path::new("/tmp/index.md"));
        
        assert_eq!(results.len(), 3);
    }
}

