import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class SessionState(BaseModel):
    session_id: str = "default"
    metadata: Dict[str, Any] = Field(default_factory=lambda: {
        "nombre": "CARLOS ALBERTO PEREZ GOMEZ",
        "nit": "1234567890",
        "tax_year": 2026,
        "custom_uvt": 52350,
        "active_module": "pn",
        "active_subtab": "calc"
    })
    persona_natural: Dict[str, Any] = Field(default_factory=dict)
    persona_juridica: Dict[str, Any] = Field(default_factory=dict)
    calculation_results: Dict[str, Any] = Field(default_factory=dict)
    reconciliation: Dict[str, Any] = Field(default_factory=dict)
    last_updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SessionStore:
    """
    Almacén de sesiones reactivo en memoria con difusión de eventos SSE (Server-Sent Events)
    para sincronización en tiempo real entre la API y clientes web.
    """
    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()
        
        # Inicializar sesión por defecto
        self._sessions["default"] = self._create_default_session("default")

    def _create_default_session(self, session_id: str) -> SessionState:
        return SessionState(
            session_id=session_id,
            metadata={
                "nombre": "CARLOS ALBERTO PEREZ GOMEZ",
                "nit": "1234567890",
                "tax_year": 2026,
                "custom_uvt": 52350,
                "active_module": "pn",
                "active_subtab": "calc"
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
                "saldo_a_favor_ano_anterior": 0.0
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
                "anticipo_ano_anterior": 15000000.0
            }
        )

    def get_state(self, session_id: str = "default") -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = self._create_default_session(session_id)
        return self._sessions[session_id]

    async def update_state(
        self,
        session_id: str = "default",
        new_state_data: Optional[Dict[str, Any]] = None,
        source: str = "api"
    ) -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = self._create_default_session(session_id)
        
        current = self._sessions[session_id]
        if new_state_data:
            if "metadata" in new_state_data and isinstance(new_state_data["metadata"], dict):
                current.metadata.update(new_state_data["metadata"])
            if "persona_natural" in new_state_data and isinstance(new_state_data["persona_natural"], dict):
                current.persona_natural.update(new_state_data["persona_natural"])
            if "persona_juridica" in new_state_data and isinstance(new_state_data["persona_juridica"], dict):
                current.persona_juridica.update(new_state_data["persona_juridica"])
            if "calculation_results" in new_state_data and isinstance(new_state_data["calculation_results"], dict):
                current.calculation_results.update(new_state_data["calculation_results"])
            if "reconciliation" in new_state_data and isinstance(new_state_data["reconciliation"], dict):
                current.reconciliation = new_state_data["reconciliation"]
        
        current.last_updated_at = datetime.now(timezone.utc).isoformat()
        self._sessions[session_id] = current

        # Broadcast SSE event a los suscriptores conectados
        await self._broadcast(session_id, {
            "type": "state_update",
            "source": source,
            "session_id": session_id,
            "state": current.model_dump()
        })

        return current

    async def reset_state(self, session_id: str = "default") -> SessionState:
        new_state = self._create_default_session(session_id)
        self._sessions[session_id] = new_state
        
        await self._broadcast(session_id, {
            "type": "reset",
            "source": "api",
            "session_id": session_id,
            "state": new_state.model_dump()
        })
        
        return new_state

    async def subscribe(self, session_id: str = "default") -> asyncio.Queue:
        queue = asyncio.Queue()
        if session_id not in self._subscribers:
            self._subscribers[session_id] = []
        self._subscribers[session_id].append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue, session_id: str = "default"):
        if session_id in self._subscribers and queue in self._subscribers[session_id]:
            self._subscribers[session_id].remove(queue)

    async def _broadcast(self, session_id: str, message: Dict[str, Any]):
        if session_id in self._subscribers:
            dead_queues = []
            for queue in self._subscribers[session_id]:
                try:
                    queue.put_nowait(message)
                except asyncio.QueueFull:
                    dead_queues.append(queue)
            for q in dead_queues:
                self.unsubscribe(q, session_id)


# Instancia singleton del SessionStore
session_store = SessionStore()
