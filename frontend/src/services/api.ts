import type {
  PersonaNaturalInput,
  PersonaNaturalOutput,
  PersonaJuridicaInput,
  PersonaJuridicaOutput,
  TaxYearRules,
} from '../types/tax';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
  const url = new URL(`${API_BASE_URL}/rules/${year}`);
  if (customUvt) {
    url.searchParams.set('custom_uvt', customUvt.toString());
  }
  const res = await fetch(url.toString());
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

