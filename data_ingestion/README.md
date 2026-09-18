# Data Ingestion & Data Quality Service

The `data_ingestion` service is built with **NestJS** and **MongoDB (Mongoose)**. It receives telemetry from the Sucker Rod Pump (SRP) simulator or field IoT devices, runs automated data-quality checks, calculates sensor-health scores, and persists timeseries records.

---

## 1. Installation & Running

### Local Development
```bash
cd data_ingestion
npm install
npm run start:dev
```

### Build & Production
```bash
npm run build
npm run start:prod
```

### Docker Compose
Run both the simulator and ingestion service from the root:
```bash
docker compose up --build -d
```

---

## 2. Environment Variables (`.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Service port | `3002` |
| `MONGODB_URI` | MongoDB Atlas / local connection string | `mongodb+srv://...` |
| `MONGODB_DB_NAME` | Target database name | `petrodyn` |

---

## 3. REST API Endpoints

### Ingest Telemetry
* **Endpoint:** `POST /api/v1/ingest`
* **Payload:**
```json
{
  "timestamp": "2026-09-17T08:08:15.598Z",
  "well_id": "BW-001",
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
* **Response (HTTP 200):**
```json
{
  "success": true,
  "id": "6aabef980be4f85eade23274",
  "anomalies": []
}
```

### Query Latest Record
* **Endpoint:** `GET /api/v1/telemetry/latest?well_id=BW-001`
* **Response:** Returns the most recent record for the specified well.

### Query Historical Records
* **Endpoint:** `GET /api/v1/telemetry/history?well_id=BW-001&limit=50`
* **Response:** Returns time-series list sorted by `timestamp: -1`.

### Telemetry Statistics
* **Endpoint:** `GET /api/v1/telemetry/stats`
* **Response:** Total records, list of active wells, and latest ingestion timestamp.

### Health Check
* **Endpoint:** `GET /api/v1/health`
* **Response:** `{"status": "ok", "service": "data_ingestion", "timestamp": "..."}`

---

## 4. Data Quality & Sensor Health Layer

Each incoming record is validated against physical operational bounds:
* `vfd_frequency_hz`: [0, 100] Hz
* `stroke_length_m`: (0, 10] m
* `spm`: [0, 30]
* `rod_load_kn`: [0, 300] kN
* `motor_current_a`: [0, 250] A
* `tubing_pressure_bar`: [0, 200] bar
* `fluid_level_m`: [0, 1500] m
* `temperature_c`: [0, 400] °C
* `viscosity_cp`: > 0 cP

Each persisted document contains a `quality` metadata block:
```json
"quality": {
  "is_valid": true,
  "anomalies": [],
  "sensor_health_score": 100
}
```
