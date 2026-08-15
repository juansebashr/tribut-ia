# ADR 0002: Sincronización Bidireccional en Tiempo Real con Server-Sent Events (SSE)

- **Estado**: Aceptado
- **Fecha**: 2026-08-14
- **Autor**: Juan Sebastian Hernandez (@juansebashr)

## Contexto
Se requería que la plataforma TributIA pudiera ser controlada de forma remota por agentes de inteligencia artificial y scripts de prueba, permitiendo inyectar datos en vivo que se reflejaran instantáneamente en el navegador del usuario y, a la inversa, permitir a los scripts consultar el estado exacto de lo que el usuario está viendo en pantalla.

## Decisión
Implementar un canal reactivo bidireccional asimétrico:
1. **API ➔ Navegador**: Protocolo Server-Sent Events (SSE) mediante `EventSource` en `/api/v1/session/events`.
2. **Navegador ➔ API**: Endpoint REST `POST /api/v1/session/state?source=ui` con debouncing de 400ms para no saturar la red mientras el usuario digita.
3. **Almacén de Sesión**: `SessionStore` en memoria en el backend FastAPI con colas `asyncio.Queue` por suscriptor.

## Consecuencias
- **Positivas**: Extremadamente ligero, compatible con HTTP/1.1 y HTTP/2, no requiere configurar servidores WebSocket complejos ni manejar handshakes binarios pesados.
- **Negativas**: SSE es unidireccional (del servidor al cliente), por lo que el envío desde el cliente requiere peticiones POST complementarias.
