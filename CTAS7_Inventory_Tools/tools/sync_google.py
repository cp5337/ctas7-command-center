import pandas as pd
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = "YOUR_GOOGLE_SHEET_ID"
RANGE_NAME = "Sheet1!A1"
CREDENTIALS_FILE = "service_account.json"

def sync_google():
    if not os.path.exists("inventory.csv"):
        print("[sync_google] inventory.csv not found.")
        return
    df = pd.read_csv("inventory.csv")
    creds = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE)
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    values = [df.columns.tolist()] + df.values.tolist()
    body = {"values": values}
    result = sheet.values().update(
        spreadsheetId=SHEET_ID,
        range=RANGE_NAME,
        valueInputOption="RAW",
        body=body
    ).execute()
    print(f"[sync_google] Uploaded {len(df)} rows to Google Sheet.")

if __name__ == "__main__":
    sync_google()
