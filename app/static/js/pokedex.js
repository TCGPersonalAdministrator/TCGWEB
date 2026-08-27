function typeLabel(typeCode) {
    return t(`type.${typeCode}`);
}

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
        titleEl.textContent = t("pokedex.loading");
        bodyEl.innerHTML = '<div class="spinner-border" role="status"></div>';
        modal.show();

        fetch(`/pokedex/${id}/data`)
            .then((r) => r.json())
            .then(renderPokemon)
            .catch(() => {
                bodyEl.innerHTML = `<p class="text-danger">${t("pokedex.load_error")}</p>`;
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
            ? `<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> ${t("pokedex.owned_badge")}</span>`
            : `<span class="badge bg-secondary"><i class="bi bi-question-circle-fill"></i> ${t("pokedex.missing_badge")}</span>`;

        const types = [p.type_1, p.type_2]
            .filter(Boolean)
            .map((typeCode) => `<span class="badge type-badge type-${typeCode}">${typeLabel(typeCode)}</span>`)
            .join(" ");

        const stats = [
            [t("stat.hp"), p.hp], [t("stat.attack"), p.attack], [t("stat.defense"), p.defense],
            [t("stat.special_attack"), p.special_attack], [t("stat.special_defense"), p.special_defense], [t("stat.speed"), p.speed],
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
                ${t("pokedex.height_weight", { height: (p.height / 10).toFixed(1), weight: (p.weight / 10).toFixed(1) })}${p.generation ? " &middot; " + p.generation : ""}
            </p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", initPokedexModal);
