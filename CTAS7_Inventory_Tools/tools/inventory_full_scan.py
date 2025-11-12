import os
import csv
import pathlib
import datetime
import traceback

OUTPUT_FILE = "repo_inventory_full.csv"
DATE_FILTER = "2025-11-01"  # Change this to your desired cutoff date (YYYY-MM-DD)


def log(msg):
    print(f"[INVENTORY] {msg}")


def scan_files(base_dir):
    log(f"Scanning files in {base_dir}")
    file_list = []
    cutoff = datetime.datetime.strptime(DATE_FILTER, "%Y-%m-%d")
    for root, dirs, files in os.walk(base_dir):
        for name in files:
            if name.endswith(('.md', '.csv', '.txt')):
                try:
                    path = os.path.join(root, name)
                    stat = os.stat(path)
                    mod_time = datetime.datetime.fromtimestamp(stat.st_mtime)
                    if mod_time >= cutoff:
                        file_list.append({
                            "path": os.path.relpath(path, base_dir),
                            "size": stat.st_size,
                            "modified": mod_time.strftime("%Y-%m-%d %H:%M:%S"),
                        })
                except Exception as e:
                    log(f"Error reading {path}: {e}")
                    traceback.print_exc()
    return file_list


def write_csv(file_list, output_file):
    log(f"Writing inventory to {output_file}")
    try:
        with open(output_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["path", "size", "modified"])
            writer.writeheader()
            for entry in file_list:
                writer.writerow(entry)
        log(f"Inventory written: {output_file} ({len(file_list)} files)")
    except Exception as e:
        log(f"Error writing CSV: {e}")
        traceback.print_exc()


def main():
    base_dir = pathlib.Path.cwd().parent
    log(f"Starting full repo inventory scan (filter: {DATE_FILTER})...")
    try:
        files = scan_files(str(base_dir))
        write_csv(files, OUTPUT_FILE)
        log("Scan complete.")
    except Exception as e:
        log(f"Fatal error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()
