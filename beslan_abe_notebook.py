#!/usr/bin/env python3
"""
Beslan OSINT Collection - ABE Notebook
Execute this in Google Colab or AI Studio with GPU
"""

# Install dependencies
print("📦 Installing dependencies...")
import subprocess
import sys
subprocess.run([sys.executable, "-m", "pip", "install", "-q", 
               "beautifulsoup4", "requests", "nltk"])

# Download NLTK data
import nltk
print("📚 Downloading NLTK corpora...")
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('averaged_perceptron_tagger_eng', quiet=True)
nltk.download('maxent_ne_chunker', quiet=True)
nltk.download('words', quiet=True)

# Download and execute the main script
print("📥 Downloading Beslan OSINT script from ABE...")
subprocess.run(["gsutil", "cp", 
               "gs://ctas7-abe-osint/beslan_osint_extraction.py", 
               "./beslan_osint_extraction.py"], check=True)

print("\n🔍 Starting Beslan OSINT Collection...\n")
exec(open('beslan_osint_extraction.py').read())

# Upload results
print("\n📤 Uploading results to ABE...")
subprocess.run(["gsutil", "cp", "beslan_osint_results.json", 
               "gs://ctas7-abe-osint/results/beslan_osint_results.json"])

print("\n✅ Complete! Results at: gs://ctas7-abe-osint/results/beslan_osint_results.json")

