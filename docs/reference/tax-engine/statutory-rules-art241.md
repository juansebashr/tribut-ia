# 📜 Algoritmo Matemático de la Tabla Marginal (Art. 241 E.T.)

El Artículo 241 del Estatuto Tributario establece la tarifa progresiva para la Cédula General y Pensiones de personas naturales residentes en Colombia.

---

## 1. Tabla de Tramos Marginales

| Tramo | Desde (UVT) | Hasta (UVT) | Tarifa Marginal | Impuesto Base Fijo (UVT) | Fórmula Estatutaria de Impuesto |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | `> 0` | `1.090` | **0%** | `0` | Exento ($0) |
| **2** | `> 1.090` | `1.700` | **19%** | `0` | $(\text{Base UVT} - 1.090) \times 19\%$ |
| **3** | `> 1.700` | `4.100` | **28%** | `116` | $(\text{Base UVT} - 1.700) \times 28\% + 116\text{ UVT}$ |
| **4** | `> 4.100` | `8.670` | **33%** | `788` | $(\text{Base UVT} - 4.100) \times 33\% + 788\text{ UVT}$ |
| **5** | `> 8.670` | `18.970` | **35%** | `2.296` | $(\text{Base UVT} - 8.670) \times 35\% + 2.296\text{ UVT}$ |
| **6** | `> 18.970` | `31.000` | **37%** | `5.901` | $(\text{Base UVT} - 18.970) \times 37\% + 5.901\text{ UVT}$ |
| **7** | `> 31.000` | $\infty$ | **39%** | `10.352` | $(\text{Base UVT} - 31.000) \times 39\% + 10.352\text{ UVT}$ |

---

## 2. Regla de Redondeo DIAN (Art. 868 E.T.)

Todos los valores monetarios en los formularios oficiales de la DIAN se redondean al **múltiplo de mil más cercano**:

$$\text{Valor Redondeado} = \text{round}(\text{Valor COP}, -3)$$
