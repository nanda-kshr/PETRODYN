import numpy as np
from datetime import datetime
from typing import List, Dict, Any

def analyze_thermal_state(latest: Dict[str, Any]) -> Dict[str, Any]:
    temp_c = float(latest.get("temperature_c", 50.0))

    if temp_c >= 120.0:
        status = "HOT_EARLY_POST_STEAM"
        desc = "High near-wellbore thermal energy. Optimal mobility, minimal lift load."
    elif temp_c >= 70.0:
        status = "OPTIMAL_PRODUCTION_WINDOW"
        desc = "Sustainable thermal envelope with effective viscosity reduction."
    elif temp_c >= 55.0:
        status = "COOLING_TRANSITION"
        desc = "Viscosity approaching threshold where rod drag increases."
    else:
        status = "COLD_DEPLETED"
        desc = "Reservoir returned near native temperature. Severe viscosity and rod float risk."

    return {
        "wellbore_temperature_c": round(temp_c, 1),
        "thermal_condition": status,
        "description": desc
    }

def analyze_cooling_rate(records: List[Dict[str, Any]], latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes cooling rate in °C/day based on time-series telemetry.
    """
    default_rate = 0.45 # standard conductive thermal decay rate for CSS well in Jodhpur Sandstone
    
    if len(records) >= 5:
        temps = [float(r.get("temperature_c", 50.0)) for r in records]
        # In simulation time, we compute slope per second and scale to days
        x = np.arange(len(temps))
        slope, _ = np.polyfit(x, temps, 1)
        # Scaled to simulated day equivalents
        cooling_rate_c_per_day = round(abs(float(slope)) * 120.0 + default_rate, 2)
    else:
        cooling_rate_c_per_day = default_rate

    return {
        "cooling_rate_c_per_day": cooling_rate_c_per_day,
        "thermal_decay_profile": "MODERATE_HEAT_LOSS" if cooling_rate_c_per_day < 0.8 else "ACCELERATED_COOLING"
    }

def analyze_viscosity_trend(latest: Dict[str, Any], cooling_rate: float) -> Dict[str, Any]:
    visc = float(latest.get("viscosity_cp", 12000.0))
    temp_c = float(latest.get("temperature_c", 50.0))

    # Arrhenius sensitivity d(visc)/dT around current temperature
    # mu = A * exp(B / T_K) -> d(mu)/dT = -mu * B / (T_K^2)
    T_k = temp_c + 273.15
    B = 5400.0
    d_visc_dT = (visc * B) / (T_k ** 2)

    # Viscosity change rate per day = d_visc_dT * cooling_rate_c_per_day
    viscosity_change_rate_cp_per_day = round(d_visc_dT * cooling_rate, 1)

    if visc < 3000:
        regime = "LOW_VISCOSITY_HIGH_MOBILITY"
    elif visc < 10000:
        regime = "MODERATE_VISCOSITY"
    elif visc < 18000:
        regime = "HIGH_VISCOSITY_CRITICAL_DRAG"
    else:
        regime = "EXTREME_VISCOSITY_ROD_FLOAT_DANGER"

    return {
        "current_viscosity_cp": round(visc, 0),
        "viscosity_regime": regime,
        "viscosity_increase_rate_cp_per_day": viscosity_change_rate_cp_per_day,
        "trend": "INCREASING_AS_WELL_COOLS"
    }
