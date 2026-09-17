# Operator Dashboard

`dashboard` is the web-based command center for field operators and production engineers, offering live telemetry visualization, predictive diagnostics, AI recommendations, and control interfaces.

---

## 📋 Features & Views

* **Live Well Monitor:** Real-time display of operational streams (steam temperature, injection pressure, downhole temperature, dynamic viscosity, rod loads, fluid levels, gross production).
* **0–100 Well Health Score Gauge:** At-a-glance index of well integrity, broken down into thermal, mechanical, production, and sensor-health sub-scores.
* **Predictive Diagnostics & Alarms:**
  * Rod-floating early warning and impact loading alerts.
  * Thermal decay tracking and viscosity escalation alerts.
  * Mechanical fatigue and pump unsetting indicators.
* **Optimization & Recommendation Console:**
  * Displays model-recommended setpoints (SPM, stroke length, VFD, steam volume, soak time).
  * Human-in-the-Loop review: one-click **Approve**, **Modify**, or **Reject** workflows.
  * System mode switcher: **Recommendation Mode** vs. **Controlled Autonomous Mode**.
* **Explainable AI (XAI) Panel:** Explains *why* an action was proposed, listing top contributing factors, confidence intervals, and projected outcomes.
* **Engineer Copilot Chat:** Embedded conversational interface for querying well history, diagnosing anomalies, and conducting quick scenario queries.

---

## 🔄 Integration Architecture

```
[data_ingestion] ───(WebSocket/API)───┐
                                      ▼
                               ┌─────────────┐
                               │  dashboard  │ <──> [Operator / Engineer]
                               └──────┬──────┘
                                      ▲
[ai_pipelines]   ───(REST/WebSocket)──┘
```

---

## ⚙️ Tech Stack & Setup

* **Frontend Framework:** React / TypeScript / Vite or Next.js
* **UI & Visualizations:** TailwindCSS, Lucide Icons, Plotly.js / ECharts (for dynamometer cards and thermal decay curves)
* **API Clients:** WebSocket client for real-time telemetry streaming, REST client for pipeline interactions.
