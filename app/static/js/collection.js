function debounce(fn, delayMs) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delayMs);
    };
}

function initCollectionAdd() {
    const langSelect = document.getElementById("add-lang");
    const pokemonInput = document.getElementById("add-pokemon-search");
    const pokemonResults = document.getElementById("add-pokemon-results");
    const cardsSection = document.getElementById("add-cards-section");
    const cardsTitle = document.getElementById("add-cards-title");
    const cardsGrid = document.getElementById("add-cards-grid");
    const banner = document.getElementById("add-result-banner");

    if (!pokemonInput) return;

    let selectedPokemon = null;

    const runSearch = debounce((q) => {
        if (!q) {
            pokemonResults.innerHTML = "";
            return;
        }
        fetch(`/collection/add/search-pokemon?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then(renderPokemonResults)
            .catch(() => {
                pokemonResults.innerHTML = "";
            });
    }, 300);

    pokemonInput.addEventListener("input", (e) => runSearch(e.target.value.trim()));

    langSelect.addEventListener("change", () => {
        if (selectedPokemon) loadCards(selectedPokemon);
    });

    function renderPokemonResults(pokemon) {
        pokemonResults.innerHTML = "";
        pokemon.forEach((p) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "list-group-item list-group-item-action d-flex align-items-center gap-2";
            const img = p.image_url ? `<img src="${TCGAPI_BASE_URL}${p.image_url}" width="28" height="28" alt="">` : "";
            item.innerHTML = `${img}<span>#${p.id} ${p.name}</span>`;
            item.addEventListener("click", () => {
                selectedPokemon = p;
                pokemonInput.value = p.name;
                pokemonResults.innerHTML = "";
                loadCards(p);
            });
            pokemonResults.appendChild(item);
        });
    }

    function loadCards(pokemon) {
        const lang = langSelect.value;
        cardsSection.classList.remove("d-none");
        cardsTitle.textContent = `Cartas de ${pokemon.name}...`;
        cardsGrid.innerHTML = "";

        fetch(`/collection/add/pokemon/${pokemon.id}/cards?lang=${encodeURIComponent(lang)}`)
            .then((r) => r.json())
            .then((cards) => {
                cardsTitle.textContent = `Cartas de ${pokemon.name} (${langSelect.selectedOptions[0].textContent})`;
                if (!cards.length) {
                    cardsGrid.innerHTML = '<p class="text-muted">No hay cartas de este Pokémon en este idioma todavía.</p>';
                    return;
                }
                cards.forEach((c) => cardsGrid.appendChild(buildCardTile(c, lang)));
            });
    }

    function buildCardTile(card, lang) {
        const tile = document.createElement("div");
        tile.className = "card-tile";
        const img = card.image_url
            ? `<img src="${TCGAPI_BASE_URL}${card.image_url}" alt="${card.name}" loading="lazy">`
            : '<div class="pokedex-tile-placeholder">?</div>';
        tile.innerHTML = `
            ${img}
            <div class="card-tile-info">
                <div class="card-tile-name">${card.name}</div>
                <div class="card-tile-set text-muted small">${card.set_name}${card.number ? " · #" + card.number : ""}</div>
                <button type="button" class="btn btn-sm btn-primary mt-1 w-100 btn-add-card"><i class="bi bi-plus-circle-fill"></i> Añadir</button>
            </div>
        `;
        tile.querySelector(".btn-add-card").addEventListener("click", (e) => addCard(card, lang, e.target));
        return tile;
    }

    function addCard(card, lang, button) {
        button.disabled = true;
        fetch("/collection/add/card", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card_id: card.id, lang }),
        })
            .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
            .then(({ ok, body }) => {
                button.disabled = false;
                if (!ok) {
                    banner.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill"></i> No se pudo añadir "${card.name}": ${body.error || "error desconocido"}</div>`;
                    return;
                }
                banner.innerHTML = `<div class="alert alert-success"><i class="bi bi-check-circle-fill"></i> "${card.name}" añadida — ahora tienes ${body.cantidad}.</div>`;
                const tile = button.closest(".card-tile");
                if (tile) {
                    tile.classList.remove("just-added");
                    void tile.offsetWidth; // reinicia la animación si se pulsa varias veces seguidas
                    tile.classList.add("just-added");
                }
            })
            .catch(() => {
                button.disabled = false;
                banner.innerHTML = '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill"></i> No se pudo conectar con el servidor.</div>';
            });
    }
}

function initCollectionView() {
    const grid = document.getElementById("collection-grid");
    const modalEl = document.getElementById("card-modal");
    if (!grid || !modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    const titleEl = document.getElementById("card-modal-title");
    const bodyEl = document.getElementById("card-modal-body");
    const countEl = document.getElementById("collection-count");
    let currentTile = null;

    grid.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-card");
        if (deleteBtn) {
            e.stopPropagation();
            deleteCard(deleteBtn.dataset.id, deleteBtn.closest(".card-tile"));
            return;
        }
        const tile = e.target.closest(".card-tile");
        if (tile) openCardModal(tile);
    });

    modalEl.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-card");
        if (deleteBtn) deleteCard(deleteBtn.dataset.id, currentTile);
    });

    function openCardModal(tile) {
        currentTile = tile;
        titleEl.textContent = tile.dataset.name;
        bodyEl.innerHTML = `
            <img src="${tile.dataset.image}" class="card-modal-img" alt="${tile.dataset.name}">
            <p class="text-muted mb-1 mt-2">${tile.dataset.set}</p>
            ${tile.dataset.rarity ? `<p class="text-muted small">${tile.dataset.rarity}</p>` : ""}
            <p>Cantidad: <strong>${tile.dataset.cantidad}</strong></p>
            <button type="button" class="btn btn-outline-danger btn-delete-card" data-id="${tile.dataset.id}">
                <i class="bi bi-trash3-fill"></i> Eliminar de la colección
            </button>
        `;
        modal.show();
    }

    function deleteCard(id, tile) {
        if (!confirm("¿Eliminar esta carta de tu colección?")) return;
        fetch(`/collection/cards/${id}`, { method: "DELETE" })
            .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
            .then(({ ok }) => {
                if (!ok) return;
                modal.hide();
                if (!tile) return;
                tile.classList.add("removing");
                setTimeout(() => {
                    tile.remove();
                    const remaining = grid.children.length;
                    if (countEl) {
                        countEl.textContent = remaining
                            ? `${remaining} carta${remaining !== 1 ? "s" : ""} distinta${remaining !== 1 ? "s" : ""}.`
                            : "";
                    }
                    if (remaining === 0) {
                        grid.insertAdjacentHTML("afterend", '<p class="text-muted">Todavía no tienes ninguna carta registrada.</p>');
                    }
                }, 250);
            });
    }
}

document.addEventListener("DOMContentLoaded", initCollectionAdd);
document.addEventListener("DOMContentLoaded", initCollectionView);
