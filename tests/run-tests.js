'use strict';

/*
 * Pruebas unitarias de los módulos de cálculo (js/constants.js, isr.js, imss.js,
 * prestaciones.js, validaciones.js). Sin dependencias externas: usa el módulo `vm`
 * de Node para ejecutar los mismos archivos que se sirven al navegador, tal cual,
 * de forma que las pruebas siempre validen el código real del sitio.
 *
 * Ejecutar con: node tests/run-tests.js  (o `npm test`)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS_DIR = path.join(__dirname, '..', 'js');
const ARCHIVOS = ['constants.js', 'validaciones.js', 'isr.js', 'imss.js', 'prestaciones.js'];

const sandbox = { console };
vm.createContext(sandbox);

for (const archivo of ARCHIVOS) {
  const codigo = fs.readFileSync(path.join(JS_DIR, archivo), 'utf8');
  vm.runInContext(codigo, sandbox, { filename: archivo });
}

// `const`/`let` de nivel superior no se agregan como propiedades del objeto global
// (a diferencia de `function`), aunque sí son visibles entre archivos dentro del
// mismo contexto. Se exponen aquí explícitamente para poder desestructurarlas abajo.
vm.runInContext(
  `
  globalThis.UMA_2026 = UMA_2026;
  globalThis.EXENCION_AGUINALDO_UMA = EXENCION_AGUINALDO_UMA;
  globalThis.EXENCION_PRIMA_VACACIONAL_UMA = EXENCION_PRIMA_VACACIONAL_UMA;
  globalThis.SALARIO_MINIMO_2026 = SALARIO_MINIMO_2026;
  `,
  sandbox
);

const {
  calcularISR,
  calcularTasaEfectiva,
  calcularISRConceptoExtraordinario,
  calcularCuotaObreroIMSS,
  calcularAguinaldo,
  calcularPrimaVacacional,
  calcularAntiguedadAnios,
  diasVacacionesPorAntiguedad,
  validarSalarioBruto,
  UMA_2026,
  EXENCION_AGUINALDO_UMA,
  EXENCION_PRIMA_VACACIONAL_UMA,
  SALARIO_MINIMO_2026,
} = sandbox;

/* ---------- Runner mínimo ---------- */

let pass = 0;
let fail = 0;

