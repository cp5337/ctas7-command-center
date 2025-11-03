// ============================================================
// Ground Station Simulation Container
// North/South hemispheric containers with realistic HFT nodes
// ============================================================

use super::*;
use wasm_bindgen::prelude::*;
use blake3;
use std::f64::consts::PI;

impl SimulationManager {
    pub(crate) fn create_north_ground_stations(&self) -> Result<SimulationContainer, JsValue> {
        let mut entities = HashMap::new();

        // Major North American HFT hubs
        entities.insert("gs-nyc-wall-street".to_string(), create_ground_station(
            "gs-nyc-wall-street",
            40.7128, -74.0060, 0.0, // Wall Street, NYC
            1, // Tier 1
            GeographicRegion::NorthAmerica,
            vec!["TAT-14".to_string(), "Dunant".to_string()], // Google/Facebook cables
            true, // Laser capability
        ));

        entities.insert("gs-chicago-cme".to_string(), create_ground_station(
            "gs-chicago-cme",
            41.8781, -87.6298, 0.0, // Chicago (CME)
            1, // Tier 1  
            GeographicRegion::NorthAmerica,
            vec!["Fiber backbone".to_string()],
            true,
        ));

        entities.insert("gs-london-canary".to_string(), create_ground_station(
            "gs-london-canary",
            51.5049, -0.0197, 0.0, // Canary Wharf, London
            1, // Tier 1
            GeographicRegion::Europe,
            vec!["TAT-14".to_string(), "MAREA".to_string()],
            true,
        ));

        entities.insert("gs-frankfurt-eurex".to_string(), create_ground_station(
            "gs-frankfurt-eurex",
            50.1109, 8.6821, 0.0, // Frankfurt (Eurex)
            1, // Tier 1
            GeographicRegion::Europe,
            vec!["European fiber".to_string()],
            true,
        ));

        entities.insert("gs-tokyo-tse".to_string(), create_ground_station(
            "gs-tokyo-tse",
            35.6762, 139.6503, 0.0, // Tokyo Stock Exchange
            1, // Tier 1
            GeographicRegion::Asia,
            vec!["TPC-5".to_string(), "FASTER".to_string()],
            true,
        ));

        // Secondary HFT nodes (Tier 2)
        entities.insert("gs-toronto-tsx".to_string(), create_ground_station(
            "gs-toronto-tsx", 43.6532, -79.3832, 0.0,
            2, GeographicRegion::NorthAmerica, vec![], true,
        ));

        entities.insert("gs-paris-euronext".to_string(), create_ground_station(
            "gs-paris-euronext", 48.8566, 2.3522, 0.0,
            2, GeographicRegion::Europe, vec![], true,
        ));

        entities.insert("gs-zurich-six".to_string(), create_ground_station(
            "gs-zurich-six", 47.3769, 8.5417, 0.0,
            2, GeographicRegion::Europe, vec![], true,
        ));

        // Arctic/Northern backup stations (Tier 3)
        entities.insert("gs-reykjavik-backup".to_string(), create_ground_station(
            "gs-reykjavik-backup", 64.1466, -21.9426, 0.0,
            3, GeographicRegion::Arctic, vec!["CANTAT-3".to_string()], false,
        ));

        entities.insert("gs-anchorage-backup".to_string(), create_ground_station(
            "gs-anchorage-backup", 61.2181, -149.9003, 0.0,
            3, GeographicRegion::Arctic, vec![], false,
        ));

        let performance_metrics = PerformanceMetrics {
            update_rate_hz: 60.0,
            computation_time_ms: 2.5,
            memory_usage_mb: 15.2,
            network_overhead_bps: 1024000, // 1 Mbps
            wasm_execution_time_us: 850,
        };

        Ok(SimulationContainer {
            id: "north_ground_stations".to_string(),
            container_type: ContainerType::NorthGroundStations,
            entities,
            performance_metrics,
            wasm_instance_id: format!("wasm-north-{}", js_sys::Date::now() as u64),
        })
    }

