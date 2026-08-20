# Propósito y Fundamento del Proyecto (Why TributIA Exists)

## 1. Propósito del Proyecto

TributIA dota a la inteligencia artificial de capacidades para actuar como un contador público y pedagógico bajo la normativa fiscal colombiana (Estatuto Tributario Nacional y Ley 2277 de 2022). El sistema se articula en dos componentes principales:

1. Una aplicación web interactiva que sirve como calculadora fiscal, visualizador y herramienta didáctica para simular, ajustar y entender cada renglón de la liquidación.
2. Un plugin de agentes y habilidades (skills) autónomas para procesar soportes contables, conciliar información exógena de la DIAN y clasificar movimientos financieros en las cédulas correspondientes.

## 2. Usuarios Principales

- **Contribuyentes (Personas Naturales y Jurídicas):** Para entender, auditar y preparar su declaración tributaria de forma transparente.
- **Estudiantes de Contaduría y Finanzas:** Como plataforma didáctica interactiva para aprender la aplicación práctica del sistema cedular, tarifas marginales y beneficios tributarios.
- **Contadores y Asesores Tributarios:** Como herramienta de soporte para agilizar conciliaciones y enseñar visualmente el proceso a sus clientes.
- **Agentes Autónomos y Sistemas Externos:** Consumidores de la API y el motor de reglas para liquidación automatizada y sincronización en tiempo real.

## 3. Prioridades de Optimización

- **Exactitud Matemática y Cumplimiento Normativo:** Los cálculos deben reflejar con absoluta precisión los topes en UVT, tarifas marginales y fórmulas del Estatuto Tributario.
- **Calidad de Código y Determinismo:** Fórmulas puras, tipado estricto con Pydantic v2 y Python 3.11, suite de pruebas automatizadas y linteo riguroso.
- **Experiencia del Usuario Final:** Visualización pedagógica, desglose casilla por casilla y retroalimentación interactiva con máscara contable.

## 4. Restricciones y Reglas No Negociables

- **Cero Valores Fijos Quemados (Hardcoding):** Nunca quemar en el código valores particulares de ejemplos ni parámetros anuales (como la UVT); deben recibirse dinámicamente o parametrizarse en modelos.
- **Simplicidad Arquitectónica:** No sobrecomplicar la aplicación con abstracciones innecesarias ni dependencias redundantes; mantener el código legible, modular y directo.
