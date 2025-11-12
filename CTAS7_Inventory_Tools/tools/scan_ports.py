import csv
import subprocess

def scan_ports():
    ports = []
    try:
        result = subprocess.run(["lsof", "-i", "-P", "-n"], capture_output=True, text=True)
        for line in result.stdout.splitlines()[1:]:
            parts = line.split()
            if len(parts) > 8:
                ports.append([parts[0], parts[8]])
    except Exception as e:
        ports = [["error", str(e)]]
    with open("ports_inventory.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["process", "port_info"])
        for proc, port in ports:
            writer.writerow([proc, port])
    print("[scan_ports] ports_inventory.csv written.")

if __name__ == "__main__":
    scan_ports()
