import { Injectable } from '@nestjs/common';

@Injectable()
export class PhysicsEngineService {
  private readonly WELL_DEPTH_M = 1150.0;
  private readonly BASE_VFD_HZ = 50.0;
  private readonly BASE_SPM_AT_50HZ = 6.875; // At 40Hz -> 5.5 SPM

  /**
   * Calculates dynamic oil viscosity (cP) from temperature (°C)
   * Arrhenius formulation for Baghewala heavy crude:
   * Calibrated to ~12,000 cP at 50°C (323.15 K).
   */
  calculateViscosityFromTemperature(temperatureC: number): number {
    const clampedTemp = Math.max(10, Math.min(350, temperatureC));
    const T_kelvin = clampedTemp + 273.15;
    const B = 5400.0;
    const A = 12000.0 * Math.exp(-B / (50.0 + 273.15));
    const viscosity = A * Math.exp(B / T_kelvin);
    return Math.round(viscosity);
  }

  /**
   * Calculates SPM from VFD frequency unless overridden.
   */
  calculateSpmFromVfd(vfdFrequencyHz: number): number {
    const rawSpm = (vfdFrequencyHz / this.BASE_VFD_HZ) * this.BASE_SPM_AT_50HZ;
    return Math.round(rawSpm * 10) / 10;
  }

  /**
   * Calculates kinematic rod position (m), velocity (m/s), and acceleration (m/s^2)
   * at time elapsed t (seconds).
   */
  calculateRodKinematics(
    strokeLengthM: number,
    spm: number,
    elapsedSeconds: number,
  ) {
    const omega = (2 * Math.PI * spm) / 60.0; // rad/s
    const amplitude = strokeLengthM / 2.0;

    // Position oscillating between 0 and strokeLengthM
    const rodPositionM = amplitude * (1.0 - Math.cos(omega * elapsedSeconds));

    // Velocity: v > 0 is upstroke, v < 0 is downstroke
    const rodVelocityMps = amplitude * omega * Math.sin(omega * elapsedSeconds);

    // Acceleration
    const rodAccelerationMps2 =
      amplitude * Math.pow(omega, 2) * Math.cos(omega * elapsedSeconds);

    return {
      rodPositionM,
      rodVelocityMps,
      rodAccelerationMps2,
    };
  }

  /**
   * Calculates rod load (kN) as a function of:
   * - rod position & kinematics (upstroke vs downstroke)
   * - tubing pressure
   * - fluid head above pump
   * - viscous drag on rod string
   * - rod string inertia
   */
  calculateRodLoad(
    rodPositionM: number,
    rodVelocityMps: number,
    rodAccelerationMps2: number,
    strokeLengthM: number,
    tubingPressureBar: number,
    fluidLevelM: number,
    viscosityCp: number,
    spm: number,
  ): number {
    // 1. Buoyant rod string weight for ~1150m grade D rod string (~56.5 kN)
    const buoyantRodWeightKn = 56.5;

    // 2. Inertial force: Mass ~ 6500 kg -> F_inertial (kN) = M * a / 1000
    const inertialForceKn = (6500.0 * rodAccelerationMps2) / 1000.0;

    // 3. Fluid column load (acting primarily on upstroke when traveling valve is closed)
    // Head pressure: h_net = Well Depth - Fluid Level
    const netHeadM = Math.max(0, this.WELL_DEPTH_M - fluidLevelM);
    const fluidHeadPressureBar = (netHeadM * 0.95 * 9.81) / 100.0; // ~0.0932 bar/m
    const totalBackpressureBar = tubingPressureBar + fluidHeadPressureBar;

    // 2.25" pump plunger cross-sectional area ~ 0.002565 m^2
    // 1 bar = 100 kN/m^2 -> Fluid load = P_bar * 100 * Area = P_bar * 0.2565 kN
    const maxFluidLoadKn = totalBackpressureBar * 0.2565;

    // Smooth valve transfer sigmoid between downstroke and upstroke
    // High velocity on upstroke carries full fluid load; on downstroke, load transfers to standing valve
    const valveClosureFactor = 1.0 / (1.0 + Math.exp(-8.0 * (rodVelocityMps / Math.max(0.1, strokeLengthM))));
    const fluidLoadKn = maxFluidLoadKn * valveClosureFactor;

    // 4. Viscous drag along the 1,150 m rod string
    // Drag increases with viscosity and relative velocity
    const normalizedViscosity = viscosityCp / 12000.0;
    const dragDirection = rodVelocityMps >= 0 ? 1.0 : -1.0;
    const dragMagnitudeKn =
      Math.abs(rodVelocityMps) * 8.5 * normalizedViscosity * (spm / 5.5);
    const viscousDragKn = dragDirection * dragMagnitudeKn;

    // Total load on polished rod
    const totalLoadKn =
      buoyantRodWeightKn + inertialForceKn + fluidLoadKn + viscousDragKn;

    // Clamped to physical bounds
    return Math.max(5.0, totalLoadKn);
  }

  /**
   * Calculates surface motor current (Amperes) responding to rod load and power draw.
   * Calibrated around nominal ~72.4 A at 145.2 kN and 5.5 SPM.
   */
  calculateMotorCurrent(rodLoadKn: number, spm: number): number {
    const baseIdleCurrentA = 18.0;
    const currentSlope = 0.375;
    const speedFactor = spm / 5.5;

    const motorCurrentA =
      baseIdleCurrentA + rodLoadKn * currentSlope * speedFactor;
    return Math.max(10.0, motorCurrentA);
  }

  /**
   * Calculates daily production in Barrels of Oil Per Day (BOPD).
   * Depends on:
   * - volumetric displacement: SPM * stroke length * plunger area
   * - fluid availability (submergence head from fluid_level_m)
   * - pump fillage resistance due to viscosity
   * - tubing pressure backpressure factor
   */
  calculateProductionBopd(
    spm: number,
    strokeLengthM: number,
    fluidLevelM: number,
    tubingPressureBar: number,
    viscosityCp: number,
  ): number {
    // Theoretical displacement in bopd for 2.25" pump:
    // Plunger constant ~ 3.03 bbl/day per (stroke_m * spm)
    const theoreticalBopd = strokeLengthM * spm * 3.03;

    // Inflow / submergence factor (pump at 1150m, nominal fluid level 850m = 300m submergence)
    const submergenceM = Math.max(0, this.WELL_DEPTH_M - fluidLevelM);
    const submergenceFactor = Math.min(1.0, Math.max(0.1, submergenceM / 300.0));

    // Viscosity penalty on pump fill efficiency (high viscosity fills plunger slower)
    const viscosityFactor = Math.max(
      0.35,
      1.0 - 0.25 * Math.log10(Math.max(1, viscosityCp / 1000.0)),
    );

    // Tubing backpressure slippage factor
    const pressureFactor = Math.max(0.7, 1.0 - (tubingPressureBar - 18.5) * 0.005);

    const actualBopd =
      theoreticalBopd * submergenceFactor * viscosityFactor * pressureFactor;
    return Math.max(0.0, actualBopd);
  }
}
