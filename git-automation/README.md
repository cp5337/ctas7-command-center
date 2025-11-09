# CTAS Git Automation System

**Purpose**: Prevent lost work + Enforce professional PR workflow + Maintain code quality

---

## Components

### 1. **Hourly Auto-Commit** (`hourly-commit.sh`)
Automatically commits uncommitted work every hour to prevent data loss.

**Features**:
- Scans all CTAS repositories
- Creates auto-commit branches if on main/master
- Commits with descriptive timestamps
- Pushes to remote (if configured)
- Comprehensive logging

### 2. **PR Workflow Enforcer** (`pr-workflow-enforcer.sh`)
Pre-push Git hook that blocks direct commits to protected branches.

**Features**:
- Blocks pushes to main/master/production/staging
- Validates commit message format (conventional commits)
- Checks for sensitive data (API keys, passwords, private keys)
- Runs PhD QA validation (when integrated)
- Provides helpful error messages

### 3. **Hook Installer** (`install-hooks.sh`)
Installs pre-push hooks across all CTAS repositories.

**Features**:
- Installs hooks via symlinks (easy updates)
- Backs up existing hooks
- Batch installation across 10+ repos
- Installation summary report

---

## Quick Start

### Step 1: Setup Hourly Auto-Commit

```bash
# Make executable
chmod +x /Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh

# Test run
/Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh

# Check log
tail -f /Users/cp5337/Developer/ctas7-command-center/logs/hourly-commit.log
```

### Step 2: Install Cron Job

```bash
# Edit crontab
crontab -e

# Add this line (runs at minute 0 of every hour):
0 * * * * /Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh

# For testing (every 5 minutes):
*/5 * * * * /Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh

# Verify
crontab -l
```

### Step 3: Install PR Workflow Hooks

```bash
cd /Users/cp5337/Developer/ctas7-command-center/git-automation
./install-hooks.sh
```

**Expected output**:
```
✓  Installed: 10
⚠️  Skipped: 0
❌ Failed: 0
```

---

## Usage Examples

### Proper Git Workflow (After Hook Installation)

```bash
# ❌ This will be BLOCKED:
git checkout main
echo "changes" >> file.txt
git commit -m "update"
git push origin main
# Error: Direct push to protected branch!

# ✅ This is the correct workflow:
git checkout -b feature/my-new-feature
echo "changes" >> file.txt
git commit -m "feat(component): add new feature"
git push origin feature/my-new-feature
# Then create PR on GitHub
```

### Emergency Bypass (Use Sparingly)

```bash
# In true emergencies only:
git push --no-verify
```

**Warning**: This bypasses all safety checks. Use only when:
- Critical production hotfix
- Hook is malfunctioning
- You understand the risks

---

## Conventional Commit Format

All commits must follow this format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance (auto-commits, dependencies)
- `docs`: Documentation
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `style`: Formatting, missing semicolons
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples**:
```bash
git commit -m "feat(agents): add Elena mentor cybersecurity mode"
git commit -m "fix(plasma): resolve port scan detection false positives"
git commit -m "chore(deps): upgrade Linear SDK to v2.1.0"
git commit -m "docs(intern): add Mackenzie onboarding guide"
```

---

## Hourly Auto-Commit Behavior

### What It Does

**Every hour**, the script:

1. **Scans all CTAS repos** for uncommitted changes
2. If changes exist:
   - If on `main`/`master`: Creates branch `auto-commit/YYYYMMDD-HHMM`
   - If on feature branch: Commits directly
3. **Commits with timestamp**: `chore(auto): hourly auto-commit - YYYY-MM-DD HH:MM:SS`
4. **Pushes to remote** (if origin configured)
5. **Logs everything** to `logs/hourly-commit.log`

### Why This Matters

**Problem**: You've been coding for 3 hours, your Mac crashes, you lose everything.

**Solution**: With hourly auto-commits, you lose at most 59 minutes of work.

### Cleaning Up Auto-Commits

After a coding session:

