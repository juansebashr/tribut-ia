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

/* =========================================================================
   BASE DE CONOCIMIENTO EXHAUSTIVA - FORMULARIO 110 DIAN (PERSONA JURÍDICA)
   Declaración de Renta y Complementarios para Personas Jurídicas y Asimiladas
   ========================================================================= */

export const CASILLAS_INFO_F110: Record<string, CasillaInfo> = {
  "1": {
    titulo: "Año Gravable",
    art: "Art. 1 E.T. y Calendario DIAN",
    concepto: "Año gravable objeto de declaración por parte de la persona jurídica o asimilada.",
    como_llenar: "Año de 4 dígitos correspondiente al periodo fiscal (ej. 2025 o 2026).",
    tope: "Año fiscal de 4 dígitos."
  },
  "4": {
    titulo: "Número de Formulario",
    art: "Art. 578 E.T.",
    concepto: "Número consecutivo único asignado por la DIAN en los servicios informáticos Muisca.",
    como_llenar: "Generado automáticamente por el Muisca.",
    tope: "13 dígitos numéricos."
  },
  "5": {
    titulo: "Número de Identificación Tributaria (NIT)",
    art: "Art. 555-1 y 555-2 E.T.",
    concepto: "NIT de la sociedad comercial, entidad sin ánimo de lucro o sucursal extranjera.",
    como_llenar: "Diligencie el NIT sin dígito de verificación ni separadores.",
    tope: "Máximo 10 dígitos."
  },
  "6": {
    titulo: "Dígito de Verificación (DV)",
    art: "Art. 555-2 E.T.",
    concepto: "Dígito de verificación calculado mediante módulo 11.",
    como_llenar: "Calculado automáticamente por el sistema.",
    tope: "1 dígito del 0 al 9."
  },
  "11": {
    titulo: "Razón Social",
    art: "Art. 555-2 E.T.",
    concepto: "Nombre o denominación social registrado en el RUT y Cámara de Comercio.",
    como_llenar: "Nombre completo de la empresa en mayúsculas.",
    tope: "Texto alfanumérico."
  },
  "24": {
    titulo: "Actividad Económica Principal (CIIU)",
    art: "Art. 555-2 E.T.",
    concepto: "Código CIIU de 4 dígitos que generó el mayor volumen de ingresos operacionales.",
    como_llenar: "Código de actividad económica principal registrada en el RUT.",
    tope: "Código numérico de 4 dígitos."
  },
  "33": {
    titulo: "Total costos y gastos de nómina",
    art: "Art. 108 E.T.",
    concepto: "Total devengado por sueldos, salarios, prestaciones sociales, vacaciones y demás pagos laborales del año.",
    como_llenar: "Sume todos los salarios, horas extras, primas y cesantías causados a favor de los empleados.",
    tope: "Dato informativo. Condiciona la deducibilidad al pago de seguridad social y parafiscales."
  },
  "34": {
    titulo: "Aportes al sistema de seguridad social",
    art: "Art. 108 y 115-1 E.T.",
    concepto: "Total aportes efectivamente pagados en el año por concepto de Salud, Pensión y Riesgos Laborales (ARL).",
    como_llenar: "Sume los aportes a seguridad social a cargo del empleador pagados mediante planilla PILA.",
    tope: "Dato informativo de control para la deducibilidad de la nómina."
  },
  "35": {
    titulo: "Aportes al SENA, ICBF, Cajas de Compensación",
    art: "Art. 108 y 114-1 E.T.",
    concepto: "Aportes parafiscales pagados durante el año gravable.",
    como_llenar: "Sume los pagos de parafiscales (SENA, ICBF, CCF). Si aplica la exoneración del Art. 114-1 E.T., solo incluirá Caja de Compensación para trabajadores de < 10 SMMLV.",
    tope: "Dato informativo."
  },
  "36": {
    titulo: "Efectivo y equivalentes de efectivo",
    art: "Art. 261, 267 y 268 E.T.",
    concepto: "Saldos a 31 de diciembre en caja general, cajas menores, depósitos bancarios, cuentas de ahorros y fiducias.",
    como_llenar: "Registre el saldo fiscal conciliado de efectivo y bancos al cierre del año gravable.",
    tope: "Valor patrimonial fiscal a 31 de diciembre."
  },
  "37": {
    titulo: "Inversiones e instrumentos derivados",
    art: "Art. 271, 272 y 273 E.T.",
    concepto: "Acciones, cuotas o partes de interés social, títulos de deuda, CDTs y fondos de inversión a costo fiscal.",
    como_llenar: "Registre el costo fiscal de las inversiones financieras determinado según los Arts. 271 y 272 E.T.",
    tope: "Costo fiscal de adquisición o valor intrínseco según corresponda."
  },
  "38": {
    titulo: "Cuentas, documentos y arrendamientos financieros por cobrar",
    art: "Art. 270 E.T.",
    concepto: "Cartera de clientes, anticipos a proveedores, préstamos a socios y cuentas por cobrar fiscales netas de provisión deducible.",
    como_llenar: "Sume los créditos fiscales a favor de la empresa menos el deterioro fiscal permitido (Art. 145 E.T.).",
    tope: "Valor nominal o saldo insoluto a 31 de diciembre."
  },
  "39": {
    titulo: "Inventarios",
    art: "Art. 62 a 66 E.T.",
    concepto: "Mercancías para la venta, materias primas, productos en proceso y productos terminados valorados por costo fiscal.",
    como_llenar: "Registre el saldo fiscal de inventarios determinado por sistema de juego de inventarios o inventario permanente.",
    tope: "Costo de adquisición o transformación según Art. 66 E.T."
  },
  "40": {
    titulo: "Activos intangibles",
    art: "Art. 74, 74-1 y 279 E.T.",
    concepto: "Patentes, marcas, licencias, software, derechos de autor y plusvalía adquirida a costo fiscal neto de amortización.",
    como_llenar: "Registre el costo fiscal de adquisición menos las amortizaciones fiscales acumuladas procedentes.",
    tope: "Costo fiscal neto acumulado."
  },
  "41": {
    titulo: "Activos biológicos",
    art: "Art. 92 a 95 y 276-1 E.T.",
    concepto: "Plantas y animales vivos clasificados como productores o consumibles al costo de adquisición o transformación.",
    como_llenar: "Valore los activos biológicos al costo histórico acumulado según las reglas especiales de los Arts. 92-95 E.T.",
    tope: "Costo fiscal."
  },
  "42": {
    titulo: "Propiedades, planta y equipo, propiedades de inversión y ANCMV",
    art: "Art. 67 a 73 y 277 E.T.",
    concepto: "Terrenos, edificaciones, maquinaria, equipo de oficina, flota y equipo de transporte al costo fiscal ajustado neto de depreciación.",
    como_llenar: "Registre el costo fiscal determinado por Art. 69 o reajuste fiscal (Art. 70/73 E.T.) menos depreciación acumulada fiscal.",
    tope: "Costo fiscal neto de depreciación acumulada."
  },
  "43": {
    titulo: "Otros activos",
    art: "Art. 261 E.T.",
    concepto: "Gastos pagados por anticipado, depósitos en garantía, activos por impuestos corrientes y demás partidas del activo.",
    como_llenar: "Registre el saldo fiscal a 31 de diciembre de todos los demás bienes y derechos apreciables en dinero.",
    tope: "Valor nominal o costo fiscal."
  },
  "44": {
    titulo: "Total patrimonio bruto",
    art: "Art. 261 E.T.",
    concepto: "Suma total de todos los bienes y derechos apreciables en dinero poseídos dentro del país y en el exterior.",
    como_llenar: "Suma de las casillas 36 a 43.",
    tope: "Casilla 44 = c36 + c37 + c38 + c39 + c40 + c41 + c42 + c43."
  },
  "45": {
    titulo: "Pasivos",
    art: "Art. 283 a 287 E.T.",
    concepto: "Total de deudas fiscales respaldadas por documentos idóneos con fecha cierta al 31 de diciembre.",
    como_llenar: "Registre las obligaciones financieras, cuentas por pagar comerciales, laborales y fiscales ciertas y vigentes.",
    tope: "Deudas debidamente soportadas según Art. 283 E.T."
  },
  "46": {
    titulo: "Total patrimonio líquido",
    art: "Art. 282 E.T.",
    concepto: "Diferencia entre el patrimonio bruto y el total de deudas fiscales a cargo de la sociedad a 31 de diciembre.",
    como_llenar: "Casilla 44 menos Casilla 45. Si los pasivos superan los activos, se registra cero ($0).",
    tope: "Casilla 46 = max(0, c44 - c45)."
  },
  "47": {
    titulo: "Ingresos brutos de actividades ordinarias",
    art: "Art. 28 E.T.",
    concepto: "Ingresos procedentes de la venta de bienes y prestación de servicios del objeto social devengados en el año.",
    como_llenar: "Registre el total de facturación e ingresos ordinarios devengados comercial y fiscalmente.",
    tope: "Ingresos brutos devengados en el año."
  },
  "48": {
    titulo: "Ingresos financieros",
    art: "Art. 28 E.T.",
    concepto: "Intereses, rendimientos financieros, descuentos concedidos y fluctuación de divisas devengados en el ejercicio.",
    como_llenar: "Registre los rendimientos financieros certificados por entidades financieras o vinculados económicos.",
    tope: "Valor fiscal devengado."
  },
  "49": {
    titulo: "Dividendos y/o participaciones no constitutivos de renta ni ganancia ocasional",
    art: "Art. 48 y 49 E.T.",
    concepto: "Dividendos recibidos de sociedades nacionales distribuidos como no gravados según el cálculo del Art. 49 E.T.",
    como_llenar: "Registre los dividendos no gravados recibidos y certificados por las sociedades distribuidoras.",
    tope: "Certificado de dividendos Art. 49 E.T."
  },
  "51": {
    titulo: "Dividendos gravados a la tarifa general",
    art: "Art. 240 E.T.",
    concepto: "Dividendos recibidos provenientes de utilidades gravadas en cabeza de la sociedad que los distribuye.",
    como_llenar: "Registre los dividendos gravados a la tarifa general del 35% certificados por la sociedad emisora.",
    tope: "Certificado de dividendos gravados."
  },
  "58": {
    titulo: "Total ingresos brutos",
    art: "Art. 26 E.T.",
    concepto: "Suma consolidada de todos los ingresos brutos operacionales, financieros, dividendos y extraordinarios.",
    como_llenar: "Suma de las casillas 47 a 57.",
    tope: "Casilla 58 = Suma(c47..c57)."
  },
  "59": {
    titulo: "Devoluciones, rebajas y descuentos",
    art: "Art. 26 E.T.",
    concepto: "Devoluciones efectivas de mercancías, rescisiones contractuales, rebajas y descuentos comerciales a clientes.",
    como_llenar: "Registre las notas crédito y devoluciones en ventas soportadas con factura electrónica.",
    tope: "Monto soportado en notas crédito electrónicas."
  },
  "60": {
    titulo: "Ingresos no constitutivos de renta ni ganancia ocasional",
    art: "Art. 36 a 57 E.T.",
    concepto: "Partidas de ingreso expresamente calificadas por la ley tributaria como no constitutivas de renta.",
    como_llenar: "Sume dividendos no gravados (c49), indemnizaciones por daño emergente (Art. 45), incentivo a la capitalización rural (Art. 52), etc.",
    tope: "Limitado a los conceptos taxativos de la ley."
  },
  "61": {
    titulo: "Total ingresos netos",
    art: "Art. 26 E.T.",
    concepto: "Ingresos brutos depurados de devoluciones y partidas no constitutivas de renta.",
    como_llenar: "Casilla 58 menos Casilla 59 menos Casilla 60.",
    tope: "Casilla 61 = max(0, c58 - c59 - c60)."
  },
  "62": {
    titulo: "Costos",
    art: "Art. 58 a 88 y 107 E.T.",
    concepto: "Costo fiscal de los bienes vendidos o servicios prestados debidamente soportados con nómina y factura electrónica.",
    como_llenar: "Registre el costo fiscal procedente determinado según el sistema de costeo legalmente aplicable.",
    tope: "Costos con soporte electrónico y bancarización (Art. 771-2 y 771-5 E.T.)."
  },
  "63": {
    titulo: "Gastos de administración",
    art: "Art. 107 E.T.",
    concepto: "Gastos operacionales de administración con relación de causalidad, necesidad y proporcionalidad comercial.",
    como_llenar: "Registre sueldos administrativos, arriendos, servicios, asesorías, seguros y depreciación de bienes administrativos.",
    tope: "Cumplimiento de causalidad, necesidad y proporcionalidad."
  },
  "64": {
    titulo: "Gastos de distribución y ventas",
    art: "Art. 107 E.T.",
    concepto: "Gastos incurridos para la comercialización, mercadeo, fletes, comisiones de ventas y distribución de productos.",
    como_llenar: "Registre sueldos de ventas, publicidad, fletes, comisiones y empaques con relación de causalidad.",
    tope: "Gastos procedentes con soporte electrónico."
  },
  "65": {
    titulo: "Gastos financieros",
    art: "Art. 107 y 118-1 E.T.",
    concepto: "Intereses, comisiones bancarias y gastos de financiación, controlando el límite de subcapitalización (endeudamiento con vinculados).",
    como_llenar: "Registre intereses comerciales y bancarios. Si tiene deudas con vinculados, valide el límite de 2 veces el patrimonio líquido (Art. 118-1 E.T.).",
    tope: "Límite de subcapitalización Art. 118-1 E.T."
  },
  "66": {
    titulo: "Otros gastos y deducciones",
    art: "Art. 107, 108 y siguientes E.T.",
    concepto: "Impuestos deducibles (50% GMF Art. 115, 100% predial y vehicular vinculados al negocio), deducción primer empleo (Art. 108-5), etc.",
    como_llenar: "Registre otras deducciones especiales permitidas por el Estatuto Tributario.",
    tope: "Partidas deducibles con soporte."
  },
  "67": {
    titulo: "Total costos y gastos deducibles",
    art: "Art. 107 E.T.",
    concepto: "Consolidación de todos los costos procedentes y gastos deducibles del ejercicio fiscal.",
    como_llenar: "Suma de las casillas 62, 63, 64, 65 y 66.",
    tope: "Casilla 67 = c62 + c63 + c64 + c65 + c66."
  },
  "72": {
    titulo: "Renta líquida ordinaria del ejercicio",
    art: "Art. 26 y 178 E.T.",
    concepto: "Utilidad fiscal neta del ejercicio antes de compensación de pérdidas fiscales.",
    como_llenar: "Ingresos netos (c61) más recuperaciones (c70) menos total costos y gastos (c67). Si el resultado es negativo se coloca $0 y se lleva a Casilla 73.",
    tope: "Casilla 72 = max(0, c61 + c70 - c67)."
  },
  "73": {
    titulo: "Pérdida líquida del ejercicio",
    art: "Art. 147 E.T.",
    concepto: "Exceso de costos y deducciones sobre los ingresos netos del año gravable.",
    como_llenar: "Si los costos y gastos (c67) superan los ingresos netos, registre la diferencia positiva aquí.",
    tope: "Compensable en los 12 periodos gravables siguientes (Art. 147 E.T.)."
  },
  "74": {
    titulo: "Compensaciones",
    art: "Art. 147 y 189 E.T.",
    concepto: "Pérdidas fiscales acumuladas de años anteriores y excesos de renta presuntiva compensables.",
    como_llenar: "Registre el monto de pérdidas fiscales a compensar sin superar la Renta Líquida Ordinaria de la casilla 72.",
    tope: "Límite: no puede generar pérdida fiscal en el ejercicio."
  },
  "75": {
    titulo: "Renta líquida",
    art: "Art. 178 E.T.",
    concepto: "Renta líquida ordinaria depurada de pérdidas fiscales compensadas.",
    como_llenar: "Casilla 72 menos Casilla 74.",
    tope: "Casilla 75 = max(0, c72 - c74)."
  },
  "77": {
    titulo: "Rentas exentas",
    art: "Art. 235-2 E.T.",
    concepto: "Rentas legalmente exentas (ej. venta de energía renovable, transporte fluvial sostenible, plantaciones forestales).",
    como_llenar: "Registre el valor de las rentas con exención legal vigente aplicable a personas jurídicas.",
    tope: "Limitado a la renta líquida de la casilla 75."
  },
  "79": {
    titulo: "Renta líquida gravable",
    art: "Art. 240 y 241 E.T.",
    concepto: "Base impositiva final sobre la cual se aplica la tarifa del impuesto sobre la renta.",
    como_llenar: "Renta líquida (c75) menos rentas exentas (c77) más rentas gravables (c78).",
    tope: "Casilla 79 = max(0, c75 - c77 + c78)."
  },
  "80": {
    titulo: "Ingresos por ganancias ocasionales",
    art: "Art. 300 a 316 E.T.",
    concepto: "Ingresos por venta de activos fijos poseídos por 2 o más años, herencias o utilidades en liquidación de sociedades.",
    como_llenar: "Registre el precio de enajenación de bienes raíces, maquinaria o vehículos poseídos más de 2 años.",
    tope: "Valor comercial de la enajenación."
  },
  "81": {
    titulo: "Costos por ganancias ocasionales",
    art: "Art. 307 a 312 E.T.",
    concepto: "Costo fiscal del activo fijo enajenado determinado según reajuste fiscal (Art. 70/73) o costo de adquisición.",
    como_llenar: "Registre el costo fiscal a la fecha de venta sin que pueda superar el precio de venta.",
    tope: "Costo fiscal del activo vendido."
  },
  "82": {
    titulo: "Ganancias ocasionales no gravadas y exentas",
    art: "Art. 307 a 311-1 E.T.",
    concepto: "Partidas exentas de ganancia ocasional reconocidas por la ley tributaria.",
    como_llenar: "Registre las ganancias exentas procedentes.",
    tope: "Topes en UVT según el concepto normativo."
  },
  "83": {
    titulo: "Ganancias ocasionales gravables",
    art: "Art. 300 E.T.",
    concepto: "Base gravable para la liquidación del impuesto de ganancias ocasionales.",
    como_llenar: "Casilla 80 menos Casilla 81 menos Casilla 82.",
    tope: "Casilla 83 = max(0, c80 - c81 - c82)."
  },
  "84": {
    titulo: "Sobre la renta líquida gravable (Impuesto Básico)",
    art: "Art. 240 E.T.",
    concepto: "Impuesto sobre la renta calculado aplicando la tarifa general (35%) o tarifa preferencial (ej. 20% Zonas Francas, 15% Hoteles).",
    como_llenar: "Multiplique la Renta Líquida Gravable (c79) por la tarifa general (35%) o preferencial aplicable.",
    tope: "Casilla 84 = round(c79 * Tarifa / 1000) * 1000."
  },
  "85": {
    titulo: "Puntos adicionales (Sobretasas)",
    art: "Art. 240 Parágrafos 2, 3 y 4 E.T.",
    concepto: "Sobretasa financiera (+5% si RLG >= 120.000 UVT), hidroeléctricas (+3% si RLG >= 30.000 UVT) o minero-petrolera (+5% a +15%).",
    como_llenar: "Calcule los puntos porcentuales adicionales aplicados sobre la Renta Líquida Gravable (c79).",
    tope: "Aplica según actividad económica y umbrales de UVT."
  },
  "91": {
    titulo: "Total impuesto sobre las rentas líquidas gravables",
    art: "Art. 240 E.T.",
    concepto: "Consolidación del impuesto básico sobre la renta líquida más sobretasas e impuesto sobre dividendos.",
    como_llenar: "Suma de las casillas 84 a 90.",
    tope: "Casilla 91 = c84 + c85 + c86 + c87 + c88 + c89 + c90."
  },
  "93": {
    titulo: "Descuentos tributarios",
    art: "Art. 254 a 258 E.T.",
    concepto: "Descuento por impuestos pagados en el exterior (Art. 254), donaciones a ESAL (25% Art. 257) y descuento del 50% del ICA pagado (Art. 115 E.T.).",
    como_llenar: "Registre los descuentos procedentes sin que superen el límite legal (Art. 259 E.T.).",
    tope: "Límite: no puede exceder el impuesto básico de renta (Casilla 91)."
  },
  "94": {
    titulo: "Impuesto neto de renta sin adición",
    art: "Art. 240 y 259 E.T.",
    concepto: "Impuesto sobre las rentas líquidas depurado de descuentos tributarios.",
    como_llenar: "Casilla 91 más Casilla 92 menos Casilla 93.",
    tope: "Casilla 94 = max(0, c91 + c92 - c93)."
  },
  "95": {
    titulo: "Impuesto a adicionar (IA - TTD Tasa Mínima 15%)",
    art: "Art. 240 Parágrafo 6 E.T.",
    concepto: "Impuesto a Adicionar (IA) exigido por la ley cuando la Tasa de Tributación Depurada (TTD = ID / UD) es inferior al 15%.",
    como_llenar: "Si TTD < 15%, calcule IA = (UD * 15%) - ID y regístrelo en esta casilla. Si TTD >= 15%, el valor es cero ($0).",
    tope: "Impuesto requerido para alcanzar la tasa efectiva mínima del 15% sobre la Utilidad Depurada."
  },
  "96": {
    titulo: "Impuesto neto de renta con adición",
    art: "Art. 240 Par. 6 E.T.",
    concepto: "Impuesto neto definitivo sobre la renta incorporando el ajuste de la tasa mínima de tributación.",
    como_llenar: "Casilla 94 más Casilla 95.",
    tope: "Casilla 96 = c94 + c95."
  },
  "97": {
    titulo: "Impuesto de ganancias ocasionales",
    art: "Art. 313 y 314 E.T.",
    concepto: "Impuesto del 15% sobre las ganancias ocasionales gravables generadas en el año.",
    como_llenar: "Casilla 83 multiplicada por el 15% (tarifa general de ganancias ocasionales).",
    tope: "Casilla 97 = round(c83 * 0.15 / 1000) * 1000."
  },
  "99": {
    titulo: "Total impuesto a cargo",
    art: "Art. 240 y 313 E.T.",
    concepto: "Impuesto total a cargo de la sociedad por el año gravable (Renta + Ganancias Ocasionales).",
    como_llenar: "Casilla 96 más Casilla 97 menos Casilla 98.",
    tope: "Casilla 99 = c96 + c97 - c98."
  },
  "105": {
    titulo: "Autorretenciones",
    art: "Decreto 2201 de 2016 y Art. 365 E.T.",
    concepto: "Autorretenciones especiales del impuesto sobre la renta practicadas y pagadas en los Formularios 350 del año.",
    como_llenar: "Sume las autorretenciones a título de renta efectivamente declaradas y pagadas mensualmente en el año.",
    tope: "Certificado o formularios 350 pagados."
  },
  "106": {
    titulo: "Otras retenciones",
    art: "Art. 373 y 374 E.T.",
    concepto: "Retenciones en la fuente a título de renta practicadas por clientes a la empresa durante el año.",
    como_llenar: "Sume los certificados de retención en la fuente expedidos por agentes retenedores.",
    tope: "Certificados de retención en la fuente válidos."
  },
  "107": {
    titulo: "Total retenciones año gravable a declarar",
    art: "Art. 373 E.T.",
    concepto: "Suma de todas las autorretenciones y retenciones en la fuente aplicables como crédito contra el impuesto.",
    como_llenar: "Casilla 105 más Casilla 106.",
    tope: "Casilla 107 = c105 + c106."
  },
  "108": {
    titulo: "Anticipo renta año gravable siguiente",
    art: "Art. 807 E.T.",
    concepto: "Anticipo obligatorio del impuesto sobre la renta para el año siguiente (25% primer año, 50% segundo, 75% siguientes).",
    como_llenar: "Calcule según el sistema 1 (impuesto neto) o sistema 2 (promedio 2 años), multiplique por el porcentaje de anticipo y reste las retenciones de la casilla 107.",
    tope: "Cálculo según Art. 807 E.T."
  },
  "110": {
    titulo: "Anticipo puntos adicionales año gravable siguiente",
    art: "Art. 240 Parágrafo 2 E.T.",
    concepto: "Anticipo del 100% de los puntos adicionales de la sobretasa financiera exigido a entidades financieras para el año siguiente.",
    como_llenar: "Si aplica sobretasa financiera (c85), traslade el 100% del valor a esta casilla.",
    tope: "100% de la sobretasa del ejercicio."
  },
  "112": {
    titulo: "Sanciones",
    art: "Art. 639, 640, 641 y 644 E.T.",
    concepto: "Sanciones por extemporaneidad en la presentación o por corrección voluntaria de la declaración.",
    como_llenar: "Calcule la sanción aplicando las reducciones del Art. 640 E.T. si cumple requisitos (sin ser inferior a 10 UVT).",
    tope: "Sanción mínima legal de 10 UVT (Art. 639 E.T.)."
  },
  "113": {
    titulo: "Total saldo a pagar",
    art: "Art. 801 E.T.",
    concepto: "Valor neto a pagar a favor de la DIAN derivado de la liquidación privada del Formulario 110.",
    como_llenar: "Total Impuesto a cargo (c99) + Anticipos (c108+c110) + Sanciones (c112) - Retenciones (c107) - Anticipo anterior (c103+c109) - Saldo a favor (c104).",
    tope: "Monto positivo a pagar a la DIAN."
  },
  "114": {
    titulo: "Total saldo a favor",
    art: "Art. 815 y 850 E.T.",
    concepto: "Excedente a favor de la empresa generado cuando los anticipos y retenciones superan el impuesto a cargo y sanciones.",
    como_llenar: "Si los créditos fiscales superan los débitos, registre la diferencia positiva aquí.",
    tope: "Susceptible de imputación al año siguiente o solicitud de devolución."
  },
  "980": {
    titulo: "PAGO TOTAL $",
    art: "Art. 801 E.T.",
    concepto: "Valor monetario que se cancela en bancos o PSE simultáneamente con la presentación del formulario.",
    como_llenar: "Coincide con la Casilla 113. Se traslada al recibo oficial de pago Formulario 490.",
    tope: "Monto a pagar."
  }
};

