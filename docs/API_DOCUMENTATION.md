# THERMO-LIFT API Documentation

Comprehensive API reference for all backend microservices supporting the Baghewala Wellbore Digital Twin.

---

## 1. Pump Simulator (`pump_simulator`)
- **Port**: `3001`
- **Framework**: NestJS
- **Base URL**: `http://localhost:3001/api/v1/simulator`

### Endpoints

#### 1. Get Simulator State
- **Method**: `GET`
- **Path**: `/state`
- **Description**: Returns the live state of all downhole, surface, and mechanical variables.
- **Response** (`200 OK`):
```json
{
  "operating_stage": "PRODUCTION",
  "pump_running": true,
  "vfd_frequency_hz": 40.0,
  "stroke_length_m": 2.5,
  "spm": 5.5,
  "rod_position_m": 1.25,
  "rod_load_kn": 42.8,
  "motor_current_a": 13.4,
  "tubing_pressure_bar": 18.5,
  "fluid_level_m": 850.0,
  "production_bopd": 30.5,
  "temperature_c": 50.0,
  "viscosity_cp": 12000.0
}
```

#### 2. Set Parameter
- **Method**: `POST`
- **Path**: `/set`
- **Description**: Dynamically modifies a single simulator parameter at runtime.
- **Request Body**:
```json
{
  "parameter": "spm",
  "value": 6.5
}
```
*Allowed parameters*: `spm` (0.0–15.0), `vfd_frequency_hz` (0.0–70.0), `stroke_length_m` (1.0–5.0), `temperature_c` (20.0–350.0), `tubing_pressure_bar` (5.0–180.0), `fluid_level_m` (300.0–1150.0).
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Parameter 'spm' successfully updated to 6.5",
  "state": { ... }
}
```

#### 3. Apply CSS Lifecycle Stage
- **Method**: `POST`
- **Path**: `/stage/:stage` or `/css/:stage`
- **Description**: Transitions well to one of three Cyclic Steam Stimulation stages:
  - `STEAM` (Huff): Pump stopped (0 SPM), 280°C downhole steam, 125 bar.
  - `SOAK`: Pump stopped (0 SPM), shut-in soaking, 160°C, 45 bar.
  - `PRODUCTION` (Puff): Pump active (5.5 SPM, 40 Hz), 85°C flush production.
- **Parameters**: `stage` (string, `STEAM` | `SOAK` | `PRODUCTION`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "stage": "STEAM",
  "pump_running": false,
  "message": "CSS Stage 'STEAM' applied successfully",
  "state": { ... }
}
```

#### 4. Simulation Loop Controls
- **Method**: `POST`
  - `/start`: Starts/resumes the 100ms calculation & 1s telemetry broadcast loop.
  - `/stop`: Pauses simulation generation.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "running": true,
  "message": "Simulator loop started"
}
```

#### 5. Simulator Status
- **Method**: `GET`
- **Path**: `/status`
- **Response** (`200 OK`):
```json
{
  "running": true,
  "interval_ms": 100,
  "ingestion_url": "http://localhost:3002/api/v1/ingest",
  "simulating_failure": false
}
```

---

## 2. Data Ingestion (`data_ingestion`)
- **Port**: `3002`
- **Framework**: NestJS + Socket.io
- **Base URL**: `http://localhost:3002/api/v1`

### REST Endpoints

#### 1. Ingest Telemetry
- **Method**: `POST`
- **Path**: `/ingest`
- **Description**: Ingests sensor frame, runs threshold validation, saves to MongoDB, and broadcasts over WebSocket.
- **Request Body**:
```json
{
  "well_id": "BW-001",
  "timestamp": "2026-09-18T14:00:00.000Z",
  "operating_stage": "PRODUCTION",
  "pump_running": true,
  "spm": 5.5,
  "rod_position_m": 1.25,
  "rod_load_kn": 42.8,
  "motor_current_a": 13.4,
  "vfd_frequency_hz": 40.0,
  "stroke_length_m": 2.5,
  "tubing_pressure_bar": 18.5,
  "fluid_level_m": 850.0,
  "temperature_c": 50.0,
  "viscosity_cp": 12000.0,
  "production_bopd": 30.5
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "id": "66ea6f9b1b7c123456789abc",
  "anomalies": []
}
```

