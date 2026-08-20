# Guía How-To: Consultar Vencimientos por NIT y Calendario DIAN

Esta guía explica cómo calcular el Dígito de Verificación (DV) de la DIAN mediante el algoritmo oficial Módulo 11 (Art. 370 E.T.) y consultar las fechas límite de declaración y pago.

---

## 1. Algoritmo DIAN Módulo 11 (Cálculo de DV)

El Dígito de Verificación se calcula ponderando los dígitos del NIT con la serie de factores fija:
`[71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]` alineados de derecha a izquierda:

```python
def calculate_dian_dv(nit: str) -> int:
weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]
digits = [int(c) for c in nit.replace("-", "").replace(".", "").strip() if c.isdigit()]
padded = [0] * (15 - len(digits)) + digits
s = sum(padded[i] * weights[i] for i in range(15))
remainder = s % 11
return remainder if remainder <= 1 else 11 - remainder
```

### Casos Oficiales de Prueba

- NIT `800197268` $\rightarrow$ DV **`4`** (800.197.268-4)
- NIT `860002964` $\rightarrow$ DV **`4`** (860.002.964-4)
- NIT `900156264` $\rightarrow$ DV **`2`** (900.156.264-2)
- NIT `900876543` $\rightarrow$ DV **`1`** (900.876.543-1)
