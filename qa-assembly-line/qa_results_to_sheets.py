#!/usr/bin/env python3
import argparse
import os
import glob
import json
import pandas as pd

try:
    import gspread
    from google.oauth2.service_account import Credentials
except Exception:
    print("Missing Google Sheets dependencies. Install with: pip install gspread google-auth")
    raise

parser = argparse.ArgumentParser()
parser.add_argument('--creds', required=True, help='Path to service account JSON key')
parser.add_argument('--sheet', required=True, help='Google Sheet name or URL')
parser.add_argument('--results', required=True, help='Path to results directory')
args = parser.parse_args()

CREDS_PATH = os.path.expanduser(args.creds)
SHEET_NAME = args.sheet
RESULTS_DIR = os.path.expanduser(args.results)

if not os.path.isfile(CREDS_PATH):
    raise SystemExit(f"Service account creds not found: {CREDS_PATH}")

json_files = glob.glob(os.path.join(RESULTS_DIR, "*-clone.json"))
rows = []
for f in json_files:
    try:
        data = json.load(open(f))
    except Exception:
        continue
    crate = os.path.basename(f).replace('-clone.json','')
    flat = {'crate': crate}
    for k,v in data.items():
        if isinstance(v, (dict, list)):
            flat[k] = json.dumps(v)
        else:
            flat[k] = v
    rows.append(flat)

if not rows:
    print('No JSON results found to upload.')
    raise SystemExit(0)

df = pd.DataFrame(rows)
# normalize columns order
cols = ['crate'] + [c for c in df.columns if c != 'crate']
df = df[cols]

# write CSV local copy
csv_out = os.path.join(RESULTS_DIR, 'qa_results_master.csv')
df.to_csv(csv_out, index=False)
print('Wrote', csv_out)

# upload to Google Sheets
scopes = ['https://www.googleapis.com/auth/spreadsheets']
creds = Credentials.from_service_account_file(CREDS_PATH, scopes=scopes)
gc = gspread.authorize(creds)

# open or create sheet
try:
    sh = gc.open_by_key(SHEET_NAME)
except Exception:
    try:
        sh = gc.open(SHEET_NAME)
    except Exception:
        sh = gc.create(SHEET_NAME)

ws = sh.sheet1
ws.resize(rows=df.shape[0]+1, cols=df.shape[1])
ws.update([df.columns.values.tolist()] + df.fillna('').values.tolist())
print('Pushed results to Google Sheet:', SHEET_NAME)
