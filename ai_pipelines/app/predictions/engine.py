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

def generate_optimization_advisory(latest: Dict[str, Any], rod_floating: Dict[str, Any], prod_rate: Dict[str, Any]) -> List[Dict[str, Any]]:
    floating_pct = rod_floating.get("risk_next_10min_pct", 0)
    current_spm = float(latest.get("spm", 5.5))
    target_spm = round(max(2.5, current_spm - 1.0), 1) if floating_pct > 50 else current_spm

    return [
        {
            "parameter": "SPM",
            "decision_interval": "Every 5–15 min",
            "current_setting": f"{current_spm} SPM",
            "recommended_action": f"Adjust to {target_spm} SPM" if floating_pct > 50 else "Maintain current SPM",
            "rationale": "Mitigate downstroke rod float and fluid pound" if floating_pct > 50 else "Operating within safe viscous window"
        },
        {
            "parameter": "VFD",
            "decision_interval": "Every 5–15 min",
            "current_setting": f"{latest.get('vfd_frequency_hz', 40.0)} Hz",
            "recommended_action": f"Trim to {round(float(latest.get('vfd_frequency_hz', 40.0)) * 0.9, 1)} Hz" if floating_pct > 50 else "Maintain 40–45 Hz",
            "rationale": "Slow down downstroke travel speed to counter viscous drag"
        },
        {
            "parameter": "Stroke length",
            "decision_interval": "Every 1–6 h",
            "current_setting": f"{latest.get('stroke_length_m', 2.5)} m",
            "recommended_action": "Maintain 2.5 m (Long stroke preferred)",
            "rationale": "Maximizes fluid compression ratio and reduces reversal cycles"
        },
        {
            "parameter": "Production cut-off",
            "decision_interval": "Every 1–6 h",
            "current_setting": "Active Lift",
            "recommended_action": "Continue CSS lift phase" if prod_rate.get("current_bopd", 30) > 10 else "Trigger cycle cut-off",
            "rationale": "Economic cut-off threshold is 10 BOPD for Baghewala"
        },
        {
            "parameter": "Steam injection pressure",
            "decision_interval": "During CSS injection (Every 5–30 min)",
            "current_setting": "Production Phase (Standby)",
            "recommended_action": "Target 85–110 bar during steam cycle",
            "rationale": "Stay below formation parting pressure in Jodhpur Sandstone"
        },
        {
            "parameter": "Steam volume/rate",
            "decision_interval": "During CSS injection (Continuously / 5–30 min)",
            "current_setting": "Standby",
            "recommended_action": "Plan ~2,500 m³ CWE (~15,700 bbl) per CSS cycle",
            "rationale": "Optimal thermal radius without early steam breakthrough"
        },
        {
            "parameter": "Soak time",
            "decision_interval": "Per CSS cycle",
            "current_setting": "Post-soak production",
            "recommended_action": "5–7 days soak recommended",
            "rationale": "Ensures uniform heat saturation to liquefy 12,000 cP bitumen"
        },
        {
            "parameter": "Overall CSS strategy",
            "decision_interval": "Per cycle / before next cycle",
            "current_setting": "Cycle 4 Lift Phase",
            "recommended_action": "Evaluate re-steaming when temp decays <55°C",
            "rationale": "Maintains economic SOR and prevents heavy crude immobilization"
        }
    ]

class PredictionEngine:
    @staticmethod
    def run(records: List[Dict[str, Any]], analytics: Dict[str, Any]) -> Dict[str, Any]:
        if not records:
            return {}

        latest = records[-1]
        cooling_rate_c_per_day = analytics.get("cooling_rate", {}).get("cooling_rate_c_per_day", 0.45)

        # 1. Reservoir temperature (Next 6-72 h)
        res_temp = predict_reservoir_temperature(latest, cooling_rate_c_per_day)

        # 2. Reservoir cooling (Next 1-7 days)
        res_cooling = predict_reservoir_cooling(latest, res_temp)

        # 3. Oil viscosity (Next 6-72 h)
        oil_visc = predict_oil_viscosity(res_temp, latest)

        # 4. Production rate (Next 6-24 h)
        prod_rate = predict_production_rate(latest, oil_visc)

        # 5. Pump behavior (Next 1-6 h)
        pump_behavior = predict_pump_behavior(latest, oil_visc)

        # 6. Pump efficiency (Next 1-24 h)
        pump_efficiency = predict_pump_efficiency(latest, pump_behavior)

        # 7. Rod floating (Next 5-30 min)
        rod_floating = predict_rod_floating(latest)

        # 8. Impact loading (Next 1-15 min)
        impact_loading = predict_impact_loading(latest, rod_floating)

        # 9. Rod failure (Next 24 h-30 days)
        rod_failure = predict_rod_failure(latest, rod_floating, impact_loading)

        # 10. Pump unsetting (Next 1-24 h)
        pump_unsetting = predict_pump_unsetting(latest, impact_loading)

        # 11. Production decline (Cycle / Shift)
        prod_decline = predict_production_decline(latest, prod_rate)

        # 12. Energy consumption (Next 6-24 h)
        energy_consumption = predict_energy_consumption(latest, prod_rate)

        # 13. SOR (Next 1-7 days)
        future_sor = predict_future_sor(latest, prod_rate)

        # Optimization Advisory
        opt_advisory = generate_optimization_advisory(latest, rod_floating, prod_rate)

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
            "optimization_advisory": opt_advisory,
        }
