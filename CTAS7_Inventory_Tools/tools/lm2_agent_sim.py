import time
import csv
import threading
import queue
import random
import datetime

AGENTS = ["Scout", "Comms", "Ops", "Data", "Monitor"]
EVENTS = ["ping", "status", "msg", "update", "alert"]

def agent_worker(name, q, stop_event):
    for i in range(6):
        if stop_event.is_set():
            break
        event = random.choice(EVENTS)
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        q.put((name, event, timestamp))
        time.sleep(random.uniform(2, 5))

def lm2_agent_sim():
    q = queue.Queue()
    stop_event = threading.Event()
    threads = []
    for agent in AGENTS:
        t = threading.Thread(target=agent_worker, args=(agent, q, stop_event))
        t.start()
        threads.append(t)
    start = time.time()
    with open("agents_runtime.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["agent", "event", "timestamp"])
        while time.time() - start < 30:
            try:
                agent, event, timestamp = q.get(timeout=1)
                writer.writerow([agent, event, timestamp])
                print(f"[LM2] {agent}: {event} @ {timestamp}")
            except queue.Empty:
                continue
        stop_event.set()
    for t in threads:
        t.join()
    print("[lm2_agent_sim] agents_runtime.csv written.")

if __name__ == "__main__":
    lm2_agent_sim()
