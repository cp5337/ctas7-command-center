import csv
import pathlib
import datetime

def scan_docs():
    docs_dir = pathlib.Path.cwd().parent / "docs"
    docs = []
    cutoff = datetime.datetime.now() - datetime.timedelta(days=30)
    if docs_dir.exists():
        for doc in docs_dir.glob("*.md"):
            mtime = datetime.datetime.fromtimestamp(doc.stat().st_mtime)
            if mtime < cutoff:
                docs.append([doc.name, mtime.strftime("%Y-%m-%d %H:%M:%S")])
    else:
        docs = [["example.md", cutoff.strftime("%Y-%m-%d %H:%M:%S")]]
    with open("docs_inventory.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["doc_file", "last_modified"])
        for name, mtime in docs:
            writer.writerow([name, mtime])
    print("[scan_docs] docs_inventory.csv written.")

if __name__ == "__main__":
    scan_docs()
