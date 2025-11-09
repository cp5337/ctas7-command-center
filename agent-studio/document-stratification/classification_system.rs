// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CTAS-7 Stratified Document Classification System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Prevents mixing of different document types:
// - Technical Documentation
// - BNE Artifacts (Bar Napkin Engineering)
// - White Papers
// - EA Documents (Enterprise Architecture - DOD)
// - Research Papers (Academic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DocumentType {
    /// Technical documentation (API docs, user guides, system manuals)
    TechnicalDocumentation,

    /// Bar Napkin Engineering (informal design docs, architecture sketches)
    BNEArtifact,

    /// White papers (technical analysis, system proposals, thought leadership)
    WhitePaper,

    /// Enterprise Architecture documents (DOD-compliant, C4 diagrams, system specs)
    EADocument,

    /// Research papers (academic publications, peer-reviewed, LaTeX)
    ResearchPaper,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub doc_type: DocumentType,
    pub title: String,
    pub classification: SecurityClassification,
    pub author: String,
    pub version: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub tags: Vec<String>,
    pub project: String,
    pub status: DocumentStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SecurityClassification {
    Unclassified,
    CUI,                    // Controlled Unclassified Information
    Confidential,
    Secret,
    TopSecret,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DocumentStatus {
    Draft,
    InReview,
    Approved,
    Published,
    Archived,
}

impl DocumentType {
    /// Get the Google Drive folder for this document type
    pub fn google_drive_folder(&self) -> &'static str {
        match self {
            DocumentType::TechnicalDocumentation => "CTAS Knowledge Base/Technical Documentation",
            DocumentType::BNEArtifact => "CTAS Knowledge Base/BNE Artifacts",
            DocumentType::WhitePaper => "CTAS Knowledge Base/White Papers",
            DocumentType::EADocument => "CTAS Knowledge Base/EA Documents",
            DocumentType::ResearchPaper => "CTAS Knowledge Base/Research Papers",
        }
    }

    /// Get the local file path for this document type
    pub fn local_path(&self) -> PathBuf {
        PathBuf::from(match self {
            DocumentType::TechnicalDocumentation => "/app/documents/technical",
            DocumentType::BNEArtifact => "/app/documents/bne",
            DocumentType::WhitePaper => "/app/documents/whitepapers",
            DocumentType::EADocument => "/app/documents/ea",
            DocumentType::ResearchPaper => "/app/documents/research",
        })
    }

    /// Get the template system for this document type
    pub fn template_system(&self) -> TemplateSystem {
        match self {
            DocumentType::TechnicalDocumentation => TemplateSystem::Docusaurus,
            DocumentType::BNEArtifact => TemplateSystem::Markdown,
            DocumentType::WhitePaper => TemplateSystem::GoogleDocs,
            DocumentType::EADocument => TemplateSystem::Figma,
            DocumentType::ResearchPaper => TemplateSystem::LaTeX,
        }
    }

    /// Get the export formats for this document type
    pub fn export_formats(&self) -> Vec<ExportFormat> {
        match self {
            DocumentType::TechnicalDocumentation => vec![
                ExportFormat::HTML,
                ExportFormat::Markdown,
                ExportFormat::PDF,
            ],
            DocumentType::BNEArtifact => vec![
                ExportFormat::Markdown,
                ExportFormat::PDF,
                ExportFormat::Mermaid,
            ],
            DocumentType::WhitePaper => vec![
                ExportFormat::PDF,
                ExportFormat::Word,
                ExportFormat::GoogleDoc,
            ],
            DocumentType::EADocument => vec![
                ExportFormat::Word,
                ExportFormat::PowerPoint,
                ExportFormat::PDF,
                ExportFormat::Visio,
            ],
            DocumentType::ResearchPaper => vec![
                ExportFormat::PDF,
                ExportFormat::LaTeX,
                ExportFormat::Arxiv,
            ],
        }
    }

    /// Get the required sections for this document type
    pub fn required_sections(&self) -> Vec<&'static str> {
        match self {
            DocumentType::TechnicalDocumentation => vec![
                "Overview",
                "Installation",
                "Usage",
                "API Reference",
                "Troubleshooting",
            ],
            DocumentType::BNEArtifact => vec![
                "Problem Statement",
                "Proposed Solution",
                "Architecture Sketch",
                "Next Steps",
            ],
            DocumentType::WhitePaper => vec![
                "Executive Summary",
                "Problem Statement",
                "Proposed Solution",
                "Technical Analysis",
                "Implementation",
                "Conclusion",
            ],
            DocumentType::EADocument => vec![
                "System Context",
                "Container View",
                "Component View",
                "Deployment View",
                "Security Architecture",
                "Data Architecture",
            ],
            DocumentType::ResearchPaper => vec![
                "Abstract",
                "Introduction",
                "Related Work",
                "Methodology",
                "Results",
                "Discussion",
                "Conclusion",
                "References",
            ],
        }
    }

    /// Classify document from file path and content
    pub fn classify(path: &PathBuf, content: &str) -> Self {
        let path_str = path.to_string_lossy().to_lowercase();

        // Path-based classification
        if path_str.contains("bne") || path_str.contains("napkin") {
            return DocumentType::BNEArtifact;
        }
        if path_str.contains("whitepaper") || path_str.contains("white_paper") {
            return DocumentType::WhitePaper;
        }
        if path_str.contains("ea") || path_str.contains("enterprise_architecture") {
            return DocumentType::EADocument;
        }
        if path_str.contains("research") || path_str.contains("paper") || path_str.contains("arxiv") {
            return DocumentType::ResearchPaper;
        }

        // Content-based classification
        let content_lower = content.to_lowercase();

        if content_lower.contains("\\documentclass") || content_lower.contains("\\begin{document}") {
            return DocumentType::ResearchPaper;
        }
        if content_lower.contains("c4 model") || content_lower.contains("deployment diagram") {
            return DocumentType::EADocument;
        }
        if content_lower.contains("abstract") && content_lower.contains("methodology") {
            return DocumentType::ResearchPaper;
        }
        if content_lower.contains("api reference") || content_lower.contains("usage:") {
            return DocumentType::TechnicalDocumentation;
        }

        // Default to BNE for informal docs
        DocumentType::BNEArtifact
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TemplateSystem {
    Docusaurus,    // For technical docs
    Markdown,      // For BNE artifacts
    GoogleDocs,    // For white papers
    Figma,         // For EA diagrams
    LaTeX,         // For research papers
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportFormat {
    HTML,
    Markdown,
    PDF,
    Word,
    PowerPoint,
    GoogleDoc,
    Mermaid,
    Visio,
    LaTeX,
    Arxiv,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentClassifier {
    pub metadata: DocumentMetadata,
    pub content: String,
    pub source_path: Option<PathBuf>,
}

impl DocumentClassifier {
    pub fn new(content: String, source_path: Option<PathBuf>) -> Self {
        let doc_type = if let Some(ref path) = source_path {
            DocumentType::classify(path, &content)
        } else {
            DocumentType::classify(&PathBuf::from("unknown.md"), &content)
        };

        Self {
            metadata: DocumentMetadata {
                doc_type,
                title: "Untitled".to_string(),
                classification: SecurityClassification::Unclassified,
                author: "CTAS Agent Studio".to_string(),
                version: "1.0.0".to_string(),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
                tags: vec![],
                project: "CTAS-7".to_string(),
                status: DocumentStatus::Draft,
            },
            content,
            source_path,
        }
    }

    pub fn classify_and_route(&self) -> DocumentRoute {
        DocumentRoute {
            doc_type: self.metadata.doc_type.clone(),
            google_drive_folder: self.metadata.doc_type.google_drive_folder().to_string(),
            local_path: self.metadata.doc_type.local_path(),
            template_system: self.metadata.doc_type.template_system(),
            export_formats: self.metadata.doc_type.export_formats(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentRoute {
    pub doc_type: DocumentType,
    pub google_drive_folder: String,
    pub local_path: PathBuf,
    pub template_system: TemplateSystem,
    pub export_formats: Vec<ExportFormat>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_classification() {
        let bne = DocumentType::classify(
            &PathBuf::from("/docs/bne/system_design.md"),
            "Quick architecture sketch",
        );
        assert_eq!(bne, DocumentType::BNEArtifact);

        let research = DocumentType::classify(
            &PathBuf::from("/docs/research/paper.tex"),
            "\\documentclass{article}",
        );
        assert_eq!(research, DocumentType::ResearchPaper);
    }
}
