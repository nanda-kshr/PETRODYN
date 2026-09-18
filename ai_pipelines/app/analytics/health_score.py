from typing import Dict, Any

def calculate_well_health_score(
    pump_state: Dict[str, Any],
    pump_load: Dict[str, Any],
    volumetric_eff: Dict[str, Any],
    motor_load: Dict[str, Any],
    thermal_state: Dict[str, Any],
    sensor_health: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Computes a composite 0-100 Well Health Score across 5 weighted domains:
    1. Thermal Condition (25%)
    2. Mechanical Lift Stability (25%)
    3. Production & Volumetric Efficiency (20%)
    4. Electrical / Motor Integrity (15%)
    5. Data Quality & Sensor Health (15%)
    """
    # 1. Thermal score (0-100)
    temp_c = thermal_state.get("wellbore_temperature_c", 50.0)
    if temp_c >= 80.0:
        thermal_score = 95.0
    elif temp_c >= 60.0:
        thermal_score = 80.0 + (temp_c - 60.0) * 0.75
    elif temp_c >= 45.0:
        thermal_score = 55.0 + (temp_c - 45.0) * 1.6
    else:
        thermal_score = max(20.0, temp_c)

    # 2. Mechanical score (0-100)
    stage = str(pump_state.get("operating_stage", "PRODUCTION")).upper()
    is_parked = stage in ("STEAM", "SOAK") or pump_state.get("state") == "STOP"

    if is_parked:
        mechanical_score = 98.0
        production_score = 95.0  # Planned shut-in for thermal stimulation
        elec_score = 98.0        # Motor turned off safely
    else:
        min_load = pump_load.get("min_load_kn", 40.0)
        peak_load = pump_load.get("peak_load_kn", 120.0)
        mech_penalties = 0.0
        if min_load < 20.0:
            mech_penalties += (20.0 - min_load) * 2.5 # Rod floating penalty
        if peak_load > 140.0:
            mech_penalties += (peak_load - 140.0) * 1.5 # Overload penalty
        mechanical_score = max(20.0, min(100.0, 100.0 - mech_penalties))

        # 3. Production efficiency score (0-100)
        vol_eff = volumetric_eff.get("volumetric_efficiency_pct", 75.0)
        production_score = min(100.0, max(25.0, vol_eff * 1.05))

        # 4. Electrical score (0-100)
        motor_load_pct = motor_load.get("motor_load_pct", 65.0)
        if motor_load_pct > 100.0:
            elec_score = max(30.0, 100.0 - (motor_load_pct - 100.0) * 2.0)
        elif motor_load_pct < 20.0:
            elec_score = 65.0 # underload / idle
        else:
            elec_score = 92.0

    # 5. Data quality score (0-100)
    data_quality_score = float(sensor_health.get("sensor_health_score", 100))

    # Composite weighted average
    composite_score = (
        thermal_score * 0.25 +
        mechanical_score * 0.25 +
        production_score * 0.20 +
        elec_score * 0.15 +
        data_quality_score * 0.15
    )
    final_score = round(max(0.0, min(100.0, composite_score)), 1)

    if final_score >= 80.0:
        status = "EXCELLENT_HEALTH"
    elif final_score >= 65.0:
        status = "GOOD_HEALTH"
    elif final_score >= 45.0:
        status = "ATTENTION_REQUIRED"
    else:
        status = "CRITICAL_INTERVENTION_NEEDED"

    return {
        "well_health_score": final_score,
        "health_status": status,
        "sub_scores": {
            "thermal_score": round(thermal_score, 1),
            "mechanical_score": round(mechanical_score, 1),
            "production_efficiency_score": round(production_score, 1),
            "electrical_score": round(elec_score, 1),
            "sensor_health_score": round(data_quality_score, 1)
        }
    }
