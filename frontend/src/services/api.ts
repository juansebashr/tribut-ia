import {
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
    body: JSON.stringify({
      tax_year: taxYear,
      amount_cop: amountCop,
      amount_uvt: amountUvt,
      custom_uvt: customUvt,
    }),
  });
  if (!res.ok) throw new Error('Error al convertir UVT');
  return await res.json();
}
