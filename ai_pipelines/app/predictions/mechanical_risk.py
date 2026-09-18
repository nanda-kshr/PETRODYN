from typing import Dict, Any

def predict_pump_behavior(latest: Dict[str, Any], viscosity_forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    5. Pump Behavior Prediction
    Horizon: Next 1–6 h | Update freq: Every 1–5 min
    """
    current_peak_load = float(latest.get("rod_load_kn", 120.0))
    min_load = float(latest.get("rod_load_kn", 55.0)) * 0.45
    visc_ratio = viscosity_forecast.get("viscosity_surge_ratio_24h", 1.1)

    future_peak_load = current_peak_load * (1.0 + 0.10 * (visc_ratio - 1.0))
    future_min_load = max(5.0, min_load * (1.0 - 0.15 * (visc_ratio - 1.0)))
    future_fillage_pct = max(30.0, 85.0 - (visc_ratio - 1.0) * 12.0)

    return {
        "horizon": "Next 1–6 h",
        "update_frequency": "Every 1–5 min",
        "future_peak_rod_load_kn": round(future_peak_load, 1),
        "future_min_rod_load_kn": round(future_min_load, 1),
        "future_fillage_pct": round(future_fillage_pct, 1),
        "summary": f"Future load = {future_peak_load:.1f} kN | Fillage = {future_fillage_pct:.0f}%",
        "expected_performance_regime": "HEAVY_DRAG_DEGRADED" if future_fillage_pct < 60.0 else "NOMINAL_STABLE"
    }

def predict_pump_efficiency(latest: Dict[str, Any], behavior: Dict[str, Any]) -> Dict[str, Any]:
    """
    6. Pump Efficiency Prediction
    Horizon: Next 1–24 h | Update freq: Every 5–15 min
    """
    current_eff = 72.0
    future_fillage = float(behavior.get("future_fillage_pct", 75.0))
    eff_24h = round(max(30.0, min(current_eff, future_fillage * 0.90)), 1)
    eff_6h = round((current_eff + eff_24h) / 2.0, 1)

    return {
        "horizon": "Next 1–24 h",
        "update_frequency": "Every 5–15 min",
        "current_volumetric_efficiency_pct": current_eff,
        "forecast_6h_volumetric_efficiency_pct": eff_6h,
        "forecast_24h_volumetric_efficiency_pct": eff_24h,
        "summary": f"Efficiency expected to fall from {current_eff:.0f}% → {eff_24h:.0f}%",
        "efficiency_trend": "DECLINING_WITH_COOLING" if eff_24h < 68.0 else "SUSTAINABLE"
    }

def predict_rod_floating(latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    7. Rod Floating Prediction
    Horizon: Next 5–30 min | Update freq: Every 10–30 sec
    """
    spm = float(latest.get("spm", 5.5))
    stage = str(latest.get("operating_stage", "PRODUCTION")).upper()
    pump_running = latest.get("pump_running")

    # If pump is stopped or in STEAM/SOAK, rod is parked (no floating risk)
    if spm <= 0.05 or pump_running is False or stage in ("STEAM", "SOAK"):
        return {
            "horizon": "Next 5–30 min",
            "update_frequency": "Every 10–30 sec",
            "floating_probability": 0.0,
            "risk_next_10min_pct": 0,
            "status": "PUMP_STOPPED_CSS_INACTIVE",
            "summary": f"Pump shut-in ({stage} stage) — 0% floating risk",
            "recommended_remedy": "None (Planned CSS cycle active)"
        }

    min_load = float(latest.get("rod_load_kn", 55.0))
    visc = float(latest.get("viscosity_cp", 12000.0))

    visc_factor = max(0.0, (visc - 10000.0) / 15000.0)
    speed_factor = spm / 6.0

    raw_prob = (visc_factor * 0.55) + (speed_factor * 0.25)
    if min_load < 20.0:
        raw_prob += (20.0 - min_load) / 20.0 * 0.40

    prob = round(min(1.0, max(0.0, raw_prob)), 3)
    pct_10m = round(prob * 100.0)

    return {
        "horizon": "Next 5–30 min",
        "update_frequency": "Every 10–30 sec",
        "floating_probability": prob,
        "risk_next_10min_pct": pct_10m,
        "status": "CRITICAL_ROD_FLOAT" if prob > 0.70 else ("ELEVATED_RISK" if prob > 0.40 else "NORMAL_FREE_FALL"),
        "summary": f"Rod-floating risk in next 10 min = {pct_10m}%",
        "recommended_remedy": "Reduce SPM via VFD or Initiate Hot-Oil/Steam Flush" if prob > 0.50 else "None"
    }

def predict_impact_loading(latest: Dict[str, Any], rod_floating: Dict[str, Any]) -> Dict[str, Any]:
    """
    8. Impact Loading Prediction
    Horizon: Next 1–15 min | Update freq: Every 5–10 sec
    """
    spm = float(latest.get("spm", 5.5))
    stage = str(latest.get("operating_stage", "PRODUCTION")).upper()
    pump_running = latest.get("pump_running")

    if spm <= 0.05 or pump_running is False or stage in ("STEAM", "SOAK"):
        return {
            "horizon": "Next 1–15 min",
            "update_frequency": "Every 5–10 sec",
            "impact_probability": 0.0,
            "impact_severity": "MINIMAL_SMOOTH_REVERSAL",
            "summary": f"Pump shut-in ({stage} stage) — No impact loading"
        }

    float_prob = rod_floating["floating_probability"]
    stroke = float(latest.get("stroke_length_m", 2.5))

    impact_prob = round(min(1.0, float_prob * (spm / 5.0) * (stroke / 2.5)), 3)

    if impact_prob > 0.60:
        severity = "HIGH_SEVERITY_IMPACT"
        summary = "High-impact event likely within next 5 min"
    elif impact_prob > 0.30:
        severity = "MODERATE_FLUID_POUND"
        summary = "Moderate fluid pound risk within 15 min"
    else:
        severity = "MINIMAL_SMOOTH_REVERSAL"
        summary = "Smooth turnaround expected within next 15 min"

    return {
        "horizon": "Next 1–15 min",
        "update_frequency": "Every 5–10 sec",
        "impact_probability": impact_prob,
        "impact_severity": severity,
        "summary": summary
    }

def predict_rod_failure(
    latest: Dict[str, Any],
    rod_floating: Dict[str, Any],
    impact_loading: Dict[str, Any],
) -> Dict[str, Any]:
    """
    9. Rod Failure Risk Prediction
    Horizon: Next 24 h–30 days | Update freq: Every 1–6 h
    """
    peak_load = float(latest.get("rod_load_kn", 120.0))
    impact_prob = impact_loading["impact_probability"]
    float_prob = rod_floating["floating_probability"]

    stress_ratio = peak_load / 165.0
    fatigue_contribution = max(0.0, (stress_ratio - 0.70) * 1.5)

    risk_score = (fatigue_contribution * 0.40) + (impact_prob * 0.35) + (float_prob * 0.25)
    prob_30d = round(min(1.0, max(0.01, risk_score)), 3)
    prob_7d_pct = round(prob_30d * 100 * 0.18, 1)

    return {
        "horizon": "Next 24 h–30 days",
        "update_frequency": "Every 1–6 h",
        "failure_probability": prob_30d,
        "failure_risk_7d_pct": prob_7d_pct,
        "summary": f"Failure risk in next 7 days = {prob_7d_pct}%",
        "fatigue_risk_level": "CRITICAL" if prob_30d > 0.75 else ("ELEVATED" if prob_30d > 0.40 else "ACCEPTABLE"),
        "estimated_cycles_to_failure": int(max(10000, 1000000 * (1.0 - prob_30d))),
        "primary_threat_vector": "CYCLIC_IMPACT_FATIGUE" if impact_prob > 0.5 else "TENSILE_OVERLOAD"
    }

def predict_pump_unsetting(latest: Dict[str, Any], impact_loading: Dict[str, Any]) -> Dict[str, Any]:
    """
    10. Pump Unsetting Prediction
    Horizon: Next 1–24 h | Update freq: Every 5–15 min
    """
    tubing_press = float(latest.get("tubing_pressure_bar", 18.5))
    impact_prob = impact_loading["impact_probability"]

    press_factor = max(0.0, (tubing_press - 35.0) / 50.0)
    unsetting_prob = round(min(1.0, max(0.005, (impact_prob * 0.60) + (press_factor * 0.40))), 3)
    risk_6h_pct = round(unsetting_prob * 100 * 0.65, 1)

    return {
        "horizon": "Next 1–24 h",
        "update_frequency": "Every 5–15 min",
        "unsetting_probability": unsetting_prob,
        "unsetting_risk_6h_pct": risk_6h_pct,
        "summary": f"Unsetting risk in next 6 h = {risk_6h_pct}%",
        "status": "IMMINENT_UNSETTING_ALARM" if unsetting_prob > 0.70 else ("MONITOR" if unsetting_prob > 0.35 else "SEATED_SECURE"),
        "recommended_action": "Check mechanical seating cups and downhole anchor" if unsetting_prob > 0.40 else "Routine inspection"
    }
