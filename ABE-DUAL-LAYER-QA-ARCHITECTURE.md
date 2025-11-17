# ABE Dual-Layer QA System Architecture
**Version:** 2.0.0
**Date:** November 17, 2025
**Status:** Design Complete 🎯 | Ready for Implementation

---

## 🎯 Architecture Overview

### Layer 1: Script-Only GPU Analysis (Lightning Fast)
- **Purpose**: Non-invasive, pure script-based analysis
- **Performance**: GPU-accelerated, sub-30 second analysis
- **Output**: Detailed JSON/Markdown for automation
- **Integration**: Linear + PR generation + Claude meta-agents

### Layer 2: AI-Driven Expert QA (Deep Intelligence)
- **Purpose**: ZenCoder.ai platform testing + expert QA engineering
- **Tools**: Crawl4ai + Playwright + Multi-model AI
- **Models**: GPT-4, Claude, Gemini (all models available)
- **Goal**: Become independent QA experts on the platform

---

## ⚡ Layer 1: Script-Only GPU Analysis

### 1.1 Core Architecture

```bash
# Non-Invasive Script Pipeline
/usr/local/bin/ctas7-lightning-qa \
  --gpu-accelerated \
  --non-invasive \
  --output-format=json \
  --linear-integration \
  --pr-automation
```

### 1.2 Implementation: Lightning QA Engine

**File:** `ctas7-lightning-qa.py`

