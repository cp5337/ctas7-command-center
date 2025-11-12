import csv
import subprocess

def scan_containers():
    containers = []
    try:
        result = subprocess.run(["docker", "ps", "--format", "{{.Names}},{{.Status}}"], capture_output=True, text=True)
        for line in result.stdout.splitlines():
            name, status = line.split(",", 1)
            containers.append([name, status])
    except Exception as e:
        containers = [["error", str(e)]]
    with open("containers_inventory.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["container_name", "status"])
        for name, status in containers:
            writer.writerow([name, status])
    print("[scan_containers] containers_inventory.csv written.")

if __name__ == "__main__":
    scan_containers()
