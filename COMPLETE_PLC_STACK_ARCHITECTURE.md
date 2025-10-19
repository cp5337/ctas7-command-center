# Complete PLC Stack Architecture
## VSC-SOP UI + SynaptixPLC Orchestration + Hardware Control

**Date**: October 13, 2025  
**Stack**: Full hardware-to-UI integration

---

## 🏗️ **The Complete Stack (All 3 Layers)**

```
┌──────────────────────────────────────────────────────┐
│  Layer 1: UI/UX (iOS/iPad)                          │
│  ─────────────────────────────                      │
│  Source: VSC-SOP Mobile Patterns                    │
│  - Operator profiles                                │
│  - Shift handoff                                    │
│  - Command queue                                    │
│  - Emergency shutdown                               │
│  - Audit logging                                    │
│                                                     │
│  Technology: SwiftUI                                │
└──────────────────────────────────────────────────────┘
                        ↕ HTTP/JSON
┌──────────────────────────────────────────────────────┐
│  Layer 2: Orchestration (Backend)                   │
│  ───────────────────────────────                    │
│  Your Rust: SynaptixPLC                             │
│  - Command routing                                  │
│  - Node management                                  │
│  - Queue processing                                 │
│  - State tracking                                   │
│  - Event logging                                    │
│  - Neural Mux integration                           │
│                                                     │
│  Technology: Rust + Tokio                           │
└──────────────────────────────────────────────────────┘
                        ↕ Modbus/OPC UA/Ethernet IP
┌──────────────────────────────────────────────────────┐
│  Layer 3: Hardware Interface (Device Drivers) ⭐    │
│  ───────────────────────────────────────────────    │
│  THIS IS WHAT'S MISSING!                            │
│  - Protocol implementation (Modbus TCP/RTU)         │
│  - Device drivers                                   │
│  - Register mapping                                 │
│  - Real-time I/O                                    │
│  - Safety interlocks                                │
│  - Direct hardware control                          │
│                                                     │
│  Technology: Rust (tokio-modbus, opcua, etc.)       │
└──────────────────────────────────────────────────────┘
                        ↕ RS-485/Ethernet/USB
┌──────────────────────────────────────────────────────┐
│  Actual PLC Hardware                                │
│  ───────────────────                                │
│  - Siemens S7                                       │
│  - Allen-Bradley ControlLogix                       │
│  - Schneider Modicon                                │
│  - WAGO                                             │
│  - Beckhoff TwinCAT                                 │
│  OR: iPhone/iPad as PLC (HomeKit)                   │
└──────────────────────────────────────────────────────┘
```

---

## ⚠️ **What You Currently Have**

### ✅ Layer 1: UI/UX (VSC-SOP Patterns)
- Operator profiles ✅
- Shift handoff ✅
- Task management ✅
- Emergency procedures ✅
- Audit logging ✅

### ✅ Layer 2: Orchestration (Your SynaptixPLC)
```rust
pub struct SynaptixPLC {
    pub base_url: String,
    client: Client,
}

pub async fn query_nodes(&self) -> Result<Vec<PLCNode>, reqwest::Error> { }
pub async fn send_command(&self, node: &str, command: &str, ttl: u32) { }
```

### ❌ Layer 3: Hardware Interface (MISSING)
**This is the gap!** You need actual device control.

---

## 🔧 **Layer 3: Hardware Control Implementation**

### Option A: Real PLC Hardware (Modbus/OPC UA)

**Rust Implementation**:

```rust
// Cargo.toml
[dependencies]
tokio-modbus = "0.7"
opcua = "0.12"
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
```

**Modbus TCP Driver**:

