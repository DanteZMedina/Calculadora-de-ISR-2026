/*
 * Cálculo de ISR sobre sueldo ordinario y sobre percepciones extraordinarias
 * (aguinaldo, prima vacacional) mediante el método de tasa efectiva
 * (RISR art. 174 — procedimiento comúnmente usado para calcular la retención
 * de ISR sobre gratificaciones anuales, PTU y prima vacacional).
 */

/** Aplica la tarifa de ISR mensual (art. 96 LISR) a una base gravable. */
function calcularISR(baseGravable, tabla = ISR_MENSUAL_2026) {
  if (!(baseGravable > 0)) return 0;
  const tramo = tabla.find(
    (t) => baseGravable >= t.limiteInferior && baseGravable <= t.limiteSuperior
  );
  if (!tramo) return 0;
  const excedente = baseGravable - tramo.limiteInferior;
  return tramo.cuotaFija + excedente * (tramo.porcentaje / 100);
}

/** Tasa efectiva de ISR del sueldo mensual ordinario, usada para gravar conceptos extraordinarios. */
function calcularTasaEfectiva(salarioMensualOrdinario) {
  if (!(salarioMensualOrdinario > 0)) return 0;
  return calcularISR(salarioMensualOrdinario) / salarioMensualOrdinario;
}

/**
 * ISR de un concepto extraordinario (aguinaldo o prima vacacional):
 * se exenta hasta `exencionUMA` UMAs (valor diario) y el excedente se grava
 * a la tasa efectiva del sueldo ordinario.
 */
function calcularISRConceptoExtraordinario(monto, exencionUMA, tasaEfectiva) {
  const exento = exencionUMA * UMA_2026.diario;
  const gravable = Math.max(0, monto - exento);
  return {
    exento: Math.min(monto, exento),
    gravable,
    isr: gravable * tasaEfectiva,
  };
}