/* =========================================================================
   BASE DE CONOCIMIENTO EXHAUSTIVA - FORMULARIO 260 DIAN (RÉGIMEN SIMPLE)
   Declaración Anual Consolidada Régimen Simple de Tributación (SIMPLE)
   ========================================================================= */

export const CASILLAS_INFO_F260: Record<string, CasillaInfo> = {
  "1": {
    titulo: "Año Gravable",
    art: "Art. 903 a 916 E.T.",
    concepto: "Año gravable objeto de consolidación anual del Régimen Simple de Tributación.",
    como_llenar: "Año de 4 dígitos correspondiente al periodo consolidado.",
    tope: "Año fiscal de 4 dígitos."
  },
  "4": {
    titulo: "Número de Formulario",
    art: "Art. 578 E.T.",
    concepto: "Consecutivo único asignado por los servicios digitales de la DIAN.",
    como_llenar: "Generado automáticamente por el Muisca.",
    tope: "13 dígitos numéricos."
  },
  "5": {
    titulo: "Número de Identificación Tributaria (NIT / Cédula)",
    art: "Art. 555-1 E.T.",
    concepto: "Identificación tributaria del contribuyente inscrito en el Régimen Simple.",
    como_llenar: "Número del NIT o cédula de ciudadanía sin dígito de verificación.",
    tope: "Máximo 10 dígitos."
  },
  "6": {
    titulo: "Dígito de Verificación (DV)",
    art: "Art. 555-2 E.T.",
    concepto: "Dígito de seguridad módulo 11.",
    como_llenar: "Generado automáticamente.",
    tope: "1 dígito del 0 al 9."
  },
  "11": {
    titulo: "Razón Social o Nombres y Apellidos",
    art: "Art. 555-2 E.T.",
    concepto: "Identificación legal de la persona natural o jurídica adscrita al SIMPLE.",
    como_llenar: "Razón social o nombres y apellidos completos tal como figuran en el RUT.",
    tope: "Texto alfanumérico."
  },
  "28": {
    titulo: "Patrimonio bruto",
    art: "Art. 261 E.T.",
    concepto: "Total de bienes y derechos apreciables en dinero poseídos dentro y fuera de Colombia a 31 de diciembre.",
    como_llenar: "Sume el valor fiscal de cuentas bancarias, inmuebles, vehículos, inventarios e inversiones.",
    tope: "Valor patrimonial bruto a 31 de diciembre."
  },
  "29": {
    titulo: "Pasivos",
    art: "Art. 283 E.T.",
    concepto: "Total de obligaciones financieras y deudas debidamente soportadas al cierre del ejercicio.",
    como_llenar: "Registre el saldo insoluto de las deudas a 31 de diciembre.",
    tope: "Pasivos reales y exigibles."
  },
  "30": {
    titulo: "Patrimonio líquido",
    art: "Art. 282 E.T.",
    concepto: "Patrimonio bruto menos el total de pasivos a 31 de diciembre.",
    como_llenar: "Casilla 28 menos Casilla 29.",
    tope: "Casilla 30 = max(0, c28 - c29)."
  },
  "31": {
    titulo: "Ingresos brutos Grupo 1 (País)",
    art: "Art. 908 Numeral 1 E.T.",
    concepto: "Ingresos de tiendas pequeñas, minimercados, micromercados y peluquerías obtenidos en Colombia.",
    como_llenar: "Registre las ventas brutas devengadas en el país para este grupo (Tarifas 1.2% a 5.6%).",
    tope: "Hasta 100.000 UVT."
  },
  "33": {
    titulo: "Ingresos brutos Grupo 2 (País)",
    art: "Art. 908 Numeral 2 E.T.",
    concepto: "Ingresos por comercio al por mayor y menor, industria, servicios técnicos y mecánicos en Colombia.",
    como_llenar: "Registre las ventas del sector comercial e industrial nacional (Tarifas 1.6% a 4.5%).",
    tope: "Hasta 100.000 UVT."
  },
  "35": {
    titulo: "Ingresos brutos Grupo 3 (País)",
    art: "Art. 908 Numeral 3 E.T.",
    concepto: "Ingresos por expendio de comidas y bebidas (restaurantes, bares, cafeterías) y actividades de transporte en Colombia.",
    como_llenar: "Registre los ingresos brutos del sector restaurantes y transporte (Tarifas 1.6% a 4.5% + INC 8%).",
    tope: "Hasta 100.000 UVT."
  },
  "37": {
    titulo: "Ingresos brutos Grupo 4 (País)",
    art: "Art. 908 Numeral 4 E.T.",
    concepto: "Ingresos por servicios de educación y actividades de atención de la salud humana y de asistencia social.",
    como_llenar: "Registre los ingresos brutos por servicios educativos y médicos (Tarifas 3.7% a 5.9%).",
    tope: "Hasta 100.000 UVT."
  },
  "39": {
    titulo: "Ingresos brutos Grupo 5 (País)",
    art: "Art. 908 Numeral 5 E.T.",
    concepto: "Ingresos por servicios profesionales, científicos, asesorías, consultorías y profesiones liberales.",
    como_llenar: "Registre los ingresos de servicios profesionales (Tarifas 7.3% a 12.0%).",
    tope: "Límite especial de 12.000 UVT anuales."
  },
  "41": {
    titulo: "Ingresos brutos Grupo 6 (País)",
    art: "Art. 908 Numeral 6 E.T.",
    concepto: "Ingresos por reciclaje, recuperación de materiales y recolección de residuos (CIIU 4665, 3830, 3811).",
    como_llenar: "Registre las ventas de materiales reciclables (Tarifa fija reducida del 1.62%).",
    tope: "Hasta 100.000 UVT."
  },
  "43": {
    titulo: "Total ingresos brutos sin ganancias ocasionales",
    art: "Art. 904 E.T.",
    concepto: "Suma consolidada de todos los ingresos brutos del año obtenidos en Colombia y en el exterior.",
    como_llenar: "Suma de las casillas 31 a 42.",
    tope: "Casilla 43 = Suma(c31..c42)."
  },
  "44": {
    titulo: "Ingresos no constitutivos de renta ni ganancia ocasional",
    art: "Art. 36 a 57 y 904 E.T.",
    concepto: "Ingresos no constitutivos de renta válidamente detraíbles de la base gravable del SIMPLE.",
    como_llenar: "Registre los ingresos que por ley no son constitutivos de renta ni ganancia ocasional.",
    tope: "Casilla 44."
  },
  "45": {
    titulo: "Total ingresos gravables",
    art: "Art. 904 y 908 E.T.",
    concepto: "Base gravable definitiva sobre la cual se calcula el Impuesto SIMPLE consolidado.",
    como_llenar: "Casilla 43 menos Casilla 44.",
    tope: "Casilla 45 = max(0, c43 - c44)."
  },
  "46": {
    titulo: "Impuesto SIMPLE",
    art: "Art. 908 E.T.",
    concepto: "Impuesto SIMPLE consolidado determinado aplicando la tabla progresiva según grupo de actividad e ingresos en UVT.",
    como_llenar: "Multiplique los ingresos gravables (c45) por la tarifa porcentual que corresponda al rango en UVT.",
    tope: "Casilla 46 = round(c45 * Tarifa / 1000) * 1000."
  },
  "47": {
    titulo: "Componente ICA territorial consolidado",
    art: "Art. 907 y 908 E.T.",
    concepto: "Parte del Impuesto SIMPLE que corresponde al Impuesto de Industria y Comercio (ICA) transferido a los municipios.",
    como_llenar: "Valor del ICA liquidado con las tarifas municipales consolidadas en el SIMPLE.",
    tope: "Parte territorial que se descuenta del componente nacional."
  },
  "48": {
    titulo: "Valor componente SIMPLE nacional",
    art: "Art. 907 E.T.",
    concepto: "Porción del impuesto que ingresa a las arcas de la Nación (recaudo DIAN).",
    como_llenar: "Casilla 46 menos Casilla 47.",
    tope: "Casilla 48 = max(0, c46 - c47)."
  },
  "49": {
    titulo: "Descuento por aportes a pensión a cargo del empleador",
    art: "Art. 903 E.T.",
    concepto: "Descuento tributario directo del 100% de los aportes obligatorios al fondo de pensiones a cargo del empleador (12%).",
    como_llenar: "Sume los aportes a pensión de la nómina pagados oportunamente en el año.",
    tope: "Limitado al valor de la Casilla 48 (Componente Nacional)."
  },
  "50": {
    titulo: "Descuento por ventas con medios de pago electrónicos",
    art: "Art. 912 E.T.",
    concepto: "Descuento tributario equivalente al 0.5% de todas las ventas cobradas mediante tarjetas de débito, crédito o canales electrónicos.",
    como_llenar: "Multiplique el total de ventas cobradas con datafonos, pasarelas de pago o transferencias por 0.5%.",
    tope: "0.5% de las ventas electrónicas certificadas por entidades financieras."
  },
  "52": {
    titulo: "Total descuentos",
    art: "Art. 903 y 912 E.T.",
    concepto: "Suma de los descuentos de pensión de empleador, 0.5% de medios electrónicos y GMF.",
    como_llenar: "Suma de las casillas 49, 50 y 51. No puede superar el Componente SIMPLE Nacional (Casilla 48).",
    tope: "Casilla 52 = min(c48, c49 + c50 + c51)."
  },
  "53": {
    titulo: "Impuesto neto SIMPLE",
    art: "Art. 908 E.T.",
    concepto: "Componente SIMPLE nacional depurado de descuentos tributarios.",
    como_llenar: "Casilla 48 menos Casilla 52.",
    tope: "Casilla 53 = max(0, c48 - c52)."
  },
  "54": {
    titulo: "Retenciones en la fuente antes de pertenecer al SIMPLE",
    art: "Art. 911 E.T.",
    concepto: "Retenciones practicadas antes de optar por el SIMPLE en el mismo año gravable.",
    como_llenar: "Registre el saldo de retenciones certificadas sufridas antes de ingresar al régimen.",
    tope: "Certificados de retención."
  },
  "56": {
    titulo: "Anticipos SIMPLE efectivamente pagados en el año",
    art: "Art. 910 E.T.",
    concepto: "Suma de los anticipos bimestrales del componente SIMPLE pagados en los 6 Formularios 2593 del año.",
    como_llenar: "Sume los valores efectivamente pagados en los recibos electrónicos bimestrales F-2593.",
    tope: "Suma de las casillas 96 a 101."
  },
  "58": {
    titulo: "Saldo a pagar por impuesto SIMPLE",
    art: "Art. 910 E.T.",
    concepto: "Diferencia a pagar del impuesto nacional SIMPLE tras descontar retenciones y anticipos bimestrales.",
    como_llenar: "Casilla 53 menos (c54 + c55 + c56 + c57).",
    tope: "Casilla 58 = max(0, c53 - (c54+c55+c56+c57))."
  },
  "63": {
    titulo: "Total saldo a pagar SIMPLE",
    art: "Art. 910 E.T.",
    concepto: "Saldo final a pagar del impuesto SIMPLE incluyendo sanciones.",
    como_llenar: "Casilla 58 más Casilla 62 (Total sanciones).",
    tope: "Casilla 63 = c58 + c62."
  },
  "64": {
    titulo: "Total saldo a favor SIMPLE",
    art: "Art. 910 E.T.",
    concepto: "Saldo a favor generado cuando los anticipos bimestrales y retenciones superan el impuesto SIMPLE anual.",
    como_llenar: "Diferencia positiva de los créditos frente al impuesto y sanciones.",
    tope: "Imputable a los anticipos del año siguiente o devolución."
  },
  "69": {
    titulo: "Ingresos gravados por servicio de comidas y bebidas (INC)",
    art: "Art. 512-1 y Art. 908 Parágrafo 1 E.T.",
    concepto: "Ingresos brutos por venta de alimentos y bebidas preparados en restaurantes, cafeterías, panaderías y bares.",
    como_llenar: "Registre el total de ventas por comidas y bebidas preparadas.",
    tope: "Ventas brutas del servicio de comidas y bebidas."
  },
  "70": {
    titulo: "Impuesto nacional al consumo (INC 8%)",
    art: "Art. 512-1 E.T.",
    concepto: "Impuesto del 8% sobre los ingresos del servicio de comidas y bebidas.",
    como_llenar: "Multiplique la Casilla 69 por el 8% (0.08).",
    tope: "Casilla 70 = round(c69 * 0.08 / 1000) * 1000."
  },
  "71": {
    titulo: "INC efectivamente pagado en anticipos bimestrales",
    art: "Art. 910 E.T.",
    concepto: "Suma de los valores de INC pagados en los 6 anticipos bimestrales Formulario 2593.",
    como_llenar: "Suma de los anticipos pagados de INC en el año (Casillas 102 a 107).",
    tope: "Suma de recibos 2593 pagados de INC."
  },
  "78": {
    titulo: "Total saldo a pagar INC",
    art: "Art. 512-1 y 910 E.T.",
    concepto: "Saldo final a pagar del Impuesto Nacional al Consumo anual más sanciones.",
    como_llenar: "Casilla 73 más Casilla 77.",
    tope: "Monto a pagar de INC."
  },
  "79": {
    titulo: "Total saldo a favor INC",
    art: "Art. 910 E.T.",
    concepto: "Saldo a favor de INC cuando los anticipos superan el impuesto consolidado anual.",
    como_llenar: "Exceso de anticipos de INC frente al impuesto liquidado.",
    tope: "Imputable al año siguiente."
  },
  "80": {
    titulo: "Ingresos por ganancias ocasionales",
    art: "Art. 300 a 316 y 908 E.T.",
    concepto: "Ingresos por venta de activos fijos poseídos por 2 o más años, herencias o loterías.",
    como_llenar: "Registre el precio de venta o enajenación del activo fijo.",
    tope: "Ingresos brutos de ganancia ocasional."
  },
  "84": {
    titulo: "Impuesto de ganancias ocasionales (15%)",
    art: "Art. 313 y 314 E.T.",
    concepto: "Impuesto sobre las ganancias ocasionales gravables liquidado a la tarifa general del 15%.",
    como_llenar: "Casilla 83 multiplicada por el 15%.",
    tope: "Casilla 84 = round(c83 * 0.15 / 1000) * 1000."
  },
  "94": {
    titulo: "Total saldo a pagar Ganancias Ocasionales",
    art: "Art. 908 E.T.",
    concepto: "Saldo final a pagar por concepto de Ganancias Ocasionales más sanciones.",
    como_llenar: "Casilla 89 más Casilla 93.",
    tope: "Monto a pagar por GO."
  },
  "980": {
    titulo: "PAGO TOTAL $",
    art: "Art. 801 y 910 E.T.",
    concepto: "Consolidado total a pagar en la declaración anual del SIMPLE (Suma de saldos a pagar SIMPLE + ICA + INC + Ganancias Ocasionales).",
    como_llenar: "Casilla 63 (SIMPLE) + Casilla 68 (ICA) + Casilla 78 (INC) + Casilla 94 (GO).",
    tope: "Casilla 980 = c63 + c68 + c78 + c94."
  }
};

