# THERMO-LIFT: AI-Enabled Well-to-Surface Digital Twin

**THERMO-LIFT** is an integrated Digital Twin and optimization platform designed for heavy oil production using Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP), specifically tailored for challenging reservoirs like the Baghewala Field (Jodhpur Sandstone, Rajasthan).

---

## 📌 Problem Context: Baghewala Field

* **Reservoir Depth:** ~1,150 m (Jodhpur Sandstone, Oil India Limited)
* **Fluid Characteristics:** Heavy crude oil with ultra-high viscosity (**10,000–13,000 cP at 50°C**)
* **Well Count:** 56 wells drilled, 34 currently producing
* **Operational Cycle:** 
  * **CSS:** 250–320°C steam injected over 14–21 days, followed by soaking (~half injection duration).
  * **SRP Lift:** Artificial lift operated through thermal decay as the reservoir cools.
* **The Core Challenge:** 
  CSS and SRP operate as disconnected systems. Thermal decay causes rapid viscosity spikes, inducing severe sucker rod floating, impact loading, casing elongation, excessive steam-to-oil ratios (SOR), and artificial lift failure.

---

## 💡 The Solution: THERMO-LIFT

THERMO-LIFT bridges the reservoir, wellbore, artificial lift, and surface facilities into a single unified predictive model.

```
+-------------------------------------------------------------+
|                     Data Quality Engine                     |
|        (Sensor validation, outlier & drift detection)       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|              Well-to-Surface Digital Twin                   |
|  - Thermal & Cooling Dynamics   - Viscosity Tracking        |
|  - SRP Dynamics & Rod Load      - Rod-Floating Risk         |
|  - Inflow & Fluid Levels        - Mechanical Failure Risk   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|             Multi-Objective Optimization Engine             |
|   Evaluates: Steam Volume, Injection Pressure, Soak Time,   |
|              SPM, Stroke Length, VFD Frequency              |
|   Constrained by: SOR, Energy Consumption, Rod/Tubing Limits|
+------------------------------+------------------------------+
                               |
         +---------------------+---------------------+
         v                                           v
+---------------------------------+   +---------------------------------+
|   Web Operations Dashboard      |   |   VR What-If Simulator &        |
|   - Real-time Well Health (0-100)|   |   Training Environment          |
|   - Explainable AI Copilot      |   |   - Scenario testing            |
|   - Recommendation & Auto modes |   |   - Failure response training   |
+---------------------------------+   +---------------------------------+
```

---

## 🚀 Key Features

### 1. Robust Data Quality Layer
* Ingests historical and real-time operational streams: steam volume, injection pressure/temperature, wellhead pressure, gross production, SPM, stroke length, VFD frequency, rod load, and acoustic fluid levels.
* Detects missing values, flatlines, calibration drifts, and sensor anomalies before inputting to model layers.

### 2. Coupled Digital Twin Core
* **Reservoir & Thermal State:** Predicts heating/cooling cycles, near-wellbore temperature decay, and in-situ oil viscosity.
* **SRP Mechanical Simulator:** Dynamometer load analysis, predicts rod-floating risks, fluid pound, impact loading, and fatigue limits.

### 3. Optimization Engine
* Optimizes CSS parameters (steam volume, injection pressure, soak duration, production cut-off) alongside SRP operational parameters (SPM, stroke length, VFD frequency).
* Balances net oil production against Steam-to-Oil Ratio (SOR), power consumption, and mechanical stress.

### 4. Operational Modes & Interface
* **Recommendation Mode:** Generates actionable guidance with explainable AI (XAI) rationale for operator sign-off.
* **Closed-Loop Autonomous Mode:** Integrates with existing SCADA/RTU systems to safely dispatch approved setpoints.
* **0–100 Well Health Score:** Composite metric assessing thermal efficiency, lift stability, and equipment degradation.
* **VR What-If Simulator:** Interactive sandbox for running injection/pumping scenarios and failure drills for field operators.

---

## 🛠 Tech Stack & Architecture (Planned)

* **Modeling & Analytics:** Python, PyTorch / SciPy, Physics-Informed Neural Networks (PINNs)
* **Data Pipelines & Ingestion:** Kafka, MQTT, TimescaleDB / InfluxDB
* **Backend API:** FastAPI
* **Frontend Dashboard:** React / TypeScript, Plotly / WebGL
* **Simulation / VR:** Unity / WebXR
