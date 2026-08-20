# Skill: `declaracion-renta-persona-natural`

- **Plugin Asociado**: `colombian-tax-assistant`
- **Versión**: 1.0.0
- **Formulario DIAN**: 210 (Declaración de Renta y Complementarios Personas Naturales y Asimiladas de Residentes)
- **Marco Legal**: Estatuto Tributario Nacional de Colombia y Ley 2277 de 2022 (Reforma Tributaria).

---

## 1. Propósito

Automatiza el flujo documental de personas naturales residentes fiscales en Colombia:
1. Extrae y desglosa entradas y salidas desde extractos bancarios y certificados tributarios (F220 de ingresos y retenciones, medicina prepagada, créditos hipotecarios).
2. Realiza el cruce y conciliación automática frente al archivo oficial de Información Exógena de la DIAN.
3. Clasifica partidas en el sistema cedular (Trabajo, Honorarios, Capital, No Laborales, Pensiones, Dividendos y Ganancias Ocasionales).
4. Aplica depuración estatutaria, límites en UVT (Art. 336 E.T., límite conjunto 1.340 UVT y 40%) y genera el payload JSON validado.
5. Inyecta el resultado en la sesión activa de TributIA vía API REST / Redis.

---

## 2. Scripts Disponibles

### `conciliar_exogena.py`

Cruza el archivo CSV de transacciones depuradas contra el reporte de Información Exógena DIAN (`.xlsx` o `.csv`) y de facturación electrónica:

```bash
python skills/declaracion-renta-persona-natural/scripts/conciliar_exogena.py \
  transacciones_depuradas.csv \
  "DIAN - Informacion exogena 2025.xlsx" \
  --facturas "DIAN - Facturas electronicas 2025.xlsx" \
  --out-csv conciliacion_exogena.csv \
  --out-json estado_conciliacion.json
```

### `consolidar_transacciones.py`

Agrupa las partidas por cédula y concepto tributario generando el payload JSON estructurado:

```bash
python skills/declaracion-renta-persona-natural/scripts/consolidar_transacciones.py \
  transacciones_depuradas.csv \
  --year 2025 \
  --uvt 49799 \
  --nombre "JUAN PEREZ" \
  --nit "123456789" \
  --reconciliation estado_conciliacion.json \
  --out payload_declaracion.json
```

### `inyectar_tributia.py`

Envía el payload a la API REST de TributIA con el ID de sesión del usuario para sincronización instantánea:

```bash
python skills/declaracion-renta-persona-natural/scripts/inyectar_tributia.py \
  payload_declaracion.json \
  --api-url http://localhost:8000 \
  --session-id ses_abc123
```
