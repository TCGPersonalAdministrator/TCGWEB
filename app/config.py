import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")
    # URL que usa el propio backend de TCGWEB para llamar a TCGAPI.
    TCGAPI_BASE_URL = os.environ.get("TCGAPI_BASE_URL", "http://localhost:8080")
    # URL que el NAVEGADOR usa para pedir imágenes a TCGAPI directamente.
    # Necesita ser distinta de TCGAPI_BASE_URL cuando ambos corren en
    # contenedores Docker separados: TCGAPI_BASE_URL apunta al nombre del
    # servicio en la red interna de Docker (ej. "http://tcgapi:8080",
    # inalcanzable desde el navegador del host), mientras que esta debe seguir
    # siendo una URL accesible desde el PC (ej. "http://localhost:8080").
    TCGAPI_PUBLIC_URL = os.environ.get("TCGAPI_PUBLIC_URL", TCGAPI_BASE_URL)
