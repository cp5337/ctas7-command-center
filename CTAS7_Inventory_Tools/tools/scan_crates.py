import csv
import pathlib
import datetime

def scan_crates():
    crates = []
    crates_dir = pathlib.Path.cwd().parent / "crates"
    if crates_dir.exists():
        for crate in crates_dir.glob("*/"):
            crates.append([crate.name, crate.stat().st_mtime])
    else:
        crates = [["example_crate", datetime.datetime.now().timestamp()]]
    with open("crates_inventory.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["crate_name", "last_modified"])
        for name, mtime in crates:
            dt = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([name, dt])
    print("[scan_crates] crates_inventory.csv written.")

if __name__ == "__main__":
    scan_crates()
