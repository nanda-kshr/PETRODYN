# AI Pipeline & Digital Twin Intelligence Layer

`ai_pipelines` is the core intelligence and decision-support service for the THERMO-LIFT platform. It ingests validated telemetry from MongoDB at regular intervals, evaluates coupled reservoir-mechanical states, and produces predictive, optimization, and agentic outputs.

---

## 🧠 Architectural Modules

### 3A. AI Prediction Engine (Physics + ML)
* **Thermal Dynamics:** Predicts reservoir temperature decay curves and near-wellbore cooling rates.
* **Fluid Modeling:** Estimates dynamic in-situ oil viscosity changes as cooling proceeds.
* **Lift Mechanics:** Predicts SRP behavior, rod-floating tendencies, fluid pounding, impact loading, fatigue cycles, and pump unsetting risks.
* **Production Forecast:** Predicts gross production rate and effective Steam-to-Oil Ratio (SOR).

### 3B. Optimization Engine (Constrained Optimization & MPC)
* Evaluates trade-offs between thermal input and mechanical wear.
* Computes optimal setpoints for:
  * **CSS Parameters:** Steam injection volume, injection pressure, soak duration, and production cut-off threshold.
  * **SRP Parameters:** Pumping speed (SPM), stroke length, and VFD frequency.
* Minimizes SOR and electrical energy consumption while respecting mechanical stress and rod load limits.

### 3C. AI Agent (Decision & Action Layer)
* Interprets prediction states and optimization proposals.
* Decides corrective actions (e.g., reduce SPM to prevent imminent rod floating; flag well for next CSS cycle).
* Dispatches execution commands to the field/simulator when authorized.

### 3D. Human-in-the-Loop (Safety Governance)
* **Agent ON (Autonomous Mode):** Automatically pushes safety-verified setpoints to actuators/controllers.
* **Agent OFF (Recommendation Mode):** Packages recommendations with full reasoning and holds for engineer approval before dispatching.

### 3E. Engineer Copilot
* Conversational AI assistant for domain engineers.
* Answers natural language diagnostic inquiries (e.g., *"Why did SOR increase over the last 3 days?"*, *"What happens if SPM is reduced to 4.5?"*).

### 3F. Explainable AI (XAI)
* Provides transparency for all model decisions:
  * Feature attributions (key contributing variables).
  * Model confidence metrics.
  * Expected production impact vs. risk profile of alternative actions.

### 3G. Well Health Score (0–100 Index)
* Composite index synthesizing:
  * **Thermal condition** (temperature sustainability, heat efficiency)
  * **Production performance** (inflow stability, rate vs. target)
  * **Pump mechanics** (rod load margins, vibration, impact stress)
  * **Data reliability** (sensor health from `data_ingestion`)

---

## 🔄 Execution Flow

```
[MongoDB (validated_telemetry)]
                │
                ▼ (Periodic Batch / Stream Ingestion)
      ┌───────────────────┐
      │ Prediction Engine │ (Physics + ML State Estimation)
      └─────────┬─────────┘
                ▼
      ┌───────────────────┐
      │Optimization Engine│ (Constrained MPC / Solvers)
      └─────────┬─────────┘
                ▼
      ┌───────────────────┐
      │  AI Agent & XAI   │ (Scores Health 0-100 & formats rationale)
      └─────────┬─────────┘
                │
         +──────┴────────────────────────+
         ▼                               ▼
[Autonomous Dispatch]          [dashboard / Operator Sign-Off]
```

---

## ⚙️ Configuration & Scheduling

* Configurable evaluation cadence (e.g., every 5 to 60 seconds, or event-driven).
* Configurable safety envelopes and thresholds for autonomous actuation.
