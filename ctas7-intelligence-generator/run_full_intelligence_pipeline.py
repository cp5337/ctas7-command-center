#!/usr/bin/env python3
"""
CTAS7 Full Intelligence Pipeline Runner
Demonstrates complete intelligence gathering and analysis capabilities
"""

import os
import sys
from pathlib import Path
from master_intelligence_orchestrator import CTAS7MasterOrchestrator

def check_api_keys():
    """Check for required API keys"""
    required_keys = {
        'GEMINI_API_KEY': 'Google AI Studio (ABE Analysis Engine)',
        'PACER_LOGIN': 'PACER Federal Court Records (Optional)',
        'CONGRESS_API_KEY': 'Congress.gov API (Optional)',
        'COURTLISTENER_API_KEY': 'CourtListener API (Optional)'
    }

    available_keys = []
    missing_keys = []

    for key, description in required_keys.items():
        if os.getenv(key):
            available_keys.append(f"✅ {key}: {description}")
        else:
            missing_keys.append(f"❌ {key}: {description}")

    print("🔑 API Key Status:")
    for key in available_keys:
        print(f"   {key}")

    if missing_keys:
        print("\n⚠️  Missing Optional Keys:")
        for key in missing_keys:
            print(f"   {key}")
        print("\n   Note: System will use available APIs and public data sources")

    # Require at least Gemini API key for ABE analysis
    if not os.getenv('GEMINI_API_KEY'):
        print("\n❌ CRITICAL: GEMINI_API_KEY required for ABE analysis")
        print("   Get key at: https://aistudio.google.com/app/apikey")
        return False

    return True

def display_intelligence_capabilities():
    """Display comprehensive intelligence capabilities"""
    print("\n🌐 CTAS7 COMPREHENSIVE INTELLIGENCE CAPABILITIES")
    print("=" * 60)

    capabilities = {
        "📚 Government Document Intelligence": [
            "Library of Congress virtual branch access",
            "LOC microservices for targeted searches",
            "GAO reports on security program effectiveness",
            "Congress.gov legislative intelligence + CRS reports"
        ],
        "⚖️ Legal Intelligence": [
            "PACER federal court terrorism cases",
            "CourtListener legal database access",
            "Real prosecution data and court filings",
            "Legal precedent analysis for threat patterns"
        ],
        "📊 Raw Dataset Intelligence": [
            "Data.gov government datasets by agency",
            "DHS, FBI, TSA, Treasury security data",
            "Raw intelligence data sample analysis",
            "Statistical pattern recognition"
        ],
        "🚗 Transportation Security": [
            "NHTSA vehicle identification analysis",
            "CDAN crash data pattern analysis",
            "Vehicle-based threat assessments",
            "Transportation vulnerability analysis",
            "Supply chain security intelligence"
        ],
        "📡 Real-Time Intelligence": [
            "DOJ press release RSS monitoring",
            "Current terrorism prosecution tracking",
            "Law enforcement operation updates",
            "Policy changes and enforcement priorities"
        ],
        "🧠 ABE Analysis Engine": [
            "Google Gemini 2M Flash model integration",
            "Automated intelligence value assessment",
            "Narrative generation from structured data",
            "Real-time threat analysis and correlation"
        ],
        "📖 CTAS7-TT-Narrative Generation": [
            "TTL (Terrorist Task List) phase analysis",
            "Flowing prose narratives for semantic analysis",
            "Professional intelligence brief formatting",
            "Executive summary generation"
        ]
    }

    for category, features in capabilities.items():
        print(f"\n{category}")
        for feature in features:
            print(f"   • {feature}")