function test(nombre, fn) {
  try {
    fn();
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${nombre}`);
  } catch (err) {
    fail++;
    console.log(`  \x1b[31m✗ ${nombre}\x1b[0m`);
    console.log(`    ${err.message}`);
  }
}

function assert(cond, mensaje) {
  if (!cond) throw new Error(mensaje || 'Assertion failed');
}

function assertAprox(actual, esperado, mensaje = '', tolerancia = 0.01) {
  const diff = Math.abs(actual - esperado);
  assert(
    diff <= tolerancia,
    `${mensaje ? mensaje + ': ' : ''}esperado ≈ ${esperado}, obtenido ${actual} (diferencia ${diff})`
  );
}

/* ================= calcularISR ================= */

console.log('calcularISR');
test('base 0 o negativa devuelve 0', () => {
  assert(calcularISR(0) === 0);
  assert(calcularISR(-100) === 0);
});

test('primer tramo (1.92%), sin cuota fija', () => {
  assertAprox(calcularISR(500), 500 * 0.0192);
});

test('sueldo de $15,000 mensuales cae en el tramo de 17.92%', () => {
  assertAprox(calcularISR(15000), 1339.14 + (15000 - 14644.65) * 0.1792);
});

test('límite superior del primer tramo ($844.59)', () => {
  assertAprox(calcularISR(844.59), 844.59 * 0.0192);
});

test('último tramo (35%), ingreso alto', () => {
  assertAprox(calcularISR(1000000), 133488.54 + (1000000 - 425642) * 0.35);
});

/* ================= calcularTasaEfectiva ================= */

console.log('calcularTasaEfectiva');
test('salario 0 devuelve tasa 0', () => {
  assert(calcularTasaEfectiva(0) === 0);
});

test('coincide con ISR(salario) / salario', () => {
  const salario = 20000;
  assertAprox(calcularTasaEfectiva(salario), calcularISR(salario) / salario, '', 0.0001);
});

/* ================= calcularISRConceptoExtraordinario ================= */

console.log('calcularISRConceptoExtraordinario');
test('monto dentro de la exención da ISR 0 y gravable 0', () => {
  const r = calcularISRConceptoExtraordinario(1000, EXENCION_PRIMA_VACACIONAL_UMA, 0.2);
  assert(r.isr === 0);
  assert(r.gravable === 0);
});

test('excedente sobre la exención se grava a la tasa dada', () => {
  const exento = EXENCION_AGUINALDO_UMA * UMA_2026.diario;
  const monto = exento + 1000;
  const r = calcularISRConceptoExtraordinario(monto, EXENCION_AGUINALDO_UMA, 0.15);
  assertAprox(r.gravable, 1000);
  assertAprox(r.isr, 150);
});

/* ================= calcularCuotaObreroIMSS ================= */

console.log('calcularCuotaObreroIMSS');
test('SBC por debajo de 3 UMA no genera excedente de EyM', () => {
  const r = calcularCuotaObreroIMSS(UMA_2026.diario * 2);
  assertAprox(r.excedente, 0);
});

test('SBC se topa a 25 UMA', () => {
  const r = calcularCuotaObreroIMSS(UMA_2026.diario * 100);
  assertAprox(r.sbc, 25 * UMA_2026.diario);
});

test('cuota mensual = cuota diaria × 30', () => {
  const r = calcularCuotaObreroIMSS(500);
  assertAprox(r.cuotaMensual, r.cuotaDiaria * 30);
});

test('cuota obrero de un salario diario de $500', () => {
  // sbc = 500; excedente = 500 - 3*117.31 = 148.07
  const sbc = 500;
  const excedente = sbc - 3 * UMA_2026.diario;
  const cuotaDiariaEsperada = excedente * 0.004 + sbc * (0.0025 + 0.00375 + 0.00625 + 0.01125);
  const r = calcularCuotaObreroIMSS(500);
  assertAprox(r.cuotaMensual, cuotaDiariaEsperada * 30);
});

/* ================= diasVacacionesPorAntiguedad ================= */

console.log('diasVacacionesPorAntiguedad (LFT art. 76)');
test('tabla de vacaciones dignas', () => {
  assert(diasVacacionesPorAntiguedad(0) === 0);
  assert(diasVacacionesPorAntiguedad(1) === 12);
  assert(diasVacacionesPorAntiguedad(2) === 14);
  assert(diasVacacionesPorAntiguedad(4) === 18);
  assert(diasVacacionesPorAntiguedad(5) === 20);
  assert(diasVacacionesPorAntiguedad(9) === 20);
  assert(diasVacacionesPorAntiguedad(10) === 22);
  assert(diasVacacionesPorAntiguedad(20) === 26);
});

/* ================= calcularAntiguedadAnios ================= */

console.log('calcularAntiguedadAnios');
test('aniversario ya cumplido este año', () => {
  const anios = calcularAntiguedadAnios(new Date(2024, 0, 15), new Date(2026, 7, 14));
  assert(anios === 2, `esperaba 2, obtuve ${anios}`);
});

test('aniversario aún no llega este año', () => {
  const anios = calcularAntiguedadAnios(new Date(2024, 11, 15), new Date(2026, 7, 14));
  assert(anios === 1, `esperaba 1, obtuve ${anios}`);
});

/* ================= calcularAguinaldo ================= */

console.log('calcularAguinaldo');
test('antigüedad cubre el año completo: aguinaldo íntegro', () => {
  const r = calcularAguinaldo(500, 15, new Date(2024, 0, 15), new Date(2026, 11, 31));
  assertAprox(r.diasPagar, 15);
  assertAprox(r.montoBruto, 7500);
});

test('ingreso a mitad de año se prorratea', () => {
  const r = calcularAguinaldo(500, 15, new Date(2026, 6, 1), new Date(2026, 11, 31));
  assert(r.diasLaborados === 184, `esperaba 184 días laborados, obtuve ${r.diasLaborados}`);
  assertAprox(r.diasPagar, (15 * 184) / 365);
});

test('fecha de ingreso posterior a la fecha de corte da 0', () => {
  const r = calcularAguinaldo(500, 15, new Date(2027, 0, 1), new Date(2026, 11, 31));
  assert(r.montoBruto === 0);
  assert(r.diasPagar === 0);
});

/* ================= calcularPrimaVacacional ================= */

console.log('calcularPrimaVacacional');
test('fórmula: salario diario × días × %', () => {
  const r = calcularPrimaVacacional(500, 12, 25);
  assertAprox(r.montoBruto, 500 * 12 * 0.25);
});

/* ================= validarSalarioBruto ================= */

console.log('validarSalarioBruto (mínimo: salario mínimo 2026)');
test('SALARIO_MINIMO_2026 está definido y es coherente (diario × 30 = mensual)', () => {
  assert(SALARIO_MINIMO_2026 && SALARIO_MINIMO_2026.diario > 0);
  assertAprox(SALARIO_MINIMO_2026.mensual, SALARIO_MINIMO_2026.diario * 30);
});

test('rechaza un valor absurdamente bajo como "0.1"', () => {
  const r = validarSalarioBruto('0.1');
  assert(r.valido === false);
  assert(typeof r.mensaje === 'string' && r.mensaje.length > 0);
});

test('rechaza 0, negativos, vacío y no numéricos', () => {
  assert(validarSalarioBruto(0).valido === false);
  assert(validarSalarioBruto(-500).valido === false);
  assert(validarSalarioBruto('').valido === false);
  assert(validarSalarioBruto('abc').valido === false);
  assert(validarSalarioBruto(null).valido === false);
  assert(validarSalarioBruto(undefined).valido === false);
});

test('rechaza un salario por debajo del salario mínimo mensual', () => {
  const r = validarSalarioBruto(SALARIO_MINIMO_2026.mensual - 1);
  assert(r.valido === false);
});

test('acepta exactamente el salario mínimo mensual', () => {
  const r = validarSalarioBruto(SALARIO_MINIMO_2026.mensual);
  assert(r.valido === true);
  assertAprox(r.salario, SALARIO_MINIMO_2026.mensual);
});

test('acepta un salario por arriba del mínimo', () => {
  const r = validarSalarioBruto('15000');
  assert(r.valido === true);
  assertAprox(r.salario, 15000);
});

/* ================= Resumen ================= */

console.log(`\n${pass} pruebas exitosas, ${fail} fallidas.`);
process.exit(fail > 0 ? 1 : 0);
