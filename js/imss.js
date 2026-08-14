/*
 * Cálculo de la cuota obrero (descuento IMSS que ve el trabajador en su recibo).
 * Simplificación: se asume Salario Base de Cotización (SBC) ≈ salario diario
 * capturado, sin factor de integración de prestaciones. Ver legal.html#metodologia.
 */

/** Cuota obrero (trabajador) del IMSS a partir del salario diario. */
function calcularCuotaObreroIMSS(salarioDiario) {
  const sbcMaximo = SBC_TOPE_UMA * UMA_2026.diario;
  const sbc = Math.min(salarioDiario, sbcMaximo);
  const excedente = Math.max(0, sbc - EYM_UMBRAL_UMA * UMA_2026.diario);
  const t = IMSS_TASAS_TRABAJADOR;

  const cuotaDiaria =
    excedente * t.excedenteEyM +
    sbc *
      (t.prestacionesDinero +
        t.gastosMedicosPensionados +
        t.invalidezVida +
        t.cesantiaVejez);

  return {
    sbc,
    excedente,
    cuotaDiaria,
    cuotaMensual: cuotaDiaria * 30,
  };
}