```python
#!/usr/bin/env python3
"""
CTAS-7 Lightning QA Engine - Layer 1 Script-Only Analysis
Non-invasive GPU-accelerated analysis with PR automation
"""

import asyncio
import json
import subprocess
import os
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
import httpx
from pathlib import Path

@dataclass
class LightningAnalysis:
    """Lightning-fast analysis results"""
    crate_name: str
    analysis_time_seconds: float
    gpu_accelerated: bool
    files_analyzed: int
    total_loc: int
    complexity_score: float
    maintainability_score: float
    security_score: float
    overall_grade: str
    critical_issues: List[Dict]
    recommendations: List[str]
    pr_candidates: List[Dict]

class CTASLightningQA:
    """
    Layer 1: Pure script-based QA analysis
    - GPU accelerated for speed
    - Non-invasive (read-only)
    - Automated PR generation
    - Claude meta-agent integration
    """

    def __init__(self):
        self.gpu_available = self._check_gpu()
        self.linear_api_key = os.getenv("LINEAR_API_KEY")
        self.github_token = os.getenv("GITHUB_TOKEN")

    def _check_gpu(self) -> bool:
        """Check if CUDA GPU is available"""
        try:
            result = subprocess.run(["nvidia-smi"], capture_output=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False

    async def lightning_analyze(self, crate_path: str) -> LightningAnalysis:
        """
        Lightning-fast script-only analysis
        - Uses GPU acceleration if available
        - Pure script execution, no AI models
        - Detailed output for automation
        """
        start_time = datetime.now()
        print(f"⚡ Lightning Analysis: {crate_path}")

        # Run GPU-accelerated PhD analyzer
        phd_results = await self._run_gpu_phd_analyzer(crate_path)

        # Run security scanner
        security_results = await self._run_security_scanner(crate_path)

        # Run complexity analyzer
        complexity_results = await self._run_complexity_analyzer(crate_path)

        # Calculate scores
        analysis_time = (datetime.now() - start_time).total_seconds()

        analysis = LightningAnalysis(
            crate_name=Path(crate_path).name,
            analysis_time_seconds=analysis_time,
            gpu_accelerated=self.gpu_available,
            files_analyzed=phd_results.get("files_count", 0),
            total_loc=phd_results.get("total_loc", 0),
            complexity_score=self._calculate_complexity_score(complexity_results),
            maintainability_score=self._calculate_maintainability_score(phd_results),
            security_score=self._calculate_security_score(security_results),
            overall_grade=self._calculate_overall_grade(phd_results, security_results, complexity_results),
            critical_issues=self._extract_critical_issues(phd_results, security_results),
            recommendations=self._generate_recommendations(phd_results, security_results),
            pr_candidates=self._identify_pr_candidates(phd_results, security_results)
        )

        # Output detailed results
        await self._output_results(analysis)

        print(f"✅ Lightning Analysis Complete: {analysis_time:.1f}s")
        print(f"   Grade: {analysis.overall_grade}")
        print(f"   Files: {analysis.files_analyzed}")
        print(f"   Critical Issues: {len(analysis.critical_issues)}")
        print(f"   PR Candidates: {len(analysis.pr_candidates)}")

        return analysis

    async def _run_gpu_phd_analyzer(self, crate_path: str) -> Dict:
        """Run PhD analyzer with GPU acceleration"""

        cmd = [
            "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-qa-analyzer/target/release/ctas7-phd-analyzer",
            crate_path,
            "--json",
            "--detailed"
        ]

        if self.gpu_available:
            cmd.append("--gpu-accelerated")

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                print(f"⚠️  PhD Analyzer failed: {result.stderr}")
                return {"error": result.stderr}
        except subprocess.TimeoutExpired:
            print("⚠️  PhD Analyzer timed out")
            return {"error": "timeout"}
        except json.JSONDecodeError:
            print("⚠️  PhD Analyzer returned invalid JSON")
            return {"error": "invalid_json"}

    async def _run_security_scanner(self, crate_path: str) -> Dict:
        """Run security scanner (clippy + custom rules)"""

        # Rust security analysis
        clippy_cmd = ["cargo", "clippy", "--", "-W", "clippy::all", "-W", "clippy::pedantic"]

        try:
            result = subprocess.run(
                clippy_cmd,
                cwd=crate_path,
                capture_output=True,
                text=True,
                timeout=120
            )

            security_issues = []
            if result.stderr:
                # Parse clippy output for security issues
                for line in result.stderr.split('\n'):
                    if 'warning:' in line or 'error:' in line:
                        security_issues.append({
                            'type': 'clippy',
                            'message': line.strip(),
                            'severity': 'warning' if 'warning:' in line else 'error'
                        })

            return {
                "security_issues": security_issues,
                "total_issues": len(security_issues),
                "critical_count": len([i for i in security_issues if i['severity'] == 'error'])
            }

        except subprocess.TimeoutExpired:
            return {"error": "security_timeout"}
        except Exception as e:
            return {"error": str(e)}

    async def _run_complexity_analyzer(self, crate_path: str) -> Dict:
        """Run fast complexity analysis"""

        complexity_data = {
            "functions": [],
            "modules": [],
            "total_complexity": 0
        }

        # Simple regex-based complexity analysis for speed
        for rs_file in Path(crate_path).rglob("*.rs"):
            try:
                with open(rs_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # Count complexity indicators
                    if_count = content.count('if ')
                    match_count = content.count('match ')
                    loop_count = content.count('for ') + content.count('while ')
                    function_count = content.count('fn ')

                    file_complexity = if_count + match_count * 2 + loop_count + function_count

                    complexity_data["functions"].append({
                        "file": str(rs_file.relative_to(crate_path)),
                        "complexity": file_complexity,
                        "functions": function_count
                    })

                    complexity_data["total_complexity"] += file_complexity

            except Exception:
                continue

        return complexity_data

    def _calculate_complexity_score(self, complexity_results: Dict) -> float:
        """Calculate complexity score (0-100)"""
        if "error" in complexity_results:
            return 50.0

        total_complexity = complexity_results.get("total_complexity", 0)
        total_functions = sum(f.get("functions", 0) for f in complexity_results.get("functions", []))

        if total_functions == 0:
            return 100.0

        avg_complexity = total_complexity / total_functions
        # Lower complexity = higher score
        score = max(0, min(100, 100 - (avg_complexity * 5)))

        return round(score, 1)

    def _calculate_maintainability_score(self, phd_results: Dict) -> float:
        """Calculate maintainability score from PhD analyzer"""
        if "error" in phd_results or "totals" not in phd_results:
            return 50.0

        totals = phd_results["totals"]

        # Use PhD maintainability index if available
        if "mi" in totals:
            return round(totals["mi"], 1)

        # Fallback calculation
        loc = totals.get("loc", 1)
        complexity = totals.get("cyclo", 0)

        # Simple maintainability heuristic
        if complexity == 0:
            return 90.0

        ratio = loc / complexity
        score = min(100, ratio * 10)

        return round(score, 1)

    def _calculate_security_score(self, security_results: Dict) -> float:
        """Calculate security score"""
        if "error" in security_results:
            return 50.0

        total_issues = security_results.get("total_issues", 0)
        critical_count = security_results.get("critical_count", 0)

        # Penalize critical issues more heavily
        penalty = (critical_count * 20) + (total_issues * 5)
        score = max(0, 100 - penalty)

        return round(score, 1)

    def _calculate_overall_grade(self, phd_results: Dict, security_results: Dict, complexity_results: Dict) -> str:
        """Calculate overall letter grade"""

        complexity_score = self._calculate_complexity_score(complexity_results)
        maintainability_score = self._calculate_maintainability_score(phd_results)
        security_score = self._calculate_security_score(security_results)

        # Weighted average
        overall_score = (
            complexity_score * 0.3 +
            maintainability_score * 0.4 +
            security_score * 0.3
        )

        if overall_score >= 95: return "A+"
        elif overall_score >= 90: return "A"
        elif overall_score >= 85: return "A-"
        elif overall_score >= 80: return "B+"
        elif overall_score >= 75: return "B"
        elif overall_score >= 70: return "B-"
        elif overall_score >= 65: return "C+"
        elif overall_score >= 60: return "C"
        elif overall_score >= 55: return "C-"
        elif overall_score >= 50: return "D"
        else: return "F"

    def _extract_critical_issues(self, phd_results: Dict, security_results: Dict) -> List[Dict]:
        """Extract critical issues for immediate attention"""

        critical_issues = []

        # From PhD analyzer
        if "files" in phd_results:
            for file_data in phd_results["files"]:
                warnings = file_data.get("warnings", [])
                for warning in warnings:
                    if "cyclomatic>8" in warning or "mi<50" in warning:
                        critical_issues.append({
                            "type": "complexity",
                            "file": file_data.get("path", "unknown"),
                            "issue": warning,
                            "severity": "high"
                        })

        # From security scanner
        if "security_issues" in security_results:
            for issue in security_results["security_issues"]:
                if issue.get("severity") == "error":
                    critical_issues.append({
                        "type": "security",
                        "file": "multiple",
                        "issue": issue.get("message", "Unknown security issue"),
                        "severity": "critical"
                    })

        return critical_issues[:10]  # Top 10 critical issues

    def _generate_recommendations(self, phd_results: Dict, security_results: Dict) -> List[str]:
        """Generate actionable recommendations"""

        recommendations = []

        # Complexity recommendations
        if "totals" in phd_results:
            totals = phd_results["totals"]
            avg_complexity = totals.get("cyclo", 0) / max(totals.get("files", 1), 1)

            if avg_complexity > 10:
                recommendations.append("🔧 Refactor high-complexity functions to improve maintainability")

            if totals.get("lloc", 0) > 10000:
                recommendations.append("📦 Consider splitting large crate into smaller modules")

        # Security recommendations
        security_issues = security_results.get("total_issues", 0)
        if security_issues > 5:
            recommendations.append("🔒 Address security warnings from Clippy analysis")

        # Documentation recommendations
        if "files" in phd_results:
            doc_density = 0
            for file_data in phd_results["files"]:
                doc_density += file_data.get("doc_density", 0)

            avg_doc_density = doc_density / len(phd_results["files"])
            if avg_doc_density < 0.1:
                recommendations.append("📝 Improve code documentation and comments")

        return recommendations[:5]  # Top 5 recommendations

    def _identify_pr_candidates(self, phd_results: Dict, security_results: Dict) -> List[Dict]:
        """Identify specific files/functions that are good PR candidates"""

        pr_candidates = []

        if "files" in phd_results:
            for file_data in phd_results["files"]:
                warnings = file_data.get("warnings", [])
                complexity = file_data.get("cyclo", 0)

                # High complexity files are good refactoring candidates
                if complexity > 15:
                    pr_candidates.append({
                        "type": "refactor",
                        "file": file_data.get("path", "unknown"),
                        "reason": f"High complexity ({complexity}) - refactor needed",
                        "estimated_effort": "medium",
                        "auto_fixable": False
                    })

                # Documentation candidates
                if file_data.get("doc_density", 0) < 0.05:
                    pr_candidates.append({
                        "type": "documentation",
                        "file": file_data.get("path", "unknown"),
                        "reason": "Missing documentation",
                        "estimated_effort": "low",
                        "auto_fixable": True
                    })

        # Security fix candidates
        for issue in security_results.get("security_issues", []):
            if "unused" in issue.get("message", "").lower():
                pr_candidates.append({
                    "type": "cleanup",
                    "file": "multiple",
                    "reason": "Remove unused code",
                    "estimated_effort": "low",
                    "auto_fixable": True
                })

        return pr_candidates[:8]  # Top 8 PR candidates

    async def _output_results(self, analysis: LightningAnalysis):
        """Output detailed results for automation"""

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # JSON output for automation
        json_output = {
            "analysis": {
                "crate_name": analysis.crate_name,
                "timestamp": datetime.now().isoformat(),
                "analysis_time_seconds": analysis.analysis_time_seconds,
                "gpu_accelerated": analysis.gpu_accelerated
            },
            "scores": {
                "complexity": analysis.complexity_score,
                "maintainability": analysis.maintainability_score,
                "security": analysis.security_score,
                "overall_grade": analysis.overall_grade
            },
            "metrics": {
                "files_analyzed": analysis.files_analyzed,
                "total_loc": analysis.total_loc
            },
            "issues": {
                "critical_issues": analysis.critical_issues,
                "critical_count": len(analysis.critical_issues)
            },
            "automation": {
                "recommendations": analysis.recommendations,
                "pr_candidates": analysis.pr_candidates,
                "auto_fixable_count": len([pr for pr in analysis.pr_candidates if pr.get("auto_fixable")])
            }
        }

        # Save JSON for automation tools
        output_dir = Path("./qa-lightning-results")
        output_dir.mkdir(exist_ok=True)

        json_file = output_dir / f"{analysis.crate_name}_lightning_{timestamp}.json"
        with open(json_file, 'w') as f:
            json.dump(json_output, f, indent=2)

        # Markdown report for human review
        markdown_file = output_dir / f"{analysis.crate_name}_report_{timestamp}.md"
        await self._generate_markdown_report(analysis, markdown_file)

        print(f"📄 Results saved:")
        print(f"   JSON: {json_file}")
        print(f"   Report: {markdown_file}")

    async def _generate_markdown_report(self, analysis: LightningAnalysis, output_file: Path):
        """Generate detailed Markdown report"""

        report = f"""# Lightning QA Report: {analysis.crate_name}

**Analysis Time:** {analysis.analysis_time_seconds:.1f} seconds
**GPU Accelerated:** {'✅ Yes' if analysis.gpu_accelerated else '❌ No'}
**Overall Grade:** **{analysis.overall_grade}**

---

## 📊 Quality Scores

| Metric | Score | Status |
|--------|--------|--------|
| Complexity | {analysis.complexity_score}/100 | {'✅ Good' if analysis.complexity_score >= 75 else '⚠️ Needs Work' if analysis.complexity_score >= 50 else '❌ Poor'} |
| Maintainability | {analysis.maintainability_score}/100 | {'✅ Good' if analysis.maintainability_score >= 75 else '⚠️ Needs Work' if analysis.maintainability_score >= 50 else '❌ Poor'} |
| Security | {analysis.security_score}/100 | {'✅ Good' if analysis.security_score >= 75 else '⚠️ Needs Work' if analysis.security_score >= 50 else '❌ Poor'} |

---

## 🔥 Critical Issues ({len(analysis.critical_issues)})

"""

        for i, issue in enumerate(analysis.critical_issues, 1):
            report += f"""
### {i}. {issue.get('type', 'Unknown').title()} Issue
- **File:** `{issue.get('file', 'unknown')}`
- **Severity:** {issue.get('severity', 'unknown')}
- **Issue:** {issue.get('issue', 'No description')}
"""

        report += f"""
---

## 💡 Recommendations ({len(analysis.recommendations)})

"""
        for i, rec in enumerate(analysis.recommendations, 1):
            report += f"{i}. {rec}\n"

        report += f"""
---

## 🚀 PR Candidates ({len(analysis.pr_candidates)})

"""
        for i, pr in enumerate(analysis.pr_candidates, 1):
            auto_fix = "🤖 Auto-fixable" if pr.get("auto_fixable") else "👨‍💻 Manual"
            effort = pr.get("estimated_effort", "unknown").title()
            report += f"""
### {i}. {pr.get('type', 'Unknown').title()} - {pr.get('file', 'unknown')}
- **Reason:** {pr.get('reason', 'No reason provided')}
- **Effort:** {effort}
- **Automation:** {auto_fix}
"""

        report += f"""
---

## 📈 Metrics

- **Files Analyzed:** {analysis.files_analyzed}
- **Total Lines of Code:** {analysis.total_loc:,}
- **Analysis Speed:** {analysis.files_analyzed / max(analysis.analysis_time_seconds, 0.1):.1f} files/second

---

*Generated by CTAS-7 Lightning QA Engine v2.0*
"""

        with open(output_file, 'w') as f:
            f.write(report)

    # Linear Integration
    async def create_linear_issues(self, analysis: LightningAnalysis):
        """Create Linear issues for critical problems"""

        if not self.linear_api_key:
            print("⚠️  No Linear API key - skipping issue creation")
            return

        # Only create issues for poor grades
        if analysis.overall_grade in ['F', 'D', 'C-']:
            print(f"📝 Creating Linear issue for grade {analysis.overall_grade}")

            # Use the Linear orchestrator from the original architecture
            # Implementation would go here
            pass

    # Claude Meta-Agent PR Generation
    async def generate_automated_prs(self, analysis: LightningAnalysis):
        """Generate PRs using Claude meta-agents for auto-fixable issues"""

        auto_fixable = [pr for pr in analysis.pr_candidates if pr.get("auto_fixable")]

        if auto_fixable:
            print(f"🤖 Found {len(auto_fixable)} auto-fixable issues")

            # Integration point for Claude Code meta-agents
            # This would call Claude to generate actual PR code
            pass

# Main execution
async def main():
    lightning_qa = CTASLightningQA()

    # Example usage
    crates_to_analyze = [
        "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-qa-analyzer",
        "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-real-port-manager",
        "/Users/cp5337/Developer/ctas-7-shipyard-staging/smart-crate-system"
    ]

    for crate_path in crates_to_analyze:
        if Path(crate_path).exists():
            analysis = await lightning_qa.lightning_analyze(crate_path)

            # Automated integrations
            await lightning_qa.create_linear_issues(analysis)
            await lightning_qa.generate_automated_prs(analysis)

            print("─" * 80)

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🚀 Layer 2: AI-Driven Expert QA

### 2.1 ZenCoder.ai Integration + Expert Platform Testing

**File:** `abe-zencoder-expert.py`

```python
#!/usr/bin/env python3
"""
ABE ZenCoder Expert QA System - Layer 2 AI-Driven Analysis
Expert-level QA engineering using ZenCoder.ai platform
"""

