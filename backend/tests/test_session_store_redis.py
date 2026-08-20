import concurrent.futures

import fakeredis.aioredis

from app.services.session_store import RedisSessionStore


def test_redis_session_store_lifecycle_and_ttl():
    """Valida que RedisSessionStore persista datos con TTL de 86.400 segundos (1 día) y soporte rolling expiration."""

    def _target():
        import asyncio

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        async def _test():
            fake_client = fakeredis.aioredis.FakeRedis(decode_responses=True)
            store = RedisSessionStore(redis_url="redis://localhost:6379/0", ttl_seconds=86400)
            store._redis = fake_client

            try:
                # 1. get_state de sesión inexistente debe inicializar por defecto con TTL
                state = await store.get_state("test_user_1")
                assert state.session_id == "test_user_1"
                assert state.revision == 1

                # Verificar que la clave en Redis existe y tiene TTL <= 86400
                ttl = await fake_client.ttl("session:test_user_1")
                assert 86000 <= ttl <= 86400

                # 2. update_state debe incrementar revisión y guardar cambios
                update_payload = {
                    "metadata": {"nombre": "JUAN SEBASTIAN HERNANDEZ", "tax_year": 2025},
                    "persona_natural": {
                        "rentas_trabajo": 206083000.0,
                        "aporte_salud_obligatorio": 6868000.0,
                    },
                }
                updated = await store.update_state("test_user_1", update_payload, source="api")
                assert updated.revision == 2
                assert updated.metadata["nombre"] == "JUAN SEBASTIAN HERNANDEZ"
                assert updated.persona_natural["rentas_trabajo"] == 206083000.0

                # 3. get_state posterior recupera el estado actualizado y renueva el TTL
                fetched = await store.get_state("test_user_1")
                assert fetched.revision == 2
                assert fetched.persona_natural["rentas_trabajo"] == 206083000.0

                new_ttl = await fake_client.ttl("session:test_user_1")
                assert 86000 <= new_ttl <= 86400
            finally:
                await fake_client.aclose()

        try:
            loop.run_until_complete(_test())
        finally:
            loop.close()
            asyncio.set_event_loop(None)

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        executor.submit(_target).result()


def test_redis_session_store_pubsub_broadcast():
    """Valida la suscripción a eventos y la publicación Pub/Sub en Redis."""

    def _target():
        import asyncio

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        async def _test():
            fake_client = fakeredis.aioredis.FakeRedis(decode_responses=True)
            store = RedisSessionStore(redis_url="redis://localhost:6379/0", ttl_seconds=86400)
            store._redis = fake_client

            try:
                # Suscribir cliente
                queue = await store.subscribe("test_pubsub")
                assert queue is not None

                # Publicar actualización
                await store.update_state(
                    "test_pubsub", {"metadata": {"nombre": "TEST BROKER"}}, source="api"
                )

                # Desuscribir limpiamente
                await store.unsubscribe("test_pubsub", queue)
            finally:
                await fake_client.aclose()

        try:
            loop.run_until_complete(_test())
        finally:
            loop.close()
            asyncio.set_event_loop(None)

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        executor.submit(_target).result()
