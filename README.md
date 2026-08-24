# TCGWEB

Parte web de la aplicación para gestión de colección Pokémon TCG. Escrita en Python con Flask + Jinja2 + Bootstrap 5, consume datos de TCGAPI.

## Requisitos

- [Python](https://www.python.org/downloads/) 3.14 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para la base de datos MariaDB) — requiere WSL2 o Hyper-V activado en Windows
- (VS Code) Extensiones [`ms-python.python`](https://marketplace.visualstudio.com/items?itemName=ms-python.python) y [`ms-python.debugpy`](https://marketplace.visualstudio.com/items?itemName=ms-python.debugpy)

## Instalación paso a paso

1. Verificar que Python está instalado:
   ```bash
   python --version
   ```

2. Crear el entorno virtual `.venv`:
   ```powershell
   python -m venv .venv
   ```

3. Activar el entorno virtual:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   (En bash/Git Bash: `source .venv/Scripts/activate`)

4. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

5. Copiar el archivo de variables de entorno de ejemplo:
   ```bash
   cp .env.example .env
   ```

6. Ejecutar la aplicación:
   ```bash
   python run.py
   ```
   Por defecto arranca en `http://localhost:5000` con `debug=True` y `threaded=True` (necesario: las páginas de sincronización hacen polling en vivo a `/sync-status` mientras la sincronización corre, y con el servidor de desarrollo sin `threaded=True` esas peticiones se bloquean entre sí).

## Base de datos (MariaDB con Docker)

La base de datos corre en un contenedor Docker de MariaDB, definido en `docker-compose.yml`. **No arranca sola**: hay que levantarla a mano cada vez (no tiene política de reinicio automático, ni al arrancar el contenedor ni al arrancar el PC).

1. Abrir Docker Desktop (debe estar corriendo el motor de Docker).

2. Levantar el contenedor:
   ```bash
   docker compose up -d
   ```

3. Comprobar que está arriba:
   ```bash
   docker compose ps
   ```

4. Para pararlo:
   ```bash
   docker compose stop
   ```
   (o `docker compose down` para además eliminar el contenedor; los datos persisten en el volumen `mariadb_data` mientras no se borre el volumen explícitamente).

### Credenciales / conexión (ej. desde DBeaver)

| Campo         | Valor         |
|---------------|---------------|
| Host          | `localhost`   |
| Puerto        | `3306`        |
| Usuario       | `admin`       |
| Contraseña    | `admin1234`   |
| Base de datos | `tcg_db`      |

## Páginas / funcionalidades

Todas las sincronizaciones siguen el mismo patrón: al pulsar el botón se dispara una petición `POST .../start` a TCGAPI (fire-and-forget, no espera), se muestra un **overlay a pantalla completa** que bloquea la interacción con la app, y JS (`static/js/sync.js`) hace *polling* a `GET /sync-status` cada 700ms para actualizar el contador (`current/total`) en vivo. Al terminar, se muestra un banner con el resultado (verde si OK, rojo si error) y la página se recarga a los 2s para reflejar el nuevo estado. Solo se permite una sincronización a la vez (si ya hay una en curso, se avisa en vez de arrancar otra).

| Ruta          | Descripción |
|---------------|---|
| `/`           | Página de inicio |
| `/pokedex/`   | Botón "Sincronizar Pokédex" — sincroniza todos los Pokémon desde PokeAPI (~5s). |
| `/admin/`     | Hub de administración, enlaza a las secciones de sincronización (Pokédex, Sets y Cartas en inglés, Cartas por idioma). |
| `/admin/sets/`| Sets y cartas **en inglés** (pokemontcg.io). Botón "Sincronizar lista de sets" (174 sets, sin cartas). Tabla con todos los sets: **verde** ("Actualizado", con fecha) si ya se sincronizaron sus cartas, **rojo** ("Sin actualizar") si no. Desplegable + botón "Actualizar" para sincronizar las cartas de **un solo set** a la vez — así no se satura la API con miles de peticiones de golpe (antes había un botón que traía las ~20.479 cartas de una sentada; se quitó por ser demasiado lento e inestable). Precios excluidos por ahora (ver README de TCGAPI). |
| `/admin/langs/` | Selector de idioma: español, japonés, coreano, chino simplificado. |
| `/admin/langs/<lang>/sets/` | Mismo patrón que `/admin/sets/` (sync de lista de sets + sync de cartas de un set, tabla verde/rojo) pero para el catálogo de ese idioma (tcgdex.dev) — catálogo de sets independiente por idioma, no una traducción del inglés. |
| `/sync-status`| (uso interno, JS) Proxy a `GET {TCGAPI_BASE_URL}/sync/status` — progreso de la sincronización en curso. |

Todas requieren TCGAPI arrancada y MariaDB corriendo; las de sets/cartas en inglés requieren además `POKEMONTCG_API_KEY` configurada en TCGAPI (las de `/admin/langs/` no necesitan API key, tcgdex.dev es abierta).

## Variables de entorno

| Variable          | Descripción                                  | Por defecto              |
|-------------------|-----------------------------------------------|---------------------------|
| `SECRET_KEY`      | Clave secreta de Flask (sesiones, CSRF, etc.) | `dev`                     |
| `TCGAPI_BASE_URL` | URL base de la API (TCGAPI)                   | `http://localhost:8080`   |

## Estructura del proyecto

```
TCGWEB/
├── run.py              Entrypoint de la aplicación
├── requirements.txt
└── app/
    ├── __init__.py       App factory (create_app)
    ├── config.py          Configuración
    ├── routes/             Blueprints / vistas (main, pokedex, admin, sync_status)
    ├── api_calls/           Llamadas HTTP a TCGAPI, separadas de las vistas (sync_api.py, sets_api.py, pokedex_api.py, lang_sets_api.py)
    ├── models/              Entidades / modelos de datos
    ├── templates/            Plantillas Jinja2 (base.html, admin/index.html, admin/sets.html, admin/langs.html, admin/lang_sets.html, etc.)
    └── static/
        ├── css/style.css       Estilos propios + overlay de sincronización
        └── js/sync.js           JS compartido: dispara sync, overlay con progreso en vivo, polling
```

## Debug en VS Code

Abre esta carpeta (`TCGWEB`) como raíz del workspace en VS Code y pulsa `F5` (configuración "TCGWEB (Flask)" ya incluida en `.vscode/launch.json`, apunta al intérprete de `.venv` automáticamente).
