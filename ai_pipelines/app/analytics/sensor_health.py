from typing import List, Dict, Any

def analyze_sensor_health(records: List[Dict[str, Any]], latest: Dict[str, Any]) -> Dict[str, Any]:
    channels = [
        "vfd_frequency_hz", "stroke_length_m", "spm", "rod_position_m",
        "rod_load_kn", "motor_current_a", "tubing_pressure_bar",
        "fluid_level_m", "production_bopd", "temperature_c", "viscosity_cp"
    ]

    channel_status = {}
    stuck_channels = []
    missing_channels = []
    outlier_channels = []

    # Check missing fields in latest
    for ch in channels:
        if ch not in latest or latest[ch] is None:
            missing_channels.append(ch)
            channel_status[ch] = "MISSING"

    # Check for stuck (dead) sensors across historical window
    if len(records) >= 8:
        for ch in channels:
            if ch in missing_channels:
                continue
            vals = [float(r.get(ch, 0.0)) for r in records if ch in r and r[ch] is not None]
            if len(vals) >= 8 and len(set(vals)) == 1:
                # Variable like stroke_length might legitimately stay constant, so we only flag dynamic channels
                if ch in ["rod_position_m", "rod_load_kn", "motor_current_a"]:
                    stuck_channels.append(ch)
                    channel_status[ch] = "STUCK_CONSTANT"
                else:
                    channel_status[ch] = "HEALTHY"
            else:
                channel_status[ch] = "HEALTHY"
    else:
        for ch in channels:
            if ch not in channel_status:
                channel_status[ch] = "HEALTHY"

    # Evaluate quality metadata from ingestion if present
    quality_meta = latest.get("quality", {})
    if not quality_meta.get("is_valid", True):
        for anomaly in quality_meta.get("anomalies", []):
            outlier_channels.append(anomaly)

    overall = "HEALTHY"
    if missing_channels or stuck_channels or outlier_channels:
        overall = "DEGRADED" if (len(stuck_channels) <= 1 and not missing_channels) else "FAULT_DETECTED"

    health_score = max(0, 100 - (len(missing_channels) * 20 + len(stuck_channels) * 15 + len(outlier_channels) * 10))

    return {
        "status": overall,
        "sensor_health_score": health_score,
        "channel_status": channel_status,
        "stuck_channels": stuck_channels,
        "missing_channels": missing_channels,
        "outlier_channels": outlier_channels
    }
