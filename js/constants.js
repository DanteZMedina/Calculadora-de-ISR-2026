/*
 * Constantes fiscales y laborales — Calculadora ISR / IMSS / Aguinaldo / Prima Vacacional (CDMX)
 *
 * Fuentes:
 * - ISR_MENSUAL_2026: Anexo 8 de la RMF 2026 (DOF 28/12/2025), apartado B.V — tarifa mensual
 *   general de los artículos 96 LISR y 175 de su Reglamento, vigente todo 2026.
 * - UMA_2026: INEGI, valores vigentes a partir del 1 de febrero de 2026.
 * - IMSS_TASAS_TRABAJADOR / SBC_TOPE_UMA / EYM_UMBRAL_UMA: cuotas obrero (trabajador) 2026
 *   conforme a la Ley del Seguro Social (art. 106, 25, 147, 168).
 * - EXENCION_AGUINALDO_UMA / EXENCION_PRIMA_VACACIONAL_UMA: art. 93, fracción XIV, LISR.
 * - diasVacacionesPorAntiguedad: art. 76 LFT (reforma "vacaciones dignas", vigente desde 2023).
 *
 * Estas cifras cambian cada año (UMA, tarifas ISR) o pueden reformarse (LFT, LSS). Antes de
 * tomar decisiones, valida siempre contra la publicación oficial vigente. Ver legal.html#metodologia.
 */

const ISR_MENSUAL_2026 = [
  { limiteInferior: 0.01, limiteSuperior: 844.59, cuotaFija: 0.00, porcentaje: 1.92 },
  { limiteInferior: 844.60, limiteSuperior: 7168.51, cuotaFija: 16.22, porcentaje: 6.40 },
  { limiteInferior: 7168.52, limiteSuperior: 12598.02, cuotaFija: 420.95, porcentaje: 10.88 },
  { limiteInferior: 12598.03, limiteSuperior: 14644.64, cuotaFija: 1011.68, porcentaje: 16.00 },
  { limiteInferior: 14644.65, limiteSuperior: 17533.64, cuotaFija: 1339.14, porcentaje: 17.92 },
  { limiteInferior: 17533.65, limiteSuperior: 35362.83, cuotaFija: 1856.84, porcentaje: 21.36 },
  { limiteInferior: 35362.84, limiteSuperior: 55736.68, cuotaFija: 5665.16, porcentaje: 23.52 },
  { limiteInferior: 55736.69, limiteSuperior: 106410.50, cuotaFija: 10457.09, porcentaje: 30.00 },
  { limiteInferior: 106410.51, limiteSuperior: 141880.66, cuotaFija: 25659.23, porcentaje: 32.00 },
  { limiteInferior: 141880.67, limiteSuperior: 425641.99, cuotaFija: 37009.69, porcentaje: 34.00 },
  { limiteInferior: 425642.00, limiteSuperior: Infinity, cuotaFija: 133488.54, porcentaje: 35.00 },
];

const UMA_2026 = { diario: 117.31, mensual: 3566.22, anual: 42794.64 };

const IMSS_TASAS_TRABAJADOR = {
  excedenteEyM: 0.0040,          // Enfermedades y maternidad, excedente sobre 3 UMA
  prestacionesDinero: 0.0025,    // Prestaciones en dinero
  gastosMedicosPensionados: 0.00375,
  invalidezVida: 0.00625,
  cesantiaVejez: 0.01125,        // Cesantía en edad avanzada y vejez
};
const SBC_TOPE_UMA = 25;   // Tope de cotización: 25 UMA
const EYM_UMBRAL_UMA = 3;  // Umbral a partir del cual aplica el excedente de EyM

const EXENCION_AGUINALDO_UMA = 30;
const EXENCION_PRIMA_VACACIONAL_UMA = 15;

/** Días de vacaciones según antigüedad (años completos), art. 76 LFT vigente desde 2023. */
function diasVacacionesPorAntiguedad(aniosCompletos) {
  if (aniosCompletos < 1) return 0;
  if (aniosCompletos < 5) return 12 + 2 * (aniosCompletos - 1);
  return 20 + 2 * Math.floor((aniosCompletos - 5) / 5);
}
