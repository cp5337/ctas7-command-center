# 🔒 MAKE ALL REPOS PRIVATE - QUICK GUIDE

**URGENT:** Secure all CTAS7/Synaptix repositories immediately.

---

## ⚡ **FASTEST METHOD: GitHub CLI**

### **Step 1: Fix Authentication**

```bash
# Switch to keyring auth
gh auth switch

# Or re-login if needed
gh auth login
```

### **Step 2: Run One Command Per Repo**

Copy and paste these commands:

```bash
# Core Systems
gh repo edit cp5337/ctas7-command-center --visibility private
gh repo edit cp5337/ctas7-shipyard-staging --visibility private
gh repo edit cp5337/ctas7-shipyard-system --visibility private

# Design & Frontend
gh repo edit cp5337/ctas7-v0-design-system-framework-react-native --visibility private
gh repo edit cp5337/ctas7-react-native-framework --visibility private
gh repo edit cp5337/ctas7-intelligent-transpiler --visibility private
gh repo edit cp5337/CTAS7-SDC-iOS --visibility private
gh repo edit cp5337/CTA7-IOS-SEED --visibility private

# Infrastructure
gh repo edit cp5337/ctas7-terraform-gis --visibility private
gh repo edit cp5337/ctas7-cesium-mcp --visibility private
gh repo edit cp5337/orbital-gis-platform --visibility private

# Intelligence & Analysis
gh repo edit cp5337/ctas7-EEI-staging --visibility private
gh repo edit cp5337/ctas7-crate-analyzer-system --visibility private
gh repo edit cp5337/ctas7-crate-split-inventory --visibility private
gh repo edit cp5337/usim-system --visibility private

# Agents
gh repo edit cp5337/agent_os-Claude --visibility private
```

### **Step 3: Verify**

```bash
# List all repos with visibility
gh repo list cp5337 --json name,visibility --jq '.[] | "\(.name): \(.visibility)"'
```

---

## 🌐 **ALTERNATIVE: Web Interface**

For each repository:

1. **Go to:** `https://github.com/cp5337/<repo-name>/settings`
2. **Scroll down** to "Danger Zone"
3. **Click** "Change visibility"
4. **Select** "Make private"
5. **Type repository name** to confirm
6. **Click** "I understand, make this repository private"

### **Quick Links:**

**Core:**
- https://github.com/cp5337/ctas7-command-center/settings
- https://github.com/cp5337/ctas7-shipyard-staging/settings
- https://github.com/cp5337/ctas7-shipyard-system/settings

**Design:**
- https://github.com/cp5337/ctas7-v0-design-system-framework-react-native/settings
- https://github.com/cp5337/ctas7-react-native-framework/settings
- https://github.com/cp5337/ctas7-intelligent-transpiler/settings

**iOS:**
- https://github.com/cp5337/CTAS7-SDC-iOS/settings
- https://github.com/cp5337/CTA7-IOS-SEED/settings

**GIS:**
- https://github.com/cp5337/ctas7-terraform-gis/settings
- https://github.com/cp5337/ctas7-cesium-mcp/settings
- https://github.com/cp5337/orbital-gis-platform/settings

**Intelligence:**
- https://github.com/cp5337/ctas7-EEI-staging/settings
- https://github.com/cp5337/ctas7-crate-analyzer-system/settings
- https://github.com/cp5337/usim-system/settings

**Agents:**
- https://github.com/cp5337/agent_os-Claude/settings

---

## ✅ **VERIFICATION**

After making repos private, verify with:

```bash
# Check all are private
gh repo list cp5337 --limit 100 --json name,visibility \
  | jq '.[] | select(.visibility == "PUBLIC")'

# Should return empty (no public repos)
```

---

## 🚨 **WHY THIS IS URGENT**

- ✅ **Design system** currently public (proprietary)
- ✅ **React Native framework** currently public (competitive advantage)
- ✅ **Agent systems** currently public (strategic IP)
- ✅ **May contain API keys** in history
- ✅ **Government/DoD work** requires private repos
- ✅ **Fortune 500 clients** expect confidentiality

---

## 📋 **CHECKLIST**

Mark as you complete:

- [ ] Fix GitHub CLI auth (`gh auth switch`)
- [ ] Run privacy commands for all repos
- [ ] Verify all repos are private
- [ ] Check for API keys in public history
- [ ] Review collaborator access
- [ ] Enable branch protection
- [ ] Enable security alerts
- [ ] Update .gitignore in all repos

---

## 🔧 **IF COMMANDS FAIL**

### **Error: "authentication required"**

```bash
gh auth login
# Follow prompts to authenticate
```

### **Error: "repository not found"**

Repository may already be private or you may not have access. Check:

```bash
gh repo view cp5337/<repo-name>
```

### **Error: "insufficient permissions"**

You need admin access to change visibility. Check:

```bash
gh api repos/cp5337/<repo-name> --jq .permissions
```

---

## 🎯 **QUICK START**

```bash
# 1. Fix auth
gh auth switch

# 2. Make first repo private (test)
gh repo edit cp5337/ctas7-v0-design-system-framework-react-native --visibility private

# 3. If successful, run all commands above

# 4. Verify
gh repo list cp5337 --json name,visibility
```

---

**STATUS:** ⚠️ URGENT - Make repos private ASAP  
**TIME:** ~5 minutes via CLI, ~15 minutes via web  
**PRIORITY:** CRITICAL for security compliance  

🔒 **PROTECT YOUR INTELLECTUAL PROPERTY NOW**

