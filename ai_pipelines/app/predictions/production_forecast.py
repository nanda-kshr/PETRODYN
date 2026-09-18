from typing import Dict, Any

def predict_production_rate(
    latest: Dict[str, Any],
    viscosity_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    4. Production Rate Prediction
    Horizon: Next 6–24 h | Update freq: Every 15–60 min
    """
    current_bopd = float(latest.get("production_bopd", 30.0))
    current_visc = float(latest.get("viscosity_cp", 12000.0))
    mu_6h = viscosity_forecast.get("forecast_6h_cp", current_visc * 1.02)
    mu_24h = viscosity_forecast.get("forecast_24h_cp", current_visc * 1.08)

    bopd_6h = current_bopd * ((current_visc / max(100.0, mu_6h)) ** 0.25)
    bopd_24h = current_bopd * ((current_visc / max(100.0, mu_24h)) ** 0.25)

    low_range = round(bopd_24h - 1.5, 0)
    high_range = round(bopd_24h + 1.5, 0)

    return {
        "horizon": "Next 6–24 h",
        "update_frequency": "Every 15–60 min",
        "current_bopd": round(current_bopd, 1),
        "forecast_6h_bopd": round(max(5.0, bopd_6h), 1),
        "forecast_24h_bopd": round(max(4.0, bopd_24h), 1),
        "forecast_range_24h": f"{low_range:.0f}–{high_range:.0f} BOPD",
        "summary": f"Next 24 h production = {low_range:.0f}–{high_range:.0f} BOPD",
        "cumulative_24h_oil_bbl": round(bopd_24h, 1)
    }

def predict_production_decline(
    latest: Dict[str, Any],
    prod_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    11. Production Decline Prediction
    Horizon: Cycle / Shift | Update freq: Every 1–6 h
    """
    q_start = prod_forecast["current_bopd"]
    q_24h = prod_forecast["forecast_24h_bopd"]

    daily_decline_pct = round(((q_start - q_24h) / max(1.0, q_start)) * 100.0, 2)
    monthly_decline_pct = round(daily_decline_pct * 30.0, 1)

    if monthly_decline_pct > 25.0:
        rate_char = "RAPID_THERMAL_EXHAUSTION"
    elif monthly_decline_pct > 12.0:
        rate_char = "NORMAL_POST_CSS_DEPLETION"
    else:
        rate_char = "STABLE_PLATEAU"

    return {
        "horizon": "Cycle / Shift",
        "update_frequency": "Every 1–6 h",
        "daily_decline_pct": daily_decline_pct,
        "expected_monthly_decline_pct": monthly_decline_pct,
        "decline_character": rate_char,
        "economic_limit_cut_off_days": 45 if monthly_decline_pct > 20 else 90,
        "summary": f"Decline = {daily_decline_pct:.2f}%/day ({rate_char.replace('_', ' ')})"
    }

def predict_energy_consumption(
    latest: Dict[str, Any],
    prod_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    12. Energy Consumption Prediction
    Horizon: Next 6–24 h | Update freq: Every 15–60 min
    """
    motor_current = float(latest.get("motor_current_a", 50.0))
    vfd_hz = float(latest.get("vfd_frequency_hz", 40.0))
    voltage = 415.0 * min(1.0, vfd_hz / 50.0)
    power_kw = (1.732 * voltage * motor_current * 0.82 * 0.90) / 1000.0
    daily_kwh = power_kw * 24.0

    current_kwh_per_bbl = daily_kwh / max(1.0, prod_forecast["current_bopd"])
    forecast_6h_kwh_per_bbl = daily_kwh / max(1.0, prod_forecast["forecast_6h_bopd"])
    forecast_24h_kwh_per_bbl = (daily_kwh * 1.04) / max(1.0, prod_forecast["forecast_24h_bopd"])

    return {
        "horizon": "Next 6–24 h",
        "update_frequency": "Every 15–60 min",
        "current_kwh_per_bbl": round(current_kwh_per_bbl, 1),
        "forecast_6h_kwh_per_bbl": round(forecast_6h_kwh_per_bbl, 1),
        "forecast_24h_kwh_per_bbl": round(forecast_24h_kwh_per_bbl, 1),
        "summary": f"Tomorrow = {round(forecast_24h_kwh_per_bbl, 1)} kWh/bbl",
        "projected_cost_trend": "INCREASING_LIFT_COST_PER_BARREL" if forecast_24h_kwh_per_bbl > current_kwh_per_bbl else "STABLE"
    }

def predict_future_sor(
    latest: Dict[str, Any],
    prod_forecast: Dict[str, Any],
) -> Dict[str, Any]:
    """
    13. Future SOR Prediction
    Horizon: Next 1–7 days | Update freq: Every 1–6 h
    """
    # Estimated steam-oil ratio for current CSS cycle
    estimated_steam_pool_bbl = 4500.0
    cum_oil_est = prod_forecast["current_bopd"] * 30.0
    current_sor = round(estimated_steam_pool_bbl / max(1.0, cum_oil_est), 1)
    projected_cycle_end_sor = round(current_sor * 1.25, 1)

    return {
        "horizon": "Next 1–7 days",
        "update_frequency": "Every 1–6 h",
        "current_sor_forecast": current_sor,
        "projected_cycle_end_sor": projected_cycle_end_sor,
        "summary": f"Expected SOR next cycle = {projected_cycle_end_sor:.1f}",
        "efficiency_status": "ECONOMIC_WINDOW" if projected_cycle_end_sor < 6.0 else "STEAM_INTENSIVE_RESTIMULATE"
    }
