/// Lazy-loading markdown file system
/// Loads markdown files on-demand from filesystem or HTTP, not bundled
use std::path::{Path, PathBuf};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct MarkdownLoader {
    base_path: PathBuf,
    cache: HashMap<String, String>,
}

impl MarkdownLoader {
    pub fn new(base_path: impl AsRef<Path>) -> Self {
        Self {
            base_path: base_path.as_ref().to_path_buf(),
            cache: HashMap::new(),
        }
    }
    
    /// Load markdown file on-demand
    pub async fn load(&mut self, file_path: &str) -> Result<String, LoadError> {
        // Check cache first
        if let Some(content) = self.cache.get(file_path) {
            return Ok(content.clone());
        }
        
        // Construct full path
        let full_path = self.base_path.join(file_path);
        
        // Load from filesystem
        let content = tokio::fs::read_to_string(&full_path)
            .await
            .map_err(|e| LoadError::FileNotFound(full_path.clone(), e))?;
        
        // Cache it
        self.cache.insert(file_path.to_string(), content.clone());
        
        Ok(content)
    }
    
    /// Load from HTTP endpoint (for production)
    pub async fn load_http(&mut self, url: &str) -> Result<String, LoadError> {
        // Check cache
        if let Some(content) = self.cache.get(url) {
            return Ok(content.clone());
        }
        
        // Fetch from HTTP
        let response = reqwest::get(url)
            .await
            .map_err(|e| LoadError::HttpError(url.to_string(), e))?;
        
        let content = response
            .text()
            .await
            .map_err(|e| LoadError::HttpError(url.to_string(), e))?;
        
        // Cache it
        self.cache.insert(url.to_string(), content.clone());
        
        Ok(content)
    }
    
    /// Clear cache
    pub fn clear_cache(&mut self) {
        self.cache.clear();
    }
    
    /// Preload multiple files in parallel
    pub async fn preload(&mut self, files: Vec<String>) -> Result<(), LoadError> {
        let mut tasks = Vec::new();
        
        for file in files {
            let full_path = self.base_path.join(&file);
            tasks.push(tokio::spawn(async move {
                tokio::fs::read_to_string(&full_path).await
            }));
        }
        
        for (idx, task) in tasks.into_iter().enumerate() {
            match task.await {
                Ok(Ok(content)) => {
                    self.cache.insert(files[idx].clone(), content);
                }
                Ok(Err(e)) => {
                    return Err(LoadError::FileNotFound(
                        self.base_path.join(&files[idx]),
                        e
                    ));
                }
                Err(e) => {
                    return Err(LoadError::TaskError(e));
                }
            }
        }
        
        Ok(())
    }
}

#[derive(Debug)]
pub enum LoadError {
    FileNotFound(PathBuf, std::io::Error),
    HttpError(String, reqwest::Error),
    TaskError(tokio::task::JoinError),
}

impl std::fmt::Display for LoadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LoadError::FileNotFound(path, e) => {
                write!(f, "File not found: {} ({})", path.display(), e)
            }
            LoadError::HttpError(url, e) => {
                write!(f, "HTTP error loading {}: {}", url, e)
            }
            LoadError::TaskError(e) => {
                write!(f, "Task error: {}", e)
            }
        }
    }
}

impl std::error::Error for LoadError {}

