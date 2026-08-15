/*
 * Validación de entradas de usuario. Funciones puras (sin tocar el DOM) para que
 * puedan probarse por separado de la interfaz.
 */

/**
 * Valida un salario bruto mensual: debe ser un número positivo y no puede ser menor
 * al salario mínimo mensual vigente (evita valores absurdos como "0.1").
 */
function validarSalarioBruto(valor) {
  const salario = typeof valor === 'number' ? valor : parseFloat(valor);

  if (valor === '' || valor === null || valor === undefined || isNaN(salario)) {
    return { valido: false, salario: null, mensaje: 'Ingresa un salario bruto mensual válido.' };
  }

  if (salario <= 0) {
    return { valido: false, salario: null, mensaje: 'El salario bruto mensual debe ser mayor a $0.' };
  }

  if (salario < SALARIO_MINIMO_2026.mensual) {
    return {
      valido: false,
      salario: null,
      mensaje:
        `El salario bruto mensual no puede ser menor al salario mínimo general vigente: ` +
        `$${SALARIO_MINIMO_2026.diario.toFixed(2)} MXN diarios ` +
        `(aprox. $${SALARIO_MINIMO_2026.mensual.toFixed(2)} MXN mensuales).`,
    };
  }

  return { valido: true, salario, mensaje: '' };
}
