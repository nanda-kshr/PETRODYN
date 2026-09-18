from typing import Dict, Any

def predict_production_rate(
    latest: Dict[str, Any],
    viscosity_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    4. Production Rate Prediction
    Inputs: SPM, stroke, VFD, fluid level, tubing pressure, temperature, viscosity, historical production
    Output: BOPD forecast (7d, 14d, 30d)
    """
    current_bopd = float(latest.get("production_bopd", 30.0))
    current_visc = float(latest.get("viscosity_cp", 12000.0))
    mu_7d = viscosity_forecast["forecast_7d_cp"]
    mu_14d = viscosity_forecast["forecast_14d_cp"]
    mu_30d = viscosity_forecast["forecast_30d_cp"]

    # Production is inversely related to viscosity increase due to relative permeability & pump fillage
    # Q(t) ~ Q0 * (mu_0 / mu_t)^0.25
    bopd_7d = current_bopd * ((current_visc / max(100.0, mu_7d)) ** 0.25)
    bopd_14d = current_bopd * ((current_visc / max(100.0, mu_14d)) ** 0.25)
    bopd_30d = current_bopd * ((current_visc / max(100.0, mu_30d)) ** 0.25)

    return {
        "current_bopd": round(current_bopd, 1),
        "forecast_7d_bopd": round(max(5.0, bopd_7d), 1),
        "forecast_14d_bopd": round(max(4.0, bopd_14d), 1),
        "forecast_30d_bopd": round(max(3.0, bopd_30d), 1),
        "cumulative_30d_oil_bbl": round((current_bopd + bopd_30d) / 2.0 * 30.0, 0)
    }

def predict_production_decline(
    latest: Dict[str, Any],
    prod_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    11. Production Decline Prediction
    Inputs: Historical production, temperature, viscosity, fluid level, pump settings
    Output: Expected monthly decline (%)
    """
    q_start = prod_forecast["current_bopd"]
    q_30d = prod_forecast["forecast_30d_bopd"]

    monthly_decline_pct = round(((q_start - q_30d) / max(1.0, q_start)) * 100.0, 1)

    # Harmonic / Arps decline characterization
    if monthly_decline_pct > 25.0:
        rate_char = "RAPID_THERMAL_EXHAUSTION"
    elif monthly_decline_pct > 12.0:
        rate_char = "NORMAL_POST_CSS_DEPLETION"
    else:
        rate_char = "STABLE_PLATEAU"

    return {
        "expected_monthly_decline_pct": monthly_decline_pct,
        "decline_character": rate_char,
        "economic_limit_cut_off_days": 45 if monthly_decline_pct > 20 else 90
    }

def predict_energy_consumption(
    latest: Dict[str, Any],
    prod_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    12. Energy Consumption Prediction
    Inputs: Motor current/power, VFD, SPM, production
    Output: Future kWh/bbl
    """
    motor_current = float(latest.get("motor_current_a", 50.0))
    vfd_hz = float(latest.get("vfd_frequency_hz", 40.0))
    voltage = 415.0 * min(1.0, vfd_hz / 50.0)
    power_kw = (1.732 * voltage * motor_current * 0.82 * 0.90) / 1000.0
    daily_kwh = power_kw * 24.0

    current_kwh_per_bbl = daily_kwh / max(1.0, prod_forecast["current_bopd"])
    forecast_7d_kwh_per_bbl = daily_kwh / max(1.0, prod_forecast["forecast_7d_bopd"])
    forecast_30d_kwh_per_bbl = (daily_kwh * 1.1) / max(1.0, prod_forecast["forecast_30d_bopd"]) # motor works harder as oil cools

    return {
        "current_kwh_per_bbl": round(current_kwh_per_bbl, 2),
        "forecast_7d_kwh_per_bbl": round(forecast_7d_kwh_per_bbl, 2),
        "forecast_30d_kwh_per_bbl": round(forecast_30d_kwh_per_bbl, 2),
        "projected_monthly_energy_cost_trend": "INCREASING_LIFT_COST_PER_BARREL"
    }

def predict_future_sor(
    latest: Dict[str, Any],
    prod_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    13. Future SOR Prediction
    Inputs: Steam usage + production + temperature + cycle history
    Output: Future SOR
    """
    # Cumulative steam allocated for typical Baghewala cycle ~ 2500 m3 CWE = ~15,725 bbls steam
    # SOR = Total Steam / Cumulative Oil
    cum_oil_30d = prod_forecast["cumulative_30d_oil_bbl"]
    estimated_steam_pool_bbl = 4500.0

    current_sor = round(estimated_steam_pool_bbl / max(1.0, cum_oil_30d), 2)
    # If production declines faster than anticipated, SOR rises
    projected_cycle_end_sor = round(current_sor * 1.25, 2)

    return {
        "current_sor_forecast": current_sor,
        "projected_cycle_end_sor": projected_cycle_end_sor,
        "efficiency_status": "ECONOMIC_WINDOW" if projected_cycle_end_sor < 5.0 else "STEAM_INTENSIVE_CANDIDATE_FOR_RESTIMULATION"
    }
