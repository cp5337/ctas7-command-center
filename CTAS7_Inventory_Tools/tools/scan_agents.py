import csv
import pathlib

def scan_agents():
    agents_dir = pathlib.Path.cwd().parent / "agents"
    agents = []
    if agents_dir.exists():
        for agent in agents_dir.glob("*.json"):
            agents.append([agent.name, agent.stat().st_mtime])
    else:
        agents = [["example_agent.json", 0]]
    with open("agents_inventory.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["agent_file", "last_modified"])
        for name, mtime in agents:
            writer.writerow([name, mtime])
    print("[scan_agents] agents_inventory.csv written.")

if __name__ == "__main__":
    scan_agents()
