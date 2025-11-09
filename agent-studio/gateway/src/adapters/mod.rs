// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CTAS Agent Studio - Universal Adapter System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// All external integrations are unified through this adapter layer
//
// Categories:
// - Document Intelligence: Google Workspace, ABE
// - Design Automation: Canva, Figma
// - Deployment: Vercel
// - Development: Zen Coder (future)
// - Communication: Slack, Linear (future)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

pub mod canva_adapter;
pub mod figma_adapter;
pub mod vercel_adapter;

pub use canva_adapter::*;
pub use figma_adapter::*;
pub use vercel_adapter::*;