```bash
# View your auto-commit branches
git branch | grep auto-commit

# Squash auto-commits into meaningful commits
git checkout auto-commit/20251107-1400
git rebase -i main
# Mark commits as "squash" or "fixup"
# Write one good commit message

# Or just cherry-pick the changes
git checkout -b feature/my-feature main
git cherry-pick <commit-hash>

# Delete auto-commit branch
git branch -D auto-commit/20251107-1400
```

---

## PhD QA Integration (Coming Soon)

The pre-push hook has placeholder for PhD QA validation:

**When integrated, it will**:
- Analyze Rust files in your changeset
- Calculate primitive density
- Block pushes < 500% primitive density
- Provide detailed quality reports

**To integrate**:
1. Ensure PhD QA analyzer is at `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-qa-analyzer`
2. Update `run_phd_qa()` function in `pr-workflow-enforcer.sh`
3. Test with sample Rust code

---

## Logs & Debugging

### Hourly Commit Log

```bash
# View log
cat /Users/cp5337/Developer/ctas7-command-center/logs/hourly-commit.log

# Watch live
tail -f /Users/cp5337/Developer/ctas7-command-center/logs/hourly-commit.log

# Check cron execution
grep CRON /var/log/system.log  # macOS
```

### Pre-Push Hook Debugging

```bash
# Hook location (per repo)
ls -la .git/hooks/pre-push

# Test manually
cd /path/to/repo
./.git/hooks/pre-push

# Remove hook temporarily
rm .git/hooks/pre-push

# Reinstall
cd /Users/cp5337/Developer/ctas7-command-center/git-automation
./install-hooks.sh
```

---

## Multi-Platform Setup

### Mac (Primary Development)
Already covered above - use cron for hourly commits.

### Windows Dell i7 #1 & #2 (Production & Dev/Test)

```powershell
# Use Task Scheduler instead of cron
# Create task: "CTAS Hourly Auto-Commit"
# Trigger: Hourly
# Action: Run Git Bash script

# Convert script for Windows:
"C:\Program Files\Git\bin\bash.exe" /c/path/to/hourly-commit.sh
```

### IBM ThinkPad T420 (Linux)

```bash
# Same as Mac - use crontab
crontab -e
0 * * * * /path/to/hourly-commit.sh
```

---

## Troubleshooting

### "Permission denied" errors

```bash
chmod +x /Users/cp5337/Developer/ctas7-command-center/git-automation/*.sh
```

### Cron job not running

```bash
# Check cron service (macOS)
sudo launchctl list | grep cron

# Verify crontab syntax
crontab -l

# Check system log
tail -f /var/log/system.log | grep cron
```

### Pre-push hook not blocking

```bash
# Verify hook is installed
ls -la .git/hooks/pre-push

# Check it's executable
chmod +x .git/hooks/pre-push

# Test it manually
./.git/hooks/pre-push
```

### False positives on sensitive data

Edit `pr-workflow-enforcer.sh` and adjust `PATTERNS` array.

---

## Benefits Summary

### For You

✅ **Never lose work** - Hourly commits protect against crashes
✅ **No direct main commits** - Enforced PR workflow
✅ **Better code review** - All changes go through PRs
✅ **Cleaner history** - Proper commit messages
✅ **Security** - Sensitive data detection
✅ **Quality gates** - PhD QA integration (coming)

### For the Team

✅ **Consistent workflow** - Everyone follows same process
✅ **Knowledge preservation** - PRs document decisions
✅ **Code quality** - Automated validation
✅ **Audit trail** - All changes traceable
✅ **DoD DevSecOps compliant** - Meets standards

---

## Next Steps

1. ✅ Install hourly auto-commit cron job
2. ✅ Install pre-push hooks across all repos
3. ⏳ Test the workflow (create feature branch, push, verify block on main)
4. ⏳ Integrate PhD QA validation
5. ⏳ Setup on Windows servers (Task Scheduler)
6. ⏳ Setup on Linux server (crontab)
7. ⏳ Train Mackenzie on Git workflow during Week 1

---

**Questions?** Check logs, read script comments, or escalate to leadership.

**Remember**: These tools are here to help you, not hinder you. If something's not working, we'll fix it. The goal is **zero lost work** and **professional git workflow**, not bureaucracy.

