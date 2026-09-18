from typing import List, Dict, Any
from app.predictions.thermal_cooling import (
    predict_reservoir_temperature,
    predict_reservoir_cooling,
    predict_oil_viscosity,
)
from app.predictions.production_forecast import (
    predict_production_rate,
    predict_production_decline,
    predict_energy_consumption,
    predict_future_sor,
)
from app.predictions.mechanical_risk import (
    predict_pump_behavior,
    predict_pump_efficiency,
    predict_rod_floating,
    predict_impact_loading,
    predict_rod_failure,
    predict_pump_unsetting,
)

class PredictionEngine:
    @staticmethod
    def run(records: List[Dict[str, Any]], analytics: Dict[str, Any]) -> Dict[str, Any]:
        if not records:
            return {}

        latest = records[-1]
        cooling_rate_c_per_day = analytics.get("cooling_rate", {}).get("cooling_rate_c_per_day", 0.45)

        # 1. Reservoir temperature
        res_temp = predict_reservoir_temperature(latest, cooling_rate_c_per_day)

        # 2. Reservoir cooling
        res_cooling = predict_reservoir_cooling(latest, res_temp)

        # 3. Oil viscosity
        oil_visc = predict_oil_viscosity(res_temp, latest)

        # 4. Production rate
        prod_rate = predict_production_rate(latest, oil_visc)

        # 5. Pump behavior
        pump_behavior = predict_pump_behavior(latest, oil_visc)

        # 6. Pump efficiency
        pump_efficiency = predict_pump_efficiency(latest, pump_behavior)

        # 7. Rod floating
        rod_floating = predict_rod_floating(latest)

        # 8. Impact loading
        impact_loading = predict_impact_loading(latest, rod_floating)

        # 9. Rod failure
        rod_failure = predict_rod_failure(latest, rod_floating, impact_loading)

        # 10. Pump unsetting
        pump_unsetting = predict_pump_unsetting(latest, impact_loading)

        # 11. Production decline
        prod_decline = predict_production_decline(latest, prod_rate)

        # 12. Energy consumption
        energy_consumption = predict_energy_consumption(latest, prod_rate)

        # 13. SOR
        future_sor = predict_future_sor(latest, prod_rate)

        return {
            "reservoir_temperature": res_temp,
            "reservoir_cooling": res_cooling,
            "oil_viscosity": oil_visc,
            "production_rate": prod_rate,
            "pump_behavior": pump_behavior,
            "pump_efficiency": pump_efficiency,
            "rod_floating": rod_floating,
            "impact_loading": impact_loading,
            "rod_failure": rod_failure,
            "pump_unsetting": pump_unsetting,
            "production_decline": prod_decline,
            "energy_consumption": energy_consumption,
            "sor": future_sor,
        }
