import pandas as pd
import glob

def merge_inventory():
    csv_files = [f for f in glob.glob("*_inventory.csv") if f != "inventory.csv"]
    dfs = [pd.read_csv(f) for f in csv_files]
    merged = pd.concat(dfs, ignore_index=True, sort=False)
    merged.to_csv("inventory.csv", index=False)
    print("[merge_inventory] inventory.csv written.")

if __name__ == "__main__":
    merge_inventory()
