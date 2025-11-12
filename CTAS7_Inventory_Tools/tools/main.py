import subprocess
import sys
import datetime

BANNER = r"""
  ____ ____ ___  ____   ___   _   _   _   _   _   _   _   _   _   _   _   _  
 / ___|  _ \_ _|/ ___| / _ \ | | | | | | | | | | | | | | | | | | | | | | | | 
| |   | |_) | || |    | | | || |_| |_| |_| |_| |_| |_| |_| |_| |_| |_| |_| | 
| |___|  __/| || |___ | |_| ||  _   _   _   _   _   _   _   _   _   _   _  | 
 \____|_|  |___|\____| \___/ |_| |_| |_| |_| |_| |_| |_| |_| |_| |_| |_| |_| 
"""

def menu():
    print(BANNER)
    print(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nCTAS-7 Inventory Tools Menu:")
    print("1. Full Scan (All Scanners, Merge, Google Sync)")
    print("2. Quick Scan (Crates, Agents, Merge)")
    print("3. LM2 Agent Simulation")
    print("4. Exit")
    choice = input("Select option [1-4]: ").strip()
    return choice

def run_scanner(script):
    print(f"\n[+] Running {script} ...")
    subprocess.run([sys.executable, f"tools/{script}"], check=True)

def main():
    while True:
        choice = menu()
        if choice == "1":
            for script in ["scan_crates.py", "scan_agents.py", "scan_ports.py", "scan_containers.py", "scan_docs.py"]:
                run_scanner(script)
            run_scanner("merge_inventory.py")
            run_scanner("sync_google.py")
        elif choice == "2":
            for script in ["scan_crates.py", "scan_agents.py"]:
                run_scanner(script)
            run_scanner("merge_inventory.py")
        elif choice == "3":
            run_scanner("lm2_agent_sim.py")
        elif choice == "4":
            print("Exiting CTAS-7 Inventory Tools.")
            break
        else:
            print("Invalid choice. Please select 1-4.")

if __name__ == "__main__":
    main()
