# AI Pipeline & Analytics Service

The `ai_pipelines` service is the intelligence and predictive modeling layer of **THERMO-LIFT**, built with **FastAPI**, **NumPy**, **SciPy**, and **MongoDB (PyMongo)**. It runs continuous analytics and multi-horizon forecasts over well telemetry ingested from Baghewala wells.

---

## 1. Analytics Models (15 Components)

| # | Analytics | Inputs | Output |
|---|---|---|---|
| 1 | **Pump operating state** | SPM, VFD, stroke, rod position | RUN/STOP, current operating point |
| 2 | **Pump load analysis** | Rod load, rod position, tubing pressure | Average, peak, min load, load profile |
| 3 | **Dynamometer analysis** | Rod load + rod position | Surface dyno card, stroke work (kJ), card area |
| 4 | **Pump fillage** | Dynamometer card, position, production | Fillage % (submergence head & viscosity drag) |
| 5 | **Pump volumetric efficiency** | Stroke, SPM, pump geometry, production | Volumetric efficiency % |
| 6 | **Motor load** | Motor current, VFD, torque/power | Motor load % & electrical power (kW) |
| 7 | **Energy intensity** | Motor power + production | kWh/bbl & daily power (kWh) |
| 8 | **SOR** | Steam consumed + oil production | Steam-to-oil ratio (bbl steam / bbl oil) |
| 9 | **Production performance** | Production, SPM, stroke, fluid level | Current BOPD and rate trend |
| 10 | **Pressure analysis** | Tubing pressure, fluid level | Intake, discharge & differential pressure (bar) |
| 11 | **Thermal state** | Temperature + steam history | Thermal condition (HOT / OPTIMAL / COLD) |
| 12 | **Cooling rate** | Temperature history | Cooling decay rate (°C/day) |
| 13 | **Viscosity trend** | Temperature + viscosity | Current viscosity & daily increase rate (cP/day) |
| 14 | **Sensor health** | All sensor streams | Healthy / degraded / stuck / outlier / missing |
| 15 | **Well Health Score** | Pump + production + thermal + mechanical + data quality | Composite 0–100 score + 5 domain sub-scores |

---

## 2. Prediction Models (13 Components)

| # | Prediction | Inputs | Output |
|---|---|---|---|
| 1 | **Reservoir temperature** | Current temp, steam history, cooling rate | 7d, 14d, 30d temperature forecast (°C) |
| 2 | **Reservoir cooling** | Temp history, previous CSS cycles, decay constant | Cooling rate (°C/day) & days to 55°C limit |
| 3 | **Oil viscosity** | Temp forecast, Arrhenius fluid-property curve | 7d, 14d, 30d viscosity forecast (cP) |
| 4 | **Production rate** | SPM, stroke, VFD, fluid level, viscosity curve | 7d, 14d, 30d BOPD forecast & cumulative 30d oil |
| 5 | **Pump behavior** | SPM, stroke, rod load, viscosity forecast | Future peak rod load (kN) & fillage % |
| 6 | **Pump efficiency** | Dyno card, SPM, stroke, production, fluid level | Future volumetric & mechanical efficiency % |
| 7 | **Rod floating** | Rod load + position, SPM, stroke, fluid level | Floating probability (0.0 to 1.0) & trigger cause |
| 8 | **Impact loading** | Rod load/position, acceleration, SPM, stroke | Impact probability (0.0 to 1.0) & severity level |
| 9 | **Rod failure** | Load history, peak load, cycles, Goodman stress ratio | Failure probability (0.0 to 1.0) & fatigue cycles |
| 10 | **Pump unsetting** | Dynamometer, rod load, tubing backpressure | Unsetting probability (0.0 to 1.0) & status |
| 11 | **Production decline** | Historical production, thermal decay, pump settings | Expected monthly decline % & decline character |
| 12 | **Energy consumption** | Motor current/power, VFD, SPM, production | Future kWh/bbl forecast (7d, 30d) |
| 13 | **SOR** | Steam pool + cumulative oil forecast | Current & cycle-end SOR forecast |

---

## 3. REST API Endpoints

### On-Demand Pipeline Execution
* **Endpoint:** `POST /api/v1/pipeline/run?well_id=BW-001`
* **Description:** Runs all 15 analytics and 13 predictions on the latest telemetry and saves results to MongoDB.

### Query Latest Results
* **Endpoint:** `GET /api/v1/pipeline/latest?well_id=BW-001`
* **Description:** Returns the latest complete run (analytics + predictions + well health score).

### Query Analytics Only
* **Endpoint:** `GET /api/v1/analytics/latest?well_id=BW-001`
* **Description:** Returns the 15 real-time analytics indicators.

### Query Predictions Only
* **Endpoint:** `GET /api/v1/predictions/latest?well_id=BW-001`
* **Description:** Returns the 13 predictive forecasts and mechanical risk assessments.

### Health Check
* **Endpoint:** `GET /api/v1/health`
* **Description:** Returns service and database connection status.

---

## 4. How to Run

### Local Development
```bash
cd ai_pipelines
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### Docker Compose
Run all services together from the project root:
```bash
docker compose up --build -d
```