```rust
use tokio_modbus::prelude::*;
use tokio::net::TcpStream;

pub struct ModbusPLCDriver {
    context: modbus::tcp::Context,
    address: String,
}

impl ModbusPLCDriver {
    pub async fn new(address: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let socket_addr = address.parse()?;
        let stream = TcpStream::connect(socket_addr).await?;
        let context = modbus::tcp::connect_slave(stream, Slave(1)).await?;
        
        Ok(Self {
            context,
            address: address.to_string(),
        })
    }
    
    // Read discrete inputs (digital sensors)
    pub async fn read_discrete_inputs(&mut self, addr: u16, count: u16) 
        -> Result<Vec<bool>, Box<dyn std::error::Error>> 
    {
        let inputs = self.context.read_discrete_inputs(addr, count).await?;
        Ok(inputs)
    }
    
    // Read coils (digital outputs)
    pub async fn read_coils(&mut self, addr: u16, count: u16) 
        -> Result<Vec<bool>, Box<dyn std::error::Error>> 
    {
        let coils = self.context.read_coils(addr, count).await?;
        Ok(coils)
    }
    
    // Write single coil (turn on/off)
    pub async fn write_single_coil(&mut self, addr: u16, value: bool) 
        -> Result<(), Box<dyn std::error::Error>> 
    {
        self.context.write_single_coil(addr, value).await?;
        Ok(())
    }
    
    // Read holding registers (analog values)
    pub async fn read_holding_registers(&mut self, addr: u16, count: u16) 
        -> Result<Vec<u16>, Box<dyn std::error::Error>> 
    {
        let registers = self.context.read_holding_registers(addr, count).await?;
        Ok(registers)
    }
    
    // Write holding register (analog output)
    pub async fn write_single_register(&mut self, addr: u16, value: u16) 
        -> Result<(), Box<dyn std::error::Error>> 
    {
        self.context.write_single_register(addr, value).await?;
        Ok(())
    }
}
```

**High-Level PLC Control**:

```rust
pub struct PLCController {
    driver: ModbusPLCDriver,
    node_id: String,
    register_map: RegisterMap,
}

#[derive(Debug, Clone)]
pub struct RegisterMap {
    // Digital I/O
    pub emergency_stop: u16,      // Coil address
    pub motor_run: u16,            // Coil address
    pub pump_status: u16,          // Discrete input address
    
    // Analog I/O
    pub temperature: u16,          // Holding register address
    pub pressure: u16,             // Holding register address
    pub flow_rate: u16,            // Holding register address
    pub valve_position: u16,       // Holding register address
}

impl PLCController {
    pub async fn new(node_id: &str, modbus_addr: &str, register_map: RegisterMap) 
        -> Result<Self, Box<dyn std::error::Error>> 
    {
        let driver = ModbusPLCDriver::new(modbus_addr).await?;
        
        Ok(Self {
            driver,
            node_id: node_id.to_string(),
            register_map,
        })
    }
    
    // High-level commands
    
    pub async fn start_motor(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Check safety interlocks
        if self.is_emergency_stop_active().await? {
            return Err("Emergency stop is active".into());
        }
        
        // Set motor run coil
        self.driver.write_single_coil(self.register_map.motor_run, true).await?;
        
        // Log command
        println!("[{}] Motor started", self.node_id);
        Ok(())
    }
    
    pub async fn stop_motor(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.driver.write_single_coil(self.register_map.motor_run, false).await?;
        println!("[{}] Motor stopped", self.node_id);
        Ok(())
    }
    
    pub async fn read_temperature(&mut self) -> Result<f32, Box<dyn std::error::Error>> {
        let raw = self.driver.read_holding_registers(self.register_map.temperature, 1).await?;
        let temp = raw[0] as f32 / 10.0; // Convert to °C
        Ok(temp)
    }
    
    pub async fn set_valve_position(&mut self, percent: u16) 
        -> Result<(), Box<dyn std::error::Error>> 
    {
        // Clamp to 0-100%
        let value = percent.min(100);
        self.driver.write_single_register(self.register_map.valve_position, value).await?;
        println!("[{}] Valve position set to {}%", self.node_id, value);
        Ok(())
    }
    
    pub async fn emergency_stop(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Stop all motors
        self.stop_motor().await?;
        
        // Close all valves
        self.set_valve_position(0).await?;
        
        // Set emergency stop flag
        self.driver.write_single_coil(self.register_map.emergency_stop, true).await?;
        
        println!("[{}] EMERGENCY STOP ACTIVATED", self.node_id);
        Ok(())
    }
    
    pub async fn is_emergency_stop_active(&mut self) -> Result<bool, Box<dyn std::error::Error>> {
        let coils = self.driver.read_coils(self.register_map.emergency_stop, 1).await?;
        Ok(coils[0])
    }
    
    pub async fn get_status(&mut self) -> Result<PLCStatus, Box<dyn std::error::Error>> {
        let temp = self.read_temperature().await?;
        let pressure = self.driver.read_holding_registers(self.register_map.pressure, 1).await?;
        let motor_running = self.driver.read_coils(self.register_map.motor_run, 1).await?;
        let emergency_stop = self.is_emergency_stop_active().await?;
        
        Ok(PLCStatus {
            node_id: self.node_id.clone(),
            temperature: temp,
            pressure: pressure[0] as f32 / 10.0,
            motor_running: motor_running[0],
            emergency_stop,
            timestamp: std::time::SystemTime::now(),
        })
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PLCStatus {
    pub node_id: String,
    pub temperature: f32,
    pub pressure: f32,
    pub motor_running: bool,
    pub emergency_stop: bool,
    pub timestamp: std::time::SystemTime,
}
```