import asyncio
import json
from typing import Dict, List
from datetime import datetime
from playwright.async_api import async_playwright
from crawl4ai import AsyncWebCrawler
import httpx

class ZenCoderExpertQA:
    """
    Layer 2: AI-driven expert QA using ZenCoder.ai platform
    - All available models (GPT-4, Claude, Gemini)
    - Crawl4ai for platform research
    - Playwright for automation
    - Expert-level QA methodology
    """

    def __init__(self):
        self.zencoder_api_key = self._get_api_key()
        self.models = ["gpt-4", "claude-3", "gemini-pro"]

    def _get_api_key(self) -> str:
        """Get ZenCoder API key (BYOK or dedicated)"""
        # Check for dedicated ZenCoder key first
        # Fall back to BYOK with existing model keys
        import os
        return os.getenv("ZENCODER_API_KEY", "byok_mode")

    async def platform_research(self):
        """
        Research ZenCoder platform capabilities using crawl4ai
        Become experts on the platform features
        """

        print("🔬 Researching ZenCoder Platform...")

        async with AsyncWebCrawler() as crawler:
            # Research key pages
            research_urls = [
                "https://zencoder.ai/product/coding-agent",
                "https://zencoder.ai/product/zentester",
                "https://zencoder.ai/product/zen-agents",
                "https://docs.zencoder.ai/get-started/introduction",
                "https://zencoder.ai/pricing",
                "https://zencoder.ai/product/universal-ai-platform"
            ]

            research_data = {}

            for url in research_urls:
                try:
                    result = await crawler.arun(url=url)

                    research_data[url] = {
                        "title": result.title,
                        "content_summary": result.cleaned_text[:1000],  # First 1000 chars
                        "links": result.links[:10],  # Top 10 links
                        "images": result.images[:5]   # Top 5 images
                    }

                    print(f"✅ Researched: {url}")

                except Exception as e:
                    print(f"❌ Failed to research {url}: {e}")

            return research_data

    async def platform_testing_with_playwright(self):
        """
        Test ZenCoder platform using Playwright automation
        Comprehensive expert-level testing
        """

        print("🎭 Testing ZenCoder Platform with Playwright...")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)  # Visible for learning
            page = await browser.new_page()

            try:
                # Navigate to ZenCoder
                await page.goto("https://app.zencoder.ai")

                # Take screenshot for documentation
                await page.screenshot(path="zencoder-landing.png")

                # Test login flow (if we have credentials)
                if await page.locator("button:has-text('Login')").is_visible():
                    print("🔐 Testing login flow...")
                    # Login testing would go here

                # Test coding agent interface
                if await page.locator("text=Coding Agent").is_visible():
                    print("🤖 Testing Coding Agent...")
                    await page.click("text=Coding Agent")
                    await page.screenshot(path="coding-agent.png")

                # Test Zentester
                if await page.locator("text=Zentester").is_visible():
                    print("🧪 Testing Zentester...")
                    await page.click("text=Zentester")
                    await page.screenshot(path="zentester.png")

                # Extract pricing information
                pricing_info = await page.evaluate("""
                    () => {
                        const pricingElements = document.querySelectorAll('[class*="price"], [class*="pricing"]');
                        return Array.from(pricingElements).map(el => el.textContent);
                    }
                """)

                print(f"💰 Pricing info found: {len(pricing_info)} elements")

                test_results = {
                    "timestamp": datetime.now().isoformat(),
                    "platform_accessible": True,
                    "features_tested": ["coding_agent", "zentester", "pricing"],
                    "screenshots": ["zencoder-landing.png", "coding-agent.png", "zentester.png"],
                    "pricing_elements": pricing_info
                }

                return test_results

            except Exception as e:
                print(f"❌ Platform testing failed: {e}")
                return {"error": str(e)}

            finally:
                await browser.close()

    async def expert_code_analysis(self, crate_path: str, model: str = "gpt-4") -> Dict:
        """
        Expert-level code analysis using ZenCoder Coding Agent
        Multi-model approach for comprehensive insights
        """

        print(f"👨‍💻 Expert Analysis with {model}")

        # Simulate ZenCoder API call (replace with actual API when available)
        analysis_prompt = f"""
        As an expert QA engineer, perform comprehensive analysis of: {crate_path}

        Focus areas:
        1. Architecture and design patterns
        2. Code quality and maintainability
        3. Security vulnerabilities
        4. Performance optimization opportunities
        5. Testing coverage and quality
        6. Documentation adequacy
        7. Best practices adherence

        Provide expert-level recommendations with specific code examples.
        """

        # This would be the actual ZenCoder API call
        expert_analysis = {
            "model_used": model,
            "analysis_type": "expert_qa",
            "crate_path": crate_path,
            "timestamp": datetime.now().isoformat(),

            # Simulated expert insights
            "architecture_review": {
                "score": 85,
                "strengths": ["Clean module separation", "Good error handling"],
                "weaknesses": ["Tight coupling in some areas", "Missing abstraction layers"]
            },
            "security_analysis": {
                "score": 78,
                "vulnerabilities": ["Potential buffer overflow", "Unsafe block usage"],
                "recommendations": ["Add bounds checking", "Review unsafe code"]
            },
            "performance_review": {
                "score": 82,
                "bottlenecks": ["Inefficient string allocation", "Missing async optimization"],
                "optimizations": ["Use Cow<str>", "Implement async streams"]
            },
            "expert_recommendations": [
                "Implement comprehensive error handling strategy",
                "Add performance benchmarks and regression testing",
                "Improve documentation with code examples",
                "Consider microservice architecture for scalability"
            ]
        }

        return expert_analysis

    async def zentester_integration(self, crate_path: str) -> Dict:
        """
        Use ZenCoder Zentester for automated test generation
        Expert-level test strategy
        """

        print("🧪 Expert Test Generation with Zentester")

        # Simulate Zentester API call
        test_analysis = {
            "tool": "zentester",
            "crate_path": crate_path,
            "test_strategy": "expert_comprehensive",

            # Generated test insights
            "coverage_analysis": {
                "current_coverage": 73,
                "target_coverage": 95,
                "missing_areas": ["error paths", "edge cases", "integration tests"]
            },
            "generated_tests": {
                "unit_tests": 24,
                "integration_tests": 8,
                "property_tests": 5,
                "benchmark_tests": 3
            },
            "test_quality_score": 87,
            "expert_test_recommendations": [
                "Add property-based tests for data validation",
                "Implement chaos testing for error resilience",
                "Create performance regression test suite",
                "Add documentation tests for examples"
            ]
        }

        return test_analysis

    async def multi_model_consensus(self, crate_path: str) -> Dict:
        """
        Run analysis across multiple models for consensus
        GPT-4, Claude, Gemini expert opinions
        """

        print("🧠 Multi-Model Expert Consensus")

        model_analyses = {}

        for model in self.models:
            try:
                analysis = await self.expert_code_analysis(crate_path, model)
                model_analyses[model] = analysis
                print(f"✅ {model} analysis complete")

            except Exception as e:
                print(f"❌ {model} analysis failed: {e}")
                model_analyses[model] = {"error": str(e)}

        # Calculate consensus
        consensus = self._calculate_expert_consensus(model_analyses)

        return {
            "consensus_analysis": consensus,
            "individual_models": model_analyses,
            "expert_confidence": self._calculate_confidence(model_analyses)
        }

    def _calculate_expert_consensus(self, model_analyses: Dict) -> Dict:
        """Calculate expert consensus across models"""

        # Extract scores from each model
        architecture_scores = []
        security_scores = []
        performance_scores = []

        for model, analysis in model_analyses.items():
            if "error" not in analysis:
                architecture_scores.append(analysis.get("architecture_review", {}).get("score", 0))
                security_scores.append(analysis.get("security_analysis", {}).get("score", 0))
                performance_scores.append(analysis.get("performance_review", {}).get("score", 0))

        # Calculate averages
        consensus = {
            "architecture_consensus": sum(architecture_scores) / len(architecture_scores) if architecture_scores else 0,
            "security_consensus": sum(security_scores) / len(security_scores) if security_scores else 0,
            "performance_consensus": sum(performance_scores) / len(performance_scores) if performance_scores else 0,
            "models_in_agreement": len([s for s in architecture_scores if abs(s - (sum(architecture_scores)/len(architecture_scores))) <= 10]),
            "expert_grade": self._consensus_to_grade(architecture_scores + security_scores + performance_scores)
        }

        return consensus

    def _consensus_to_grade(self, all_scores: List[float]) -> str:
        """Convert consensus scores to expert grade"""
        if not all_scores:
            return "Incomplete"

        avg_score = sum(all_scores) / len(all_scores)

        if avg_score >= 95: return "Expert A+"
        elif avg_score >= 90: return "Expert A"
        elif avg_score >= 85: return "Expert B+"
        elif avg_score >= 80: return "Expert B"
        elif avg_score >= 75: return "Expert C+"
        else: return "Needs Expert Review"

    def _calculate_confidence(self, model_analyses: Dict) -> float:
        """Calculate confidence in analysis based on model agreement"""

        successful_analyses = [a for a in model_analyses.values() if "error" not in a]

        if len(successful_analyses) < 2:
            return 0.3  # Low confidence with single model

        # Calculate variance in scores as confidence indicator
        architecture_scores = [a.get("architecture_review", {}).get("score", 0) for a in successful_analyses]
        variance = sum((s - (sum(architecture_scores)/len(architecture_scores)))**2 for s in architecture_scores) / len(architecture_scores)

        # High variance = low confidence
        confidence = max(0.5, 1.0 - (variance / 1000))

        return round(confidence, 2)

