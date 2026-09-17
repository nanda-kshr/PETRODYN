# Sucker Rod Pump (SRP) Simulator

A modular NestJS simulator for the THERMO-LIFT prototype that continuously generates realistic, physically-connected SRP and well telemetry, transmits records to a Data Ingestion API, and exposes runtime parameter control APIs.

---

## 1. How to Install

Ensure Node.js (v18+) is installed, then navigate into the directory and install dependencies:

```bash
cd pump_simulator
npm install
```

---

## 2. How to Start the Simulator

### Development Mode
```bash
npm run start:dev
```

### Production Build & Run
```bash
npm run build
npm run start:prod
```

### Environment Variables (`.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `WELL_ID` | `BW-001` | Identifier for the simulated well |
| `SIMULATION_INTERVAL_MS` | `250` | Telemetry emission cadence (ms) |
| `INGESTION_API_URL` | `http://localhost:3001/api/v1/ingest` | Target ingestion endpoint |
| `SIMULATE_TRANSMISSION_FAILURE` | `false` | Block ingestion transmissions if `true` |
| `NOISE_ENABLED` | `true` | Apply realistic micro-sensor jitter |

---

## 3. How to Change Parameters Using the API

Use `POST /api/v1/simulator/set` with JSON specifying the parameter and new value:

```bash
curl -X POST http://localhost:3001/api/v1/simulator/set \
  -H "Content-Type: application/json" \
  -d '{"parameter": "tubing_pressure_bar", "value": 30}'
```

Other examples:
```bash
# Change pumping speed (SPM)
curl -X POST http://localhost:3001/api/v1/simulator/set \
  -H "Content-Type: application/json" \
  -d '{"parameter": "spm", "value": 7.0}'

# Change wellbore temperature (automatically recalculates viscosity)
curl -X POST http://localhost:3001/api/v1/simulator/set \
  -H "Content-Type: application/json" \
  -d '{"parameter": "temperature_c", "value": 55}'
```

### Settable Parameters & Bounds
* `vfd_frequency_hz` (5.0 – 75.0 Hz)
* `stroke_length_m` (0.5 – 6.0 m)
* `spm` (0.5 – 20.0)
* `tubing_pressure_bar` (0.0 – 150.0 bar)
* `fluid_level_m` (0.0 – 1150.0 m)
* `temperature_c` (10.0 – 350.0 °C)
* `viscosity_cp` (1.0 – 100000.0 cP)

*Invalid parameters or out-of-bounds values return HTTP 400 Bad Request.*

---

## 4. How to Read Current Simulator State & Controls

### Read Current State
```bash
curl http://localhost:3001/api/v1/simulator/state
```
**Sample Response:**
```json
{
  "vfd_frequency_hz": 40.0,
  "stroke_length_m": 2.5,
  "spm": 5.5,
  "rod_position_m": 1.25,
  "rod_load_kn": 145.2,
  "motor_current_a": 72.4,
  "tubing_pressure_bar": 18.5,
  "fluid_level_m": 850.0,
  "production_bopd": 31.4,
  "temperature_c": 50.0,
  "viscosity_cp": 12000
}
```

### Simulation Loop Controls
* **Status:** `GET /api/v1/simulator/status`
* **Start:** `POST /api/v1/simulator/start`
* **Stop:** `POST /api/v1/simulator/stop`

### Built-in Ingestion Endpoint
* **Ingest Data:** `POST /api/v1/ingest` (always returns `{"success": true}`)
* **View Buffer:** `GET /api/v1/ingest/records`

---

## 5. Physical Relationships Between Variables

The simulator links variables through coherent physical formulations:

* **VFD Frequency $\rightarrow$ Motor Speed & SPM:** Motor frequency linearly scales stroke rate ($SPM = \frac{VFD}{50} \times 6.875$) unless SPM is explicitly overridden.
* **Rod Kinematics (Position, Velocity, Acceleration):** Rod position executes smooth cyclic motion ($x(t) = \frac{S}{2}(1 - \cos(\omega t))$) between $0$ and `stroke_length_m`.
* **Rod Load ($F_{\text{load}}$):**
  * **Upstroke:** Traveling valve closes, rod carries buoyant rod weight + inertial load + fluid column head pressure + tubing backpressure + upward viscous drag.
  * **Downstroke:** Traveling valve opens, transferring fluid column weight to the standing valve; downward motion experiences upward buoyant drag.
* **Motor Current:** Surface electric motor current scales dynamically with required torque and rod load power requirements.
* **Production Rate (BOPD):** Calculated from volumetric displacement ($SPM \times stroke\_length \times plunger\_area$), adjusted for fluid submergence head ($1150\text{ m} - fluid\_level\_m$), crude viscosity flow resistance, and tubing backpressure.
* **Temperature $\rightarrow$ Viscosity:** Baghewala heavy crude follows an Arrhenius curve calibrated to ~12,000 cP at 50°C. Temperature shifts automatically recalculate in-situ viscosity unless manually overridden.
* **Viscosity $\rightarrow$ Load & Production:** High viscosity increases rod friction/drag and reduces pump filling efficiency.
