import math
from typing import List, Dict, Any

def predict_reservoir_temperature(latest: Dict[str, Any], cooling_rate_per_day: float) -> Dict[str, Any]:
    """
    1. Reservoir Temperature Prediction
    Horizon: Next 6–72 h | Update freq: Every 15–60 min
    """
    current_temp = float(latest.get("temperature_c", 50.0))
    ambient_temp = 48.0  # Native Jodhpur Sandstone reservoir temperature at ~1,150 m depth

    delta_t = max(0.0, current_temp - ambient_temp)
    k_decay = max(0.015, cooling_rate_per_day / max(1.0, delta_t + 5.0))

    # Convert days to hours: 6h = 0.25d, 24h = 1d, 72h = 3d
    t_6h = ambient_temp + delta_t * math.exp(-k_decay * 0.25)
    t_24h = ambient_temp + delta_t * math.exp(-k_decay * 1.0)
    t_72h = ambient_temp + delta_t * math.exp(-k_decay * 3.0)

    return {
        "horizon": "Next 6–72 h",
        "update_frequency": "Every 15–60 min",
        "current_temperature_c": round(current_temp, 1),
        "forecast_6h_c": round(t_6h, 1),
        "forecast_24h_c": round(t_24h, 1),
        "forecast_72h_c": round(t_72h, 1),
        "summary": f"Temperature tomorrow = {round(t_24h, 1)}°C",
        "asymptotic_ambient_c": ambient_temp,
        "thermal_decay_constant": round(k_decay, 4)
    }

def predict_reservoir_cooling(latest: Dict[str, Any], temp_forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    2. Reservoir Cooling Prediction
    Horizon: Next 1–7 days | Update freq: Every 1–6 h
    """
    t_curr = temp_forecast["current_temperature_c"]
    t_24h = temp_forecast["forecast_24h_c"]
    decay_const = temp_forecast["thermal_decay_constant"]
    ambient = temp_forecast["asymptotic_ambient_c"]

    rate_per_day = round(max(0.05, t_curr - t_24h), 2)

    days_until_suboptimal = 0
    if t_curr > 55.0 and (55.0 - ambient) > 0 and (t_curr - ambient) > 0:
        days_until_suboptimal = round(-math.log((55.0 - ambient) / (t_curr - ambient)) / decay_const, 1)

    return {
        "horizon": "Next 1–7 days",
        "update_frequency": "Every 1–6 h",
        "cooling_rate_c_per_day": rate_per_day,
        "days_until_cooling_threshold_55c": days_until_suboptimal,
        "recommended_css_resteam_window_days": max(0.0, round(days_until_suboptimal + 7, 1)),
        "summary": f"Cooling = {rate_per_day:.1f}°C/day"
    }

def predict_oil_viscosity(temp_forecast: Dict[str, Any], latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    3. Oil Viscosity Prediction
    Horizon: Next 6–72 h | Update freq: Every 15–60 min
    """
    B = 5400.0
    A = 12000.0 * math.exp(-B / (50.0 + 273.15))

    def calc_mu(t_c: float) -> float:
        t_k = max(20.0, t_c) + 273.15
        return A * math.exp(B / t_k)

    mu_curr = float(latest.get("viscosity_cp", calc_mu(temp_forecast["current_temperature_c"])))
    mu_6h = calc_mu(temp_forecast["forecast_6h_c"])
    mu_24h = calc_mu(temp_forecast["forecast_24h_c"])
    mu_72h = calc_mu(temp_forecast["forecast_72h_c"])

    return {
        "horizon": "Next 6–72 h",
        "update_frequency": "Every 15–60 min",
        "current_viscosity_cp": round(mu_curr, 0),
        "forecast_6h_cp": round(mu_6h, 0),
        "forecast_24h_cp": round(mu_24h, 0),
        "forecast_72h_cp": round(mu_72h, 0),
        "viscosity_surge_ratio_24h": round(mu_24h / max(1.0, mu_curr), 2),
        "summary": f"Viscosity tomorrow = {round(mu_24h, 0):,.0f} cP",
        "mobility_risk": "HIGH_VISCOSITY_TRAP_IN_24H" if mu_24h > 15000 else "CONTROLLED"
    }
