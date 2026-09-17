# VR Digital Twin, What-If Simulator & Training Mode

`vr_simulator` is an immersive 3D/VR application that visualizes the full well-to-surface domain and provides an interactive sandbox for operational "what-if" testing and operator training.

---

## 📋 Key Capabilities

* **3D Well-to-Surface Visualization:**
  * High-fidelity 3D representation across all domains: **Reservoir → Wellbore → Sucker Rod Pump (SRP) → Surface Unit**.
  * Real-time animation of pumping motion (walking beam, horsehead, polished rod) synchronized with live/simulated SPM and stroke length.
  * Downhole visualization of thermal distribution, steam plume, and fluid level fluctuations.
* **Bidirectional Sync with `pump_simulator`:**
  * Reflects live states emitted by `pump_simulator`.
  * Allows operators inside VR to physically or digitally modify control parameters (VFD, SPM, stroke, steam valve settings), which immediately sync back to `pump_simulator` to evaluate system response.
* **Interactive What-If Simulation Sandbox:**
  * Alter CSS parameters (steam volume, injection pressure, soak days) or SRP variables in real time.
  * Visualize projected consequences: thermal decay curve shifts, viscosity spikes, rod-floating probability, and changes in SOR.
* **Scenario-Based Operator Training Mode:**
  * Pre-built emergency and operational challenge scenarios:
    * Rod-floating due to cold fluid viscosity shock.
    * Severe fluid pound / gas lock.
    * Pump unsetting under abnormal dynamic loads.
    * Casing thermal stress / steam leakage.
  * Evaluates trainee response times, correctness of remedial actions, and delivers diagnostic feedback scores.

---

## 🔄 Synchronization Architecture

```
┌─────────────────┐       Parameter Updates       ┌──────────────────┐
│                 │ ────────────────────────────> │                  │
│  vr_simulator   │                               │  pump_simulator  │
│  (3D / WebXR)   │ <──────────────────────────── │                  │
└─────────────────┘        Telemetry State        └──────────────────┘
```

---

## ⚙️ Tech Stack & Platforms

* **3D Engine:** Unity / Unreal Engine / WebXR (Three.js / Babylon.js)
* **Target Platforms:** Standalone VR headsets (e.g., Meta Quest), PC-tethered VR, or desktop 3D browser fallback.
* **Integration Interface:** WebSockets / REST API to communicate directly with `pump_simulator`.
