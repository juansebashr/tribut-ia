export interface CasillaInfo {
  titulo: string;
  art: string;
  concepto: string;
  como_llenar: string;
  tope: string;
}

export const CASILLAS_INFO: Record<string, CasillaInfo> = /* =========================================================================
   BASE DE CONOCIMIENTO EXHAUSTIVA - FORMULARIO 210 DIAN
   Estatuto Tributario Colombiano actualizado a Ley 2277 de 2022 y año 2026
   ========================================================================= */

 {
  // DATOS GENERALES Y CONTROL
  "1": {
    titulo: "Año Gravable",
    art: "Art. 1 E.T. y Calendario Tributario Nacional",
    concepto: "Periodo fiscal de 12 meses (del 1 de enero al 31 de diciembre) sobre el cual se declaran los ingresos, costos, patrimonio e impuestos.",
    como_llenar: "Viene predeterminado según el año de la declaración (ej. 2026). Para años anteriores se diligencia el año fiscal que se está corrigiendo o declarando.",
    tope: "Año fiscal de 4 dígitos."
  },
  "4": {
    titulo: "Número de Formulario",
    art: "Art. 578 E.T.",
    concepto: "Número consecutivo único asignado por la DIAN (código de barras y serial Muisca) que identifica unívocamente este documento de declaración privada.",
    como_llenar: "Es generado automáticamente por el sistema Muisca de la DIAN al momento de crear el borrador o habilitar la presentación virtual.",
    tope: "13 dígitos numéricos."
  },
  "5": {
    titulo: "Número de Identificación Tributaria (NIT / Cédula)",
    art: "Art. 555-1 y 555-2 E.T.",
    concepto: "Número de identificación fiscal en el Registro Único Tributario (RUT) del contribuyente declarante.",
    como_llenar: "Digita el número de cédula de ciudadanía, cédula de extranjería o NIT registrado en el RUT sin puntos, comas ni guiones.",
    tope: "Máximo 10 dígitos numéricos."
  },
  "6": {
    titulo: "Dígito de Verificación (DV)",
    art: "Art. 555-2 E.T.",
    concepto: "Dígito matemático de seguridad calculado según el algoritmo módulo 11 de la DIAN que valida la autenticidad del NIT.",
    como_llenar: "Se calcula automáticamente a partir del número del NIT según la fórmula oficial de la DIAN.",
    tope: "1 dígito del 0 al 9."
  },
  "7": {
    titulo: "Primer apellido",
    art: "Art. 555-2 E.T.",
    concepto: "Primer apellido del declarante tal como figura inscrito en el RUT y en su documento de identidad.",
    como_llenar: "Escribe en mayúsculas el primer apellido exactamente como está en el RUT (ej. PEREZ).",
    tope: "Texto alfabético."
  },
  "8": {
    titulo: "Segundo apellido",
    art: "Art. 555-2 E.T.",
    concepto: "Segundo apellido del declarante.",
    como_llenar: "Escribe en mayúsculas el segundo apellido. Si el contribuyente no tiene segundo apellido, se deja en blanco.",
    tope: "Texto alfabético."
  },
  "9": {
    titulo: "Primer nombre",
    art: "Art. 555-2 E.T.",
    concepto: "Primer nombre del declarante.",
    como_llenar: "Escribe en mayúsculas el primer nombre tal como consta en el RUT (ej. CARLOS).",
    tope: "Texto alfabético."
  },
  "10": {
    titulo: "Otros nombres",
    art: "Art. 555-2 E.T.",
    concepto: "Segundo o demás nombres del declarante.",
    como_llenar: "Escribe en mayúsculas los nombres adicionales (ej. ALBERTO). Si no tiene más nombres, déjalo en blanco.",
    tope: "Texto alfabético."
  },
  "12": {
    titulo: "Código Dirección Seccional",
    art: "Art. 555-2 E.T.",
    concepto: "Código numérico de la administración seccional de impuestos de la DIAN donde el contribuyente tiene su domicilio fiscal principal.",
    como_llenar: "Toma el código de la casilla 12 del RUT (ej. 32 para Bogotá Personas Naturales, 01 para Medellín, 02 para Cali).",
    tope: "Código numérico de 2 dígitos."
  },
  "24": {
    titulo: "Actividad económica principal",
    art: "Art. 555-2 E.T. - Clasificación CIIU DIAN",
    concepto: "Código de 4 dígitos de la Clasificación Industrial Internacional Uniforme (CIIU) que generó el mayor porcentaje de ingresos en el año.",
    como_llenar: "Ingresa el código CIIU registrado en la casilla 46 del RUT (ej. 0010 Asalariados, 0090 Rentistas de Capital, 6910 Actividades Jurídicas, 6920 Contabilidad).",
    tope: "4 dígitos CIIU."
  },
  "28": {
    titulo: "Uno por ciento (1%) de compras con factura electrónica",
    art: "Art. 336 Numeral 5 E.T. (Adicionado Ley 2277 de 2022)",
    concepto: "Deducción especial independiente del 1% del valor total de adquisiciones de bienes y servicios personales soportadas con Factura Electrónica de Venta con validación previa.",
    como_llenar: "Suma todas las compras y gastos personales del año pagados mediante canales bancarios (tarjeta de crédito, débito o transferencias electrónicas) que cuenten con factura electrónica emitida a tu nombre y NIT. Multiplica el total por el 1% (0.01) y regístralo aquí.",
    tope: "Máximo 240 UVT anuales ($12.564.000 COP en 2026). NO está sujeto al límite conjunto del 40% ni a los 1.340 UVT de la Cédula General."
  },

  // PATRIMONIO
  "29": {
    titulo: "Total patrimonio bruto",
    art: "Art. 261 a 279 E.T.",
    concepto: "Totalidad de bienes, derechos reales, inversiones, cuentas bancarias y activos poseídos por el contribuyente en Colombia y en el exterior a 31 de diciembre.",
    como_llenar: "Suma: a) Saldos bancarios y CDT a 31 de diciembre (certificados bancarios), b) Bienes raíces (el mayor entre avalúo catastral y costo de adquisición fiscal, Art. 277), c) Vehículos (costo fiscal de compra, no avalúo comercial), d) Acciones y aportes sociales, e) Cuentas por cobrar y f) Demás activos.",
    tope: "Debe estar soportado 100% en escrituras, extractos bancarios y declaraciones de impuestos prediales/vehiculares."
  },
  "30": {
    titulo: "Deudas",
    art: "Art. 283 a 287 E.T.",
    concepto: "Pasivos u obligaciones financieras, comerciales y civiles vigentes y a cargo del contribuyente al 31 de diciembre.",
    como_llenar: "Diligencia el saldo de capital adeudado en: créditos hipotecarios de vivienda, créditos de consumo, libranzas, saldos de tarjetas de crédito y deudas con personas naturales respaldadas en documentos con fecha cierta e idoneidad probatoria (Art. 770).",
    tope: "Soportado con extractos bancarios de deuda o contratos notariales. No se admiten deudas manifiestamente inexistentes."
  },
  "31": {
    titulo: "Total patrimonio líquido",
    art: "Art. 282 E.T.",
    concepto: "Patrimonio neto real del contribuyente resultante de restar las obligaciones financieras de los activos brutos poseídos.",
    como_llenar: "Cálculo aritmético automático: Reste las Deudas (Casilla 30) del Patrimonio Bruto (Casilla 29). Si las deudas son mayores que los activos, el valor es cero ($0).",
    tope: "Casilla 29 menos Casilla 30."
  },

  // CÉDULA GENERAL - SUB-CÉDULA RENTAS DE TRABAJO (RELACIÓN LABORAL)
  "32": {
    titulo: "Ingresos brutos por rentas de trabajo",
    art: "Art. 103 E.T.",
    concepto: "Ingresos generados en virtud de un contrato de trabajo laboral, relación legal y reglamentaria o prestaciones sociales.",
    como_llenar: "Toma el valor de la Casilla 36 (Total Ingresos Brutos) del Formulario 220 (Certificado de Ingresos y Retenciones) expedido por el empleador. Si tuviste más de un empleador, suma todas las casillas 36 de los F220 del año.",
    tope: "Suma total de salarios, comisiones, viáticos habituales, primas, cesantías e intereses de cesantías percibidos."
  },
  "33": {
    titulo: "Ingresos no constitutivos de renta (Trabajo)",
    art: "Art. 55 y 56 E.T.",
    concepto: "Aportes obligatorios a seguridad social que por ley no son base gravable de impuesto de renta.",
    como_llenar: "Suma los Aportes Obligatorios a Salud (Casilla 37 F220) + Aportes Obligatorios a Pensión y FSP (Casilla 38 F220) efectivamente descontados de nómina o pagados por el trabajador.",
    tope: "100% de los aportes obligatorios legales pagados en el año."
  },
  "34": {
    titulo: "Renta líquida (Trabajo)",
    art: "Art. 336 E.T.",
    concepto: "Ingreso neto ordinario del trabajador antes de la imputación de alivios tributarios, deducciones y rentas exentas.",
    como_llenar: "Cálculo automático: Casilla 32 (Ingresos brutos) menos Casilla 33 (INCRNGO).",
    tope: "Casilla 32 menos Casilla 33."
  },
  "35": {
    titulo: "Aportes voluntarios AFC, FVP y AVC (Trabajo)",
    art: "Art. 126-1 y 126-4 E.T.",
    concepto: "Aportes voluntarios a Fondos de Pensiones Voluntarias (FVP), cuentas de Ahorro para el Fomento de la Construcción (AFC) o Ahorro Voluntario Contractual (AVC).",
    como_llenar: "Toma el valor informado en los certificados tributarios expedidos por las fiduciarias o entidades administradoras de fondos de pensiones voluntarias o cuentas AFC.",
    tope: "No puede exceder el 30% del ingreso laboral bruto ni las 3.800 UVT anuales ($198.930.000 COP en 2026). Además compite dentro del límite conjunto del 40% (Casilla 41)."
  },
  "36": {
    titulo: "Otras rentas exentas (25% laboral y cesantías)",
    art: "Art. 206 Numerales 4 y 10 E.T.",
    concepto: "Exención del 25% automática sobre los pagos laborales netos, indemnizaciones por accidente de trabajo, seguro por muerte y cesantías.",
    como_llenar: "Se calcula aplicando el 25% sobre el resultado de: Casilla 34 (Renta líquida) menos Casilla 35 (Aportes AFC) menos Casilla 40 (Deducciones imputables).",
    tope: "La renta exenta del 25% está limitada individualmente a 790 UVT anuales ($41.356.500 COP en 2026) y entra en el límite global del 40%."
  },
  "37": {
    titulo: "Total rentas exentas (Trabajo)",
    art: "Art. 206, 336 E.T.",
    concepto: "Sumatoria de las rentas exentas solicitadas por el contribuyente en rentas de trabajo.",
    como_llenar: "Cálculo automático: Suma de la Casilla 35 (Aportes voluntarios) + Casilla 36 (Otras rentas exentas y 25%).",
    tope: "Suma de Casillas 35 + 36."
  },
  "38": {
    titulo: "Intereses de vivienda (Trabajo)",
    art: "Art. 119 E.T.",
    concepto: "Deducción por intereses o corrección monetaria cancelados durante el año por créditos hipotecarios o contratos de leasing habitacional para vivienda de habitación del declarante.",
    como_llenar: "Ingresa el valor certificado por el banco o entidad financiera en el extracto anual de crédito hipotecario o leasing habitacional.",
    tope: "Máximo 1.200 UVT anuales (100 UVT mensuales = $62.820.000 COP en 2026)."
  },
  "39": {
    titulo: "Otras deducciones imputables (Trabajo)",
    art: "Art. 387, 115 E.T.",
    concepto: "Deducciones por: 1) Dependientes económicos generales (10% del ingreso laboral hasta 384 UVT), 2) Medicina prepagada y planes complementarios de salud (hasta 192 UVT), y 3) 50% del Gravamen a los Movimientos Financieros (4x1000).",
    como_llenar: "Suma los pagos de medicina prepagada certificados + el valor por dependiente general (10% de ingresos laborales sin pasar de 384 UVT) + el 50% del 4x1000 certificado por los bancos.",
    tope: "Medicina Prepagada: 192 UVT ($10.051.200 COP) | Dependientes generales: 384 UVT ($20.102.400 COP) | GMF: 50% efectivamente pagado."
  },
  "40": {
    titulo: "Total deducciones imputables (Trabajo)",
    art: "Art. 336 E.T.",
    concepto: "Sumatoria de todas las deducciones solicitadas en la cédula de trabajo.",
    como_llenar: "Cálculo automático: Suma de la Casilla 38 (Intereses vivienda) + Casilla 39 (Otras deducciones imputables).",
    tope: "Suma de Casillas 38 + 39."
  },
  "41": {
    titulo: "Rentas exentas y deducciones limitadas (Trabajo)",
    art: "Art. 336 E.T.",
    concepto: "Valor jurídicamente procedente de rentas exentas y deducciones tras aplicar el límite conjunto del Estatuto Tributario.",
    como_llenar: "Cálculo automático: Se toma la suma de beneficios solicitados (Casilla 37 + Casilla 40) y se limita para que no supere el menor valor entre el 40% del Ingreso Neto (Casilla 34) y 1.340 UVT ($70.149.000 COP en 2026).",
    tope: "Menor entre el 40% de la Casilla 34 y 1.340 UVT ($70.149.000 COP)."
  },
  "42": {
    titulo: "Renta líquida ordinaria (Trabajo)",
    art: "Art. 336 E.T.",
    concepto: "Renta líquida de trabajo final que se sumará en la Cédula General.",
    como_llenar: "Cálculo automático: Casilla 34 (Renta líquida) menos Casilla 41 (Rentas exentas y deducciones limitadas).",
    tope: "Casilla 34 menos Casilla 41."
  },

  // CÉDULA GENERAL - SUB-CÉDULA RENTAS DE TRABAJO SIN RELACIÓN LABORAL (HONORARIOS CON COSTOS)
  "43": {
    titulo: "Ingresos brutos por honorarios y compensaciones (No laboral)",
    art: "Art. 103, 335 E.T.",
    concepto: "Ingresos por honorarios, comisiones o compensaciones de servicios independientes cuando el contribuyente opta por imputar costos y gastos procedentes en lugar de la renta exenta del 25%.",
    como_llenar: "Suma todas las cuentas de cobro o facturas electrónicas cobradas durante el año por concepto de honorarios o servicios profesionales independientes.",
    tope: "Total facturación de honorarios antes de costos y retenciones."
  },
  "44": {
    titulo: "Ingresos no constitutivos de renta (Honorarios)",
    art: "Art. 55 y 56 E.T.",
    concepto: "Aportes obligatorios a seguridad social (Salud 12.5%, Pensión 16% y ARL) pagados sobre los honorarios independientes.",
    como_llenar: "Suma los aportes cancelados en las planillas PILA tipo 'Independiente' durante el año gravable.",
    tope: "100% de los aportes obligatorios pagados por el independiente."
  },
  "45": {
    titulo: "Costos y deducciones procedentes (Honorarios)",
    art: "Art. 107 E.T.",
    concepto: "Costos y gastos directamente asociados a la prestación de los servicios profesionales (arriendos de oficina, papelería, empleados, insumos).",
    como_llenar: "Diligencia la suma de compras y gastos deducibles con factura electrónica que tengan relación de causalidad con la actividad.",
    tope: "Deben cumplir estrictamente con el Art. 107 E.T. Si solicitas costos, no puedes tomar la renta exenta del 25% del Art. 206 Num. 10."
  },
  "46": {
    titulo: "Renta líquida (Honorarios sin relación laboral)",
    art: "Art. 336 E.T.",
    concepto: "Utilidad neta previa de la subcédula de honorarios independientes.",
    como_llenar: "Cálculo automático: Casilla 43 menos Casilla 44 menos Casilla 45.",
    tope: "Casilla 43 - 44 - 45."
  },
  "47": {
    titulo: "Aportes voluntarios AFC y FVP (Honorarios)",
    art: "Art. 126-1, 126-4 E.T.",
    concepto: "Aportes voluntarios a fondos de pensiones o cuentas AFC imputables a los honorarios.",
    como_llenar: "Ingresa el valor de aportes voluntarios según certificado de la entidad fiduciaria.",
    tope: "Hasta 30% del ingreso bruto y máximo 3.800 UVT."
  },
  "48": {
    titulo: "Otras rentas exentas (Honorarios)",
    art: "Art. 206 E.T.",
    concepto: "Otras exenciones autorizadas por ley para este tipo de rentas.",
    como_llenar: "Diligencia las exenciones legales procedentes. Nota: No procede el 25% si se imputaron costos en la casilla 45.",
    tope: "Límites legales específicos."
  },
  "49": {
    titulo: "Total rentas exentas (Honorarios)",
    art: "Art. 336 E.T.",
    concepto: "Sumatoria de rentas exentas en la subcédula de honorarios.",
    como_llenar: "Suma automática de Casilla 47 + Casilla 48.",
    tope: "Casilla 47 + 48."
  },
  "50": {
    titulo: "Intereses de vivienda (Honorarios)",
    art: "Art. 119 E.T.",
    concepto: "Deducción de intereses de crédito hipotecario aplicables a esta subcédula si no fueron imputados en la casilla 38.",
    como_llenar: "Valor certificado por el banco en extracto anual de vivienda.",
    tope: "Máximo 1.200 UVT anuales en conjunto."
  },
  "51": {
    titulo: "Otras deducciones imputables (Honorarios)",
    art: "Art. 387 E.T.",
    concepto: "Medicina prepagada, dependientes y 50% GMF aplicables a honorarios.",
    como_llenar: "Certificados de salud prepagada y bancos no imputados en otras casillas.",
    tope: "Topes de 192 UVT en prepagada y 384 UVT en dependientes."
  },
  "52": {
    titulo: "Total deducciones imputables (Honorarios)",
    art: "Art. 336 E.T.",
    concepto: "Total deducciones en la subcédula de honorarios.",
    como_llenar: "Suma automática de Casilla 50 + Casilla 51.",
    tope: "Casilla 50 + 51."
  },
  "53": {
    titulo: "Rentas exentas y deducciones limitadas (Honorarios)",
    art: "Art. 336 E.T.",
    concepto: "Alivios aceptados tras aplicar el límite conjunto del 40% / 1.340 UVT.",
    como_llenar: "Cálculo automático: Menor entre (Casilla 49 + 52) y el 40% de la Casilla 46.",
    tope: "40% de la casilla 46 o remanente del límite de 1.340 UVT."
  },
  "54": {
    titulo: "Rentas exentas y deducciones no imputables (Honorarios)",
    art: "Art. 336 E.T. y Art. 1.2.1.20.4 DUT 1625/2016",
    concepto: "Rentas exentas y deducciones que no fueron imputadas por superar el límite del 40% o 1.340 UVT.",
    como_llenar: "Exceso de deducciones y exenciones no admitidas en la casilla 53.",
    tope: "(Casilla 49 + 52) menos Casilla 53."
  },
  "55": {
    titulo: "Compensación por pérdidas (Honorarios)",
    art: "Art. 147 y 330 E.T.",
    concepto: "Pérdidas fiscales acumuladas de años gravables anteriores imputables a la subcédula de honorarios.",
    como_llenar: "Valor de las pérdidas declaradas en años previos sujetas a compensación sin exceder la renta líquida.",
    tope: "Hasta el valor de la renta líquida ordinaria de la subcédula."
  },
  "56": {
    titulo: "Renta líquida gravable (Honorarios)",
    art: "Art. 336 E.T.",
    concepto: "Base gravable neta final correspondiente a honorarios y compensaciones.",
    como_llenar: "Cálculo automático: Casilla 57 menos Casilla 55.",
    tope: "Renta gravable definitiva de la subcédula."
  },
  "57": {
    titulo: "Renta líquida ordinaria (Honorarios sin relación laboral)",
    art: "Art. 336 E.T.",
    concepto: "Renta ordinaria neta de honorarios que se consolida en la Cédula General.",
    como_llenar: "Cálculo automático: Casilla 46 menos Casilla 53.",
    tope: "Casilla 46 - 53."
  },

  // CÉDULA GENERAL - RENTAS DE CAPITAL
  "58": {
    titulo: "Ingresos brutos por rentas de capital",
    art: "Art. 335 E.T.",
    concepto: "Ingresos obtenidos por intereses, rendimientos financieros de cuentas y CDT, cánones de arrendamiento de inmuebles o vehículos, regalías y propiedad intelectual.",
    como_llenar: "Suma los rendimientos financieros certificados por los bancos en extractos tributarios más los ingresos brutos facturados o cobrados por arriendos durante el año.",
    tope: "Total ingresos de capital brutos antes de restar retenciones o gastos."
  },
  "59": {
    titulo: "Ingresos no constitutivos de renta (Capital)",
    art: "Art. 38 a 41, 55, 56 E.T.",
    concepto: "Componente inflacionario de los rendimientos financieros informado por el banco y aportes obligatorios a salud y pensión como rentista de capital.",
    como_llenar: "Toma el renglón 'Componente no gravado / no constitutivo' del certificado tributario bancario y suma los pagos a seguridad social por rentas de capital.",
    tope: "Porcentaje legal fijado anualmente por decreto para el componente inflacionario + aportes reales a seguridad social."
  },
  "60": {
    titulo: "Costos y deducciones procedentes (Capital)",
    art: "Art. 107 E.T.",
    concepto: "Gastos directamente asociados a la generación de rentas de capital (comisiones inmobiliarias, reparaciones locativas de inmuebles arrendados, prediales de bienes alquilados, seguros).",
    como_llenar: "Suma los pagos a agencias de arrendamiento, comisiones fiduciarias y gastos de mantenimiento soportados con factura electrónica.",
    tope: "Deben tener relación de causalidad con los bienes que generan los cánones o rendimientos."
  },
  "61": {
    titulo: "Renta líquida (Capital)",
    art: "Art. 336 E.T.",
    concepto: "Utilidad líquida de la actividad de capital antes de rentas exentas y deducciones imputables.",
    como_llenar: "Cálculo automático: Casilla 58 (Ingresos) menos Casilla 59 (INCRNGO) menos Casilla 60 (Costos procedentes).",
    tope: "Casilla 58 - 59 - 60."
  },
  "63": {
    titulo: "Aportes voluntarios AFC y FVP (Capital)",
    art: "Art. 126-1, 126-4 E.T.",
    concepto: "Aportes a cuentas AFC o fondos de pensión voluntaria imputables a la cédula de capital.",
    como_llenar: "Certificados de fiduciarias por aportes de pensión voluntaria o AFC.",
    tope: "Hasta 30% del ingreso y 3.800 UVT."
  },
  "64": {
    titulo: "Otras rentas exentas (Capital)",
    art: "Art. 235-2 E.T.",
    concepto: "Rentas exentas legales aplicables a rentas de capital (ej. aprovechamiento forestal, venta de energía renovable).",
    como_llenar: "Diligencia el valor de las exenciones especiales de ley.",
    tope: "Límites según normativa específica de cada incentivo."
  },
  "65": {
    titulo: "Total rentas exentas (Capital)",
    art: "Art. 336 E.T.",
    concepto: "Sumatoria de rentas exentas de capital.",
    como_llenar: "Suma automática de Casilla 63 + Casilla 64.",
    tope: "Casilla 63 + 64."
  },
  "66": {
    titulo: "Intereses de vivienda (Capital)",
    art: "Art. 119 E.T.",
    concepto: "Intereses hipotecarios o leasing de vivienda imputados a rentas de capital.",
    como_llenar: "Extracto bancario de crédito de vivienda.",
    tope: "Hasta 1.200 UVT anuales en conjunto."
  },
  "67": {
    titulo: "Otras deducciones imputables (Capital)",
    art: "Art. 115, 387 E.T.",
    concepto: "50% del 4x1000 pagado en cuentas asociadas a rentas de capital y medicina prepagada.",
    como_llenar: "Suma el 50% del GMF certificado y pagos de salud no usados en otras casillas.",
    tope: "Prepagada: 192 UVT | GMF: 50% pagado."
  },
  "68": {
    titulo: "Total deducciones imputables (Capital)",
    art: "Art. 336 E.T.",
    concepto: "Sumatoria de deducciones en rentas de capital.",
    como_llenar: "Suma automática de Casilla 66 + Casilla 67.",
    tope: "Casilla 66 + 67."
  },
  "69": {
    titulo: "Rentas exentas y deducciones limitadas (Capital)",
    art: "Art. 336 E.T.",
    concepto: "Alivios procedentes de capital tras aplicar el límite conjunto del 40% y 1.340 UVT.",
    como_llenar: "Cálculo automático: Menor entre (Casilla 65 + 68) y el 40% de la Casilla 61.",
    tope: "40% de la casilla 61 o cupo disponible de 1.340 UVT."
  },
  "70": {
    titulo: "Rentas exentas y deducciones no imputables (Capital)",
    art: "Art. 336 E.T. y Art. 1.2.1.20.4 DUT 1625/2016",
    concepto: "Rentas exentas y deducciones de capital rechazadas por superar el límite del 40% o 1.340 UVT.",
    como_llenar: "(Casilla 65 + 68) menos Casilla 69.",
    tope: "Exceso de alivios no deducibles."
  },
  "71": {
    titulo: "Compensación por pérdidas (Capital)",
    art: "Art. 147 y 330 E.T.",
    concepto: "Compensación de pérdidas fiscales de años anteriores en la cédula de capital.",
    como_llenar: "Pérdidas acumuladas imputables a la actividad de capital.",
    tope: "Hasta la renta líquida ordinaria de capital."
  },
  "72": {
    titulo: "Renta líquida gravable (Capital)",
    art: "Art. 336 E.T.",
    concepto: "Base gravable neta de rentas de capital tras compensaciones.",
    como_llenar: "Cálculo automático: Casilla 73 menos Casilla 71.",
    tope: "Renta gravable final de capital."
  },
  "73": {
    titulo: "Renta líquida ordinaria (Capital)",
    art: "Art. 336 E.T.",
    concepto: "Renta gravable neta de capital que se integra a la Cédula General.",
    como_llenar: "Cálculo automático: Casilla 61 menos Casilla 69.",
    tope: "Casilla 61 - 69."
  },

  // CÉDULA GENERAL - RENTAS NO LABORALES
  "74": {
    titulo: "Ingresos brutos por rentas no laborales",
    art: "Art. 335 E.T.",
    concepto: "Ingresos provenientes de actividades de comercio, manufactura, agricultura, transporte, prestación de servicios independientes con más de 2 empleados y cualquier otro ingreso que no clasifique en las otras cédulas.",
    como_llenar: "Suma el total de ventas brutas o ingresos operacionales del negocio o actividad independiente durante el año gravable.",
    tope: "Total facturado antes de devoluciones, costos e impuestos."
  },
  "75": {
    titulo: "Devoluciones, rebajas y descuentos (No laborales)",
    art: "Art. 335 E.T.",
    concepto: "Notas crédito por devoluciones de mercancías, rescisiones de contratos o rebajas comerciales concedidas a clientes.",
    como_llenar: "Suma el valor de las notas crédito y devoluciones soportadas con facturación electrónica.",
    tope: "Debe estar respaldado en documentos contables y notas crédito electrónicas."
  },
  "76": {
    titulo: "Ingresos no constitutivos de renta (No laborales)",
    art: "Art. 55 y 56 E.T.",
    concepto: "Aportes obligatorios a salud, pensión y ARL cancelados por el contribuyente para el desarrollo de su actividad comercial o no laboral.",
    como_llenar: "Suma los aportes realizados mediante planilla PILA vinculados a la actividad no laboral.",
    tope: "100% de aportes obligatorios pagados."
  },
  "77": {
    titulo: "Costos y deducciones procedentes (No laborales)",
    art: "Art. 107 E.T.",
    concepto: "Costo de ventas (mercancías e insumos), nóminas de empleados con seguridad social, servicios públicos del local, arriendos comerciales y gastos operativos necesarios.",
    como_llenar: "Diligencia la suma del costo de ventas y gastos operativos que tengan factura electrónica y pago bancarizado (Art. 771-5).",
    tope: "Deben cumplir necesidad, causalidad y proporcionalidad con la actividad generadora de renta."
  },
  "78": {
    titulo: "Renta líquida (No laborales)",
    art: "Art. 336 E.T.",
    concepto: "Utilidad bruta fiscal de la actividad no laboral antes de alivios tributarios.",
    como_llenar: "Cálculo automático: Casilla 74 (Ingresos) menos Casilla 75 (Devoluciones) menos Casilla 76 (INCRNGO) menos Casilla 77 (Costos procedentes).",
    tope: "Casilla 74 - 75 - 76 - 77. Si es negativo, constituye pérdida líquida."
  },
  "80": {
    titulo: "Aportes voluntarios AFC y FVP (No laborales)",
    art: "Art. 126-1, 126-4 E.T.",
    concepto: "Aportes a pensiones voluntarias o cuentas AFC solicitados en la cédula no laboral.",
    como_llenar: "Certificados de fiduciarias por aportes de pensión voluntaria o AFC.",
    tope: "Hasta 30% del ingreso y 3.800 UVT."
  },
  "81": {
    titulo: "Otras rentas exentas (No laborales)",
    art: "Art. 235-2 E.T.",
    concepto: "Incentivos tributarios de rentas exentas para actividades no laborales (ej. economía naranja, desarrollo del campo).",
    como_llenar: "Diligencia el valor de las exenciones especiales de ley.",
    tope: "Sujeto a los requisitos legales de cada régimen especial."
  },
  "82": {
    titulo: "Total rentas exentas (No laborales)",
    art: "Art. 336 E.T.",
    concepto: "Sumatoria de rentas exentas no laborales.",
    como_llenar: "Suma automática de Casilla 80 + Casilla 81.",
    tope: "Casilla 80 + 81."
  },
  "83": {
    titulo: "Intereses de vivienda (No laborales)",
    art: "Art. 119 E.T.",
    concepto: "Deducción de intereses de vivienda imputados a rentas no laborales.",
    como_llenar: "Extracto bancario de crédito hipotecario.",
    tope: "Hasta 1.200 UVT anuales en conjunto."
  },
  "84": {
    titulo: "Otras deducciones imputables (No laborales)",
    art: "Art. 115, 387 E.T.",
    concepto: "50% del 4x1000 y medicina prepagada imputable a rentas no laborales.",
    como_llenar: "Certificados de salud prepagada y 50% de GMF certificado por entidades bancarias.",
    tope: "Prepagada: 192 UVT | GMF: 50% pagado."
  },
  "85": {
    titulo: "Total deducciones imputables (No laborales)",
    art: "Art. 336 E.T.",
    concepto: "Sumatoria de deducciones en rentas no laborales.",
    como_llenar: "Suma automática de Casilla 83 + Casilla 84.",
    tope: "Casilla 83 + 84."
  },
  "86": {
    titulo: "Rentas exentas y deducciones limitadas (No laborales)",
    art: "Art. 336 E.T.",
    concepto: "Alivios procedentes de rentas no laborales tras aplicar el límite conjunto del 40% y 1.340 UVT.",
    como_llenar: "Cálculo automático: Menor entre (Casilla 82 + 85) y el 40% de la Casilla 78.",
    tope: "40% de la casilla 78 o cupo disponible de 1.340 UVT."
  },
  "87": {
    titulo: "Rentas exentas y deducciones no imputables (No laborales)",
    art: "Art. 336 E.T. y Art. 1.2.1.20.4 DUT 1625/2016",
    concepto: "Alivios tributarios no laborales que superan el límite del 40% o 1.340 UVT.",
    como_llenar: "(Casilla 82 + 85) menos Casilla 86.",
    tope: "Exceso de deducciones y exenciones."
  },
  "88": {
    titulo: "Compensación por pérdidas (No laborales)",
    art: "Art. 147 y 330 E.T.",
    concepto: "Compensación de pérdidas fiscales acumuladas en la cédula no laboral.",
    como_llenar: "Pérdidas acumuladas a compensar.",
    tope: "Hasta la renta líquida ordinaria no laboral."
  },
  "89": {
    titulo: "Renta líquida gravable (No laborales)",
    art: "Art. 336 E.T.",
    concepto: "Base gravable final de rentas no laborales.",
    como_llenar: "Cálculo automático: Casilla 90 menos Casilla 88.",
    tope: "Renta gravable definitiva de la subcédula."
  },
  "90": {
    titulo: "Renta líquida ordinaria (No laborales)",
    art: "Art. 336 E.T.",
    concepto: "Renta ordinaria neta no laboral que se consolida en la Cédula General.",
    como_llenar: "Cálculo automático: Casilla 78 menos Casilla 86.",
    tope: "Casilla 78 - 86."
  },

  // TOTALES CÉDULA GENERAL
  "91": {
    titulo: "Renta líquida Cédula General",
    art: "Art. 335 E.T.",
    concepto: "Consolidación total de los ingresos netos de las cuatro subcédulas (trabajo, honorarios, capital y no laborales) antes de beneficios tributarios.",
    como_llenar: "Cálculo automático: Casilla 34 + Casilla 46 + Casilla 61 + Casilla 78.",
    tope: "Sumatoria matemática de las 4 rentas líquidas previas."
  },
  "92": {
    titulo: "Rentas exentas y deducciones limitadas consolidadas",
    art: "Art. 336 E.T.",
    concepto: "Total de beneficios fiscales (rentas exentas y deducciones) aceptados en toda la Cédula General tras aplicar el límite máximo legal de 1.340 UVT.",
    como_llenar: "Cálculo automático: Suma de Casilla 41 + Casilla 53 + Casilla 69 + Casilla 86.",
    tope: "Tope máximo inquebrantable de 1.340 UVT ($70.149.000 COP en 2026)."
  },
  "93": {
    titulo: "Renta líquida ordinaria Cédula General",
    art: "Art. 336 E.T.",
    concepto: "Renta líquida ordinaria depurada de la Cédula General.",
    como_llenar: "Cálculo automático: Casilla 91 (Renta líquida total) menos Casilla 92 (Alivios limitados consolidados).",
    tope: "Casilla 91 menos Casilla 92."
  },
  "94": {
    titulo: "Compensación por pérdidas año 2016 y anteriores",
    art: "Art. 147 E.T.",
    concepto: "Compensación de pérdidas fiscales acumuladas originadas en el año 2016 o años anteriores.",
    como_llenar: "Diligencia el saldo de pérdidas fiscales de años previos a 2017 que tengas derecho a compensar en esta cédula.",
    tope: "No puede exceder el valor de la Casilla 93."
  },
  "95": {
    titulo: "Compensación por exceso de renta presuntiva",
    art: "Art. 189 E.T.",
    concepto: "Compensación de excesos de renta presuntiva sobre la renta ordinaria liquidados en años gravables anteriores (dentro de los 5 años siguientes).",
    como_llenar: "Diligencia los excesos de renta presuntiva pendientes de compensar generados en declaraciones anteriores.",
    tope: "Hasta el valor de la renta líquida ordinaria del año."
  },
  "96": {
    titulo: "Rentas gravables",
    art: "Art. 195 a 199 E.T.",
    concepto: "Rentas gravables especiales por recuperación de deducciones (ej. depreciaciones, inventarios castigados o deudas incobrables recuperadas).",
    como_llenar: "Ingresa el valor de las deducciones que hayan sido recuperadas económicamente durante el año gravable.",
    tope: "Total de recuperaciones del año."
  },
  "97": {
    titulo: "Renta líquida gravable Cédula General",
    art: "Art. 241 E.T.",
    concepto: "Base gravable definitiva de la Cédula General que se integrará con las pensiones para la liquidación del impuesto progresivo.",
    como_llenar: "Cálculo automático: Casilla 93 menos Casilla 94 menos Casilla 95 más Casilla 96.",
    tope: "Base que se traslada a la Casilla 111."
  },
  "98": {
    titulo: "Renta presuntiva",
    art: "Art. 188 E.T.",
    concepto: "Rendimiento mínimo patrimonial presunto exigido por la ley. A partir de la Ley 2010 de 2019 y 2277 de 2022 la tarifa de renta presuntiva es del 0%.",
    como_llenar: "Registra $0 (Tarifa legal vigente: 0%).",
    tope: "0% del patrimonio líquido del año anterior."
  },

  // CÉDULA DE PENSIONES
  "99": {
    titulo: "Ingresos brutos por rentas de pensiones",
    art: "Art. 206 Numeral 1 E.T.",
    concepto: "Ingresos percibidos por pensiones de jubilación, vejez, invalidez, sobrevivientes y riesgos laborales reconocidas por Colpensiones, fondos privados o entidades públicas.",
    como_llenar: "Toma el valor del certificado anual expedido por la entidad pagadora de la pensión.",
    tope: "Total de mesadas pensionales y retroactivos percibidos en el año."
  },
  "100": {
    titulo: "Ingresos no constitutivos de renta (Pensiones)",
    art: "Art. 55 y 56 E.T.",
    concepto: "Descuentos obligatorios de salud practicados sobre las mesadas pensionales.",
    como_llenar: "Suma los aportes a salud descontados de las colillas de pago pensional.",
    tope: "100% de aportes a salud efectivamente descontados."
  },
  "103": {
    titulo: "Renta líquida gravable cédula de pensiones",
    art: "Art. 206 Numeral 1 E.T.",
    concepto: "Monto de las pensiones que excede el límite exento legal de 1.000 UVT mensuales (12.000 UVT anuales = $628.200.000 COP en 2026).",
    como_llenar: "Cálculo automático: Casilla 99 menos Casilla 100 menos la exención de 12.000 UVT. En Colombia más del 99% de las pensiones son 100% exentas y esta casilla da $0.",
    tope: "Exención de hasta 1.000 UVT mensuales ($52.350.000 COP/mes en 2026)."
  },

  // CÉDULA DE DIVIDENDOS Y PARTICIPACIONES
  "104": {
    titulo: "Dividendos y participaciones 2016 y anteriores",
    art: "Art. 48, 49 E.T.",
    concepto: "Dividendos decretados con cargo a utilidades generadas antes del 1 de enero de 2017 como no constitutivos de renta.",
    como_llenar: "Toma el valor del certificado tributario de dividendos expedido por la sociedad emisora.",
    tope: "Monto certificado por la empresa como utilidad no gravada año 2016 o anterior."
  },
  "105": {
    titulo: "Ingresos no constitutivos de renta (Dividendos 2016)",
    art: "Art. 48, 49 E.T.",
    concepto: "Parte del dividendo que no constituye renta por provenir de utilidades que ya pagaron impuesto en cabeza de la sociedad.",
    como_llenar: "Valor informado en el certificado de dividendos.",
    tope: "Hasta el 100% del dividendo no gravado certificado."
  },
  "107": {
    titulo: "Dividendos año 2017 y siguientes (No gravados sociedad)",
    art: "Art. 242 E.T. (Modificado Ley 2277 de 2022)",
    concepto: "Dividendos recibidos de sociedades nacionales provenientes de utilidades comerciales del año 2017 en adelante que ya tributaron en la empresa (Art. 49 Num. 3).",
    como_llenar: "Ingresa el valor certificado por la sociedad en el renglón 'Dividendos 2017+ Art. 49 Num. 3'. Tributan a tarifa marginal progresiva con descuento del 19%.",
    tope: "Monto total certificado por la entidad pagadora."
  },

  // LIQUIDACIÓN PRIVADA DEL IMPUESTO
  "111": {
    titulo: "Renta líquida gravable consolidada (Art. 241 E.T.)",
    art: "Art. 241 E.T.",
    concepto: "Base definitiva consolidada (Cédula General + Pensiones Gravables) sobre la cual se aplica la tabla de tarifas progresivas de impuesto de renta.",
    como_llenar: "Cálculo automático: Suma de la Casilla 97 (Cédula General) + Casilla 103 (Pensiones gravables).",
    tope: "Base sobre la cual se calculan los brackets de UVT."
  },

  // GANANCIAS OCASIONALES
  "112": {
    titulo: "Ingresos por ganancias ocasionales país y exterior",
    art: "Art. 300 a 317 E.T.",
    concepto: "Ingresos extraordinarios por: a) Venta de bienes inmuebles o activos fijos poseídos durante 2 o más años, b) Porciones conyugales, herencias, legados y donaciones, c) Loterías, rifas, apuestas y premios.",
    como_llenar: "Suma: 1) El precio de venta en escrituras de bienes poseídos por 2+ años, 2) El valor de bienes adjudicados en sucesiones o donaciones y 3) El valor bruto de premios de loterías.",
    tope: "Total ingresos extraordinarios. Si el activo se poseyó por menos de 2 años, no va aquí sino en la Cédula No Laboral (Casilla 74)."
  },
  "113": {
    titulo: "Costos por ganancias ocasionales",
    art: "Art. 307, 311 E.T.",
    concepto: "Costo fiscal del bien o activo fijo enajenado que originó la ganancia ocasional.",
    como_llenar: "Registra el costo de adquisición del inmueble o activo vendido ajustado según las normas fiscales (Art. 70 o Art. 73 E.T. según aplique).",
    tope: "No puede ser superior al precio de venta del activo vendido."
  },
  "114": {
    titulo: "Ganancias ocasionales no gravadas y exentas",
    art: "Art. 307 E.T.",
    concepto: "Exenciones legales taxativas sobre ganancias ocasionales: a) Primeras 3.250 UVT ($170.137.500 COP en 2026) en vivienda del causante, b) Primeras 7.700 UVT en inmueble rural de explotación económica, c) 20% de herencias recibidas por cónyuge o herederos hasta 1.625 UVT ($85.068.750 COP).",
    como_llenar: "Calcula las exenciones correspondientes según el tipo de ganancia ocasional acreditada en la escritura pública o hijuela de partición.",
    tope: "Topes estrictos por UVT fijados en el Art. 307 del Estatuto Tributario."
  },
  "115": {
    titulo: "Ganancias ocasionales gravables",
    art: "Art. 313 y 317 E.T.",
    concepto: "Base neta sobre la cual se liquida el impuesto de ganancia ocasional (15% general / 20% rifas y loterías).",
    como_llenar: "Cálculo automático: Casilla 112 (Ingresos) menos Casilla 113 (Costos) menos Casilla 114 (Exentas).",
    tope: "Casilla 112 - 113 - 114."
  },

  // IMPUESTOS LIQUIDADOS
  "116": {
    titulo: "Impuesto sobre las rentas líquidas gravables",
    art: "Art. 241 E.T.",
    concepto: "Impuesto básico de renta liquidado sobre la base consolidada de la Cédula General y de Pensiones según la tabla de rangos marginales progresivos (0%, 19%, 28%, 33%, 35%, 37%, 39%).",
    como_llenar: "Cálculo matemático automático: Se convierte la Casilla 111 a UVT, se aplica la fórmula del rango del Art. 241 y se reconvierte a pesos multiplicando por el valor de la UVT del año, redondeando a miles.",
    tope: "Fórmula legal del Art. 241 E.T."
  },
  "118": {
    titulo: "Impuesto dividendos y participaciones 2017+",
    art: "Art. 242 E.T.",
    concepto: "Impuesto sobre dividendos del año 2017 en adelante recibidos por personas naturales residentes.",
    como_llenar: "Se liquida según la tabla del Art. 242: 0% para las primeras 1.090 UVT y 15% sobre el exceso, con descuento especial en Cédula General.",
    tope: "Tarifa 0% hasta 1.090 UVT y 15% marginal."
  },
  "121": {
    titulo: "Total impuesto sobre las rentas líquidas gravables",
    art: "Art. 241, 242 E.T.",
    concepto: "Sumatoria de los impuestos brutos calculados sobre la cédula general, pensiones y dividendos.",
    como_llenar: "Cálculo automático: Suma de Casilla 116 + 117 + 118 + 119 + 120.",
    tope: "Total impuesto bruto antes de descuentos tributarios."
  },
  "125": {
    titulo: "Donaciones y otros descuentos tributarios",
    art: "Art. 257, 254 E.T.",
    concepto: "Descuento del 25% por donaciones realizadas a entidades sin ánimo de lucro (ESAL) del Régimen Especial y descuentos por impuestos pagados en el exterior.",
    como_llenar: "Toma el 25% del valor donado certificado por la ESAL calificada más los impuestos pagados en otros países con convenio de doble imposición.",
    tope: "El descuento por donaciones no puede exceder el 25% del impuesto neto de renta (Art. 258 E.T.)."
  },
  "126": {
    titulo: "Impuesto neto de renta",
    art: "Art. 259 E.T.",
    concepto: "Impuesto de renta a cargo resultante tras detraer los descuentos tributarios autorizados.",
    como_llenar: "Cálculo automático: Casilla 121 (Total Impuesto) menos Casilla 125 (Descuentos tributarios).",
    tope: "No puede ser inferior al límite fijado en el Art. 259 E.T."
  },
  "127": {
    titulo: "Impuesto de ganancias ocasionales",
    art: "Art. 313 y 317 E.T. (Ley 2277 de 2022)",
    concepto: "Impuesto generado sobre las ganancias ocasionales netas (tarifa del 15% para venta de inmuebles/herencias y 20% para premios de rifas y loterías).",
    como_llenar: "Cálculo automático: Casilla 115 multiplicada por la tarifa legal correspondiente (15% o 20%).",
    tope: "Tarifa 15% general / 20% loterías."
  },
  "129": {
    titulo: "Total impuesto a cargo",
    art: "Art. 259 E.T.",
    concepto: "Monto total del impuesto liquidado a favor de la Nación que debe responder el declarante.",
    como_llenar: "Cálculo automático: Casilla 126 (Impuesto Neto de Renta) + Casilla 127 (Impuesto Ganancias Ocasionales).",
    tope: "Casilla 126 + Casilla 127."
  },

  // RETENCIONES, ANTICIPOS Y SALDOS FINALES
  "130": {
    titulo: "Anticipo de renta liquidado año anterior",
    art: "Art. 807 E.T.",
    concepto: "Anticipo de impuesto liquidado y pagado en la declaración del año gravable inmediatamente anterior.",
    como_llenar: "Toma exactamente el valor consignado en la Casilla 133 del Formulario 210 de la declaración del año anterior presentada a la DIAN.",
    tope: "Debe coincidir con la casilla 133 del formulario del año anterior."
  },
  "131": {
    titulo: "Saldo a favor año anterior",
    art: "Art. 815 E.T.",
    concepto: "Saldo a favor obtenido en la declaración de renta del año inmediatamente anterior que no fue solicitado en devolución ni compensación previa.",
    como_llenar: "Toma el valor de la Casilla 137 del Formulario 210 del año anterior que se traslada como crédito fiscal a esta vigencia.",
    tope: "Solo procede si no se solicitó devolución en dinero ni compensación previa."
  },
  "132": {
    titulo: "Retenciones año gravable a declarar",
    art: "Art. 373 E.T.",
    concepto: "Total de retenciones en la fuente a título de impuesto sobre la renta que le fueron practicadas al contribuyente durante el año gravable.",
    como_llenar: "Suma: a) Casilla 45 del Formulario 220 (Retención laboral), b) Certificados de retención en la fuente expedidos por clientes/empresas, c) Retenciones informadas en extractos bancarios.",
    tope: "Debe estar soportado 100% en certificados válidos emitidos por agentes retenedores autorizados."
  },
  "133": {
    titulo: "Anticipo de renta para el año gravable siguiente",
    art: "Art. 807 E.T.",
    concepto: "Pago anticipado obligatorio del impuesto sobre la renta para el siguiente periodo fiscal.",
    como_llenar: "Calcula según los métodos del Art. 807: a) 75% del impuesto neto promedio menos retenciones del año, b) 25% si declara por primera vez, o c) 50% si declara por segundo año.",
    tope: "Opcional u obligatorio según cálculo legal de porcentaje de anticipo."
  },
  "134": {
    titulo: "Saldo a pagar por impuesto",
    art: "Art. 801 E.T.",
    concepto: "Monto neto adeudado a la DIAN tras descontar retenciones, saldos a favor previos y anticipos.",
    como_llenar: "Cálculo automático: Casilla 129 (Impuesto a cargo) menos (Casilla 130 + 131 + 132) + Casilla 133. Si el resultado es positivo se registra aquí; si es negativo se coloca cero ($0).",
    tope: "Monto exigible a favor de la DIAN."
  },
  "135": {
    titulo: "Sanciones",
    art: "Art. 641, 644 E.T.",
    concepto: "Sanciones por extemporaneidad (presentar tarde) o corrección (modificar una declaración previa).",
    como_llenar: "Si la declaración es oportuna, registra cero ($0). En caso de extemporaneidad liquida el 5% por mes o fracción de mes de retardo (Art. 641). En corrección voluntaria liquida el 10% del mayor valor a pagar (Art. 644).",
    tope: "La sanción nunca puede ser inferior a la sanción mínima legal: 10 UVT ($523.500 COP en 2026) según Art. 639."
  },
  "136": {
    titulo: "Total saldo a pagar",
    art: "Art. 801 E.T.",
    concepto: "Valor monetario definitivo que el contribuyente debe pagar a la DIAN mediante el recibo oficial de pago Formulario 490.",
    como_llenar: "Cálculo automático: Suma de la Casilla 134 (Saldo por impuesto) + Casilla 135 (Sanciones).",
    tope: "Monto total que debe cancelarse en bancos o vía PSE."
  },
  "137": {
    titulo: "Total saldo a favor",
    art: "Art. 815, 850 E.T.",
    concepto: "Crédito a favor del declarante resultante cuando los anticipos, retenciones y saldos previos superan el total del impuesto a cargo.",
    como_llenar: "Cálculo automático: Cuando (Casilla 130 + 131 + 132) supera la Casilla 129 (Total impuesto a cargo).",
    tope: "Puede solicitarse en devolución en dinero ante la DIAN o imputarse en la declaración del año siguiente."
  },

  // DEPENDIENTES ADICIONALES Y CONTROL
  "138": {
    titulo: "Número de dependientes económicos",
    art: "Art. 387 E.T.",
    concepto: "Número de personas a cargo del declarante que cumplen con las condiciones de dependencia económica certificada (hijos menores de 18 años, hijos hasta 23 estudiantes, cónyuge o padres sin ingresos).",
    como_llenar: "Digita el número de dependientes calificados con certificado de dependencia económica.",
    tope: "Soporta la deducción de dependientes en la Casilla 39."
  },
  "139": {
    titulo: "Adición por dependientes a la casilla 92 (Ley 2277 de 2022)",
    art: "Art. 336 Numeral 4 E.T.",
    concepto: "Deducción adicional de 72 UVT por dependiente económico (hasta un máximo de 4 dependientes adicionales = 288 UVT = $15.076.800 COP en 2026) que NO está sujeta al límite del 40% ni a los 1.340 UVT de la Cédula General.",
    como_llenar: "Multiplica el número de dependientes adicionales certificados (máximo 4) por 72 UVT y por el valor de la UVT del año gravable.",
    tope: "Máximo 4 dependientes = 288 UVT ($15.076.800 COP en 2026). No computa dentro del límite del 40%."
  },
  "140": {
    titulo: "Ud. superó tope indicativo art. 336-1 E.T., marque X",
    art: "Art. 336-1 E.T.",
    concepto: "Marca de control cuando el contribuyente supera el tope indicativo de deducciones y costos.",
    como_llenar: "Marque 'X' únicamente si los costos y gastos superaron los topes indicativos fijados por la DIAN.",
    tope: "Marca X o en blanco."
  },
  "141": {
    titulo: "Aporte voluntario",
    art: "Art. 244-1 E.T.",
    concepto: "Donación o aporte voluntario adicional al Estado para financiar programas sociales y proyectos de inversión social de la Nación.",
    como_llenar: "Si deseas donar voluntariamente una suma adicional al Estado, digita el monto aquí. De lo contrario coloca cero ($0).",
    tope: "Monto voluntario que se suma al pago final."
  },
  "980": {
    titulo: "PAGO TOTAL $",
    art: "Art. 801 E.T.",
    concepto: "Monto monetario final a cancelar en bancos o mediante PSE asociado a esta declaración.",
    como_llenar: "Coincide con el valor de la Casilla 136 (Total Saldo a Pagar). Si genera saldo a favor, el valor es $0.",
    tope: "Monto que se traslada al Recibo Oficial de Pago (Formulario 490)."
  }
};
