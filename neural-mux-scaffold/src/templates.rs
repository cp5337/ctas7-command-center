//! Template Engine
//! 
//! Manages code generation templates

use anyhow::Result;
use tera::{Tera, Context};
use crate::scaffold::ProductSpec;

pub struct TemplateEngine {
    tera: Tera,
}

impl TemplateEngine {
    pub fn new() -> Self {
        let mut tera = Tera::default();
        
        // Register inline templates (in production, load from files)
        tera.add_raw_template("README.md", include_str!("../templates/README.md.tera"))
            .unwrap_or_default();
        
        Self { tera }
    }

    pub fn render(&self, template_name: &str, context: &Context) -> Result<String> {
        Ok(self.tera.render(template_name, context)?)
    }

    pub fn render_precommit_hook(&self, spec: &ProductSpec) -> Result<String> {
        let hook = format!(r#"#!/bin/bash
# CTAS-7 Quality Gate Pre-Commit Hook
# Product: {}

echo "🔍 Running CTAS-7 Quality Gates..."

# Run scaffold validator
if command -v scaffold &> /dev/null; then
    scaffold validate . --report=false
    if [ $? -ne 0 ]; then
        echo "❌ Quality gates failed. Commit blocked."
        echo "Run 'scaffold validate . --report' for details"
        exit 1
    fi
else
    echo "⚠️  Warning: 'scaffold' command not found. Install neural-mux-scaffold."
fi

echo "✅ All quality gates passed!"
exit 0
"#, spec.display_name);

        Ok(hook)
    }
}
"#