---

### Option B: iPhone/iPad as PLC (HomeKit)

**Use HomeKit accessories as industrial I/O**:

```rust
// Rust → HomeKit bridge
use homekit::*;

pub struct HomeKitPLC {
    accessories: Vec<Accessory>,
}

impl HomeKitPLC {
    pub async fn discover() -> Result<Self, Box<dyn std::error::Error>> {
        // Discover HomeKit accessories
        let accessories = homekit::discover_accessories().await?;
        Ok(Self { accessories })
    }
    
    pub async fn turn_on(&mut self, device_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let accessory = self.accessories.iter_mut()
            .find(|a| a.id == device_id)
            .ok_or("Accessory not found")?;
        
        accessory.set_characteristic("On", true).await?;
        Ok(())
    }
    
    pub async fn read_sensor(&mut self, device_id: &str) -> Result<f32, Box<dyn std::error::Error>> {
        let accessory = self.accessories.iter()
            .find(|a| a.id == device_id)
            .ok_or("Accessory not found")?;
        
        let value = accessory.get_characteristic("CurrentTemperature").await?;
        Ok(value)
    }
}
```

---

## 🔗 **Integrating All 3 Layers**

### Complete SynaptixPLC with Hardware Control

```rust
use tokio_modbus::prelude::*;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct SynaptixPLCWithHardware {
    // Layer 2: Orchestration
    pub base_url: String,
    client: reqwest::Client,
    
    // Layer 3: Hardware control
    controllers: Arc<RwLock<HashMap<String, PLCController>>>,
    
    // State tracking
    node_states: Arc<RwLock<HashMap<String, PLCStatus>>>,
}

impl SynaptixPLCWithHardware {
    pub async fn new(base_url: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            client: reqwest::Client::new(),
            controllers: Arc::new(RwLock::new(HashMap::new())),
            node_states: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    // Register a physical PLC node
    pub async fn register_node(&mut self, node_id: &str, modbus_addr: &str, register_map: RegisterMap) 
        -> Result<(), Box<dyn std::error::Error>> 
    {
        let controller = PLCController::new(node_id, modbus_addr, register_map).await?;
        self.controllers.write().await.insert(node_id.to_string(), controller);
        
        println!("[SynaptixPLC] Registered node: {} at {}", node_id, modbus_addr);
        Ok(())
    }
    
    // Query all nodes (both virtual and physical)
    pub async fn query_nodes(&self) -> Result<Vec<PLCNode>, Box<dyn std::error::Error>> {
        let controllers = self.controllers.read().await;
        let mut nodes = Vec::new();
        
        for (node_id, controller) in controllers.iter() {
            // Get real-time status from hardware
            let status = self.node_states.read().await
                .get(node_id)
                .cloned()
                .unwrap_or_else(|| PLCStatus {
                    node_id: node_id.clone(),
                    temperature: 0.0,
                    pressure: 0.0,
                    motor_running: false,
                    emergency_stop: false,
                    timestamp: std::time::SystemTime::now(),
                });
            
            nodes.push(PLCNode {
                id: node_id.clone(),
                name: format!("PLC Node {}", node_id),
                status: if status.emergency_stop {
                    "emergency_stop".to_string()
                } else if status.motor_running {
                    "running".to_string()
                } else {
                    "idle".to_string()
                },
                last_seen: format!("{:?}", status.timestamp),
                ttl: 60,
            });
        }
        
        Ok(nodes)
    }
    
    // Send command to physical hardware
    pub async fn send_command(&mut self, node: &str, command: &str, ttl: u32) 
        -> Result<(), Box<dyn std::error::Error>> 
    {
        let mut controllers = self.controllers.write().await;
        
        let controller = controllers.get_mut(node)
            .ok_or("Node not found")?;
        
        // Execute actual hardware command
        match command {
            "start" => controller.start_motor().await?,
            "stop" => controller.stop_motor().await?,
            "emergency_stop" => controller.emergency_stop().await?,
            "status" => {
                let status = controller.get_status().await?;
                self.node_states.write().await.insert(node.to_string(), status);
            }
            _ => return Err(format!("Unknown command: {}", command).into()),
        }
        
        println!("[SynaptixPLC] Executed command: {} on node: {}", command, node);
        Ok(())
    }
    
    // Continuous monitoring task
    pub async fn start_monitoring(&self) {
        let controllers = Arc::clone(&self.controllers);
        let node_states = Arc::clone(&self.node_states);
        
        tokio::spawn(async move {
            loop {
                // Poll all controllers every second
                let controllers_lock = controllers.read().await;
                
                for (node_id, _) in controllers_lock.iter() {
                    // Get fresh status from hardware
                    // (Would need to make controller methods async-safe)
                    // For now, simplified
                }
                
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            }
        });
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PLCNode {
    pub id: String,
    pub name: String,
    pub status: String,
    pub last_seen: String,
    pub ttl: u32,
}
```

