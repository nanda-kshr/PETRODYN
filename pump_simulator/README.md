# Field Data & IoT Pump Simulator

`pump_simulator` is a software simulation service that models Baghewala heavy crude well conditions, downhole dynamics, and Sucker Rod Pumping (SRP) sensor streams.

---

## 📋 Responsibilities

* **Sensor & Telemetry Generation:** Generates real-time synthetic field telemetry for:
  * **Thermal / CSS:** Steam injection volume, injection pressure, steam temperature, soaking cycle state.
  * **Downhole / Reservoir:** Near-wellbore temperature decay, dynamic crude viscosity (10,000–13,000 cP at 50°C curve), bottomhole pressure, acoustic fluid level.
  * **Surface / SRP:** Strokes Per Minute (SPM), stroke length, Variable Frequency Drive (VFD) frequency, polished rod load (peak & minimum), gross fluid production rate.
* **Physics & Thermal Degradation:** Simulates post-CSS thermal decay curves and the resultant viscosity rise over time.
* **Dynamic State Modification:** Exposes APIs to let operators or the `vr_simulator` inject parameter modifications (e.g., altering SPM, stroke length, or steam volume) and observe simulated response.
* **Telemetry Streaming:** Dispatches time-series payloads to `data_ingestion` via HTTP REST, WebSocket, or MQTT.

---

## 🔄 Data Flow

```
[VR Simulator / Operator Inputs]
               │
               ▼ (State & Parameter Updates)
     ┌──────────────────┐
     │  pump_simulator  │  <-- Thermal & SRP Physics Model
     └─────────┬────────┘
               │
               ▼ (Simulated IoT Telemetry)
       [data_ingestion]
```

---

## 📡 Sample Output Payload

```json
{
  "well_id": "BGW-34",
  "timestamp": "2026-09-17T12:00:00Z",
  "thermal_state": {
    "steam_temperature_c": 285.0,
    "injection_pressure_bar": 110.5,
    "wellbore_temperature_c": 82.3,
    "fluid_viscosity_cp": 4200.0
  },
  "srp_state": {
    "spm": 6.5,
    "stroke_length_m": 3.2,
    "vfd_frequency_hz": 42.0,
    "peak_rod_load_kn": 78.4,
    "min_rod_load_kn": 12.1,
    "fluid_level_m": 820.0,
    "production_rate_m3_day": 14.8
  },
  "system_status": "PRODUCING"
}
```

---

## ⚙️ Configuration & Setup

* Exposes control endpoints (e.g., `POST /api/v1/simulate/override`) for real-time parameter tweaking.
* Configurable simulation tick rate (default: 1–5 seconds per cycle).
