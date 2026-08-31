"""Traducciones de la interfaz (no confundir con el idioma de las cartas/
catálogo, que es un concepto totalmente distinto — ver owned_cards.idioma).

Diccionario propio en vez de Flask-Babel: para 3 idiomas y una app de este
tamaño evita añadir una dependencia nueva y un paso de compilación .po/.mo,
manteniendo el mismo criterio "sin librerías externas" que ya se usa para las
banderas o la pokéball (dibujadas a mano en SVG).
"""

from flask import g

SUPPORTED_LANGUAGES = ("en", "es", "pt")
DEFAULT_LANGUAGE = "es"
LANG_COOKIE = "app_lang"

TRANSLATIONS = {
    # ---------- Nombres de idiomas del CATÁLOGO de cartas (owned_cards.idioma
    # / tcgdex) — filtro de "Mi colección", selector de "Añadir carta", hub de
    # "Cartas por idioma", título de las banderas. Clave siempre con guion
    # bajo (zh_cn), catalog_lang_name() normaliza "zh-cn" antes de mirar aquí.
    "catalog_lang.en": {"en": "English", "es": "Inglés", "pt": "Inglês"},
    "catalog_lang.es": {"en": "Spanish", "es": "Español", "pt": "Espanhol"},
    "catalog_lang.ja": {"en": "Japanese", "es": "Japonés", "pt": "Japonês"},
    "catalog_lang.ko": {"en": "Korean", "es": "Coreano", "pt": "Coreano"},
    "catalog_lang.zh_cn": {"en": "Simplified Chinese", "es": "Chino simplificado", "pt": "Chinês simplificado"},

    # ---------- Nombres de los idiomas de la INTERFAZ, para su propio
    # selector en el navbar. ----------
    "ui_lang.en": {"en": "English", "es": "Inglés", "pt": "Inglês"},
    "ui_lang.es": {"en": "Spanish", "es": "Español", "pt": "Espanhol"},
    "ui_lang.pt": {"en": "Portuguese", "es": "Portugués", "pt": "Português"},
    # ---------- Navbar / global ----------
    "nav.pokedex": {"es": "Pokédex", "en": "Pokédex", "pt": "Pokédex"},
    "nav.collection": {"es": "Mi colección", "en": "My collection", "pt": "A minha coleção"},
    "nav.admin": {"es": "Administración", "en": "Administration", "pt": "Administração"},
    "nav.toggle_menu": {"es": "Abrir menú", "en": "Open menu", "pt": "Abrir menu"},
    "app.close": {"es": "Cerrar", "en": "Close", "pt": "Fechar"},
    "lang.switch_title": {
        "es": "Cambiar idioma de la aplicación",
        "en": "Change application language",
        "pt": "Mudar o idioma da aplicação",
    },
    "theme.to_dark": {
        "es": "Cambiar a modo oscuro",
        "en": "Switch to dark mode",
        "pt": "Mudar para o modo escuro",
    },
    "theme.to_light": {
        "es": "Cambiar a modo claro",
        "en": "Switch to light mode",
        "pt": "Mudar para o modo claro",
    },

    # ---------- Inicio ----------
    "home.title": {"es": "Inicio", "en": "Home", "pt": "Início"},
    "home.welcome": {"es": "Bienvenido", "en": "Welcome", "pt": "Bem-vindo"},
    "home.lead": {
        "es": "Estructura base del proyecto lista para empezar a construir.",
        "en": "Base project structure ready to start building.",
        "pt": "Estrutura base do projeto pronta para começar a construir.",
    },

    # ---------- Pokédex ----------
    "pokedex.title": {"es": "Pokédex", "en": "Pokédex", "pt": "Pokédex"},
    "pokedex.no_data": {
        "es": "Todavía no hay datos de la Pokédex. Sincronízala primero desde",
        "en": "There's no Pokédex data yet. Sync it first from",
        "pt": "Ainda não há dados da Pokédex. Sincroniza-a primeiro em",
    },
    "pokedex.challenge": {
        "es": "Reto del coleccionista: al menos 1 carta de cada Pokémon —",
        "en": "Collector's challenge: at least 1 card of every Pokémon —",
        "pt": "Desafio do colecionador: pelo menos 1 carta de cada Pokémon —",
    },
    "pokedex.achieved": {"es": "conseguidos.", "en": "obtained.", "pt": "obtidos."},
    "pokedex.owned_suffix": {"es": " — conseguido", "en": " — obtained", "pt": " — obtido"},
    "pokedex.missing_suffix": {"es": " — falta", "en": " — missing", "pt": " — em falta"},
    "pokedex.loading": {"es": "Cargando...", "en": "Loading...", "pt": "A carregar..."},
    "pokedex.load_error": {
        "es": "No se pudo cargar el Pokémon.",
        "en": "Couldn't load the Pokémon.",
        "pt": "Não foi possível carregar o Pokémon.",
    },
    "pokedex.owned_badge": {"es": "Conseguido", "en": "Obtained", "pt": "Obtido"},
    "pokedex.missing_badge": {"es": "Aún no lo tienes", "en": "You don't have it yet", "pt": "Ainda não o tens"},
    "pokedex.height_weight": {
        "es": "Altura: {height} m · Peso: {weight} kg",
        "en": "Height: {height} m · Weight: {weight} kg",
        "pt": "Altura: {height} m · Peso: {weight} kg",
    },
    "stat.hp": {"es": "PS", "en": "HP", "pt": "PS"},
    "stat.attack": {"es": "Ataque", "en": "Attack", "pt": "Ataque"},
    "stat.defense": {"es": "Defensa", "en": "Defense", "pt": "Defesa"},
    "stat.special_attack": {"es": "At. Esp.", "en": "Sp. Atk.", "pt": "At. Esp."},
    "stat.special_defense": {"es": "Def. Esp.", "en": "Sp. Def.", "pt": "Def. Esp."},
    "stat.speed": {"es": "Velocidad", "en": "Speed", "pt": "Velocidade"},

    # ---------- Tipos de Pokémon ----------
    "type.normal": {"es": "Normal", "en": "Normal", "pt": "Normal"},
    "type.fire": {"es": "Fuego", "en": "Fire", "pt": "Fogo"},
    "type.water": {"es": "Agua", "en": "Water", "pt": "Água"},
    "type.electric": {"es": "Eléctrico", "en": "Electric", "pt": "Elétrico"},
    "type.grass": {"es": "Planta", "en": "Grass", "pt": "Planta"},
    "type.ice": {"es": "Hielo", "en": "Ice", "pt": "Gelo"},
    "type.fighting": {"es": "Lucha", "en": "Fighting", "pt": "Lutador"},
    "type.poison": {"es": "Veneno", "en": "Poison", "pt": "Veneno"},
    "type.ground": {"es": "Tierra", "en": "Ground", "pt": "Terra"},
    "type.flying": {"es": "Volador", "en": "Flying", "pt": "Voador"},
    "type.psychic": {"es": "Psíquico", "en": "Psychic", "pt": "Psíquico"},
    "type.bug": {"es": "Bicho", "en": "Bug", "pt": "Inseto"},
    "type.rock": {"es": "Roca", "en": "Rock", "pt": "Pedra"},
    "type.ghost": {"es": "Fantasma", "en": "Ghost", "pt": "Fantasma"},
    "type.dragon": {"es": "Dragón", "en": "Dragon", "pt": "Dragão"},
    "type.dark": {"es": "Siniestro", "en": "Dark", "pt": "Sombrio"},
    "type.steel": {"es": "Acero", "en": "Steel", "pt": "Aço"},
    "type.fairy": {"es": "Hada", "en": "Fairy", "pt": "Fada"},

    # ---------- Mi colección ----------
    "collection.title": {"es": "Mi colección", "en": "My collection", "pt": "A minha coleção"},
    "collection.add_button": {"es": "Añadir carta", "en": "Add card", "pt": "Adicionar carta"},
    "collection.filter_lang": {"es": "Filtrar por idioma", "en": "Filter by language", "pt": "Filtrar por idioma"},
    "collection.filter_set": {"es": "Filtrar por set", "en": "Filter by set", "pt": "Filtrar por set"},
    "collection.filter_all": {"es": "Todos", "en": "All", "pt": "Todos"},
    "collection.sort_by": {"es": "Ordenar por", "en": "Sort by", "pt": "Ordenar por"},
    "collection.sort_default": {
        "es": "Recién añadidas primero",
        "en": "Recently added first",
        "pt": "Adicionadas recentemente primeiro",
    },
    "collection.sort_name": {"es": "Nombre (A-Z)", "en": "Name (A-Z)", "pt": "Nome (A-Z)"},
    "collection.sort_dex": {
        "es": "Número de Pokédex",
        "en": "Pokédex number",
        "pt": "Número da Pokédex",
    },
    "collection.sort_value": {
        "es": "Valor (mayor a menor)",
        "en": "Value (highest first)",
        "pt": "Valor (maior primeiro)",
    },
    "collection.sort_type": {"es": "Tipo", "en": "Type", "pt": "Tipo"},
    "collection.sort_quantity": {
        "es": "Cantidad (más copias primero)",
        "en": "Quantity (most copies first)",
        "pt": "Quantidade (mais cópias primeiro)",
    },
    "collection.progress_intro": {
        "es": "Cartas conseguidas de los sets en los que ya tienes alguna carta —",
        "en": "Cards obtained from the sets you already have a card in —",
        "pt": "Cartas obtidas dos sets em que já tens alguma carta —",
    },
    "collection.progress_suffix": {"es": "conseguidas.", "en": "obtained.", "pt": "obtidas."},
    "collection.count_one": {"es": "1 carta distinta.", "en": "1 distinct card.", "pt": "1 carta distinta."},
    "collection.count_other": {
        "es": "{n} cartas distintas.",
        "en": "{n} distinct cards.",
        "pt": "{n} cartas distintas.",
    },
    "collection.empty": {
        "es": "Todavía no tienes ninguna carta registrada.",
        "en": "You haven't registered any card yet.",
        "pt": "Ainda não tens nenhuma carta registada.",
    },
    "collection.refresh_prices": {
        "es": "Recargar precios",
        "en": "Refresh prices",
        "pt": "Atualizar preços",
    },
    "collection.total_value_intro": {
        "es": "Valor total de la colección:",
        "en": "Total collection value:",
        "pt": "Valor total da coleção:",
    },
    "collection.value_usd_note": {
        "es": "sin cotización en €",
        "en": "no € price found",
        "pt": "sem cotação em €",
    },
    "card.delete": {"es": "Eliminar", "en": "Delete", "pt": "Eliminar"},
    "modal.quantity": {"es": "Cantidad:", "en": "Quantity:", "pt": "Quantidade:"},
    "modal.price": {"es": "Valor:", "en": "Value:", "pt": "Valor:"},
    "modal.delete_from_collection": {
        "es": "Eliminar de la colección",
        "en": "Remove from collection",
        "pt": "Remover da coleção",
    },
    "collection.confirm_delete": {
        "es": "¿Eliminar esta carta de tu colección?",
        "en": "Remove this card from your collection?",
        "pt": "Remover esta carta da tua coleção?",
    },

    # ---------- Añadir carta ----------
    "add.title": {"es": "Añadir carta", "en": "Add card", "pt": "Adicionar carta"},
    "add.lead": {
        "es": 'Elige el idioma, busca el Pokémon (o escribe directamente el código de la carta, ej. "DRI 116") y elige la carta que tienes.',
        "en": 'Pick the language, search the Pokémon (or type the card\'s code directly, e.g. "DRI 116") and pick the card you have.',
        "pt": 'Escolhe o idioma, procura o Pokémon (ou escreve diretamente o código da carta, ex. "DRI 116") e escolhe a carta que tens.',
    },
    "add.step1_lang": {"es": "1. Idioma", "en": "1. Language", "pt": "1. Idioma"},
    "add.step2_set": {"es": "2. Set (opcional)", "en": "2. Set (optional)", "pt": "2. Set (opcional)"},
    "add.all_sets": {"es": "Todos los sets", "en": "All sets", "pt": "Todos os sets"},
    "add.step3_pokemon": {"es": "3. Pokémon o código", "en": "3. Pokémon or code", "pt": "3. Pokémon ou código"},
    "add.search_placeholder": {
        "es": "Ej. charizard o DRI 116",
        "en": "E.g. charizard or DRI 116",
        "pt": "Ex. charizard ou DRI 116",
    },
    "add.loading_cards": {
        "es": "Cartas de {name}...",
        "en": "{name}'s cards...",
        "pt": "Cartas de {name}...",
    },
    "add.cards_of": {
        "es": "Cartas de {name} ({lang})",
        "en": "{name}'s cards ({lang})",
        "pt": "Cartas de {name} ({lang})",
    },
    "add.no_cards": {
        "es": "No hay cartas de este Pokémon en este idioma todavía.",
        "en": "There are no cards of this Pokémon in this language yet.",
        "pt": "Ainda não há cartas deste Pokémon neste idioma.",
    },
    "add.searching_code": {
        "es": 'Buscando "{code} {number}"...',
        "en": 'Searching for "{code} {number}"...',
        "pt": 'A procurar "{code} {number}"...',
    },
    "add.result_for_code": {
        "es": 'Resultado para "{code} {number}" ({lang})',
        "en": 'Result for "{code} {number}" ({lang})',
        "pt": 'Resultado para "{code} {number}" ({lang})',
    },
    "add.no_code_match": {
        "es": "No se encontró ninguna carta con ese código en este idioma.",
        "en": "No card matched that code in this language.",
        "pt": "Não foi encontrada nenhuma carta com esse código neste idioma.",
    },
    "add.added": {
        "es": '"{name}" añadida — ahora tienes {n}.',
        "en": '"{name}" added — you now have {n}.',
        "pt": '"{name}" adicionada — agora tens {n}.',
    },
    "add.add_failed": {
        "es": 'No se pudo añadir "{name}": {error}',
        "en": 'Couldn\'t add "{name}": {error}',
        "pt": 'Não foi possível adicionar "{name}": {error}',
    },
    "add.unknown_error": {"es": "error desconocido", "en": "unknown error", "pt": "erro desconhecido"},
    "add.connection_failed": {
        "es": "No se pudo conectar con el servidor.",
        "en": "Couldn't connect to the server.",
        "pt": "Não foi possível ligar ao servidor.",
    },
    "add.add_btn": {"es": "Añadir", "en": "Add", "pt": "Adicionar"},

    # ---------- Administración ----------
    "admin.title": {"es": "Administración", "en": "Administration", "pt": "Administração"},
    "admin.lead": {
        "es": "Gestión y sincronización de datos con las fuentes externas.",
        "en": "Management and synchronization of data with external sources.",
        "pt": "Gestão e sincronização de dados com as fontes externas.",
    },
    "admin.item_pokedex_title": {"es": "Pokédex", "en": "Pokédex", "pt": "Pokédex"},
    "admin.item_pokedex_desc": {
        "es": "Sincronizar todos los Pokémon desde PokeAPI",
        "en": "Sync every Pokémon from PokeAPI",
        "pt": "Sincronizar todos os Pokémon a partir da PokeAPI",
    },
    "admin.item_sets_title": {
        "es": "Sets y Cartas (inglés)",
        "en": "Sets & Cards (English)",
        "pt": "Sets e Cartas (inglês)",
    },
    "admin.item_sets_desc": {
        "es": "Sincronizar la lista de sets y las cartas de cada set, uno a uno",
        "en": "Sync the list of sets and each set's cards, one at a time",
        "pt": "Sincronizar a lista de sets e as cartas de cada set, um a um",
    },
    "admin.item_langs_title": {
        "es": "Cartas por idioma",
        "en": "Cards by language",
        "pt": "Cartas por idioma",
    },
    "admin.item_langs_desc": {
        "es": "Español, japonés, coreano, chino simplificado — catálogo independiente por idioma",
        "en": "Spanish, Japanese, Korean, Simplified Chinese — an independent catalog per language",
        "pt": "Espanhol, japonês, coreano, chinês simplificado — catálogo independente por idioma",
    },
    "admin_pokedex.lead": {
        "es": "Sincroniza todos los Pokémon desde PokeAPI hacia la base de datos.",
        "en": "Sync every Pokémon from PokeAPI into the database.",
        "pt": "Sincroniza todos os Pokémon da PokeAPI para a base de dados.",
    },
    "admin_pokedex.sync_btn": {
        "es": "Sincronizar Pokédex",
        "en": "Sync Pokédex",
        "pt": "Sincronizar Pokédex",
    },
    "admin_sets.title": {"es": "Sets y Cartas", "en": "Sets & Cards", "pt": "Sets e Cartas"},
    "admin_sets.title_lang": {
        "es": "Sets y Cartas — {lang}",
        "en": "Sets & Cards — {lang}",
        "pt": "Sets e Cartas — {lang}",
    },
    "admin_sets.lead": {
        "es": "Primero sincroniza la lista de sets. Después, elige un set del desplegable y actualiza sus cartas de una en una para no saturar la API.",
        "en": "First sync the list of sets. Then pick a set from the dropdown and update its cards one at a time so the API doesn't get overloaded.",
        "pt": "Primeiro sincroniza a lista de sets. Depois, escolhe um set na lista e atualiza as suas cartas uma a uma para não sobrecarregar a API.",
    },
    "admin_sets.sync_list_btn": {
        "es": "Sincronizar lista de sets",
        "en": "Sync set list",
        "pt": "Sincronizar lista de sets",
    },
    "admin_sets.update_set_label": {
        "es": "Actualizar cartas de un set",
        "en": "Update a set's cards",
        "pt": "Atualizar as cartas de um set",
    },
    "admin_sets.update_btn": {"es": "Actualizar", "en": "Update", "pt": "Atualizar"},
    "admin_sets.empty": {
        "es": 'Todavía no hay sets sincronizados. Pulsa "Sincronizar lista de sets" para empezar.',
        "en": 'There are no synced sets yet. Click "Sync set list" to get started.',
        "pt": 'Ainda não há sets sincronizados. Clica em "Sincronizar lista de sets" para começar.',
    },
    "admin_sets.cards_count": {"es": "{n} cartas", "en": "{n} cards", "pt": "{n} cartas"},
    "admin_langs.title": {"es": "Cartas por idioma", "en": "Cards by language", "pt": "Cartas por idioma"},
    "admin_langs.lead": {
        "es": "Elige un idioma para sincronizar sus sets y cartas (catálogo independiente por idioma — tcgdex.dev).",
        "en": "Pick a language to sync its sets and cards (an independent catalog per language — tcgdex.dev).",
        "pt": "Escolhe um idioma para sincronizar os seus sets e cartas (catálogo independente por idioma — tcgdex.dev).",
    },
    "admin_langs.change_lang": {"es": "Cambiar idioma", "en": "Change language", "pt": "Mudar idioma"},

    # ---------- Macros compartidas ----------
    "back.default_label": {"es": "Volver", "en": "Back", "pt": "Voltar"},
    "sync.updated_at": {
        "es": "Actualizado ({date})",
        "en": "Updated ({date})",
        "pt": "Atualizado ({date})",
    },
    "sync.not_updated": {"es": "Sin actualizar", "en": "Not updated", "pt": "Não atualizado"},

    # ---------- Mensajes de sincronización (sync.js) ----------
    "sync.starting": {
        "es": "Iniciando sincronización...",
        "en": "Starting sync...",
        "pt": "A iniciar sincronização...",
    },
    "sync.progress": {
        "es": "Sincronizando... {current}/{total}",
        "en": "Syncing... {current}/{total}",
        "pt": "A sincronizar... {current}/{total}",
    },
    "sync.in_progress": {"es": "Sincronizando...", "en": "Syncing...", "pt": "A sincronizar..."},
    "sync.already_running": {
        "es": "Ya hay una sincronización en curso, espera a que termine.",
        "en": "A sync is already running, wait for it to finish.",
        "pt": "Já há uma sincronização em curso, espera que termine.",
    },
    "sync.start_failed": {
        "es": "No se pudo iniciar la sincronización.",
        "en": "Couldn't start the sync.",
        "pt": "Não foi possível iniciar a sincronização.",
    },
    "sync.connection_failed": {
        "es": "No se pudo conectar con el servidor para iniciar la sincronización.",
        "en": "Couldn't connect to the server to start the sync.",
        "pt": "Não foi possível ligar ao servidor para iniciar a sincronização.",
    },
    "sync.error_prefix": {"es": "Error: ", "en": "Error: ", "pt": "Erro: "},
    "sync.completed": {
        "es": "Sincronización completada: ",
        "en": "Sync completed: ",
        "pt": "Sincronização concluída: ",
    },
    "sync.new": {"es": "nuevos", "en": "new", "pt": "novos"},
    "sync.updated_count": {"es": "actualizados", "en": "updated", "pt": "atualizados"},
    "sync.unchanged": {"es": "sin cambios", "en": "unchanged", "pt": "sem alterações"},
    "sync.failed_count": {"es": "fallidos", "en": "failed", "pt": "falhados"},
    "sync.priced_eur": {"es": "con precio en €", "en": "priced in €", "pt": "com preço em €"},
    "sync.priced_usd": {"es": "con precio en $", "en": "priced in $", "pt": "com preço em $"},
    "sync.no_price": {"es": "sin cotización", "en": "with no price found", "pt": "sem cotação"},
    "sync.duration_prefix": {"es": " en ", "en": " in ", "pt": " em "},
    "sync.failed_pages": {
        "es": " Páginas que fallaron y se saltaron: {pages} (vuelve a sincronizar para reintentarlas).",
        "en": " Pages that failed and were skipped: {pages} (sync again to retry them).",
        "pt": " Páginas que falharam e foram ignoradas: {pages} (sincroniza novamente para as repetir).",
    },
    "time.hours_minutes": {"es": "{h} h {m} min", "en": "{h} h {m} min", "pt": "{h} h {m} min"},
    "time.minutes_seconds": {"es": "{m} min {s} s", "en": "{m} min {s} s", "pt": "{m} min {s} s"},
    "time.seconds": {"es": "{s} s", "en": "{s} s", "pt": "{s} s"},

    # ---------- Select personalizado ----------
    "select.search_placeholder": {"es": "Buscar...", "en": "Search...", "pt": "Pesquisar..."},
    "select.no_results": {"es": "Sin resultados.", "en": "No results.", "pt": "Sem resultados."},
}


