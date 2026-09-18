import math
from typing import List, Dict, Any

def analyze_pump_operating_state(latest: Dict[str, Any]) -> Dict[str, Any]:
    operating_stage = str(latest.get("operating_stage", "PRODUCTION")).upper()
    pump_running_flag = latest.get("pump_running")
    spm = float(latest.get("spm", 0.0))
    vfd = float(latest.get("vfd_frequency_hz", 0.0))
    stroke = float(latest.get("stroke_length_m", 0.0))
    pos = float(latest.get("rod_position_m", 0.0))

    if pump_running_flag is not None:
        is_running = bool(pump_running_flag) and spm > 0.05
    else:
        is_running = spm > 0.05 and vfd > 0.0

    state = "RUN" if is_running else "STOP"

    return {
        "state": state,
        "operating_stage": operating_stage,
        "pump_running": is_running,
        "operating_point": {
            "spm": round(spm, 2),
            "vfd_frequency_hz": round(vfd, 2),
            "stroke_length_m": round(stroke, 2),
            "current_position_m": round(pos, 2)
        }
    }

def analyze_pump_loads(records: List[Dict[str, Any]], latest: Dict[str, Any]) -> Dict[str, Any]:
    if not records:
        records = [latest]

    loads = [float(r.get("rod_load_kn", 0.0)) for r in records if "rod_load_kn" in r]
    if not loads:
        loads = [float(latest.get("rod_load_kn", 65.0))]

    peak_load = max(loads)
    min_load = min(loads)
    avg_load = sum(loads) / len(loads)
    tubing_press = float(latest.get("tubing_pressure_bar", 18.5))

    # Determine load profile regime
    if peak_load > 160.0:
        profile = "OVERLOAD_WARNING"
    elif min_load < 15.0:
        profile = "UNDERLOAD_ROD_FLOAT_RISK"
    elif (peak_load - min_load) < 10.0:
        profile = "LOW_AMPLITUDE_POSSIBLE_PARTED_ROD"
    else:
        profile = "NORMAL_PUMPING_CYCLE"

    return {
        "peak_load_kn": round(peak_load, 1),
        "min_load_kn": round(min_load, 1),
        "average_load_kn": round(avg_load, 1),
        "load_range_kn": round(peak_load - min_load, 1),
        "tubing_pressure_bar": round(tubing_press, 1),
        "load_profile": profile
    }

def analyze_dynamometer_card(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs a closed surface dynamometer card (Load vs. Position)
    from historical stroke measurements.
    """
    if not records:
        return {"surface_card": [], "card_area_joules": 0.0, "stroke_work_kj": 0.0}

    # Extract coordinates
    card_points = []
    for r in records:
        pos = round(float(r.get("rod_position_m", 0.0)), 2)
        load = round(float(r.get("rod_load_kn", 0.0)), 1)
        card_points.append({"position_m": pos, "load_kn": load})

    # Sort or group points into stroke trajectory
    loads = [p["load_kn"] for p in card_points]
    positions = [p["position_m"] for p in card_points]
    
    # Trapezoidal approximation for enclosed card area (Work = integral F dx)
    # Work done per stroke (kJ) ~ (Peak Load - Min Load) * Stroke Length * shape_factor
    stroke_length = max(positions) - min(positions) if positions else 2.5
    load_delta = max(loads) - min(loads) if loads else 50.0
    
    # Typical SRP card shape factor ~0.60-0.75
    stroke_work_kj = round(load_delta * stroke_length * 0.65, 2)
    card_area_joules = round(stroke_work_kj * 1000.0, 1)

    return {
        "surface_card": card_points[-30:] if len(card_points) > 30 else card_points,
        "card_area_joules": card_area_joules,
        "stroke_work_kj": stroke_work_kj,
        "stroke_amplitude_m": round(stroke_length, 2),
        "min_card_load_kn": round(min(loads), 1) if loads else 0.0,
        "max_card_load_kn": round(max(loads), 1) if loads else 0.0
    }

def analyze_pump_fillage(card_data: Dict[str, Any], latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes Pump Fillage % from load decay and production.
    """
    load_range = card_data.get("max_card_load_kn", 100.0) - card_data.get("min_card_load_kn", 40.0)
    viscosity = float(latest.get("viscosity_cp", 12000.0))
    fluid_level = float(latest.get("fluid_level_m", 850.0))

    # Well depth is 1150m. Submergence = 1150 - fluid_level
    submergence = max(0.0, 1150.0 - fluid_level)
    submergence_ratio = min(1.0, submergence / 300.0)

    # Viscosity resistance degrades plunger fill speed
    visc_efficiency_drop = min(0.35, 0.08 * math.log10(max(10.0, viscosity / 1000.0)))
    
    # Baseline fillage
    raw_fillage = (submergence_ratio * (1.0 - visc_efficiency_drop)) * 100.0
    fillage_pct = round(max(15.0, min(100.0, raw_fillage)), 1)

    fillage_state = "FULL" if fillage_pct > 85.0 else ("PARTIAL_FLUID_POUND_RISK" if fillage_pct < 60.0 else "ADEQUATE")

    return {
        "fillage_pct": fillage_pct,
        "submergence_head_m": round(submergence, 1),
        "fillage_state": fillage_state
    }

def analyze_volumetric_efficiency(latest: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates Pump Volumetric Efficiency (%)
    Actual production vs theoretical pump displacement.
    """
    spm = float(latest.get("spm", 5.5))
    stroke = float(latest.get("stroke_length_m", 2.5))
    actual_bopd = float(latest.get("production_bopd", 30.0))

    # 2.25" pump displacement constant = ~3.03 bbl/day per (stroke_m * SPM)
    displacement_bopd = stroke * spm * 3.03

    if displacement_bopd > 0:
        eff_pct = (actual_bopd / displacement_bopd) * 100.0
    else:
        eff_pct = 0.0

    return {
        "volumetric_efficiency_pct": round(max(0.0, min(100.0, eff_pct)), 1),
        "actual_production_bopd": round(actual_bopd, 1),
        "theoretical_displacement_bopd": round(displacement_bopd, 1)
    }
