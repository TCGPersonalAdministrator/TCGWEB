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
   Por defecto arranca en `http://localhost:5000` con `debug=True`.

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
    ├── routes/             Blueprints (rutas)
    ├── models/              Entidades / modelos de datos
    ├── templates/            Plantillas Jinja2 (base.html, etc.)
    └── static/{css,js}/        Estáticos
```

## Debug en VS Code

Abre esta carpeta (`TCGWEB`) como raíz del workspace en VS Code y pulsa `F5` (configuración "TCGWEB (Flask)" ya incluida en `.vscode/launch.json`, apunta al intérprete de `.venv` automáticamente).
