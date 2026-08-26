const POKEMON_TYPE_LABELS = {
    normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico",
    grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
    ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
    rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
    steel: "Acero", fairy: "Hada",
};

function initPokedexModal() {
    const grid = document.querySelector(".pokedex-grid");
    const modalEl = document.getElementById("pokemon-modal");
    if (!grid || !modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    const titleEl = document.getElementById("pokemon-modal-title");
    const bodyEl = document.getElementById("pokemon-modal-body");

    grid.addEventListener("click", (e) => {
        const tile = e.target.closest(".pokedex-tile");
        if (tile) openPokemonModal(tile.dataset.id);
    });

    function openPokemonModal(id) {
        titleEl.textContent = "Cargando...";
        bodyEl.innerHTML = '<div class="spinner-border" role="status"></div>';
        modal.show();

        fetch(`/pokedex/${id}/data`)
            .then((r) => r.json())
            .then(renderPokemon)
            .catch(() => {
                bodyEl.innerHTML = '<p class="text-danger">No se pudo cargar el Pokémon.</p>';
            });
    }

    function statRow(label, value) {
        const pct = Math.max(0, Math.min(value, 200)) / 2;
        return `
            <div class="stat-row">
                <span class="stat-label">${label}</span>
                <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
                <span class="stat-value">${value}</span>
            </div>
        `;
    }

    function renderPokemon(p) {
        titleEl.textContent = `#${p.id} ${p.name}`;

        const statusBadge = p.owned
            ? '<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> Conseguido</span>'
            : '<span class="badge bg-secondary"><i class="bi bi-question-circle-fill"></i> Aún no lo tienes</span>';

        const types = [p.type_1, p.type_2]
            .filter(Boolean)
            .map((t) => `<span class="badge type-badge type-${t}">${POKEMON_TYPE_LABELS[t] || t}</span>`)
            .join(" ");

        const stats = [
            ["PS", p.hp], ["Ataque", p.attack], ["Defensa", p.defense],
            ["At. Esp.", p.special_attack], ["Def. Esp.", p.special_defense], ["Velocidad", p.speed],
        ].map(([label, value]) => statRow(label, value)).join("");

        const img = p.image_url
            ? `<img src="${TCGAPI_BASE_URL}${p.image_url}" class="pokemon-modal-img ${p.owned ? "" : "missing"}" alt="${p.name}">`
            : "";

        bodyEl.innerHTML = `
            ${img}
            <div class="my-2">${statusBadge}</div>
            <div class="mb-2">${types}</div>
            ${p.genus_es ? `<p class="text-muted mb-2">${p.genus_es}</p>` : ""}
            <div class="pokemon-stats text-start mx-auto" style="max-width: 320px;">${stats}</div>
            <p class="text-muted small mt-3 mb-0">
                Altura: ${(p.height / 10).toFixed(1)} m &middot; Peso: ${(p.weight / 10).toFixed(1)} kg${p.generation ? " &middot; " + p.generation : ""}
            </p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", initPokedexModal);
