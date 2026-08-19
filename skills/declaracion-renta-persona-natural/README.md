# Skill: Declaración de Renta Personas Naturales (Colombia - F210)

Este skill forma parte del plugin **`colombian-tax-assistant`** y contiene la lógica, plantillas y herramientas CLI para procesar declaraciones de renta de personas naturales en Colombia.

## Contenido

- `SKILL.md`: Instrucciones y protocolo operativo en 4 fases para agentes de IA.
- `beneficios_tributarios_pn.md`: Catálogo legal con artículos del Estatuto Tributario y topes en UVT.
- `templates/transacciones_template.csv`: Plantilla oficial en formato CSV para diligenciar transacciones.
- `scripts/conciliar_exogena.py`: Script para cruce con Información Exógena DIAN.
- `scripts/consolidar_transacciones.py`: Script para consolidar CSV a payload JSON de TributIA.
- `scripts/inyectar_tributia.py`: Script para inyectar datos a la API de TributIA.