# Integration with Layer 1
async def run_dual_layer_analysis(crate_path: str):
    """
    Run both Layer 1 (Lightning) and Layer 2 (Expert) analysis
    Combine results for ultimate QA insights
    """

    print("🎯 Running Dual-Layer QA Analysis")
    print("=" * 80)

    # Layer 1: Lightning Analysis
    print("\n⚡ Layer 1: Lightning Script-Only Analysis")
    lightning_qa = CTASLightningQA()
    lightning_results = await lightning_qa.lightning_analyze(crate_path)

    # Layer 2: Expert Analysis
    print("\n👨‍💻 Layer 2: AI-Driven Expert Analysis")
    expert_qa = ZenCoderExpertQA()

    # Platform research (one-time setup)
    # platform_research = await expert_qa.platform_research()
    # platform_testing = await expert_qa.platform_testing_with_playwright()

    # Expert analysis
    expert_consensus = await expert_qa.multi_model_consensus(crate_path)
    zentester_results = await expert_qa.zentester_integration(crate_path)

    # Combine insights
    dual_layer_results = {
        "analysis_type": "dual_layer_qa",
        "crate_path": crate_path,
        "timestamp": datetime.now().isoformat(),

        "layer_1_lightning": {
            "analysis_time": lightning_results.analysis_time_seconds,
            "grade": lightning_results.overall_grade,
            "critical_issues": len(lightning_results.critical_issues),
            "pr_candidates": len(lightning_results.pr_candidates),
            "auto_fixable": len([pr for pr in lightning_results.pr_candidates if pr.get("auto_fixable")])
        },

        "layer_2_expert": {
            "consensus_grade": expert_consensus["consensus_analysis"]["expert_grade"],
            "confidence": expert_consensus["expert_confidence"],
            "models_used": len(expert_consensus["individual_models"]),
            "test_strategy_score": zentester_results["test_quality_score"]
        },

        "unified_recommendation": _unify_recommendations(lightning_results, expert_consensus, zentester_results)
    }

    # Output combined results
    print("\n📊 Dual-Layer Analysis Complete")
    print(f"Lightning Grade: {lightning_results.overall_grade}")
    print(f"Expert Grade: {expert_consensus['consensus_analysis']['expert_grade']}")
    print(f"Expert Confidence: {expert_consensus['expert_confidence']}")

    return dual_layer_results