#### 2. Get Latest Telemetry
- **Method**: `GET`
- **Path**: `/telemetry/latest?well_id=BW-001`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": { ...telemetryRecord }
}
```

#### 3. Get Telemetry History
- **Method**: `GET`
- **Path**: `/telemetry/history?well_id=BW-001&limit=50`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 50,
  "data": [ ...records ]
}
```

#### 4. Service Health
- **Method**: `GET`
- **Path**: `/health`
- **Response** (`200 OK`):
```json
{
  "status": "ok",
  "service": "data_ingestion",
  "timestamp": "2026-09-18T14:00:00.000Z"
}
```

### WebSocket Stream
- **URL**: `ws://localhost:3002`
- **Event**: `telemetry`
- **Payload**: Full `TelemetryRecord` emitted in real time on every ingestion.

---

## 3. AI Pipelines (`ai_pipelines`)
- **Port**: `8000`
- **Framework**: FastAPI (Python)
- **Base URL**: `http://localhost:8000/api/v1`

### Endpoints

#### 1. Latest AI Results (Analytics + Predictions + Health)
- **Method**: `GET`
- **Path**: `/pipeline/latest?well_id=BW-001`
- **Description**: Returns all 15 real-time Analytics metrics, 13 Multi-Horizon Predictions, and composite Health Score.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "well_id": "BW-001",
    "timestamp": "2026-09-18T14:00:00Z",
    "well_health_score": {
      "well_health_score": 87,
      "health_status": "EXCELLENT_HEALTH",
      "sub_scores": {
        "thermal_score": 78,
        "mechanical_score": 92,
        "production_efficiency_score": 84,
        "electrical_score": 88,
        "sensor_health_score": 100
      }
    },
    "analytics": {
      "pump_state": { "operating_stage": "PRODUCTION", "pump_running": true },
      "dynamometer_analysis": {
        "surface_card": [{ "position_m": 0.0, "load_kn": 38.2 }],
        "stroke_work_kj": 32.5,
        "max_card_load_kn": 118.4,
        "min_card_load_kn": 36.2
      },
      "pump_fillage": { "fillage_pct": 85.0 },
      "cooling_rate": { "cooling_rate_c_per_day": 0.45 },
      "viscosity_trend": { "viscosity_increase_rate_cp_per_day": 280 }
    },
    "predictions": {
      "rod_floating": { "floating_probability": 0.12, "risk_next_10min_pct": 12 },
      "impact_loading": { "impact_probability": 0.15, "impact_severity": "MINIMAL_SMOOTH_REVERSAL" },
      "rod_failure": { "failure_probability": 0.08, "failure_risk_7d_pct": 3.2 },
      "pump_unsetting": { "unsetting_probability": 0.05, "unsetting_risk_6h_pct": 5.0 },
      "production_rate": { "current_bopd": 30.5, "forecast_24h_bopd": 29.4 },
      "reservoir_temperature": { "current_temperature_c": 50.0, "forecast_24h_c": 48.9 },
      "oil_viscosity": { "current_viscosity_cp": 12000, "forecast_24h_cp": 13100 },
      "optimization_advisory": [ ... ]
    }
  }
}
```

#### 2. Trigger On-Demand AI Pipeline Run
- **Method**: `POST`
- **Path**: `/pipeline/run?well_id=BW-001`
- **Description**: Executes all analytics calculators and predictive inference models immediately.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": { ...fullPipelineResults }
}
```

#### 3. Real-Time Analytics Only
- **Method**: `GET`
- **Path**: `/analytics/latest?well_id=BW-001`

#### 4. Predictions Only
- **Method**: `GET`
- **Path**: `/predictions/latest?well_id=BW-001`

#### 5. Health Check
- **Method**: `GET`
- **Path**: `/health`
- **Response** (`200 OK`):
```json
{
  "status": "ok",
  "service": "ai_pipelines",
  "database": "connected"
}
```
