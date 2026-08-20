import asyncio
from abc import ABC, abstractmethod
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class SessionState(BaseModel):
    session_id: str = "default"
    revision: int = 1
    metadata: dict[str, Any] = Field(
        default_factory=lambda: {
            "nombre": "CONTRIBUYENTE PERSONA NATURAL DEMO",
            "nit": "9001234567",
            "tax_year": 2026,
            "custom_uvt": 52350,
            "active_module": "pn",
            "active_subtab": "calc",
        }
    )
    persona_natural: dict[str, Any] = Field(default_factory=dict)
    persona_juridica: dict[str, Any] = Field(default_factory=dict)
    calculation_results: dict[str, Any] = Field(default_factory=dict)
    reconciliation: dict[str, Any] = Field(default_factory=dict)
    last_updated_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())


class SessionStoreBase(ABC):
    """
    Clase base abstracta para almacén de sesiones con soporte para Pub/Sub y eventos en tiempo real.
    """

    def _create_default_session(self, session_id: str) -> SessionState:
        return SessionState(
            session_id=session_id,
            revision=1,
            metadata={
                "nombre": "CONTRIBUYENTE PERSONA NATURAL DEMO",
                "nit": "9001234567",
                "tax_year": 2026,
                "custom_uvt": 52350,
                "active_module": "pn",
                "active_subtab": "calc",
            },
            persona_natural={
                "patrimonio_bruto": 300000000.0,
                "deudas": 80000000.0,
                "rentas_trabajo": 120000000.0,
                "viaticos": 0.0,
                "otros_ingresos_brutos": 0.0,
                "rentas_capital": 0.0,
                "incrngo_capital": 0.0,
                "rentas_nolaborales": 0.0,
                "incrngo_nolaborales": 0.0,
                "costos_nolaborales": 0.0,
                "aporte_salud_obligatorio": 4800000.0,
                "aporte_pension_obligatorio": 4800000.0,
                "aplica_dependiente_general": True,
                "numero_dependientes_adicionales_72uvt": 0,
                "medicina_prepagada_anual": 0.0,
                "intereses_vivienda_anual": 12000000.0,
                "gmf_4x1000_total": 0.0,
                "compras_factura_electronica": 15000000.0,
                "aportes_voluntarios_pension_afc": 10000000.0,
                "otras_rentas_exentas": 0.0,
                "ganancias_ocasionales_brutas_activos_fijos": 0.0,
                "costos_ganancia_ocasional": 0.0,
                "ganancias_ocasionales_brutas_herencias": 0.0,
                "ganancias_ocasionales_brutas_loterias": 0.0,
                "ganancias_ocasionales_exentas_solicitadas": 0.0,
                "retenciones_fuente_practicadas": 5000000.0,
                "anticipo_ano_anterior": 0.0,
                "saldo_a_favor_ano_anterior": 0.0,
            },
            persona_juridica={
                "ingresos_brutos_operacionales": 1200000000.0,
                "ingresos_no_operacionales": 50000000.0,
                "ingresos_no_constitutivos_renta": 30000000.0,
                "costos_ventas_operacionales": 650000000.0,
                "gastos_administracion_ventas": 200000000.0,
                "rentas_exentas": 20000000.0,
                "utilidad_contable_antes_impuestos": 370000000.0,
                "ingresos_no_constitutivos_utilidad": 30000000.0,
                "costos_gastos_no_deducibles": 25000000.0,
                "retenciones_fuente_practicadas": 35000000.0,
                "anticipo_ano_anterior": 15000000.0,
            },
        )

    @abstractmethod
    async def get_state(self, session_id: str = "default") -> SessionState:
        pass

    @abstractmethod
    async def update_state(
        self, session_id: str, payload: dict[str, Any], source: str = "api"
    ) -> SessionState:
        pass

    @abstractmethod
    async def reset_state(self, session_id: str = "default") -> SessionState:
        pass

    @abstractmethod
    async def subscribe(self, session_id: str = "default") -> asyncio.Queue:
        pass

    @abstractmethod
    async def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        pass

    @abstractmethod
    async def publish_event(
        self, session_id: str, event_type: str, data: dict[str, Any], source: str = "api"
    ) -> None:
        pass
