//! iOS Product Scaffold Generator
//! 
//! Core logic for generating complete Xcode projects with MVC-M architecture

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::fs;
use colored::*;
use tera::{Tera, Context as TeraContext};

use crate::templates::TemplateEngine;
use crate::swift_gen::SwiftGenerator;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductSpec {
    pub name: String,
    pub display_name: String,
    pub bundle_id: String,
    pub category: String,
    pub target_devices: Vec<String>,
    pub features: Vec<String>,
    
    #[serde(default)]
    pub data_models: Vec<DataModel>,
    
    #[serde(default)]
    pub views: Vec<ViewSpec>,
    
    #[serde(default)]
    pub services: Vec<ServiceSpec>,
    
    #[serde(default)]
    pub math_functions: Vec<MathFunction>,
    
    #[serde(default)]
    pub phi_prompts: Vec<String>,
    
    #[serde(default)]
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataModel {
    pub name: String,
    pub properties: Vec<Property>,
    
    #[serde(default)]
    pub protocols: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub name: String,
    #[serde(rename = "type")]
    pub type_name: String,
    
    #[serde(default)]
    pub optional: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewSpec {
    pub name: String,
    
    #[serde(default)]
    pub view_model: Option<String>,
    
    #[serde(default)]
    pub subviews: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceSpec {
    pub name: String,
    
    #[serde(default)]
    pub methods: Vec<ServiceMethod>,
    
    #[serde(default)]
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMethod {
    pub name: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MathFunction {
    pub name: String,
    pub description: String,
    
    #[serde(default)]
    pub test_cases: Vec<TestCase>,
    
    pub reference_implementation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCase {
    pub input: serde_json::Value,
    pub expected: serde_json::Value,
    pub tolerance: f64,
}

pub struct ProductScaffold {
    output_dir: PathBuf,
    template_engine: TemplateEngine,
    swift_gen: SwiftGenerator,
}

impl ProductScaffold {
    pub fn new(output_dir: PathBuf) -> Self {
        Self {
            output_dir,
            template_engine: TemplateEngine::new(),
            swift_gen: SwiftGenerator::new(),
        }
    }

    pub async fn generate(&mut self, spec: &ProductSpec) -> Result<()> {
        let project_dir = self.output_dir.join(&spec.name);
        
        // Create project directory structure
        self.create_directory_structure(&project_dir, spec)?;
        
        // Generate Xcode project file
        self.generate_xcode_project(&project_dir, spec)?;
        
        // Generate Models
        self.generate_models(&project_dir, spec)?;
        
        // Generate Views
        self.generate_views(&project_dir, spec)?;
        
        // Generate ViewModels
        self.generate_viewmodels(&project_dir, spec)?;
        
        // Generate Services
        self.generate_services(&project_dir, spec)?;
        
        // Generate Neural Mux Client
        self.generate_neural_mux_client(&project_dir, spec)?;
        
        // Generate Phi Integration
        self.generate_phi_integration(&project_dir, spec)?;
        
        // Generate Tests
        if !spec.math_functions.is_empty() {
            self.generate_math_tests(&project_dir, spec)?;
        }
        
        // Generate Quality Gates
        self.generate_quality_gates(&project_dir, spec)?;
        
        // Generate README
        self.generate_readme(&project_dir, spec)?;
        
        Ok(())
    }

    fn create_directory_structure(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  📁 Creating directory structure...");
        
        let dirs = vec![
            format!("{}/Models", spec.name),
            format!("{}/Views", spec.name),
            format!("{}/ViewModels", spec.name),
            format!("{}/Services", spec.name),
            format!("{}/NeuralMux", spec.name),
            format!("{}/PhiIntegration", spec.name),
            format!("{}Tests", spec.name),
            format!("{}UITests", spec.name),
        ];

        for dir in dirs {
            let path = project_dir.join(dir);
            fs::create_dir_all(&path)
                .with_context(|| format!("Failed to create directory: {:?}", path))?;
        }

        Ok(())
    }

    fn generate_xcode_project(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  📦 Generating Xcode project...");
        
        let mut context = TeraContext::new();
        context.insert("product_name", &spec.name);
        context.insert("bundle_id", &spec.bundle_id);
        context.insert("display_name", &spec.display_name);
        
        let pbxproj_content = self.template_engine.render("xcode_project.pbxproj", &context)?;
        
        let pbxproj_dir = project_dir.join(format!("{}.xcodeproj", spec.name));
        fs::create_dir_all(&pbxproj_dir)?;
        
        fs::write(pbxproj_dir.join("project.pbxproj"), pbxproj_content)?;
        
        Ok(())
    }

    fn generate_models(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  📊 Generating {} data models...", spec.data_models.len());
        
        let models_dir = project_dir.join(&spec.name).join("Models");
        
        for model in &spec.data_models {
            let swift_code = self.swift_gen.generate_model(model)?;
            let file_path = models_dir.join(format!("{}.swift", model.name));
            
            fs::write(&file_path, swift_code)
                .with_context(|| format!("Failed to write model: {}", model.name))?;
            
            // Validate file size
            self.validate_file_size(&file_path)?;
        }
        
        Ok(())
    }

    fn generate_views(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  🎨 Generating {} SwiftUI views...", spec.views.len());
        
        let views_dir = project_dir.join(&spec.name).join("Views");
        
        for view in &spec.views {
            let swift_code = self.swift_gen.generate_view(view)?;
            let file_path = views_dir.join(format!("{}.swift", view.name));
            
            fs::write(&file_path, swift_code)?;
            self.validate_file_size(&file_path)?;
        }
        
        Ok(())
    }

    fn generate_viewmodels(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        let viewmodels_dir = project_dir.join(&spec.name).join("ViewModels");
        
        let views_with_vms: Vec<_> = spec.views.iter()
            .filter(|v| v.view_model.is_some())
            .collect();
        
        if views_with_vms.is_empty() {
            return Ok(());
        }
        
        println!("  🔧 Generating {} view models...", views_with_vms.len());
        
        for view in views_with_vms {
            if let Some(vm_name) = &view.view_model {
                let swift_code = self.swift_gen.generate_viewmodel(vm_name, view)?;
                let file_path = viewmodels_dir.join(format!("{}.swift", vm_name));
                
                fs::write(&file_path, swift_code)?;
                self.validate_file_size(&file_path)?;
            }
        }
        
        Ok(())
    }

    fn generate_services(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  ⚙️  Generating {} services...", spec.services.len());
        
        let services_dir = project_dir.join(&spec.name).join("Services");
        
        for service in &spec.services {
            let swift_code = self.swift_gen.generate_service(service)?;
            let file_path = services_dir.join(format!("{}.swift", service.name));
            
            fs::write(&file_path, swift_code)?;
            self.validate_file_size(&file_path)?;
        }
        
        Ok(())
    }

    fn generate_neural_mux_client(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  🧠 Generating Neural Mux client...");
        
        let mux_dir = project_dir.join(&spec.name).join("NeuralMux");
        let swift_code = self.swift_gen.generate_mux_client(spec)?;
        let file_path = mux_dir.join(format!("{}MuxClient.swift", spec.name));
        
        fs::write(&file_path, swift_code)?;
        
        Ok(())
    }

    fn generate_phi_integration(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  🤖 Generating Phi-3 integration...");
        
        let phi_dir = project_dir.join(&spec.name).join("PhiIntegration");
        let swift_code = self.swift_gen.generate_phi_engine(spec)?;
        let file_path = phi_dir.join("PhiInferenceEngine.swift");
        
        fs::write(&file_path, swift_code)?;
        
        Ok(())
    }

    fn generate_math_tests(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  🧮 Generating {} mathematical validation tests...", spec.math_functions.len());
        
        let tests_dir = project_dir.join(format!("{}Tests", spec.name));
        
        for math_func in &spec.math_functions {
            let swift_code = self.swift_gen.generate_math_test(math_func)?;
            let file_path = tests_dir.join(format!("{}Tests.swift", math_func.name));
            
            fs::write(&file_path, swift_code)?;
        }
        
        Ok(())
    }

    fn generate_quality_gates(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        println!("  🛡️  Generating quality gates...");
        
        let git_hooks_dir = project_dir.join(".git").join("hooks");
        fs::create_dir_all(&git_hooks_dir)?;
        
        let hook_content = self.template_engine.render_precommit_hook(spec)?;
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

    fn generate_readme(&self, project_dir: &Path, spec: &ProductSpec) -> Result<()> {
        let mut context = TeraContext::new();
        context.insert("spec", spec);
        
        let readme_content = self.template_engine.render("README.md", &context)?;
        fs::write(project_dir.join("README.md"), readme_content)?;
        
        Ok(())
    }

    fn validate_file_size(&self, file_path: &Path) -> Result<()> {
        let content = fs::read_to_string(file_path)?;
        let line_count = content.lines().count();
        
        if line_count > 200 {
            eprintln!("{}", format!(
                "  ⚠️  WARNING: {} exceeds 200 LOC ({} lines)",
                file_path.file_name().unwrap().to_string_lossy(),
                line_count
            ).bright_yellow());
        }
        
        Ok(())
    }
}