/* =========================================================================
   BASE DE CONOCIMIENTO - FORMULARIO 350 DIAN (RETENCIÓN EN LA FUENTE)
   ========================================================================= */
export const CASILLAS_INFO_F350: Record<string, CasillaInfo> = {
  "1": {
    titulo: "Año",
    art: "Art. 378 y 604 E.T.",
    concepto: "Año gravable al que corresponde el periodo mensual declarado.",
    como_llenar: "Año de 4 dígitos (ej: 2026).",
    tope: "Obligación mensual."
  },
  "2": {
    titulo: "Período (Mes)",
    art: "Art. 604 E.T.",
    concepto: "Mes del año fiscal correspondiente a la declaración (01 a 12).",
    como_llenar: "Número del mes de enero (01) a diciembre (12).",
    tope: "Mes 1 a 12."
  },
  "28": {
    titulo: "Base pagos o abonos por rentas de trabajo",
    art: "Art. 383 y 388 E.T.",
    concepto: "Base gravable total depurada de nómina y salarios pagados en el mes a trabajadores.",
    como_llenar: "Sumatoria de las bases depuradas de los trabajadores sujetas a retención.",
    tope: "Base sujeta a depuración laboral."
  },
  "29": {
    titulo: "Base honorarios",
    art: "Art. 392 E.T.",
    concepto: "Base de pagos o abonos en cuenta por honorarios donde predomina el factor intelectual.",
    como_llenar: "Valor acumulado de honorarios facturados por personas jurídicas y naturales.",
    tope: "Sin cuantía mínima."
  },
  "30": {
    titulo: "Base comisiones",
    art: "Art. 392 E.T.",
    concepto: "Base de pagos por comisiones mercantiles e intermediación.",
    como_llenar: "Valor total de comisiones pagadas a terceros.",
    tope: "Sin cuantía mínima."
  },
  "31": {
    titulo: "Base servicios",
    art: "Art. 392 E.T.",
    concepto: "Base de pagos por servicios generales donde predomina el factor físico o material.",
    como_llenar: "Servicios con cuantía individual superior a 4 UVT.",
    tope: "Base mínima 4 UVT."
  },
  "32": {
    titulo: "Base arrendamientos",
    art: "Art. 401 E.T.",
    concepto: "Base de pagos por arrendamiento de bienes raíces y bienes muebles.",
    como_llenar: "Arriendos de locales, oficinas (base 27 UVT) y muebles (sin base mínima).",
    tope: "27 UVT en inmuebles."
  },
  "33": {
    titulo: "Base rendimientos financieros e intereses",
    art: "Art. 395 E.T.",
    concepto: "Base de pagos por intereses, rendimientos de títulos y cuentas financieras.",
    como_llenar: "Total intereses pagados o causados.",
    tope: "Cualquier cuantía."
  },
  "35": {
    titulo: "Base compras",
    art: "Art. 401 E.T.",
    concepto: "Base de pagos por adquisición de bienes corporales muebles.",
    como_llenar: "Compras de mercancías e insumos con cuantía superior a 27 UVT.",
    tope: "Base mínima 27 UVT."
  },
  "37": {
    titulo: "Base pagos al exterior a título de renta",
    art: "Art. 406 a 415 E.T.",
    concepto: "Base de pagos o abonos en cuenta realizados a personas o sociedades sin residencia fiscal en Colombia.",
    como_llenar: "Servicios técnicos, software, asistencia técnica, regalías y dividendos al exterior.",
    tope: "Cualquier cuantía."
  },
  "41": {
    titulo: "Total bases de retención a título de renta",
    art: "Formulario 350 DIAN",
    concepto: "Sumatoria de todas las bases gravables de retención de renta del mes.",
    como_llenar: "Suma de Casillas 28 a 40.",
    tope: "Casilla 41 = Suma de bases."
  },
  "42": {
    titulo: "Retención por rentas de trabajo",
    art: "Art. 383 E.T.",
    concepto: "Valor total retenido a los trabajadores por salarios y pagos laborales.",
    como_llenar: "Suma de las retenciones calculadas según la tabla del Art. 383.",
    tope: "Retención laboral del mes."
  },
  "43": {
    titulo: "Retención por honorarios",
    art: "Art. 392 E.T.",
    concepto: "Retenciones practicadas por honorarios (11% declarantes / 10% no declarantes).",
    como_llenar: "Valor retenido a los contratistas de honorarios.",
    tope: "11% o 10%."
  },
  "45": {
    titulo: "Retención por servicios",
    art: "Art. 392 E.T.",
    concepto: "Retenciones practicadas por servicios generales (4% declarantes / 6% no declarantes / 1% transporte).",
    como_llenar: "Total retenido en servicios que superen la base mínima de 4 UVT.",
    tope: "4%, 6% o 1%."
  },
  "49": {
    titulo: "Retención por compras",
    art: "Art. 401 E.T.",
    concepto: "Retenciones practicadas en compras de bienes (2.5% declarantes / 3.5% no declarantes).",
    como_llenar: "Total retenido en compras superiores a 27 UVT.",
    tope: "2.5% o 3.5%."
  },
  "51": {
    titulo: "Retención pagos al exterior renta",
    art: "Art. 408 E.T.",
    concepto: "Retenciones practicadas en giros al exterior (20% servicios/software o 35% paraísos).",
    como_llenar: "Retención del 20% o 35% sobre el valor bruto transferido.",
    tope: "20% / 35%."
  },
  "59": {
    titulo: "Total retenciones de renta practicadas",
    art: "Formulario 350 DIAN",
    concepto: "Suma de todas las retenciones practicadas a terceros a título del impuesto sobre la renta.",
    como_llenar: "Suma de Casillas 42 a 58.",
    tope: "Total retenciones renta."
  },
  "61": {
    titulo: "Base autorretención especial Decreto 2201 de 2016",
    art: "Decreto 2201 de 2016 y Art. 114-1 E.T.",
    concepto: "Ingresos brutos operacionales propios de las personas jurídicas beneficiarias de la exoneración de aportes.",
    como_llenar: "Total facturación bruta del mes de la propia empresa.",
    tope: "Ingresos operacionales propios."
  },
  "62": {
    titulo: "Autorretención especial Decreto 2201 de 2016",
    art: "Decreto 2201 de 2016",
    concepto: "Autorretención calculada aplicando la tarifa CIIU (0.55%, 1.10%, 1.70%, etc.) sobre los ingresos propios.",
    como_llenar: "Casilla 61 multiplicada por la tarifa reglamentaria.",
    tope: "Tarifa CIIU asignada."
  },
  "65": {
    titulo: "Total autorretenciones a título de renta",
    art: "Formulario 350 DIAN",
    concepto: "Suma de la autorretención especial y demás autorretenciones del período.",
    como_llenar: "Casilla 62 + Casilla 64.",
    tope: "Total autorretenciones."
  },
  "68": {
    titulo: "Retención de IVA practicada (ReteIVA 15%)",
    art: "Art. 437-1 E.T.",
    concepto: "Retención del 15% practicada sobre el IVA facturado por proveedores en compras gravadas.",
    como_llenar: "15% del valor facturado por concepto de IVA.",
    tope: "Tarifa del 15%."
  },
  "74": {
    titulo: "Total retenciones a título de IVA",
    art: "Art. 437-1 y 437-2 E.T.",
    concepto: "Suma de retenciones de IVA practicadas a nacionales y prestadores del exterior.",
    como_llenar: "Casilla 68 + Casilla 69.",
    tope: "Total ReteIVA."
  },
  "82": {
    titulo: "Total retenciones del período",
    art: "Formulario 350 DIAN",
    concepto: "Consolidado de retenciones de renta practicadas + autorretenciones + ReteIVA + timbre.",
    como_llenar: "Casilla 59 + Casilla 65 + Casilla 74 + Casilla 81.",
    tope: "Total retenciones brutas."
  },
  "83": {
    titulo: "Sanciones",
    art: "Art. 641 y 644 E.T.",
    concepto: "Sanciones por extemporaneidad o corrección aplicables a la declaración de retención.",
    como_llenar: "Registre el valor liquidado de la sanción (mínimo 10 UVT).",
    tope: "Sanción mínima 10 UVT."
  },
  "84": {
    titulo: "Total saldo a pagar",
    art: "Art. 580-1 E.T.",
    concepto: "Monto total a pagar en bancos mediante el Recibo 490 para que la declaración tenga plena eficacia legal.",
    como_llenar: "Casilla 82 más Casilla 83.",
    tope: "Casilla 84 = Total a pagar."
  }
};