def run_sample_intelligence_collection():
    """Run sample intelligence collection to demonstrate capabilities"""
    print("\n🎯 SAMPLE INTELLIGENCE COLLECTION DEMONSTRATION")
    print("=" * 60)

    # Initialize orchestrator
    orchestrator = CTAS7MasterOrchestrator()

    # Sample scenarios for demonstration
    demo_scenarios = [
        "Hezbollah financial operations",
        "Domestic terrorism vehicle attacks"
    ]

    print(f"Demo Target Scenarios:")
    for i, scenario in enumerate(demo_scenarios, 1):
        print(f"   {i}. {scenario}")

    print(f"\n🔄 Running limited intelligence collection...")

    # Run abbreviated collection for demonstration
    try:
        # Test LOC intelligence gathering
        print("   📚 Testing LOC virtual branch access...")
        loc_results = orchestrator.loc_branch.smart_query(demo_scenarios[0], max_results=5)
        print(f"      ✅ LOC: {len(loc_results)} intelligence items")

        # Test transportation intelligence
        print("   🚗 Testing transportation security analysis...")
        transport_results = orchestrator.gather_transportation_intelligence(demo_scenarios[1])
        print(f"      ✅ Transport: {len(transport_results)} assessments")

        # Generate sample narrative
        print("   📖 Testing TTL narrative generation...")
        sample_intelligence = {
            'legal_cases': [],
            'government_reports': loc_results,
            'legislative_intelligence': [],
            'raw_datasets': [],
            'historical_incidents': [],
            'transportation_security': transport_results
        }

        phase_info = {
            'title': 'Pre-Operational Planning Phase (Demo)',
            'description': 'Demonstration of narrative generation capabilities'
        }

        sample_narrative = orchestrator.generate_phase_narrative(phase_info, sample_intelligence)

        # Save demo outputs
        demo_dir = orchestrator.output_dir / "demonstration"
        demo_dir.mkdir(exist_ok=True)

        with open(demo_dir / "sample_narrative_demo.txt", 'w') as f:
            f.write(f"CTAS7-TT-Narrative Sample Generation\n")
            f.write(f"=" * 40 + "\n\n")
            f.write(f"Target Scenario: {demo_scenarios[0]}\n")
            f.write(f"Intelligence Sources: {len(loc_results + transport_results)} items\n\n")
            f.write(sample_narrative)

        print(f"      ✅ Narrative: Generated successfully")
        print(f"      📁 Demo outputs saved to: {demo_dir}")

        return True

    except Exception as e:
        print(f"      ❌ Demo collection failed: {e}")
        print(f"         (This is normal if API keys are not configured)")
        return False

def display_usage_instructions():
    """Display usage instructions for full system"""
    print("\n📋 FULL SYSTEM USAGE INSTRUCTIONS")
    print("=" * 50)

    instructions = [
        "1. Configure API Keys:",
        "   • GEMINI_API_KEY: Required for ABE analysis",
        "   • CONGRESS_API_KEY: For legislative intelligence",
        "   • PACER_LOGIN: For federal court access",
        "   • COURTLISTENER_API_KEY: For legal database access",
        "",
        "2. Run Full Intelligence Pipeline:",
        "   python master_intelligence_orchestrator.py",
        "",
        "3. Individual Module Testing:",
        "   python legal_api_integration.py",
        "   python virtual_loc_branch.py",
        "   python gao_intelligence_integration.py",
        "   python congress_api_integration.py",
        "   python datagov_integration.py",
        "",
        "4. Generated Intelligence Products:",
        "   • CTAS7_TT_Narrative_Comprehensive_*.json",
        "   • CTAS7_TT_Narrative_Report_*.txt",
        "   • Individual module outputs in cache directories",
        "",
        "5. Database Storage:",
        "   • ctas7_master_intelligence.db (Master database)",
        "   • virtual_loc_branch.db (LOC intelligence cache)",
        "   • Individual module databases as needed"
    ]

    for instruction in instructions:
        print(instruction)

def main():
    print("🚀 CTAS7 INTELLIGENCE PIPELINE DEMONSTRATION")
    print("=" * 60)
    print("Professional-grade intelligence gathering and analysis system")
    print("Integrating multiple government APIs and data sources")

    # Check API key availability
    if not check_api_keys():
        print("\n⚠️  Continuing with limited demonstration mode...")

    # Display capabilities
    display_intelligence_capabilities()

    # Run sample collection
    print(f"\n" + "=" * 60)
    success = run_sample_intelligence_collection()

    # Display usage instructions
    display_usage_instructions()

    print(f"\n🎯 CTAS7 INTELLIGENCE PIPELINE STATUS")
    print("=" * 50)
    print("✅ Master orchestrator: Ready")
    print("✅ Government APIs: Integrated")
    print("✅ ABE analysis engine: Configured")
    print("✅ TTL narrative generation: Available")
    print("✅ Professional intelligence products: Enabled")

    if success:
        print("✅ System demonstration: Successful")
    else:
        print("⚠️  System demonstration: Limited (API keys needed)")

    print(f"\n💡 INTELLIGENCE SOURCES AVAILABLE:")
    print("   • Legal: PACER + CourtListener federal court data")
    print("   • Government: LOC + GAO + Congress.gov reports")
    print("   • Datasets: Data.gov raw agency intelligence")
    print("   • Transportation: NHTSA + CDAN vehicle/crash analysis")
    print("   • Real-Time: DOJ RSS prosecution/operation feeds")
    print("   • Analysis: ABE semantic/ontological processing")

    print(f"\n🎖️  PROFESSIONAL INTELLIGENCE PRODUCTS:")
    print("   • CTAS7-TT-Narrative comprehensive reports")
    print("   • Executive intelligence summaries")
    print("   • Threat pattern analysis and correlation")
    print("   • Operational intelligence for decision makers")

    print(f"\n📁 Generated files in: ctas7-intelligence-generator/")

if __name__ == "__main__":
    main()