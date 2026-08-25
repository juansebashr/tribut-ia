import type {
  PersonaNaturalInput,
  PersonaNaturalOutput,
  PersonaJuridicaInput,
  PersonaJuridicaOutput,
  TaxYearRules,
} from '../types/tax';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function fetchAvailableYears(): Promise<number[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/rules/years`);
    if (!res.ok) throw new Error('Error al consultar años');
    return await res.json();
  } catch (err) {
    console.warn('Backend no disponible, usando fallback local de años', err);
    return [2026, 2025, 2024, 2022];
  }
}

export async function fetchRulesForYear(year: number, customUvt?: number): Promise<TaxYearRules> {
  const query = customUvt ? `?custom_uvt=${customUvt}` : '';
  const res = await fetch(`${API_BASE_URL}/rules/${year}${query}`);
  if (!res.ok) throw new Error(`Error al consultar reglas del año ${year}`);
  return await res.json();
}

export async function calculatePersonaNatural(payload: PersonaNaturalInput): Promise<PersonaNaturalOutput> {
  const res = await fetch(`${API_BASE_URL}/calculate/persona-natural/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en el cálculo de Persona Natural');
  }
  return await res.json();
}

export async function calculatePersonaJuridica(payload: PersonaJuridicaInput): Promise<PersonaJuridicaOutput> {
  const res = await fetch(`${API_BASE_URL}/calculate/persona-juridica/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en el cálculo de Persona Jurídica');
  }
  return await res.json();
}

export async function calculateRegimenSimple(
  payload: import('../types/tax').RegimenSimpleInput
): Promise<import('../types/tax').RegimenSimpleOutput> {
  const res = await fetch(`${API_BASE_URL}/calculate/regimen-simple/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en el cálculo de Régimen Simple');
  }
  return await res.json();
}

export async function simularComparativaSimple(
  payload: import('../types/tax').ComparativaSimpleInput
): Promise<import('../types/tax').ComparativaSimpleOutput> {
  const res = await fetch(`${API_BASE_URL}/calculate/regimen-simple/comparativa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al calcular comparativa SIMPLE vs Ordinario');
  }
  return await res.json();
}

export async function convertUvt(taxYear: number, amountCop?: number, amountUvt?: number, customUvt?: number) {
  const res = await fetch(`${API_BASE_URL}/rules/convert-uvt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tax_year: taxYear, amount_cop: amountCop, amount_uvt: amountUvt, custom_uvt: customUvt }),
  });
  if (!res.ok) throw new Error('Error en conversión UVT');
  return await res.json();
}

export async function fetchBeneficiosCatalog(): Promise<import('../types/tax').BeneficioItem[]> {
  const res = await fetch(`${API_BASE_URL}/beneficios/catalog`);
  if (!res.ok) throw new Error('Error al obtener catálogo de beneficios');
  return await res.json();
}

export async function fetchTablaArticulo73(): Promise<import('../types/tax').AjusteArticulo73Item[]> {
  const res = await fetch(`${API_BASE_URL}/beneficios/articulo-73/tabla`);
  if (!res.ok) throw new Error('Error al obtener tabla del Artículo 73');
  return await res.json();
}

export async function simularArticulo73(
  payload: import('../types/tax').SimulacionAjusteArticulo73Request
): Promise<import('../types/tax').SimulacionAjusteArticulo73Response> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-articulo-73`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular ajuste del Art. 73');
  }
  return await res.json();
}

export async function simularAuditoria(
  payload: import('../types/tax').BeneficioAuditoriaRequest
): Promise<import('../types/tax').BeneficioAuditoriaResponse> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-auditoria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular beneficio de auditoría');
  }
  return await res.json();
}

export async function simularSancion(
  payload: import('../types/tax').ReduccionSancionRequest
): Promise<import('../types/tax').ReduccionSancionResponse> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-reduccion-sancion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular reducción de sanciones');
  }
  return await res.json();
}

export async function simularInmuebleAfc(
  payload: import('../types/tax').SimulacionInmuebleAfcRequest
): Promise<import('../types/tax').SimulacionInmuebleAfcResponse> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-inmueble-afc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular beneficios de inmuebles y cuentas AFC');
  }
  return await res.json();
}

export async function fetchReconciliationDemo(): Promise<import('../types').ReconciliationResponse> {
  const res = await fetch(`${API_BASE_URL}/reconciliation/demo`);
  if (!res.ok) throw new Error('Error al cargar datos de demostración de conciliación');
  return await res.json();
}

export async function uploadReconciliationCsv(file: File): Promise<import('../types').ReconciliationResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/reconciliation/parse-csv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al procesar archivo CSV de conciliación');
  }
  return await res.json();
}

export async function parseReconciliationRaw(rawText: string): Promise<import('../types').ReconciliationResponse> {
  const res = await fetch(`${API_BASE_URL}/reconciliation/parse-raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al procesar texto CSV de conciliación');
  }
  return await res.json();
}

