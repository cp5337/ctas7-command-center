// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Microsoft Office Export from Google Workspace
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Export Google Docs → Word (.docx)
// Export Google Sheets → Excel (.xlsx)
// Export Google Slides → PowerPoint (.pptx)
//
// For DOD-compliant EA artifacts and business proposals
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Clone)]
pub struct MicrosoftOfficeExport {
    client: Client,
    access_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportRequest {
    pub file_id: String,
    pub file_type: GoogleFileType,
    pub export_format: MicrosoftFormat,
    pub output_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum GoogleFileType {
    Doc,
    Sheet,
    Slide,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum MicrosoftFormat {
    Word,      // .docx
    Excel,     // .xlsx
    PowerPoint, // .pptx
    PDF,       // .pdf (bonus)
}

impl GoogleFileType {
    fn mime_type(&self) -> &'static str {
        match self {
            GoogleFileType::Doc => "application/vnd.google-apps.document",
            GoogleFileType::Sheet => "application/vnd.google-apps.spreadsheet",
            GoogleFileType::Slide => "application/vnd.google-apps.presentation",
        }
    }
}

impl MicrosoftFormat {
    fn mime_type(&self) -> &'static str {
        match self {
            MicrosoftFormat::Word => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            MicrosoftFormat::Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            MicrosoftFormat::PowerPoint => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            MicrosoftFormat::PDF => "application/pdf",
        }
    }

    fn extension(&self) -> &'static str {
        match self {
            MicrosoftFormat::Word => "docx",
            MicrosoftFormat::Excel => "xlsx",
            MicrosoftFormat::PowerPoint => "pptx",
            MicrosoftFormat::PDF => "pdf",
        }
    }
}

impl MicrosoftOfficeExport {
    pub fn new(access_token: String) -> Self {
        let client = Client::new();
        Self {
            client,
            access_token,
        }
    }

    /// Export Google Doc to Word
    pub async fn export_doc_to_word(&self, file_id: &str, output_path: &str) -> Result<String> {
        self.export_file(
            file_id,
            GoogleFileType::Doc,
            MicrosoftFormat::Word,
            output_path,
        )
        .await
    }

    /// Export Google Sheet to Excel
    pub async fn export_sheet_to_excel(&self, file_id: &str, output_path: &str) -> Result<String> {
        self.export_file(
            file_id,
            GoogleFileType::Sheet,
            MicrosoftFormat::Excel,
            output_path,
        )
        .await
    }

    /// Export Google Slides to PowerPoint
    pub async fn export_slides_to_powerpoint(&self, file_id: &str, output_path: &str) -> Result<String> {
        self.export_file(
            file_id,
            GoogleFileType::Slide,
            MicrosoftFormat::PowerPoint,
            output_path,
        )
        .await
    }

    /// Generic export function
    async fn export_file(
        &self,
        file_id: &str,
        _file_type: GoogleFileType,
        format: MicrosoftFormat,
        output_path: &str,
    ) -> Result<String> {
        let url = format!(
            "https://www.googleapis.com/drive/v3/files/{}/export?mimeType={}",
            file_id,
            urlencoding::encode(format.mime_type())
        );

        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.access_token))
            .send()
            .await
            .context("Failed to export file from Google Drive")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Google Drive export failed: {}", error_text);
        }

        let bytes = response.bytes().await?;

        // Ensure output directory exists
        if let Some(parent) = Path::new(output_path).parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        // Write to file
        let mut file = File::create(output_path).await?;
        file.write_all(&bytes).await?;

        Ok(output_path.to_string())
    }

    /// Batch export all documents in a folder
    pub async fn export_folder(
        &self,
        folder_id: &str,
        output_dir: &str,
    ) -> Result<Vec<String>> {
        // List all files in folder
        let url = format!(
            "https://www.googleapis.com/drive/v3/files?q='{}'+in+parents",
            folder_id
        );

        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.access_token))
            .send()
            .await
            .context("Failed to list folder contents")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Failed to list folder: {}", error_text);
        }

        let files: serde_json::Value = response.json().await?;
        let mut exported_files = Vec::new();

        if let Some(files_array) = files["files"].as_array() {
            for file in files_array {
                let file_id = file["id"].as_str().unwrap_or("");
                let file_name = file["name"].as_str().unwrap_or("untitled");
                let mime_type = file["mimeType"].as_str().unwrap_or("");

                let (file_type, format) = match mime_type {
                    "application/vnd.google-apps.document" => {
                        (Some(GoogleFileType::Doc), MicrosoftFormat::Word)
                    }
                    "application/vnd.google-apps.spreadsheet" => {
                        (Some(GoogleFileType::Sheet), MicrosoftFormat::Excel)
                    }
                    "application/vnd.google-apps.presentation" => {
                        (Some(GoogleFileType::Slide), MicrosoftFormat::PowerPoint)
                    }
                    _ => (None, MicrosoftFormat::PDF), // Skip or export as PDF
                };

                if let Some(ft) = file_type {
                    let output_path = format!(
                        "{}/{}.{}",
                        output_dir,
                        file_name,
                        format.extension()
                    );

                    match self.export_file(file_id, ft, format, &output_path).await {
                        Ok(path) => exported_files.push(path),
                        Err(e) => eprintln!("Failed to export {}: {}", file_name, e),
                    }
                }
            }
        }

        Ok(exported_files)
    }

    /// Export DOD EA artifact package (Word + PowerPoint + Excel)
    pub async fn export_ea_package(
        &self,
        doc_id: &str,
        slides_id: &str,
        spreadsheet_id: Option<&str>,
        output_dir: &str,
    ) -> Result<EAPackage> {
        tokio::fs::create_dir_all(output_dir).await?;

        let doc_path = self
            .export_doc_to_word(
                doc_id,
                &format!("{}/EA_Document.docx", output_dir),
            )
            .await?;

        let slides_path = self
            .export_slides_to_powerpoint(
                slides_id,
                &format!("{}/EA_Presentation.pptx", output_dir),
            )
            .await?;

        let spreadsheet_path = if let Some(sheet_id) = spreadsheet_id {
            Some(
                self.export_sheet_to_excel(
                    sheet_id,
                    &format!("{}/EA_Data.xlsx", output_dir),
                )
                .await?,
            )
        } else {
            None
        };

        Ok(EAPackage {
            document: doc_path,
            presentation: slides_path,
            spreadsheet: spreadsheet_path,
            output_directory: output_dir.to_string(),
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EAPackage {
    pub document: String,
    pub presentation: String,
    pub spreadsheet: Option<String>,
    pub output_directory: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mime_types() {
        assert_eq!(
            MicrosoftFormat::Word.mime_type(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        assert_eq!(MicrosoftFormat::Word.extension(), "docx");
    }
}

