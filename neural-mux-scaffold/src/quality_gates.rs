//! Quality Gates Installer
//! 
//! Installs pre-commit hooks for quality enforcement

use anyhow::Result;
use std::path::{Path, PathBuf};
use std::fs;
use crate::templates::TemplateEngine;
use crate::scaffold::ProductSpec;

pub struct HooksInstaller {
    project_path: PathBuf,
}

impl HooksInstaller {
    pub fn new(project_path: PathBuf) -> Self {
        Self { project_path }
    }

    pub async fn install(&self) -> Result<()> {
        let git_hooks_dir = self.project_path.join(".git").join("hooks");
        fs::create_dir_all(&git_hooks_dir)?;

        // Create minimal spec for template rendering
        let spec = ProductSpec {
            name: self.project_path.file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            display_name: "Project".to_string(),
            bundle_id: "com.ctas7.project".to_string(),
            category: "utility".to_string(),
            target_devices: vec!["iPhone".to_string()],
            features: Vec::new(),
            data_models: Vec::new(),
            views: Vec::new(),
            services: Vec::new(),
            math_functions: Vec::new(),
            phi_prompts: Vec::new(),
            dependencies: Vec::new(),
        };

        let template_engine = TemplateEngine::new();
        let hook_content = template_engine.render_precommit_hook(&spec)?;

        let hook_path = git_hooks_dir.join("pre-commit");
        fs::write(&hook_path, hook_content)?;

        // Make executable
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(&hook_path)?.permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&hook_path, perms)?;
        }

        Ok(())
    }
}
"#



