import numpy as np
from typing import List, Dict, Any

def analyze_motor_load(latest: Dict[str, Any]) -> Dict[str, Any]:
    motor_current = float(latest.get("motor_current_a", 50.0))
    vfd_hz = float(latest.get("vfd_frequency_hz", 40.0))

    # Rated full-load motor current for standard 55 kW SRP beam unit motor ~ 95 A at 50 Hz
    rated_current_a = 95.0 * (vfd_hz / 50.0) if vfd_hz > 10.0 else 95.0
    load_pct = (motor_current / max(10.0, rated_current_a)) * 100.0

    # Electrical Power (kW) ~ sqrt(3) * V * I * pf * eta
    # 415V, power factor ~0.82, motor efficiency ~0.90
    voltage = 415.0 * min(1.0, vfd_hz / 50.0)
    power_kw = (1.732 * voltage * motor_current * 0.82 * 0.90) / 1000.0

    return {
        "motor_current_a": round(motor_current, 1),
        "motor_load_pct": round(min(150.0, max(0.0, load_pct)), 1),
        "estimated_power_kw": round(power_kw, 2),
        "status": "OVERLOAD" if load_pct > 100.0 else ("OPTIMAL" if load_pct > 40.0 else "UNDERLOAD")
    }

def analyze_energy_intensity(power_kw: float, latest: Dict[str, Any]) -> Dict[str, Any]:
    bopd = float(latest.get("production_bopd", 30.0))
    # Daily energy consumed = power_kw * 24 h
    daily_kwh = power_kw * 24.0
    kwh_per_bbl = daily_kwh / max(1.0, bopd)

    return {
        "energy_intensity_kwh_per_bbl": round(kwh_per_bbl, 2),
        "daily_power_kwh": round(daily_kwh, 1),
        "rating": "HIGH_EFFICIENCY" if kwh_per_bbl < 18.0 else ("ELEVATED" if kwh_per_bbl < 30.0 else "POOR_ENERGY_EFFICIENCY")
    }

def analyze_sor(latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    Steam-to-Oil Ratio (SOR) Analysis
    In Baghewala CSS cycles:
    CSS injection typically consumes ~140-200 m3/day of steam during 14-21 day cycles.
    Amortized daily steam injection ~ 50-80 m3/day equivalent over cycle.
    1 m3 steam ~= 6.29 bbl steam cold-water-equivalent (CWE).
    """
    bopd = float(latest.get("production_bopd", 30.0))
    temp_c = float(latest.get("temperature_c", 50.0))

    # Inferred steam equivalent based on reservoir thermal energy above ambient (50°C baseline)
    thermal_excess = max(0.0, temp_c - 50.0)
    # Estimated steam CWE allocated per day in bbls
    daily_steam_bbl = 120.0 + (thermal_excess * 4.5)
    
    sor = daily_steam_bbl / max(1.0, bopd)

    return {
        "sor_bbl_steam_per_bbl_oil": round(sor, 2),
        "sor_m3_cwe_per_m3_oil": round(sor, 2),
        "allocated_steam_rate_bpd": round(daily_steam_bbl, 1),
        "benchmark": "GOOD" if sor < 3.5 else ("ACCEPTABLE" if sor < 5.5 else "HIGH_EXCESS_STEAM")
    }

def analyze_production_performance(records: List[Dict[str, Any]], latest: Dict[str, Any]) -> Dict[str, Any]:
    current_bopd = float(latest.get("production_bopd", 30.0))
    
    if len(records) > 5:
        bopd_series = [float(r.get("production_bopd", current_bopd)) for r in records[-20:]]
        # Linear slope
        x = np.arange(len(bopd_series))
        slope, _ = np.polyfit(x, bopd_series, 1)
        
        if slope > 0.05:
            trend = "INCREASING"
        elif slope < -0.05:
            trend = "DECLINING"
        else:
            trend = "STABLE"
        rate_change_pct = ((bopd_series[-1] - bopd_series[0]) / max(1.0, bopd_series[0])) * 100.0
    else:
        trend = "STABLE"
        rate_change_pct = 0.0

    return {
        "current_bopd": round(current_bopd, 1),
        "production_trend": trend,
        "rate_change_pct": round(rate_change_pct, 1),
        "spm": round(float(latest.get("spm", 5.5)), 1),
        "stroke_length_m": round(float(latest.get("stroke_length_m", 2.5)), 2),
        "fluid_level_m": round(float(latest.get("fluid_level_m", 850.0)), 1)
    }

def analyze_pressures(latest: Dict[str, Any]) -> Dict[str, Any]:
    tubing_press = float(latest.get("tubing_pressure_bar", 18.5))
    fluid_level = float(latest.get("fluid_level_m", 850.0))
    pump_depth = 1150.0

    # Pump intake pressure = hydrostatic head of fluid above pump
    submergence_m = max(0.0, pump_depth - fluid_level)
    # Heavy oil gradient ~ 0.093 bar/m
    intake_pressure_bar = submergence_m * 0.0932

    # Discharge pressure = Tubing wellhead pressure + hydrostatic column of fluid inside tubing (1150m * 0.0932)
    discharge_pressure_bar = tubing_press + (pump_depth * 0.0932)

    differential_pressure_bar = discharge_pressure_bar - intake_pressure_bar

    return {
        "tubing_pressure_bar": round(tubing_press, 1),
        "intake_pressure_bar": round(intake_pressure_bar, 1),
        "discharge_pressure_bar": round(discharge_pressure_bar, 1),
        "differential_pressure_bar": round(differential_pressure_bar, 1)
    }