export async function fetchSessionState(sessionId: string): Promise<import('../types').SessionState> {
  const res = await fetch(`${API_BASE_URL}/session/current`, {
    headers: { 'X-Session-ID': sessionId },
  });
  if (!res.ok) throw new Error('Error al cargar estado de sesión');
  return await res.json();
}

export async function updateSessionState(sessionId: string, state: any): Promise<import('../types').SessionState> {
  const res = await fetch(`${API_BASE_URL}/session/current`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId,
    },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error('Error al guardar estado de sesión');
  return await res.json();
}

export async function resetSessionState(sessionId: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/session/current/reset`, {
    method: 'POST',
    headers: { 'X-Session-ID': sessionId },
  });
  if (!res.ok) throw new Error('Error al reiniciar sesión');
  return await res.json();
}

export async function fetchTablaComponenteInflacionario(): Promise<import('../types/tax').ItemTablaComponenteInflacionario[]> {
  const res = await fetch(`${API_BASE_URL}/beneficios/componente-inflacionario/tabla`);
  if (!res.ok) throw new Error('Error al obtener tabla del Componente Inflacionario');
  return await res.json();
}

export async function simularComponenteInflacionario(
  payload: import('../types/tax').SimulacionComponenteInflacionarioRequest
): Promise<import('../types/tax').SimulacionComponenteInflacionarioResponse> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-componente-inflacionario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular Componente Inflacionario');
  }
  return await res.json();
}

export async function simularCombinabilidadInflacionArt73(
  payload: import('../types/tax').SimulacionCombinabilidadRequest
): Promise<import('../types/tax').SimulacionCombinabilidadResponse> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-combinabilidad-inflacion-art73`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular combinabilidad');
  }
  return await res.json();
}

export async function calcularComparacionPatrimonial(
  payload: import('../types/tax').ComparacionPatrimonialRequest
): Promise<import('../types/tax').ComparacionPatrimonialResponse> {
  const res = await fetch(`${API_BASE_URL}/persona-natural/comparacion-patrimonial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al calcular Comparación Patrimonial');
  }
  return await res.json();
}

export async function simularTributacionPareja(
  payload: import('../types/tax').TributacionParejaRequest
): Promise<import('../types/tax').TributacionParejaResponse> {
  const res = await fetch(`${API_BASE_URL}/beneficios/simular-tributacion-pareja`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al simular Tributación en Pareja');
  }
  return await res.json();
}

// RETENCIÓN EN LA FUENTE
export async function calculateRetefuenteLaboral(
  payload: import('../types/tax').RetefuenteLaboralInput
): Promise<import('../types/tax').RetefuenteLaboralOutput> {
  const res = await fetch(`${API_BASE_URL}/calculate/retefuente/laboral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en depuración de retención laboral');
  }
  return await res.json();
}

export async function calculateRetefuenteF350(
  payload: import('../types/tax').RetefuenteF350Input
): Promise<import('../types/tax').RetefuenteF350Output> {
  const res = await fetch(`${API_BASE_URL}/calculate/retefuente/f350`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en liquidación Formulario 350');
  }
  return await res.json();
}

export async function fetchTablaRetefuente(
  year: number,
  customUvt?: number
): Promise<import('../types/tax').TablaRetefuenteItem[]> {
  const query = customUvt ? `?year=${year}&custom_uvt=${customUvt}` : `?year=${year}`;
  const res = await fetch(`${API_BASE_URL}/calculate/retefuente/tabla-retenciones${query}`);
  if (!res.ok) {
    throw new Error('Error al consultar tabla de retenciones');
  }
  return await res.json();
}

// IMPUESTO SOBRE LAS VENTAS (IVA)
export async function calculateIvaF300(
  payload: import('../types/tax').IvaF300Input
): Promise<import('../types/tax').IvaF300Output> {
  const res = await fetch(`${API_BASE_URL}/calculate/iva/f300`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en liquidación Formulario 300 IVA');
  }
  return await res.json();
}

export async function calculateIvaProrrateo(
  payload: import('../types/tax').IvaProrrateoInput
): Promise<import('../types/tax').IvaProrrateoOutput> {
  const res = await fetch(`${API_BASE_URL}/calculate/iva/prorrateo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error en cálculo de prorrateo de IVA');
  }
  return await res.json();
}

export async function fetchClasificadorIva(): Promise<import('../types/tax').BienServicioIvaItem[]> {
  const res = await fetch(`${API_BASE_URL}/calculate/iva/clasificador`);
  if (!res.ok) {
    throw new Error('Error al consultar clasificador de IVA');
  }
  return await res.json();
}


