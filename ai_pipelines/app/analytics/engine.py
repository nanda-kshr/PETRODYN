from typing import List, Dict, Any
from app.analytics.pump_state import (
    analyze_pump_operating_state,
    analyze_pump_loads,
    analyze_dynamometer_card,
    analyze_pump_fillage,
    analyze_volumetric_efficiency,
)
from app.analytics.mechanical_energy import (
    analyze_motor_load,
    analyze_energy_intensity,
    analyze_sor,
    analyze_production_performance,
    analyze_pressures,
)
from app.analytics.thermal_reservoir import (
    analyze_thermal_state,
    analyze_cooling_rate,
    analyze_viscosity_trend,
)
from app.analytics.sensor_health import analyze_sensor_health
from app.analytics.health_score import calculate_well_health_score

class AnalyticsEngine:
    @staticmethod
    def run(records: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not records:
            return {}

        latest = records[-1]

        # 1. Pump operating state
        pump_state = analyze_pump_operating_state(latest)

        # 2. Pump load analysis
        pump_load = analyze_pump_loads(records, latest)

        # 3. Dynamometer analysis
        dynamometer = analyze_dynamometer_card(records)

        # 4. Pump fillage
        pump_fillage = analyze_pump_fillage(dynamometer, latest)

        # 5. Volumetric efficiency
        volumetric_eff = analyze_volumetric_efficiency(latest)

        # 6. Motor load
        motor_load = analyze_motor_load(latest)

        # 7. Energy intensity
        energy_intensity = analyze_energy_intensity(motor_load["estimated_power_kw"], latest)

        # 8. SOR
        sor = analyze_sor(latest)

        # 9. Production performance
        production_perf = analyze_production_performance(records, latest)

        # 10. Pressure analysis
        pressures = analyze_pressures(latest)

        # 11. Thermal state
        thermal_state = analyze_thermal_state(latest)

        # 12. Cooling rate
        cooling = analyze_cooling_rate(records, latest)

        # 13. Viscosity trend
        viscosity_trend = analyze_viscosity_trend(latest, cooling["cooling_rate_c_per_day"])

        # 14. Sensor health
        sensor_health = analyze_sensor_health(records, latest)

        # 15. Well Health Score
        health_score = calculate_well_health_score(
            pump_state=pump_state,
            pump_load=pump_load,
            volumetric_eff=volumetric_eff,
            motor_load=motor_load,
            thermal_state=thermal_state,
            sensor_health=sensor_health,
        )

        return {
            "pump_operating_state": pump_state,
            "pump_load_analysis": pump_load,
            "dynamometer_analysis": dynamometer,
            "pump_fillage": pump_fillage,
            "pump_volumetric_efficiency": volumetric_eff,
            "motor_load": motor_load,
            "energy_intensity": energy_intensity,
            "sor": sor,
            "production_performance": production_perf,
            "pressure_analysis": pressures,
            "thermal_state": thermal_state,
            "cooling_rate": cooling,
            "viscosity_trend": viscosity_trend,
            "sensor_health": sensor_health,
            "well_health_score": health_score,
        }
