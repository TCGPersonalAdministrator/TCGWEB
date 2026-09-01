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

## Todo con Docker (MariaDB + TCGAPI + TCGWEB)

`docker-compose.yml` (en esta carpeta) orquesta los **3** contenedores de la aplicación: `mariadb`, `tcgapi` (build desde `../TCGAPI/Dockerfile`) y `tcgweb` (build desde `./Dockerfile`, esta misma carpeta). Es el mismo fichero que antes solo tenía MariaDB — se amplió el 2026-09-01 para no depender de VS Code para arrancar cada proyecto a mano; ver nota en `context.md`. **Ninguno arranca solo**: los tres tienen `restart: "no"` a propósito, igual que ya tenía MariaDB — se levantan a mano cuando se quieran usar, nunca automáticamente al arrancar el PC o Docker Desktop.

1. Abrir Docker Desktop (debe estar corriendo el motor de Docker).

2. Levantar los tres contenedores:
   ```bash
   docker compose up -d
   ```
   La primera vez construye las imágenes de `tcgapi`/`tcgweb` (puede tardar un poco); las siguientes reutiliza la imagen ya construida. `tcgapi` espera a que MariaDB esté realmente lista (`healthcheck`) antes de arrancar.

3. Comprobar que están arriba:
   ```bash
   docker compose ps
   ```
   La web queda en `http://localhost:5000` y la API en `http://localhost:8080` (igual que ejecutándolas a mano).

4. Para pararlos:
   ```bash
   docker compose stop
   ```
   (o `docker compose down` para además eliminar los contenedores; los datos de MariaDB persisten en el volumen `mariadb_data` y las imágenes descargadas de TCGAPI en `../TCGAPI/storage/` mientras no se borren explícitamente).

5. Tras cambiar código de TCGAPI o TCGWEB, hace falta reconstruir la imagen para que el contenedor recoja el cambio:
   ```bash
   docker compose up -d --build
   ```

Una vez levantados la primera vez con `docker compose up -d`, Docker Desktop los agrupa bajo el proyecto **"tcgweb"** en la pestaña *Containers*: desde ahí se pueden arrancar/parar los tres juntos (interruptor del grupo) o cada uno por separado, sin volver a tocar la terminal ni abrir VS Code.

### Solo la base de datos

Si por lo que sea solo se quiere levantar MariaDB (ej. para depurar TCGAPI/TCGWEB a mano desde VS Code, como antes):
```bash
docker compose up -d mariadb
```

### Variables de entorno y secretos en Docker

