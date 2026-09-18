from typing import Dict, Any

def predict_pump_behavior(latest: Dict[str, Any], viscosity_forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    5. Pump Behavior Prediction
    Inputs: SPM, stroke, rod load, rod position, pressure, fluid level, viscosity
    Output: Future load / fillage / performance
    """
    current_peak_load = float(latest.get("rod_load_kn", 120.0))
    visc_ratio = viscosity_forecast["viscosity_surge_ratio_30d"]

    # As viscosity surges, peak load increases by drag, while min load drops
    future_peak_load = current_peak_load * (1.0 + 0.12 * (visc_ratio - 1.0))
    future_fillage_pct = max(30.0, 85.0 - (visc_ratio - 1.0) * 15.0)

    return {
        "future_peak_rod_load_kn": round(future_peak_load, 1),
        "future_fillage_pct": round(future_fillage_pct, 1),
        "expected_performance_regime": "HEAVY_DRAG_DEGRADED" if future_fillage_pct < 60.0 else "NOMINAL_STABLE"
    }

def predict_pump_efficiency(latest: Dict[str, Any], behavior: Dict[str, Any]) -> Dict[str, Any]:
    """
    6. Pump Efficiency Prediction
    Inputs: Dynamometer card, SPM, stroke, production, fluid level
    Output: Future efficiency
    """
    base_eff = float(behavior["future_fillage_pct"]) * 0.95
    future_volumetric_eff = round(min(98.0, max(25.0, base_eff)), 1)
    future_mechanical_eff = round(max(50.0, 85.0 - (behavior["future_peak_rod_load_kn"] - 100.0) * 0.3), 1)

    return {
        "future_volumetric_efficiency_pct": future_volumetric_eff,
        "future_mechanical_efficiency_pct": future_mechanical_eff,
        "efficiency_trend": "DECLINING_WITH_COOLING" if future_volumetric_eff < 70.0 else "SUSTAINABLE"
    }

def predict_rod_floating(latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    7. Rod Floating Prediction
    Inputs: Rod load + position, SPM, stroke, acceleration/velocity, fluid level
    Output: Floating probability (0.0 to 1.0)
    
    Physics: Occurs when downstroke viscous drag exceeds buoyant rod string weight.
    W_buoyant ~= 56.5 kN. If minimum load during turnaround drops < 15 kN, risk escalates.
    """
    min_load = float(latest.get("rod_load_kn", 55.0))
    spm = float(latest.get("spm", 5.5))
    visc = float(latest.get("viscosity_cp", 12000.0))

    # Calculate floating risk score
    # High viscosity + high SPM accelerates downstroke drag
    visc_factor = max(0.0, (visc - 10000.0) / 15000.0) # > 10,000 cP increases risk
    speed_factor = spm / 6.0

    raw_prob = (visc_factor * 0.55) + (speed_factor * 0.25)
    if min_load < 20.0:
        raw_prob += (20.0 - min_load) / 20.0 * 0.40

    prob = round(min(1.0, max(0.0, raw_prob)), 3)

    return {
        "floating_probability": prob,
        "status": "CRITICAL_ROD_FLOAT" if prob > 0.70 else ("ELEVATED_RISK" if prob > 0.40 else "NORMAL_FREE_FALL"),
        "trigger_cause": "High Viscous Drag on Downstroke" if visc > 15000 else "Nominal",
        "recommended_remedy": "Reduce SPM via VFD or Initiate Hot-Oil/Steam Flush" if prob > 0.50 else "None"
    }

def predict_impact_loading(latest: Dict[str, Any], rod_floating: Dict[str, Any]) -> Dict[str, Any]:
    """
    8. Impact Loading Prediction
    Inputs: Rod load/position, acceleration, SPM, stroke, motor torque
    Output: Impact probability / severity
    """
    float_prob = rod_floating["floating_probability"]
    spm = float(latest.get("spm", 5.5))
    stroke = float(latest.get("stroke_length_m", 2.5))

    # Impact occurs when floating rod catches up with fluid/seat on turnaround
    impact_prob = round(min(1.0, float_prob * (spm / 5.0) * (stroke / 2.5)), 3)

    if impact_prob > 0.65:
        severity = "HIGH_SEVERITY_IMPACT"
        desc = "Severe shock loads on horsehead and carrier bar. High fatigue threat."
    elif impact_prob > 0.30:
        severity = "MODERATE_FLUID_POUND"
        desc = "Partial fluid pound detected on downstroke turnaround."
    else:
        severity = "MINIMAL_SMOOTH_REVERSAL"
        desc = "Smooth rod reversal with negligible impact shock."

    return {
        "impact_probability": impact_prob,
        "impact_severity": severity,
        "description": desc
    }

def predict_rod_failure(
    latest: Dict[str, Any],
    rod_floating: Dict[str, Any],
    impact_loading: Dict[str, Any],
) -> Dict[str, Any]:
    """
    9. Rod Failure Risk Prediction
    Inputs: Load history, peak load, load cycles, impact indicators, vibration, SPM, stroke, historical failures
    Output: Failure probability / risk (0.0 to 1.0)
    """
    peak_load = float(latest.get("rod_load_kn", 120.0))
    impact_prob = impact_loading["impact_probability"]
    float_prob = rod_floating["floating_probability"]

    # Modified Goodman stress ratio: Grade D rods have endurance limit ~165 kN peak
    stress_ratio = peak_load / 165.0
    fatigue_contribution = max(0.0, (stress_ratio - 0.70) * 1.5)

    risk_score = (fatigue_contribution * 0.40) + (impact_prob * 0.35) + (float_prob * 0.25)
    prob = round(min(1.0, max(0.01, risk_score)), 3)

    return {
        "failure_probability": prob,
        "fatigue_risk_level": "CRITICAL" if prob > 0.75 else ("ELEVATED" if prob > 0.40 else "ACCEPTABLE"),
        "estimated_cycles_to_failure": int(max(10000, 1000000 * (1.0 - prob))),
        "primary_threat_vector": "CYCLIC_IMPACT_FATIGUE" if impact_prob > 0.5 else "TENSILE_OVERLOAD"
    }

def predict_pump_unsetting(latest: Dict[str, Any], impact_loading: Dict[str, Any]) -> Dict[str, Any]:
    """
    10. Pump Unsetting Prediction
    Inputs: Dynamometer, rod load, pressure, fluid level, production, historical unsetting events
    Output: Unsetting probability
    """
    tubing_press = float(latest.get("tubing_pressure_bar", 18.5))
    impact_prob = impact_loading["impact_probability"]

    # Mechanical hold-down unsetting occurs under severe upward friction / shock or tubing vibration
    press_factor = max(0.0, (tubing_press - 35.0) / 50.0)
    unsetting_prob = round(min(1.0, max(0.005, (impact_prob * 0.60) + (press_factor * 0.40))), 3)

    return {
        "unsetting_probability": unsetting_prob,
        "status": "IMMINENT_UNSETTING_ALARM" if unsetting_prob > 0.70 else ("MONITOR" if unsetting_prob > 0.35 else "SEATED_SECURE"),
        "recommended_action": "Check mechanical seating cups and downhole anchor" if unsetting_prob > 0.40 else "Routine inspection"
    }
