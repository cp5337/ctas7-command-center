# Legal Intelligence API Setup Guide

## Required API Keys

### 1. CourtListener API
**FREE** - Public legal database with extensive federal case coverage

**Sign up:** https://www.courtlistener.com/api/
1. Create account at https://www.courtlistener.com/sign-up/
2. Go to Profile → API Access
3. Generate API token
4. Add to environment: `export COURTLISTENER_API_TOKEN="your_token_here"`

**Coverage:**
- Federal court opinions
- Circuit and district court cases
- Supreme Court decisions
- Terrorism prosecutions
- Financial crime cases
- National security cases

### 2. PACER API (Optional)
**PAID** - Official federal court system ($0.10 per page)

**Sign up:** https://pacer.uscourts.gov/
- Requires billing account
- Access to real-time filings
- Complete case dockets
- Sealed/confidential cases (with authorization)

**Add credentials:**
```bash
export PACER_USERNAME="your_username"
export PACER_PASSWORD="your_password"
```

### 3. Additional Legal APIs (Future Integration)

**Justia API** - Free case law
```bash
export JUSTIA_API_KEY="your_key"
```

**Westlaw API** - Premium legal research (requires institutional access)
```bash
export WESTLAW_API_KEY="your_key"
```

## Quick Test

```bash
cd ctas7-intelligence-generator
python3 legal_api_integration.py
```

**Expected Output:**
```
🏛️  Legal Case Harvester for CTAS7-TT-Narrative
============================================================

📊 Harvesting Hezbollah prosecution cases...
   ✅ 8 cases saved to legal_case_cache/hezbollah_intelligence_20251116_154523.json

📊 Harvesting domestic terrorism cases...
   ✅ 12 cases saved to legal_case_cache/domestic_intelligence_20251116_154545.json

📊 Harvesting state-sponsored cases...
   ✅ 15 cases saved to legal_case_cache/state_sponsored_intelligence_20251116_154601.json

🕸️  Generating network relationship graphs...
   ✅ Network data saved to legal_case_cache/network_graphs_intelligence_20251116_154618.json

🎯 Intelligence harvest complete!
   Total cases processed: 35
   Ready for CTAS7-TT-Narrative integration
```

## Integration with ABE Pipeline

The harvested legal data feeds directly into our CTAS7-TT-Narrative generation:

1. **Real Case Studies** - Actual prosecutions mapped to TTL phases
2. **Network Analysis** - Co-conspirator relationships and organizational structures
3. **Financial Flows** - Money laundering patterns from court records
4. **Operational Methods** - TTPs revealed through prosecutions
5. **Sentencing Data** - Legal consequences and deterrent effects

## Visual Intelligence Products

Generated from legal case data:
- **Network graphs** showing terrorist organizational structures
- **Geographic heat maps** of prosecution activity
- **Timeline visualizations** of operational phases
- **Financial flow diagrams** from asset forfeiture cases
- **Success rate statistics** for different investigation methods

## Security Notes

- All API access logged for audit purposes
- Court records may contain sensitive information
- Respect rate limits (CourtListener: 5000 requests/hour)
- Cache data locally to minimize API calls
- Some cases may be sealed/classified - respect access restrictions

Ready to generate real intelligence products with actual prosecution data!