---

## 🎯 **Complete Integration Example**

### 1. Initialize Hardware Controllers

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create SynaptixPLC with hardware support
    let mut synaptix = SynaptixPLCWithHardware::new("http://localhost:18100").await;
    
    // Register physical PLC nodes
    synaptix.register_node(
        "node-alpha",
        "192.168.1.100:502",  // Modbus TCP address
        RegisterMap {
            emergency_stop: 0,
            motor_run: 1,
            pump_status: 100,
            temperature: 1000,
            pressure: 1001,
            flow_rate: 1002,
            valve_position: 2000,
        }
    ).await?;
    
    synaptix.register_node(
        "node-bravo",
        "192.168.1.101:502",
        RegisterMap { /* ... */ }
    ).await?;
    
    // Start monitoring task
    synaptix.start_monitoring().await;
    
    // Start HTTP API server
    start_http_server(synaptix).await?;
    
    Ok(())
}
```

### 2. HTTP API Layer

```rust
use axum::{Router, Json};
use axum::routing::{get, post};

async fn start_http_server(synaptix: SynaptixPLCWithHardware) -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/api/plc/nodes", get(handle_query_nodes))
        .route("/api/plc/command", post(handle_send_command))
        .route("/api/orchestrator/status", get(handle_status))
        .with_state(Arc::new(RwLock::new(synaptix)));
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:18100").await?;
    println!("🚀 SynaptixPLC listening on http://localhost:18100");
    
    axum::serve(listener, app).await?;
    Ok(())
}

async fn handle_query_nodes(
    State(synaptix): State<Arc<RwLock<SynaptixPLCWithHardware>>>
) -> Json<Vec<PLCNode>> {
    let synaptix = synaptix.read().await;
    let nodes = synaptix.query_nodes().await.unwrap_or_default();
    Json(nodes)
}

async fn handle_send_command(
    State(synaptix): State<Arc<RwLock<SynaptixPLCWithHardware>>>,
    Json(cmd): Json<CommandRequest>
) -> Json<CommandResponse> {
    let mut synaptix = synaptix.write().await;
    
    match synaptix.send_command(&cmd.node, &cmd.command, cmd.ttl).await {
        Ok(_) => Json(CommandResponse { success: true, message: "Command executed".to_string() }),
        Err(e) => Json(CommandResponse { success: false, message: e.to_string() }),
    }
}

#[derive(serde::Deserialize)]
struct CommandRequest {
    node: String,
    command: String,
    ttl: u32,
}

#[derive(serde::Serialize)]
struct CommandResponse {
    success: bool,
    message: String,
}
```

### 3. iOS Client Calls

```swift
// From iOS app
func sendCommand(to nodeID: String, command: String) async {
    let cmd = PLCCommand(node: nodeID, command: command, ttl: 60)
    
    do {
        // This HTTP request goes to:
        // Layer 2 (SynaptixPLC) → Layer 3 (Modbus driver) → Physical hardware
        try await service.sendCommand(cmd)
        logEvent(.info, message: "✅ Command sent to physical PLC")
    } catch {
        logEvent(.error, message: "❌ Hardware command failed: \(error)")
    }
}
```

---

## 📊 **Complete Stack Flow**

### User Taps "Start Motor" on iPad

```
1. iOS SwiftUI View
   └→ Button tap handler
   
