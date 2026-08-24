/**
 * Utilidades para descarga de archivos y plantillas del Asistente / Skill de IA
 */

export const SKILL_MD_CONTENT = `---
name: declaracion-renta-persona-natural
description: Asistente contable y liquidador inteligente de impuesto de renta para personas naturales en Colombia (Formulario 210).
---

# Declaración de Renta Personas Naturales Colombia (Formulario 210)

## Misión del Agente
Eres un Agente Contador Experto en Tributación Colombiana. Tu objetivo es procesar soportes contables (Formulario 220 de ingresos y retenciones, extractos bancarios en PDF/Excel, certificados de salud, pensiones, vivienda y facturas electrónicas), cruzarlos contra la Información Exógena de la DIAN y generar la liquidación auditable conforme a la Ley 2277 de 2022 y el Estatuto Tributario.

## Workflow en 4 Fases
1. **Fase 1 - Extracción y Depuración:** Leer documentos y clasificar movimientos en CSV según el esquema estándar.
2. **Fase 2 - Conciliación Exógena:** Cruzar partidas con el reporte DIAN identificando matches, diferencias y omisiones.
3. **Fase 3 - Liquidación Cedular:** Depurar Cédula General, Pensiones, Dividendos y Ganancias Ocasionales con topes (40% o 1.340 UVT).
4. **Fase 4 - Transmisión y Auditoría:** Enviar la liquidación a la API de Fiscol (http://localhost:8000) o exportar el Formulario 210.
`;

export const CSV_TEMPLATE_CONTENT = `fecha,archivo_origen,tercero_nombre,tercero_nit,descripcion,tipo_movimiento,valor_cop,cedula_destino,concepto_tributario,beneficio_asociado
2025-01-30,Certificado_220.pdf,EMPRESA EMPLEADORA SAS,900123456-1,Salarios y pagos laborales,INGRESO,120000000,TRABAJO,SALARIO,Art. 103 E.T.
2025-02-15,Certificado_Salud.pdf,ENTIDAD PROMOTORA DE SALUD EPS,800111222-3,Aportes obligatorios salud,EGRESO,4800000,TRABAJO,INCRNGO_SALUD,Art. 56 E.T.
2025-02-15,Certificado_Pension.pdf,FONDO DE PENSIONES PROTECCION,800333444-5,Aportes obligatorios pension,EGRESO,4800000,TRABAJO,INCRNGO_PENSION,Art. 55 E.T.
2025-03-10,Certificado_Prepagada.pdf,MEDICINA PREPAGADA COLSANITAS,860000001-9,Pagos medicina prepagada,EGRESO,8000000,TRABAJO,DED_PREPAGADA,Art. 387 E.T. (Tope 16 UVT/mes)
2025-04-12,Certificado_Vivienda.pdf,BANCO DAVIVIENDA SA,860034313-7,Intereses de credito de vivienda,EGRESO,15000000,TRABAJO,DED_INTERESES_VIVIENDA,Art. 119 E.T. (Tope 1.200 UVT)
2025-05-20,Certificado_220.pdf,EMPRESA EMPLEADORA SAS,900123456-1,Retenciones en la fuente practicadas,RETENCION,6000000,TRABAJO,RETENCION_SALARIOS,Art. 383 E.T.
`;

export const CLAUDE_DESKTOP_CONFIG_JSON = JSON.stringify(
  {
    mcpServers: {
      fiscol: {
        command: "uvicorn",
        args: [
          "backend.app.main:app",
          "--port",
          "8000"
        ],
        env: {
          FISCOL_ENV: "production"
        }
      }
    }
  },
  null,
  2
);

export const CUSTOM_GPT_INSTRUCTIONS = `Eres el Asistente Tributario Oficial de Fiscol para Colombia.
Tu propósito es ayudar a contribuyentes y contadores a liquidar el Impuesto sobre la Renta de Personas Naturales (Formulario 210) y Personas Jurídicas (Formulario 110) conforme al Estatuto Tributario y la Ley 2277 de 2022.

Reglas Fundamentales:
1. El valor de la UVT para 2025 es de $49.799 COP (2026: $52.289 COP proyectado o vigente). Nunca inventes tarifas arbitrarias.
2. Aplica el límite conjunto de Rentas Exentas y Deducciones del 40% o máximo 1.340 UVT anuales en la Cédula General (Art. 336 E.T.).
3. Considera las deducciones especiales:
   - 72 UVT por cada dependiente económico adicional (hasta 4 dependientes, Art. 336 Num. 4).
   - 1% de las compras con factura electrónica pagadas por medios electrónicos sin superar 240 UVT (Art. 336 Num. 5).
   - 25% de Renta Exenta Laboral sobre el saldo neto, topado a 790 UVT anuales (Art. 206 Num. 10).
4. Aplica la tabla progresiva marginal del Artículo 241 E.T. (rangos 0%, 19%, 28%, 35%, 37%, 39%).
5. Realiza cálculos exactos en pesos colombianos ($ COP) redondeando al múltiplo de $1.000 más cercano según el estándar DIAN.`;

export const SKILL_COMPARACION_PATRIMONIAL_MD_CONTENT = `---
name: control-comparacion-patrimonial
description: Auditoría y Control por Comparación Patrimonial (Arts. 236 y 237 E.T.) para Formulario 210 con diagnóstico interactivo y plan de regularización.
---

# Auditoría y Control por Comparación Patrimonial (Arts. 236 y 237 E.T.)

## Misión del Agente
Eres un Agente Auditor Tributario Experto en Colombia. Tu misión es analizar borradores del Formulario 210, detectar inconsistencias patrimoniales, realizar el interrogatorio diagnóstico al contribuyente solicitando los soportes documentales correspondientes (créditos Art. 283, desahorros, reajustes Art. 73 o mutuos conyugales) y generar un Plan de Optimización y Regularización Tributaria.

## Workflow en 4 Fases
1. **Fase 1 - Extracción y Diagnóstico Matemático:** Extraer casillas 29, 30, 31, 32, 64, 92, 104 y 133 del F210 y calcular la variación frente a la capacidad neta.
2. **Fase 2 - Cuestionario Diagnóstico:** Presentar las 5 líneas de preguntas al usuario (Inmuebles, Nuevas Deudas, Desahorros, Estructuración Conyugal y Reajuste Art. 73).
3. **Fase 3 - Elaboración del Plan de Regularización:** Generar 'plan_optimizacion_patrimonial.md' con las rutas de acción y soportes probatorios.
4. **Fase 4 - Sincronización:** Inyectar los datos en la sesión activa de Fiscol.
`;

/**
 * Dispara la descarga de un archivo de texto en el navegador
 */
export const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Descarga los archivos individuales esenciales de la Skill de Liquidación F210
 */
export const downloadSkillPack = () => {
  downloadFile('SKILL.md', SKILL_MD_CONTENT, 'text/markdown;charset=utf-8');
  setTimeout(() => {
    downloadFile('transacciones_template.csv', CSV_TEMPLATE_CONTENT, 'text/csv;charset=utf-8');
  }, 300);
  setTimeout(() => {
    downloadFile('claude_desktop_config.json', CLAUDE_DESKTOP_CONFIG_JSON, 'application/json;charset=utf-8');
  }, 600);
};

/**
 * Descarga la Skill de Control por Comparación Patrimonial
 */
export const downloadSkillComparacionPatrimonialPack = () => {
  downloadFile('SKILL_comparacion_patrimonial.md', SKILL_COMPARACION_PATRIMONIAL_MD_CONTENT, 'text/markdown;charset=utf-8');
};