def get_lang() -> str:
    """Idioma de interfaz de la petición actual (fijado en before_request)."""
    return getattr(g, "lang", DEFAULT_LANGUAGE)


def t(key: str, **kwargs) -> str:
    """Traduce `key` al idioma actual; cae a español y luego a la propia
    clave si falta la traducción, para que nunca se rompa la pantalla."""
    lang = get_lang()
    entry = TRANSLATIONS.get(key)
    if entry is None:
        return key
    text = entry.get(lang) or entry.get(DEFAULT_LANGUAGE) or key
    return text.format(**kwargs) if kwargs else text


def catalog_lang_name(idioma: str) -> str:
    """Nombre legible de un idioma del CATÁLOGO de cartas (en/es/ja/ko/zh_cn
    o zh-cn) en el idioma de interfaz actual."""
    key = "catalog_lang." + idioma.replace("-", "_")
    return t(key) if key in TRANSLATIONS else idioma


def ui_lang_name(code: str) -> str:
    key = "ui_lang." + code
    return t(key) if key in TRANSLATIONS else code


def next_ui_lang(code: str) -> str:
    """Siguiente idioma en el ciclo (en -> es -> pt -> en -> ...), para el
    botón del navbar que rota de idioma en vez de abrir un desplegable."""
    idx = SUPPORTED_LANGUAGES.index(code) if code in SUPPORTED_LANGUAGES else -1
    return SUPPORTED_LANGUAGES[(idx + 1) % len(SUPPORTED_LANGUAGES)]


def all_translations_for_current_lang() -> dict:
    """Todas las traducciones ya resueltas al idioma actual, para volcarlas
    como JSON en base.html y que el JS del cliente pueda usar t(key)."""
    lang = get_lang()
    return {
        key: entry.get(lang) or entry.get(DEFAULT_LANGUAGE) or key
        for key, entry in TRANSLATIONS.items()
    }
