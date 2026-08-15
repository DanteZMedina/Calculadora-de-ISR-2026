/*
 * UI: conecta los dos formularios independientes con los módulos de cálculo.
 * No hay fetch, localStorage ni cookies: todo se calcula en memoria en cada envío.
 */

document.addEventListener('DOMContentLoaded', () => {
  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  const hoy = new Date();

  /* ---------- Calculadora 1: Sueldo e IMSS ---------- */

  const formSueldo = document.getElementById('form-sueldo');
  const resultadoSueldo = document.getElementById('resultado-sueldo');
  const salarioBrutoInput = document.getElementById('salarioBruto');
  const errorSueldo = document.getElementById('error-sueldo');

  // Fuente única de verdad para el mínimo permitido: SALARIO_MINIMO_2026 (js/constants.js).
  salarioBrutoInput.min = SALARIO_MINIMO_2026.mensual.toFixed(2);

  function mostrarErrorSueldo(mensaje) {
    errorSueldo.textContent = mensaje;
    errorSueldo.hidden = false;
    resultadoSueldo.hidden = true;
  }

  formSueldo.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const validacion = validarSalarioBruto(salarioBrutoInput.value);
    if (!validacion.valido) {
      mostrarErrorSueldo(validacion.mensaje);
      return;
    }
    errorSueldo.hidden = true;

    const salarioBruto = validacion.salario;
    const isr = calcularISR(salarioBruto);
    const salarioDiario = salarioBruto / 30;
    const imss = calcularCuotaObreroIMSS(salarioDiario);
    const neto = salarioBruto - isr - imss.cuotaMensual;

    document.getElementById('res-sueldo-bruto').textContent = fmt.format(salarioBruto);
    document.getElementById('res-isr').textContent = fmt.format(isr);
    document.getElementById('res-imss').textContent = fmt.format(imss.cuotaMensual);
    document.getElementById('res-neto').textContent = fmt.format(neto);
    resultadoSueldo.hidden = false;

    // Conveniencia: prellenar el salario de la segunda calculadora si está vacío.
    const salarioBruto2 = document.getElementById('salarioBruto2');
    if (!salarioBruto2.value) salarioBruto2.value = salarioBruto;
  });

  /* ---------- Calculadora 2: Aguinaldo y Prima Vacacional ---------- */

  const formPrestaciones = document.getElementById('form-prestaciones');
  const resultadoPrestaciones = document.getElementById('resultado-prestaciones');
  const fechaIngresoInput = document.getElementById('fechaIngreso');
  const fechaCorteInput = document.getElementById('fechaCorte');
  const diasVacacionesInput = document.getElementById('diasVacaciones');
  const salarioBruto2Input = document.getElementById('salarioBruto2');
  const errorPrestaciones = document.getElementById('error-prestaciones');

  // Valores por defecto: corte al 31 de diciembre del año en curso.
  fechaCorteInput.value = `${hoy.getFullYear()}-12-31`;
  fechaIngresoInput.max = hoy.toISOString().slice(0, 10);
  salarioBruto2Input.min = SALARIO_MINIMO_2026.mensual.toFixed(2);

  function mostrarErrorPrestaciones(mensaje) {
    errorPrestaciones.textContent = mensaje;
    errorPrestaciones.hidden = false;
    resultadoPrestaciones.hidden = true;
  }

  function sugerirDiasVacaciones() {
    if (!fechaIngresoInput.value) return;
    const fechaIngreso = new Date(fechaIngresoInput.value + 'T00:00:00');
    const anios = calcularAntiguedadAnios(fechaIngreso, hoy);
    diasVacacionesInput.value = diasVacacionesPorAntiguedad(anios);
  }
  fechaIngresoInput.addEventListener('change', sugerirDiasVacaciones);

  formPrestaciones.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const validacion = validarSalarioBruto(salarioBruto2Input.value);
    if (!validacion.valido) {
      mostrarErrorPrestaciones(validacion.mensaje);
      return;
    }

    const fechaIngreso = new Date(fechaIngresoInput.value + 'T00:00:00');
    const fechaCorte = new Date(fechaCorteInput.value + 'T00:00:00');
    const diasAguinaldo = parseFloat(document.getElementById('diasAguinaldo').value) || 0;
    const pctPrima = parseFloat(document.getElementById('pctPrima').value) || 0;
    const diasVacaciones = parseFloat(diasVacacionesInput.value) || 0;

    if (isNaN(fechaIngreso.getTime()) || isNaN(fechaCorte.getTime())) {
      mostrarErrorPrestaciones('Ingresa fechas válidas.');
      return;
    }
    errorPrestaciones.hidden = true;

    const salarioBruto = validacion.salario;
    const salarioDiario = salarioBruto / 30;
    const tasaEfectiva = calcularTasaEfectiva(salarioBruto);

    const aguinaldo = calcularAguinaldo(salarioDiario, diasAguinaldo, fechaIngreso, fechaCorte);
    const isrAguinaldo = calcularISRConceptoExtraordinario(
      aguinaldo.montoBruto,
      EXENCION_AGUINALDO_UMA,
      tasaEfectiva
    );

    const primaVacacional = calcularPrimaVacacional(salarioDiario, diasVacaciones, pctPrima);
    const isrPrima = calcularISRConceptoExtraordinario(
      primaVacacional.montoBruto,
      EXENCION_PRIMA_VACACIONAL_UMA,
      tasaEfectiva
    );

    document.getElementById('res-aguinaldo-dias').textContent = aguinaldo.diasPagar.toFixed(2);
    document.getElementById('res-aguinaldo-bruto').textContent = fmt.format(aguinaldo.montoBruto);
    document.getElementById('res-aguinaldo-isr').textContent = fmt.format(isrAguinaldo.isr);
    document.getElementById('res-aguinaldo-neto').textContent = fmt.format(
      aguinaldo.montoBruto - isrAguinaldo.isr
    );

    document.getElementById('res-prima-dias').textContent = diasVacaciones;
    document.getElementById('res-prima-bruto').textContent = fmt.format(primaVacacional.montoBruto);
    document.getElementById('res-prima-isr').textContent = fmt.format(isrPrima.isr);
    document.getElementById('res-prima-neto').textContent = fmt.format(
      primaVacacional.montoBruto - isrPrima.isr
    );

    resultadoPrestaciones.hidden = false;
  });
});