    pub(crate) fn create_south_ground_stations(&self) -> Result<SimulationContainer, JsValue> {
        let mut entities = HashMap::new();

        // Major South American HFT hubs
        entities.insert("gs-sao-paulo-bovespa".to_string(), create_ground_station(
            "gs-sao-paulo-bovespa",
            -23.5505, -46.6333, 0.0, // São Paulo (B3)
            1, // Tier 1
            GeographicRegion::SouthAmerica,
            vec!["SAm-1".to_string(), "Monet".to_string()],
            true,
        ));

        entities.insert("gs-buenos-aires-merval".to_string(), create_ground_station(
            "gs-buenos-aires-merval",
            -34.6118, -58.3960, 0.0, // Buenos Aires
            2, // Tier 2
            GeographicRegion::SouthAmerica,
            vec!["SAm-1".to_string()],
            true,
        ));

        entities.insert("gs-santiago-bcs".to_string(), create_ground_station(
            "gs-santiago-bcs",
            -33.4489, -70.6693, 0.0, // Santiago
            2, // Tier 2
            GeographicRegion::SouthAmerica,
            vec!["PAN-AM".to_string()],
            true,
        ));

        // Major African financial centers
        entities.insert("gs-johannesburg-jse".to_string(), create_ground_station(
            "gs-johannesburg-jse",
            -26.2041, 28.0473, 0.0, // Johannesburg Stock Exchange
            1, // Tier 1
            GeographicRegion::Africa,
            vec!["WACS".to_string(), "SAT-3".to_string()],
            true,
        ));

        entities.insert("gs-lagos-nse".to_string(), create_ground_station(
            "gs-lagos-nse",
            6.5244, 3.3792, 0.0, // Lagos (Nigeria)
            2, // Tier 2
            GeographicRegion::Africa,
            vec!["WACS".to_string()],
            true,
        ));

        entities.insert("gs-cairo-egx".to_string(), create_ground_station(
            "gs-cairo-egx",
            30.0444, 31.2357, 0.0, // Cairo
            2, // Tier 2
            GeographicRegion::Africa,
            vec!["TE North".to_string()],
            true,
        ));

        // Oceania HFT centers
        entities.insert("gs-sydney-asx".to_string(), create_ground_station(
            "gs-sydney-asx",
            -33.8688, 151.2093, 0.0, // Sydney (ASX)
            1, // Tier 1
            GeographicRegion::Oceania,
            vec!["Southern Cross".to_string(), "Endeavour".to_string()],
            true,
        ));

        entities.insert("gs-melbourne-asx".to_string(), create_ground_station(
            "gs-melbourne-asx",
            -37.8136, 144.9631, 0.0, // Melbourne
            2, // Tier 2
            GeographicRegion::Oceania,
            vec![], 
            true,
        ));

        entities.insert("gs-auckland-nzx".to_string(), create_ground_station(
            "gs-auckland-nzx",
            -36.8485, 174.7633, 0.0, // Auckland
            2, // Tier 2
            GeographicRegion::Oceania,
            vec!["Southern Cross".to_string()],
            false,
        ));

        // Antarctic research stations (backup only)
        entities.insert("gs-mcmurdo-backup".to_string(), create_ground_station(
            "gs-mcmurdo-backup",
            -77.8419, 166.6863, 0.0, // McMurdo Station
            3, // Tier 3 backup
            GeographicRegion::Antarctic,
            vec![], 
            false,
        ));

        let performance_metrics = PerformanceMetrics {
            update_rate_hz: 60.0,
            computation_time_ms: 2.8,
            memory_usage_mb: 14.7,
            network_overhead_bps: 1024000,
            wasm_execution_time_us: 920,
        };

        Ok(SimulationContainer {
            id: "south_ground_stations".to_string(),
            container_type: ContainerType::SouthGroundStations,
            entities,
            performance_metrics,
            wasm_instance_id: format!("wasm-south-{}", js_sys::Date::now() as u64),
        })
    }

    pub(crate) fn update_container(&self, container: &mut SimulationContainer, delta_time_ms: f64) -> Result<(), JsValue> {
        let current_weather = self.weather_engine.get_weather_impact(&Position3D {
            latitude: 0.0,
            longitude: 0.0, 
            altitude_km: 0.0,
            timestamp_ms: js_sys::Date::now() as u64,
        });

        // Update all entities in the container
        for (entity_id, entity) in &mut container.entities {
            self.update_ground_station(entity, delta_time_ms, &current_weather)?;
        }

        // Update container performance metrics
        container.performance_metrics.computation_time_ms = 
            measure_update_time(|| {
                // Container-specific computations
            });

        Ok(())
    }