/* =========================================================================
   BASE DE CONOCIMIENTO - FORMULARIO 300 DIAN (IMPUESTO SOBRE LAS VENTAS IVA)
   ========================================================================= */
export const CASILLAS_INFO_F300: Record<string, CasillaInfo> = {
  "1": {
    titulo: "Año",
    art: "Art. 600 E.T.",
    concepto: "Año gravable al que corresponde el periodo de IVA declarado.",
    como_llenar: "Año fiscal de 4 dígitos.",
    tope: "Año gravable."
  },
  "2": {
    titulo: "Período",
    art: "Art. 600 E.T.",
    concepto: "Número del período fiscal (Bimestre 1 a 6 o Cuatrimestre 1 a 3).",
    como_llenar: "Indique el período correspondiente al calendario tributario.",
    tope: "1 a 6 (Bimestral) o 1 a 3 (Cuatrimestral)."
  },
  "27": {
    titulo: "Ingresos por bienes gravados a la tarifa del 5%",
    art: "Art. 468-1 E.T.",
    concepto: "Ingresos brutos por venta de bienes gravados a la tarifa diferencial del 5% (café, pastas, azúcar, etc.).",
    como_llenar: "Valor facturado antes de IVA por venta de bienes al 5%.",
    tope: "Ventas gravadas al 5%."
  },
  "28": {
    titulo: "Ingresos por bienes gravados a la tarifa general (19%)",
    art: "Art. 468 E.T.",
    concepto: "Ingresos brutos por venta de bienes muebles corporales gravados al 19%.",
    como_llenar: "Valor facturado antes de IVA por ventas de bienes a tarifa general.",
    tope: "Ventas gravadas al 19%."
  },
  "29": {
    titulo: "Ingresos por servicios gravados a la tarifa del 5%",
    art: "Art. 468-3 E.T.",
    concepto: "Ingresos por prestación de servicios gravados a la tarifa especial del 5% (medicina prepagada, almacenamiento agrícola).",
    como_llenar: "Valor facturado por servicios gravados al 5%.",
    tope: "Servicios al 5%."
  },
  "30": {
    titulo: "Ingresos por servicios gravados a la tarifa general (19%)",
    art: "Art. 468 E.T.",
    concepto: "Ingresos por prestación de servicios gravados al 19% (honorarios, asesorías, mantenimientos, transporte no excluido).",
    como_llenar: "Valor facturado por servicios a tarifa general.",
    tope: "Servicios al 19%."
  },
  "34": {
    titulo: "Operaciones exentas (Art. 477)",
    art: "Art. 477 E.T.",
    concepto: "Venta de bienes exentos de la canasta básica (carnes, huevos, leche) con tarifa 0% y derecho a devolución.",
    como_llenar: "Valor facturado de productos agropecuarios exentos.",
    tope: "Tarifa 0% con devolución."
  },
  "35": {
    titulo: "Exportaciones de bienes",
    art: "Art. 479 E.T.",
    concepto: "Ingresos por ventas de bienes despachados al exterior con declaración de exportación DEX.",
    como_llenar: "Valor FOB de las exportaciones definitivas de bienes.",
    tope: "Exportaciones a tarifa 0%."
  },
  "36": {
    titulo: "Exportaciones de servicios",
    art: "Art. 481 Literal c E.T.",
    concepto: "Ingresos por servicios prestados desde Colombia para ser utilizados o consumidos exclusivamente en el exterior.",
    como_llenar: "Valor facturado de servicios exportados soportados con contrato y factura electrónica.",
    tope: "Exento con devolución."
  },
  "37": {
    titulo: "Operaciones excluidas (Art. 424 y 476)",
    art: "Art. 424 y 476 E.T.",
    concepto: "Ingresos por venta de bienes o servicios no sujetos a IVA (frutas sin procesar, servicios médicos, educación, transporte público, cloud hosting).",
    como_llenar: "Total ingresos por actividades no gravadas que no dan derecho a impuesto descontable.",
    tope: "No causan IVA ni dan derecho a descontables."
  },
  "41": {
    titulo: "Total ingresos brutos",
    art: "Formulario 300 DIAN",
    concepto: "Suma de todos los ingresos operacionales del período (gravados, exentos y excluidos).",
    como_llenar: "Suma de Casillas 27 a 40.",
    tope: "Total ingresos brutos."
  },
  "43": {
    titulo: "Total ingresos netos",
    art: "Formulario 300 DIAN",
    concepto: "Ingresos brutos menos devoluciones en ventas.",
    como_llenar: "Casilla 41 menos Casilla 42.",
    tope: "Ingresos netos del período."
  },
  "45": {
    titulo: "IVA generado a la tarifa del 5%",
    art: "Art. 468-1 y 468-3 E.T.",
    concepto: "Impuesto sobre las ventas generado al 5% en venta de bienes y servicios.",
    como_llenar: "(Casilla 27 + Casilla 29) multiplicada por el 5%.",
    tope: "5% de la base."
  },
  "46": {
    titulo: "IVA generado a la tarifa general (19%)",
    art: "Art. 468 E.T.",
    concepto: "Impuesto sobre las ventas generado al 19% en venta de bienes y servicios.",
    como_llenar: "(Casilla 28 + Casilla 30) multiplicada por el 19%.",
    tope: "19% de la base."
  },
  "58": {
    titulo: "Total IVA generado",
    art: "Formulario 300 DIAN",
    concepto: "Consolidado total del IVA facturado o generado a cargo del responsable.",
    como_llenar: "Suma de Casillas 45 a 57.",
    tope: "Total IVA Generado."
  },
  "67": {
    titulo: "Compras de bienes gravados a la tarifa general (19%)",
    art: "Art. 485 E.T.",
    concepto: "Base de compras de inventarios y mercancías gravadas al 19%.",
    como_llenar: "Valor antes de IVA de las compras nacionales soportadas con Factura Electrónica.",
    tope: "Compras deducibles en renta."
  },
  "69": {
    titulo: "Servicios gravados a la tarifa general (19%)",
    art: "Art. 485 E.T.",
    concepto: "Base de servicios y gastos operativos gravados al 19% adquiridos.",
    como_llenar: "Valor antes de IVA de los servicios tomados con Factura Electrónica.",
    tope: "Servicios imputables a la actividad."
  },
  "82": {
    titulo: "Descontable por compras de bienes gravados al 19%",
    art: "Art. 485 E.T.",
    concepto: "IVA pagado en adquisición de bienes corporales muebles al 19%.",
    como_llenar: "Casilla 67 multiplicada por el 19%.",
    tope: "IVA pagado facturado."
  },
  "84": {
    titulo: "Descontable por servicios gravados al 19%",
    art: "Art. 485 E.T.",
    concepto: "IVA pagado en contratación de servicios gravados al 19%.",
    como_llenar: "Casilla 69 multiplicada por el 19%.",
    tope: "IVA descontable de servicios."
  },
  "90": {
    titulo: "IVA común descontable prorrateado",
    art: "Art. 490 E.T.",
    concepto: "IVA pagado en compras y gastos comunes aceptado como descontable según el factor de prorrateo (Ventas gravadas y exentas / Ventas totales).",
    como_llenar: "IVA común multiplicado por el factor de prorrateo.",
    tope: "Factor proporcional Art. 490."
  },
  "96": {
    titulo: "Total IVA descontable",
    art: "Formulario 300 DIAN",
    concepto: "Suma de todo el IVA pagado en compras, servicios e importaciones que procede como descuento.",
    como_llenar: "Suma de Casillas 81 a 94 menos Casilla 95.",
    tope: "Total IVA Descontable."
  },
  "98": {
    titulo: "Saldo a pagar por el período fiscal",
    art: "Formulario 300 DIAN",
    concepto: "Exceso del IVA Generado sobre el IVA Descontable en las operaciones del período.",
    como_llenar: "Casilla 58 menos Casilla 96 (si es positivo).",
    tope: "Impuesto a cargo del período."
  },
  "99": {
    titulo: "Saldo a favor por el período fiscal",
    art: "Art. 489 E.T.",
    concepto: "Exceso del IVA Descontable sobre el IVA Generado en las operaciones del período.",
    como_llenar: "Casilla 96 menos Casilla 58 (si es positivo).",
    tope: "Saldo a favor generado."
  },
  "100": {
    titulo: "Saldo a favor del período fiscal anterior",
    art: "Art. 815 y 816 E.T.",
    concepto: "Saldo a favor de la declaración anterior de IVA no solicitado en devolución ni compensación.",
    como_llenar: "Casilla 106 de la declaración del bimestre/cuatrimestre anterior.",
    tope: "Imputable al período actual."
  },
  "101": {
    titulo: "Retenciones en la fuente de IVA que le practicaron",
    art: "Art. 437-1 y 484-1 E.T.",
    concepto: "ReteIVA del 15% retenido por clientes que son agentes de retención.",
    como_llenar: "Certificados de retención de IVA recibidos de clientes.",
    tope: "ReteIVA facturado y retenido."
  },
  "104": {
    titulo: "Sanciones",
    art: "Art. 641 y 644 E.T.",
    concepto: "Sanción por extemporaneidad o corrección en la declaración de IVA.",
    como_llenar: "Valor de la sanción liquidada (mínimo 10 UVT).",
    tope: "Sanción mínima 10 UVT."
  },
  "105": {
    titulo: "Total saldo a pagar por este período",
    art: "Formulario 300 DIAN",
    concepto: "Valor final a pagar en bancos por concepto del Impuesto sobre las Ventas.",
    como_llenar: "Casilla 98 - Casilla 99 - Casilla 100 - Casilla 101 + Casilla 104 (si es mayor a 0).",
    tope: "Total a pagar en bancos."
  },
  "106": {
    titulo: "Total saldo a favor por este período",
    art: "Art. 815 y 850 E.T.",
    concepto: "Saldo a favor acumulado y susceptible de compensación, devolución o imputación al período siguiente.",
    como_llenar: "Casilla 99 + Casilla 100 + Casilla 101 - Casilla 98 - Casilla 104 (si es mayor a 0).",
    tope: "Saldo a favor definitivo."
  }
};