- `tcgapi` carga `../TCGAPI/.env` dentro del contenedor (incluida `POKEMONTCG_API_KEY`) y solo sobreescribe `DATABASE_URL` para apuntar al host `mariadb` (nombre del servicio en la red interna de Compose) en vez de `localhost`.
- `tcgweb` carga `.env` (esta carpeta) y sobreescribe `TCGAPI_BASE_URL`/`TCGAPI_PUBLIC_URL`/`HOST`/`PORT` — ver la tabla de variables más abajo, especialmente la diferencia entre `TCGAPI_BASE_URL` y `TCGAPI_PUBLIC_URL`.
- Ninguno de los dos `.env` se copia dentro de la imagen (excluidos vía `.dockerignore`) — solo se inyectan como variables de entorno del contenedor en tiempo de ejecución.

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
| `/pokedex/`   | **Vista pública de la Pokédex**: rejilla con los 1025 Pokémon, en color los que ya tienen al menos 1 carta registrada (`owned`) y atenuados/gris los que faltan, con barra de progreso — es el reto del coleccionista, no la administración/sync. Al hacer click en un Pokémon se abre en grande en un modal (fondo semitransparente) con sus stats, tipos, altura/peso y si está conseguido o no (mantiene el gris si falta). |
| `/collection/` | **Mi colección**: todas las cartas que posee el usuario, con imagen, filtro desplegable por idioma. Botón "Añadir carta". Cada carta tiene un botón "Eliminar" (con confirmación) y, al hacer click en la imagen, se abre en grande en un modal (fondo semitransparente) con sus datos y otro botón de eliminar. |
| `/collection/add/` | Flujo para añadir una carta: elegir idioma → buscar Pokémon por nombre (autocompletado) → ver sus cartas en ese idioma con imagen → pulsar "Añadir" en la que corresponda (incrementa cantidad si ya la tenías). |
| `/admin/`     | Hub de administración, enlaza a las secciones de sincronización (Pokédex, Sets y Cartas en inglés, Cartas por idioma). |
| `/admin/pokedex/` | Botón "Sincronizar Pokédex" — sincroniza todos los Pokémon desde PokeAPI (~5s). (Antes vivía en `/pokedex/`, movido aquí al convertir esa ruta en la vista pública de progreso.) |
| `/admin/sets/`| Sets y cartas **en inglés** (pokemontcg.io). Botón "Sincronizar lista de sets" (174 sets, sin cartas). Tabla con todos los sets: **verde** ("Actualizado", con fecha) si ya se sincronizaron sus cartas, **rojo** ("Sin actualizar") si no. Desplegable + botón "Actualizar" para sincronizar las cartas de **un solo set** a la vez — así no se satura la API con miles de peticiones de golpe (antes había un botón que traía las ~20.479 cartas de una sentada; se quitó por ser demasiado lento e inestable). Precios excluidos por ahora (ver README de TCGAPI). |
| `/admin/langs/` | Selector de idioma: español, japonés, coreano, chino simplificado. |
| `/admin/langs/<lang>/sets/` | Mismo patrón que `/admin/sets/` (sync de lista de sets + sync de cartas de un set, tabla verde/rojo) pero para el catálogo de ese idioma (tcgdex.dev) — catálogo de sets independiente por idioma, no una traducción del inglés. |
| `/sync-status`| (uso interno, JS) Proxy a `GET {TCGAPI_BASE_URL}/sync/status` — progreso de la sincronización en curso. |

Todas requieren TCGAPI arrancada y MariaDB corriendo; las de sets/cartas en inglés requieren además `POKEMONTCG_API_KEY` configurada en TCGAPI (las de `/admin/langs/` no necesitan API key, tcgdex.dev es abierta). Las imágenes (Pokédex y cartas) las sirve TCGAPI en su propio puerto (`GET {TCGAPI_BASE_URL}/images/...`); las plantillas reciben `tcgapi_base_url` (context processor en `app/__init__.py`) para construir esas URLs, ya que TCGWEB corre en un puerto distinto.

## Variables de entorno

| Variable             | Descripción                                  | Por defecto              |
|----------------------|-----------------------------------------------|---------------------------|
| `SECRET_KEY`         | Clave secreta de Flask (sesiones, CSRF, etc.) | `dev`                     |
| `TCGAPI_BASE_URL`    | URL de TCGAPI que usa **el backend de TCGWEB** (llamadas `requests.*` en `app/api_calls/`). En Docker Compose es `http://tcgapi:8080` (nombre del servicio). | `http://localhost:8080`   |
| `TCGAPI_PUBLIC_URL`  | URL de TCGAPI que usa **el navegador** para pedir imágenes directamente (`<img src>`). Tiene que ser siempre una URL accesible desde tu PC — en Docker Compose sigue siendo `http://localhost:8080`, NO el nombre del servicio (el navegador no está dentro de la red de Docker). Si no se define, cae en `TCGAPI_BASE_URL`. | `http://localhost:8080`   |
| `HOST`               | Interfaz en la que escucha el servidor de Flask (`run.py`). En Docker debe ser `0.0.0.0` para que el puerto publicado del contenedor funcione; en local se deja en `127.0.0.1`. | `127.0.0.1`                |
| `PORT`               | Puerto en el que escucha Flask (`run.py`).    | `5000`                     |

## Estructura del proyecto

```
TCGWEB/
├── run.py              Entrypoint de la aplicación
├── requirements.txt
├── Dockerfile           Imagen Docker de esta app (python:3.14-slim + Flask)
├── .dockerignore
├── docker-compose.yml   Orquesta mariadb + tcgapi (../TCGAPI) + tcgweb (esta carpeta)
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