    fn update_ground_station(&self, entity: &mut SimulatedEntity, delta_time_ms: f64, weather: &WeatherImpact) -> Result<(), JsValue> {
        // Update operational status based on weather
        if let EntityType::GroundStation { tier, .. } = &entity.entity_type {
            // Higher tier stations are more resilient
            let weather_resistance = match tier {
                1 => 0.9,  // Tier 1: 90% weather resistance
                2 => 0.7,  // Tier 2: 70% weather resistance  
                3 => 0.5,  // Tier 3: 50% weather resistance
                _ => 0.3,
            };

            // Calculate weather impact on health
            let weather_factor = 1.0 - (weather.atmospheric_attenuation_db / 10.0) * (1.0 - weather_resistance);
            entity.operational_status.health_score = (entity.operational_status.health_score * weather_factor).max(0.1);

            // Update network capacity based on health
            entity.network_capacity.current_utilization = 
                (entity.network_capacity.current_utilization * entity.operational_status.health_score).min(1.0);

            // Add weather-induced latency
            entity.network_capacity.latency_ms += weather.atmospheric_attenuation_db * 0.5;

            // Update weather impact
            entity.weather_impact = weather.clone();

            // Update position timestamp
            entity.position.timestamp_ms = js_sys::Date::now() as u64;

            // Recalculate integrity hash
            entity.hash_checksum = calculate_entity_hash(entity);
        }

        Ok(())
    }
}

// Helper function to create a ground station entity
fn create_ground_station(
    id: &str,
    latitude: f64,
    longitude: f64, 
    altitude_km: f64,
    tier: u8,
    region: GeographicRegion,
    cable_connections: Vec<String>,
    laser_capability: bool,
) -> SimulatedEntity {
    let position = Position3D {
        latitude,
        longitude,
        altitude_km,
        timestamp_ms: js_sys::Date::now() as u64,
    };

    let velocity = Velocity3D {
        velocity_x_ms: 0.0, // Ground stations don't move
        velocity_y_ms: 0.0,
        velocity_z_ms: 0.0,
        angular_velocity_rad_s: 0.0,
    };

    let operational_status = OperationalStatus {
        is_operational: true,
        health_score: 0.95 + (tier as f64 * 0.01), // Higher tier = better health
        error_rate: 0.001 / (tier as f64), // Lower tier = higher error rate
        maintenance_window: None,
    };

    // Network capacity based on tier
    let (max_bandwidth, base_latency) = match tier {
        1 => (100.0, 0.5),   // Tier 1: 100 Gbps, 0.5ms
        2 => (40.0, 1.0),    // Tier 2: 40 Gbps, 1.0ms
        3 => (10.0, 2.0),    // Tier 3: 10 Gbps, 2.0ms
        _ => (1.0, 10.0),    // Fallback: 1 Gbps, 10ms
    };

    let network_capacity = NetworkCapacity {
        max_bandwidth_gbps: max_bandwidth,
        current_utilization: 0.3 + (rand::random::<f64>() * 0.4), // 30-70% utilization
        latency_ms: base_latency,
        packet_loss_rate: 0.0001 * (4 - tier) as f64, // Lower tier = higher loss
        jitter_ms: 0.1 * (4 - tier) as f64,
    };

    let weather_impact = WeatherImpact {
        visibility_km: 50.0,
        precipitation_mm_hr: 0.0,
        wind_speed_ms: 5.0,
        atmospheric_attenuation_db: 0.1,
        ionospheric_scintillation: 0.05,
    };

    let entity_type = EntityType::GroundStation {
        tier,
        cable_connections,
        laser_capability,
        region,
    };

    let mut entity = SimulatedEntity {
        id: id.to_string(),
        entity_type,
        position,
        velocity,
        operational_status,
        network_capacity,
        weather_impact,
        hash_checksum: String::new(), // Will be calculated below
    };

    // Calculate integrity hash
    entity.hash_checksum = calculate_entity_hash(&entity);

    entity
}

// Helper function to calculate Blake3 hash for entity integrity
fn calculate_entity_hash(entity: &SimulatedEntity) -> String {
    let mut hasher = blake3::Hasher::new();
    
    // Hash key entity properties for integrity checking
    hasher.update(entity.id.as_bytes());
    hasher.update(&entity.position.latitude.to_le_bytes());
    hasher.update(&entity.position.longitude.to_le_bytes());
    hasher.update(&entity.operational_status.health_score.to_le_bytes());
    hasher.update(&entity.network_capacity.max_bandwidth_gbps.to_le_bytes());
    hasher.update(&entity.position.timestamp_ms.to_le_bytes());
    
    hex::encode(hasher.finalize().as_bytes())
}

// Helper function to measure execution time
fn measure_update_time<F>(f: F) -> f64 
where
    F: FnOnce(),
{
    let start = js_sys::Date::now();
    f();
    let end = js_sys::Date::now();
    end - start
}
