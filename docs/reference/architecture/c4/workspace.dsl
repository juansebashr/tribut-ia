workspace "Fiscol Colombia" "Arquitectura de la plataforma tributaria colombiana con sincronización bidireccional" {

    model {
        usuario = person "Contribuyente / Contador" "Persona que liquida sus impuestos (F210, F110) y consulta plazos DIAN."
        agente = person "Agente Autónomo / Script IA" "Agente que interactúa con la plataforma vía API REST y SSE."
        dian = softwareSystem "DIAN (Dirección de Impuestos y Aduanas Nacionales)" "Entidad recaudadora oficial y publicadora de calendarios y formularios." "External"

        fiscol = softwareSystem "Fiscol Platform" "Sistema integral de liquidación de impuestos, simulación y sincronización visual en tiempo real." {
            
            spa = container "Single Page Application (SPA)" "Interfaz web interactiva con formulario 210, termómetro marginal, calendario y sincronización en vivo." "HTML5, Vanilla CSS, Modern JavaScript" "WebBrowser"
            
            api = container "Backend API & Engine" "Provee endpoints REST, stream SSE, motor de reglas tributarias y almacén de sesiones en memoria." "FastAPI, Python 3.11+, Pydantic v2, Uvicorn" {
                
                router = component "API Router (v1)" "Expone rutas para liquidaciones, reglas, calendario, beneficios y sincronización." "FastAPI APIRouter"
                session_service = component "Session Store & Broadcaster" "Gestiona el estado activo de la UI y distribuye eventos SSE a clientes conectados." "Python In-Memory Store & asyncio.Queue"
                engine_pn = component "Motor de Liquidación PN" "Ejecuta la depuración cedular del Formulario 210 y calcula Art. 241 E.T." "Python Service"
                engine_pj = component "Motor de Liquidación PJ" "Calcula el Formulario 110 y la Tasa de Tributación Depurada (TTD 15%)." "Python Service"
                rules_loader = component "Rules Engine & Loader" "Carga y versiona matrices tributarias desde JSON (UVT, topes, tarifas)." "Python Rules Engine"
                calendar_service = component "Calendario & NIT Parser" "Calcula dígito de verificación DIAN (Módulo 11) y fechas de vencimiento." "Python Service"
            }
            
            rules_store = container "Tax Rules Repository" "Archivos JSON versionados con parámetros legales por año gravable (2022-2026)." "JSON File System" "Database"
        }

        # Relaciones Contexto
        usuario -> fiscol "Diligencia formularios, simula escenarios y consulta vencimientos"
        agente -> fiscol "Inyecta y consulta estados de sesión vía API REST / SSE"
        fiscol -> dian "Alinea cálculos con Estatuto Tributario y resoluciones oficiales"

        # Relaciones Contenedores
        usuario -> spa "Interactúa mediante el navegador" "HTTPS"
        agente -> api "Envía comandos POST/GET y escucha eventos SSE" "HTTP/SSE"
        spa -> api "Envía payloads de cálculo y sincroniza estado de la UI" "JSON/REST"
        api -> spa "Transmite actualizaciones reactivas de estado" "Server-Sent Events (SSE)"
        api -> rules_store "Lee reglas tributarias versionadas según año gravable" "File I/O"

        # Relaciones Componentes
        spa -> router "Llama endpoints /calculate, /session, /rules, /beneficios" "HTTP"
        router -> session_service "Actualiza o consulta el estado de la sesión activa"
        router -> engine_pn "Solicita liquidación de Persona Natural"
        router -> engine_pj "Solicita liquidación de Persona Jurídica"
        router -> calendar_service "Consulta vencimiento por NIT"
        engine_pn -> rules_loader "Obtiene UVT, límites de rentas exentas y tabla Art. 241"
        engine_pj -> rules_loader "Obtiene tarifa general y parámetros TTD"
        rules_loader -> rules_store "Carga rules_YYYY.json"
        session_service -> spa "Difunde eventos state_update / reset a clientes suscritos" "SSE Stream"
    }

    views {
        systemContext fiscol "SystemContext" {
            include *
            autoLayout lr
        }

        container fiscol "Containers" {
            include *
            autoLayout lr
        }

        component api "Components" {
            include *
            autoLayout lr
        }

        styles {
            element "Person" {
                shape Person
                background #0b3b60
                color #ffffff
            }
            element "Software System" {
                background #1e40af
                color #ffffff
            }
            element "External" {
                background #64748b
                color #ffffff
            }
            element "Container" {
                background #2563eb
                color #ffffff
            }
            element "WebBrowser" {
                shape WebBrowser
            }
            element "Database" {
                shape Cylinder
            }
            element "Component" {
                background #3b82f6
                color #ffffff
            }
        }
    }
}
