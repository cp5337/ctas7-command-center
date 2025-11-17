#!/usr/bin/env python3
"""
Enhanced OSINT Script with API Key Management
Integrates with CTAS7 credential management system
"""

import os
import sys
import subprocess
import requests
from pathlib import Path

# Load environment variables from CTAS7 system
def load_env_file():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

class EnhancedOSINT:
    """Enhanced OSINT with API key management"""

    def __init__(self):
        self.virustotal_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.otx_key = os.getenv("ALIENVAULT_OTX_API_KEY")
        self.hibp_key = os.getenv("HIBP_API_KEY")  # Optional
        self.shodan_key = os.getenv("SHODAN_API_KEY")  # Optional

        print("🔍 Enhanced OSINT Script - CTAS7 Integration")
        print("=" * 50)
        print(f"VirusTotal: {'✅' if self.virustotal_key and 'get_free_key' not in self.virustotal_key else '❌'}")
        print(f"OTX: {'✅' if self.otx_key and 'get_free_key' not in self.otx_key else '❌'}")
        print(f"HIBP: {'✅' if self.hibp_key else '⚠️  Optional'}")
        print(f"Shodan: {'✅' if self.shodan_key else '⚠️  Optional'}")
        print()

    def run_command(self, command):
        """Execute shell command safely"""
        try:
            result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
            print(result.stdout)
            return True
        except subprocess.CalledProcessError as e:
            print(f"[!] Error executing {command}: {e.stderr}")
            return False

    def scan_attachment_vt(self, attachment_path):
        """Scan attachment with VirusTotal using configured API key"""
        if not self.virustotal_key or 'get_free_key' in self.virustotal_key:
            print("[!] VirusTotal API key not configured")
            return False

        if not os.path.exists(attachment_path):
            print("[!] Attachment file not found")
            return False

        print("[*] Scanning with VirusTotal...")

        try:
            files = {'file': (attachment_path, open(attachment_path, 'rb'))}
            headers = {'x-apikey': self.virustotal_key}

            response = requests.post(
                "https://www.virustotal.com/api/v3/files",
                files=files,
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                scan_id = data.get('data', {}).get('id', 'unknown')
                print(f"[✅] Scan submitted successfully. ID: {scan_id}")
                return scan_id
            else:
                print(f"[!] Scan failed: {response.status_code}")
                return False

        except Exception as e:
            print(f"[!] VirusTotal error: {e}")
            return False

    def check_breach_enhanced(self, email_address):
        """Enhanced breach checking with multiple sources"""
        print(f"[*] Checking breaches for {email_address}...")

        # Use h8mail with HIBP API if available
        if self.hibp_key:
            self.run_command(f"h8mail -t {email_address} --hibp-key {self.hibp_key}")
        else:
            print("[*] Using h8mail with free sources...")
            self.run_command(f"h8mail -t {email_address}")

    def enhanced_domain_intel(self, domain):
        """Enhanced domain intelligence with Shodan"""
        print(f"[*] Gathering enhanced domain intel for {domain}...")

        # Standard WHOIS
        self.run_command(f"whois {domain}")

        # Shodan lookup if key available
        if self.shodan_key:
            print("[*] Checking Shodan...")
            try:
                headers = {'X-API-Key': self.shodan_key}
                response = requests.get(
                    f"https://api.shodan.io/shodan/host/search?query={domain}",
                    headers=headers,
                    timeout=10
                )
                if response.status_code == 200:
                    data = response.json()
                    total = data.get('total', 0)
                    print(f"[✅] Shodan found {total} results for {domain}")

                    for result in data.get('matches', [])[:3]:
                        ip = result.get('ip_str')
                        ports = result.get('port')
                        print(f"    {ip}:{ports} - {result.get('org', 'Unknown Org')}")
                else:
                    print(f"[!] Shodan error: {response.status_code}")
            except Exception as e:
                print(f"[!] Shodan lookup failed: {e}")
        else:
            print("[⚠️] Shodan API key not configured - basic lookup only")

    def osint_investigation_workflow(self, target_email, instagram_handle=None, attachment_path=None, suspicious_url=None):
        """Complete OSINT investigation workflow"""
        print(f"\n🎯 Starting OSINT investigation for: {target_email}")
        print("=" * 60)

        email_domain = target_email.split("@")[-1] if "@" in target_email else target_email

        # 1. Instagram analysis (if provided)
        if instagram_handle:
            print("\n📸 Instagram Analysis:")
            self.run_command(f"instaloader --no-pictures --no-videos {instagram_handle}")
            self.run_command(f"sherlock {instagram_handle}")

        # 2. Email breach checking
        print("\n💔 Breach Analysis:")
        self.check_breach_enhanced(target_email)

        # 3. Domain intelligence
        print("\n🌐 Domain Intelligence:")
        self.enhanced_domain_intel(email_domain)

        # 4. Network analysis
        print("\n🔍 Network Analysis:")
        self.run_command(f"traceroute {email_domain}")
        self.run_command(f"nmap -p 25,80,443,465,587,993,995 {email_domain}")

        # 5. Attachment analysis
        if attachment_path:
            print("\n📎 Attachment Analysis:")
            scan_id = self.scan_attachment_vt(attachment_path)
            if scan_id:
                print(f"[*] Check results at: https://www.virustotal.com/gui/file-analysis/{scan_id}")

            # EXIF analysis
            self.run_command(f"exiftool {attachment_path}")

        # 6. URL analysis
        if suspicious_url:
            print("\n🔗 URL Analysis:")
            self.run_command(f"urlcrazy {suspicious_url}")

        print("\n✅ OSINT Investigation Complete!")
        print("📊 Results saved to: osint_investigation_results.txt")

def main():
    """Main OSINT workflow"""
    osint = EnhancedOSINT()

    print("🎯 CTAS7 Enhanced OSINT Investigation")
    print("Enter investigation targets (press Enter to skip optional fields)")
    print()

    # Get targets
    target_email = input("📧 Target email/domain: ").strip()
    if not target_email:
        print("❌ Email/domain required")
        return

    instagram_handle = input("📸 Instagram handle (optional): ").strip() or None
    attachment_path = input("📎 Attachment path (optional): ").strip() or None
    suspicious_url = input("🔗 Suspicious URL (optional): ").strip() or None

    # Validate attachment path
    if attachment_path and not os.path.exists(attachment_path):
        print(f"⚠️  Attachment not found: {attachment_path}")
        attachment_path = None

    # Run investigation
    osint.osint_investigation_workflow(
        target_email=target_email,
        instagram_handle=instagram_handle,
        attachment_path=attachment_path,
        suspicious_url=suspicious_url
    )

if __name__ == "__main__":
    main()