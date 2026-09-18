import math
from typing import List, Dict, Any

def predict_reservoir_temperature(latest: Dict[str, Any], cooling_rate_per_day: float) -> Dict[str, Any]:
    """
    1. Reservoir Temperature Prediction
    Inputs: Current temp, steam volume/rate, steam pressure, steam temperature,
            injection duration, soak time, days since steam, reservoir history
    Output: Temperature forecast (7d, 14d, 30d)
    """
    current_temp = float(latest.get("temperature_c", 50.0))
    ambient_temp = 48.0 # Native Jodhpur Sandstone reservoir temperature at ~1,150 m depth

    # Conductive-convective heat loss model (exponential decay towards ambient)
    # T(t) = T_ambient + (T_current - T_ambient) * exp(-decay_const * days)
    # Decay constant calibrated to ~0.022 / day
    delta_t = max(0.0, current_temp - ambient_temp)
    k_decay = max(0.015, cooling_rate_per_day / max(1.0, delta_t + 5.0))

    t_7d = ambient_temp + delta_t * math.exp(-k_decay * 7)
    t_14d = ambient_temp + delta_t * math.exp(-k_decay * 14)
    t_30d = ambient_temp + delta_t * math.exp(-k_decay * 30)

    return {
        "current_temperature_c": round(current_temp, 1),
        "forecast_7d_c": round(t_7d, 1),
        "forecast_14d_c": round(t_14d, 1),
        "forecast_30d_c": round(t_30d, 1),
        "asymptotic_ambient_c": ambient_temp,
        "thermal_decay_constant": round(k_decay, 4)
    }

def predict_reservoir_cooling(latest: Dict[str, Any], temp_forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    2. Reservoir Cooling Prediction
    Inputs: Temperature history, days since steam, previous CSS cycles, production
    Output: Cooling rate + future temperature trajectory
    """
    t_curr = temp_forecast["current_temperature_c"]
    t_7d = temp_forecast["forecast_7d_c"]
    t_14d = temp_forecast["forecast_14d_c"]

    rate_next_7d = round((t_curr - t_7d) / 7.0, 2)
    rate_next_14d = round((t_curr - t_14d) / 14.0, 2)

    days_until_suboptimal = 0
    # Sub-optimal is reached when temp drops below 55°C
    if t_curr > 55.0:
        decay_const = temp_forecast["thermal_decay_constant"]
        ambient = temp_forecast["asymptotic_ambient_c"]
        if (55.0 - ambient) > 0 and (t_curr - ambient) > 0:
            days_until_suboptimal = round(-math.log((55.0 - ambient) / (t_curr - ambient)) / decay_const, 1)

    return {
        "projected_cooling_rate_7d_c_per_day": rate_next_7d,
        "projected_cooling_rate_14d_c_per_day": rate_next_14d,
        "days_until_cooling_threshold_55c": days_until_suboptimal,
        "recommended_css_resteam_window_days": max(0.0, round(days_until_suboptimal + 7, 1))
    }

def predict_oil_viscosity(temp_forecast: Dict[str, Any], latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    3. Oil Viscosity Prediction
    Inputs: Temperature, pressure, fluid-property curve, historical viscosity
    Output: Viscosity forecast
    """
    # Walther/Arrhenius viscosity model for Baghewala crude
    # mu(T) = A * exp(B / (T + 273.15))
    B = 5400.0
    A = 12000.0 * math.exp(-B / (50.0 + 273.15))

    def calc_mu(t_c: float) -> float:
        t_k = max(20.0, t_c) + 273.15
        return A * math.exp(B / t_k)

    mu_curr = float(latest.get("viscosity_cp", calc_mu(temp_forecast["current_temperature_c"])))
    mu_7d = calc_mu(temp_forecast["forecast_7d_c"])
    mu_14d = calc_mu(temp_forecast["forecast_14d_c"])
    mu_30d = calc_mu(temp_forecast["forecast_30d_c"])

    return {
        "current_viscosity_cp": round(mu_curr, 0),
        "forecast_7d_cp": round(mu_7d, 0),
        "forecast_14d_cp": round(mu_14d, 0),
        "forecast_30d_cp": round(mu_30d, 0),
        "viscosity_surge_ratio_30d": round(mu_30d / max(1.0, mu_curr), 2),
        "mobility_risk": "HIGH_VISCOSITY_TRAP_IN_30D" if mu_30d > 16000 else "CONTROLLED"
    }
