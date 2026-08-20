# ADR 0003: Manejo de Máscara Contable Colombiana en el DOM y Sanitización Numérica

- **Estado**: Aceptado
- **Fecha**: 2026-08-14
- **Autor**: Juan Sebastian Hernandez (@juansebashr)

## Contexto

En la contabilidad y declaraciones tributarias en Colombia, las cifras se escriben tradicionalmente utilizando el apóstrofe `'` como separador de millones y el punto `.` como separador de miles (ej. `$120'000.000` o `$1'280.000`). Cuando se implementó la máscara en los inputs, `parseFloat()` interpretaba el punto como decimal, truncando las cifras a pesos individuales ($120 pesos).

## Decisión

1. Mantener la experiencia visual nativa de formateo en el DOM (`formatCOP`).
2. En la función lectora `getNum(id)`, sanitizar el valor extrayendo estrictamente los dígitos `\D` y el signo negativo, convirtiendo a enteros exactos con `parseInt(digits, 10)`.
3. Todos los cálculos en formularios DIAN se manejan como enteros en pesos (COP), respetando el redondeo oficial a múltiplo de mil (Art. 868 E.T.).

## Consecuencias

- **Positivas**: La interfaz ofrece la experiencia contable colombiana nativa sin romper ningún cálculo en el motor matemático.
