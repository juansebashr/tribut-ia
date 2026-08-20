# ADR 0001: Motor de Reglas Tributarias Declarativo en Archivos JSON Versionados

- **Estado**: Aceptado
- **Fecha**: 2026-08-14
- **Autor**: Juan Sebastian Hernandez (@juansebashr)

## Contexto

La legislación tributaria colombiana cambia anualmente según el valor de la UVT (fijado por resolución de la DIAN) y periódicamente a través de reformas tributarias (Ley 2277 de 2022, etc.). Hardcodear estos valores en el código fuente de Python causaría deuda técnica masiva y dificultaría realizar declaraciones de años anteriores o simulaciones con UVT estimada.

## Decisión

Separar completamente la lógica del motor de cálculo de los parámetros tributarios mediante artefactos JSON versionados por año gravable (`rules_2022.json`, `rules_2024.json`, `rules_2025.json`, `rules_2026.json`). El motor de reglas (`rules_engine.py`) carga dinámicamente estos parámetros y permite sobreescrituras en memoria de la UVT (`custom_uvt`).

## Consecuencias

- **Positivas**: Soporte inmediato para múltiples años gravables, capacidad de simular escenarios de reformas fiscales futuras sin modificar código, fácil auditoría por parte de contadores públicos.
- **Negativas**: Requiere validar que las claves de los archivos JSON se adhieran rigurosamente al esquema Pydantic.