2. Swift ViewModel
   └→ sendCommand(to: "node-alpha", command: "start")
   
3. Swift Service Layer
   └→ HTTP POST to http://localhost:18113/api/plc/command
      Body: {"node": "node-alpha", "command": "start", "ttl": 60}
   
4. Neural Mux (optional)
   └→ Routes request to SynaptixPLC
   
5. SynaptixPLC (Rust)
   └→ Receives HTTP request
   └→ Looks up "node-alpha" controller
   └→ Calls controller.start_motor()
   
6. PLCController (Rust)
   └→ Checks safety interlocks (emergency stop)
   └→ Calls driver.write_single_coil(motor_run, true)
   
7. ModbusPLCDriver (Rust)
   └→ Sends Modbus TCP packet
   └→ Function code: 05 (Write Single Coil)
   └→ Address: 1 (motor_run coil)
   └→ Value: 0xFF00 (ON)
   
8. Network
   └→ TCP packet over Ethernet
   └→ Destination: 192.168.1.100:502
   
9. Physical PLC Hardware
   └→ Receives Modbus packet
   └→ Sets coil 1 to ON
   └→ Energizes relay
   
10. Motor
    └→ Relay closes
    └→ Motor starts running ✅
```

---

## 🔧 **Hardware Options**

### Real Industrial PLCs

| Vendor | Protocol | Rust Crate | Price |
|--------|----------|------------|-------|
| **Siemens S7** | S7 Comm | `s7-1200` | $500-5000 |
| **Allen-Bradley** | EtherNet/IP | `ab-ethernetip` | $1000-10000 |
| **Modbus RTU/TCP** | Modbus | `tokio-modbus` ✅ | $100-1000 |
| **OPC UA** | OPC UA | `opcua` ✅ | $200-2000 |
| **WAGO** | Modbus/KNX | `tokio-modbus` | $150-800 |

**Recommendation**: Start with **Modbus TCP** (most universal, cheapest, easiest)

### iPhone/iPad as PLC (HomeKit)

| Device | Cost | I/O Type | Use Case |
|--------|------|----------|----------|
| **Refurb iPhone** | $100 | Digital sensors | Temperature, door switches |
| **HomeKit Relay** | $30 | Digital output | On/off control |
| **HomeKit Dimmer** | $50 | Analog output | 0-100% control |
| **HomeKit Sensor** | $25 | Digital input | Motion, contact |

**Advantage**: Extremely cheap, no special hardware needed

---

## 📋 **Implementation Checklist**

### Phase 1: Hardware Driver (Week 1)
- [ ] Choose protocol (Modbus TCP recommended)
- [ ] Implement `ModbusPLCDriver` (read/write coils, registers)
- [ ] Test with real PLC or simulator
- [ ] Implement safety interlocks

### Phase 2: Controller Layer (Week 1)
- [ ] Implement `PLCController` (high-level commands)
- [ ] Create register map for your PLCs
- [ ] Add emergency stop logic
- [ ] Add status polling

### Phase 3: Integration (Week 1)
- [ ] Integrate hardware layer into `SynaptixPLC`
- [ ] Add HTTP API endpoints
- [ ] Test end-to-end (iOS → Rust → Hardware)
- [ ] Add monitoring/logging

### Phase 4: UI Integration (Week 1)
- [ ] Adapt VSC-SOP patterns to PLC UI
- [ ] Connect to Rust backend
- [ ] Test all operations
- [ ] Deploy to iPad

---

## 🎯 **Summary**

**You need all 3 layers**:

1. ✅ **Layer 1 (UI)**: VSC-SOP patterns - you have this
2. ✅ **Layer 2 (Orchestration)**: SynaptixPLC - you have this
3. ❌ **Layer 3 (Hardware)**: Device drivers - **ADD THIS**

**Recommended Approach**:

```rust
// Add to your SynaptixPLC:
use tokio_modbus::prelude::*;

// Now your SynaptixPLC can:
1. Accept commands from iOS app (Layer 1)
2. Route through Neural Mux (Layer 2)
3. Control actual hardware (Layer 3) ⭐ NEW!
```

**Timeline**: 4 weeks total (1 week per phase)

**Result**: Complete hardware-to-UI PLC control system! 🚀

---

**Document Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Status**: Implementation guide for Layer 3 (hardware control)