def _unify_recommendations(lightning, expert_consensus, zentester) -> List[str]:
    """Unify recommendations from both layers"""

    unified = []

    # High-priority from Lightning (immediate fixes)
    unified.extend([f"🚀 Quick Fix: {rec}" for rec in lightning.recommendations[:2]])

    # Expert recommendations (strategic improvements)
    if "consensus_analysis" in expert_consensus:
        unified.append("🧠 Expert: Implement comprehensive error handling strategy")
        unified.append("🧠 Expert: Add performance benchmarks and regression testing")

    # Testing recommendations from Zentester
    if "expert_test_recommendations" in zentester:
        unified.extend([f"🧪 Testing: {rec}" for rec in zentester["expert_test_recommendations"][:2]])

    return unified[:8]  # Top 8 unified recommendations

# Main execution
async def main():
    # Test with sample crate
    sample_crate = "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-qa-analyzer"

    if Path(sample_crate).exists():
        results = await run_dual_layer_analysis(sample_crate)

        # Save unified results
        with open("dual_layer_qa_results.json", "w") as f:
            json.dump(results, f, indent=2)

        print("\n✅ Dual-Layer QA Analysis Complete")
        print("📄 Results saved to: dual_layer_qa_results.json")

if __name__ == "__main__":
    from pathlib import Path
    asyncio.run(main())
```

---

## 🎯 Integration Points

### Statistical CDN Integration
Both layers feed into the Statistical CDN on port 18109:

```python
# Layer 1 feeds lightning metrics
# Layer 2 feeds expert consensus data
# Combined for organizational intelligence
```

### Claude Meta-Agent PR Automation
```python
# Claude Code integration for automated PRs
# Uses Layer 1 auto-fixable candidates
# Enhanced by Layer 2 expert recommendations
```

---

## 🚀 Implementation Plan

### Week 1: Layer 1 Lightning QA
- [x] Design script-only architecture
- [ ] Implement GPU-accelerated analysis
- [ ] Build Linear integration
- [ ] Test Claude meta-agent PR generation

### Week 2: Layer 2 Expert QA
- [ ] ZenCoder.ai API integration
- [ ] Crawl4ai platform research
- [ ] Playwright automation testing
- [ ] Multi-model consensus system

### Week 3: Integration
- [ ] Dual-layer orchestration
- [ ] Statistical CDN unified metrics
- [ ] PR automation pipeline
- [ ] Expert validation testing

This gives you the perfect separation: **Lightning-fast script-based analysis for immediate automation** + **Deep AI-driven expert analysis for strategic insights**.

Ready to implement Layer 1 first?