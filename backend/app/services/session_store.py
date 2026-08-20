import asyncio
import json
from datetime import UTC, datetime
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings
from app.services.session_store_base import SessionState, SessionStoreBase


class InMemorySessionStore(SessionStoreBase):
    """
    Almacén de sesiones en memoria RAM para desarrollo local y tests unitarios.
    """

    def __init__(self):
        self._sessions: dict[str, SessionState] = {}
        self._subscribers: dict[str, list[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()
        self._sessions["default"] = self._create_default_session("default")

    async def get_state(self, session_id: str = "default") -> SessionState:
        async with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = self._create_default_session(session_id)
            return self._sessions[session_id]

    async def update_state(
        self, session_id: str, payload: dict[str, Any], source: str = "api"
    ) -> SessionState:
        async with self._lock:
            current = self._sessions.get(session_id)
            if not current:
                current = self._create_default_session(session_id)
                self._sessions[session_id] = current

            # Incrementar revisión para concurrencia optimista
            new_revision = current.revision + 1

            # Combinar metadatos
            new_metadata = dict(current.metadata)
            if "metadata" in payload and isinstance(payload["metadata"], dict):
                new_metadata.update(payload["metadata"])

            # Combinar persona natural
            new_pn = dict(current.persona_natural)
            if "persona_natural" in payload and isinstance(payload["persona_natural"], dict):
                new_pn.update(payload["persona_natural"])

            # Combinar persona jurídica
            new_pj = dict(current.persona_juridica)
            if "persona_juridica" in payload and isinstance(payload["persona_juridica"], dict):
                new_pj.update(payload["persona_juridica"])

            # Resultados de cálculo
            new_calc = dict(current.calculation_results)
            if "calculation_results" in payload and isinstance(
                payload["calculation_results"], dict
            ):
                new_calc.update(payload["calculation_results"])

            # Reconciliación exógena
            new_rec = dict(current.reconciliation)
            if "reconciliation" in payload and isinstance(payload["reconciliation"], dict):
                new_rec.update(payload["reconciliation"])

            updated_state = SessionState(
                session_id=session_id,
                revision=new_revision,
                metadata=new_metadata,
                persona_natural=new_pn,
                persona_juridica=new_pj,
                calculation_results=new_calc,
                reconciliation=new_rec,
                last_updated_at=datetime.now(UTC).isoformat(),
            )
            self._sessions[session_id] = updated_state

        # Difundir evento a suscriptores SSE
        await self.publish_event(
            session_id=session_id,
            event_type="state_update",
            data={
                "session_id": session_id,
                "revision": new_revision,
                "source": source,
                "timestamp": updated_state.last_updated_at,
                "state": updated_state.model_dump(),
            },
            source=source,
        )
        return updated_state

    async def reset_state(self, session_id: str = "default") -> SessionState:
        async with self._lock:
            default_state = self._create_default_session(session_id)
            self._sessions[session_id] = default_state

        await self.publish_event(
            session_id=session_id,
            event_type="reset",
            data={
                "session_id": session_id,
                "revision": 1,
                "timestamp": default_state.last_updated_at,
                "state": default_state.model_dump(),
            },
        )
        return default_state

    async def subscribe(self, session_id: str = "default") -> asyncio.Queue:
        async with self._lock:
            if session_id not in self._subscribers:
                self._subscribers[session_id] = []
            queue: asyncio.Queue[Any] = asyncio.Queue(maxsize=100)
            self._subscribers[session_id].append(queue)
            return queue

    async def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        async with self._lock:
            if session_id in self._subscribers and queue in self._subscribers[session_id]:
                self._subscribers[session_id].remove(queue)

    async def publish_event(
        self, session_id: str, event_type: str, data: dict[str, Any], source: str = "api"
    ) -> None:
        async with self._lock:
            subscribers = list(self._subscribers.get(session_id, []))

        msg = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for queue in subscribers:
            try:
                queue.put_nowait(msg)
            except asyncio.QueueFull:
                pass


class RedisSessionStore(SessionStoreBase):
    """
    Almacén de sesiones distribuido en Redis con TTL de 1 día y Pub/Sub
    para sincronización en tiempo real entre múltiples instancias de GCP Cloud Run.
    """

    def __init__(
        self,
        redis_url: str = settings.REDIS_URL,
        ttl_seconds: int = settings.REDIS_SESSION_TTL_SECONDS,
    ):
        self.redis_url = redis_url
        self.ttl_seconds = ttl_seconds
        self._redis: aioredis.Redis | None = None
        self._local_subscribers: dict[str, list[asyncio.Queue]] = {}
        self._pubsub_tasks: dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()

    async def _get_client(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
        return self._redis

    def _get_key(self, session_id: str) -> str:
        return f"session:{session_id}"

    def _get_channel(self, session_id: str) -> str:
        return f"session:{session_id}:events"

    async def get_state(self, session_id: str = "default") -> SessionState:
        client = await self._get_client()
        key = self._get_key(session_id)
        raw = await client.get(key)

        if not raw:
            default_session = self._create_default_session(session_id)
            await client.set(key, default_session.model_dump_json(), ex=self.ttl_seconds)
            return default_session

        # Rolling Expiration: Renovar TTL de 1 día al consultar
        await client.expire(key, self.ttl_seconds)
        data = json.loads(raw)
        return SessionState(**data)

    async def update_state(
        self, session_id: str, payload: dict[str, Any], source: str = "api"
    ) -> SessionState:
        client = await self._get_client()
        key = self._get_key(session_id)

        # Leer estado actual
        current = await self.get_state(session_id)
        new_revision = current.revision + 1

        # Combinar metadatos
        new_metadata = dict(current.metadata)
        if "metadata" in payload and isinstance(payload["metadata"], dict):
            new_metadata.update(payload["metadata"])

        # Combinar persona natural
        new_pn = dict(current.persona_natural)
        if "persona_natural" in payload and isinstance(payload["persona_natural"], dict):
            new_pn.update(payload["persona_natural"])

        # Combinar persona jurídica
        new_pj = dict(current.persona_juridica)
        if "persona_juridica" in payload and isinstance(payload["persona_juridica"], dict):
            new_pj.update(payload["persona_juridica"])

        # Resultados de cálculo
        new_calc = dict(current.calculation_results)
        if "calculation_results" in payload and isinstance(payload["calculation_results"], dict):
            new_calc.update(payload["calculation_results"])

        # Reconciliación exógena
        new_rec = dict(current.reconciliation)
        if "reconciliation" in payload and isinstance(payload["reconciliation"], dict):
            new_rec.update(payload["reconciliation"])

        updated_state = SessionState(
            session_id=session_id,
            revision=new_revision,
            metadata=new_metadata,
            persona_natural=new_pn,
            persona_juridica=new_pj,
            calculation_results=new_calc,
            reconciliation=new_rec,
            last_updated_at=datetime.now(UTC).isoformat(),
        )

        # Guardar en Redis con TTL de 1 día (86.400s)
        await client.set(key, updated_state.model_dump_json(), ex=self.ttl_seconds)

        # Publicar evento a canal Pub/Sub para que todas las instancias de Cloud Run lo reciban
        await self.publish_event(
            session_id=session_id,
            event_type="state_update",
            data={
                "session_id": session_id,
                "revision": new_revision,
                "source": source,
                "timestamp": updated_state.last_updated_at,
                "state": updated_state.model_dump(),
            },
            source=source,
        )

        return updated_state

    async def reset_state(self, session_id: str = "default") -> SessionState:
        client = await self._get_client()
        key = self._get_key(session_id)
        default_state = self._create_default_session(session_id)

        await client.set(key, default_state.model_dump_json(), ex=self.ttl_seconds)

        await self.publish_event(
            session_id=session_id,
            event_type="reset",
            data={
                "session_id": session_id,
                "revision": 1,
                "timestamp": default_state.last_updated_at,
                "state": default_state.model_dump(),
            },
        )
        return default_state

    async def _redis_pubsub_listener(self, session_id: str, channel_name: str):
        """Escucha eventos en Redis Pub/Sub y los despacha a los clientes SSE conectados a esta instancia."""
        try:
            client = await self._get_client()
            pubsub = client.pubsub()
            await pubsub.subscribe(channel_name)

            async for message in pubsub.listen():
                if message["type"] == "message":
                    payload_str = message["data"]
                    async with self._lock:
                        subscribers = list(self._local_subscribers.get(session_id, []))
                    for queue in subscribers:
                        try:
                            queue.put_nowait(payload_str)
                        except asyncio.QueueFull:
                            pass
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"[REDIS PUBSUB LISTENER ERROR]: {e}")

    async def subscribe(self, session_id: str = "default") -> asyncio.Queue:
        async with self._lock:
            if session_id not in self._local_subscribers:
                self._local_subscribers[session_id] = []
            queue: asyncio.Queue[Any] = asyncio.Queue(maxsize=100)
            self._local_subscribers[session_id].append(queue)

            # Iniciar listener de Pub/Sub si no existe para esta sesión
            channel_name = self._get_channel(session_id)
            if session_id not in self._pubsub_tasks or self._pubsub_tasks[session_id].done():
                task = asyncio.create_task(self._redis_pubsub_listener(session_id, channel_name))
                self._pubsub_tasks[session_id] = task

            return queue

    async def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        async with self._lock:
            if (
                session_id in self._local_subscribers
                and queue in self._local_subscribers[session_id]
            ):
                self._local_subscribers[session_id].remove(queue)
                # Si no quedan clientes en esta instancia, cancelar la tarea de Pub/Sub
                if len(self._local_subscribers[session_id]) == 0:
                    task = self._pubsub_tasks.pop(session_id, None)
                    if task and not task.done():
                        task.cancel()

    async def publish_event(
        self, session_id: str, event_type: str, data: dict[str, Any], source: str = "api"
    ) -> None:
        client = await self._get_client()
        channel = self._get_channel(session_id)
        msg = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        await client.publish(channel, msg)


# Factoría de sesión
def create_session_store() -> SessionStoreBase:
    backend_type = settings.SESSION_STORE_BACKEND.lower()
    if backend_type == "redis":
        return RedisSessionStore(
            redis_url=settings.REDIS_URL, ttl_seconds=settings.REDIS_SESSION_TTL_SECONDS
        )
    return InMemorySessionStore()


# Instancia singleton para FastAPI
session_store = create_session_store()
SessionStore = InMemorySessionStore  # Alias para compatibilidad con código existente
