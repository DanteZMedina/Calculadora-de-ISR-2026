/*
 * Cálculo de aguinaldo (prorrateado por antigüedad en el año) y prima vacacional,
 * a partir de la fecha de inicio de la relación laboral.
 */

function diasEnAnio(anio) {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0 ? 366 : 365;
}

/** Años completos de antigüedad entre fechaIngreso y fechaReferencia. */
function calcularAntiguedadAnios(fechaIngreso, fechaReferencia) {
  let anios = fechaReferencia.getFullYear() - fechaIngreso.getFullYear();
  const aniversario = new Date(
    fechaReferencia.getFullYear(),
    fechaIngreso.getMonth(),
    fechaIngreso.getDate()
  );
  if (fechaReferencia < aniversario) anios--;
  return Math.max(0, anios);
}

/**
 * Aguinaldo prorrateado: si la relación laboral no cubre el año completo
 * (calendario, hasta `fechaCorte`), se paga la parte proporcional a los
 * días laborados en ese año, conforme al art. 87 LFT.
 */
function calcularAguinaldo(salarioDiario, diasAguinaldo, fechaIngreso, fechaCorte) {
  const anioCorte = fechaCorte.getFullYear();
  const inicioAnio = new Date(anioCorte, 0, 1);
  const inicio = fechaIngreso > inicioAnio ? fechaIngreso : inicioAnio;

  if (inicio > fechaCorte) {
    return { diasLaborados: 0, diasPagar: 0, montoBruto: 0 };
  }

  const msPorDia = 24 * 60 * 60 * 1000;
  const diasLaborados = Math.floor((fechaCorte - inicio) / msPorDia) + 1;
  const proporcion = Math.min(1, diasLaborados / diasEnAnio(anioCorte));
  const diasPagar = diasAguinaldo * proporcion;

  return { diasLaborados, diasPagar, montoBruto: diasPagar * salarioDiario };
}

/** Prima vacacional = salario diario × días de vacaciones × % de prima. */
function calcularPrimaVacacional(salarioDiario, diasVacaciones, porcentajePrima) {
  const montoBruto = salarioDiario * diasVacaciones * (porcentajePrima / 100);
  return { montoBruto };
}
