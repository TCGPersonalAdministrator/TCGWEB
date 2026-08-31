const LANG_FLAG_SVGS = {
    en: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="60" height="40" fill="#00247d"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 L27,18 M0,40 L27,22 M60,0 L33,18 M60,40 L33,22" stroke="#cf142b" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="13"/><path d="M30,0 V40 M0,20 H60" stroke="#cf142b" stroke-width="7"/></svg>`,
    es: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="60" height="40" fill="#aa151b"/><rect y="10" width="60" height="20" fill="#f1bf00"/></svg>`,
    ja: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="60" height="40" fill="#fff"/><circle cx="30" cy="20" r="11" fill="#bc002d"/></svg>`,
    ko: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="60" height="40" fill="#fff"/><path d="M30,9 A5.5,5.5 0 0,1 30,20 A5.5,5.5 0 0,0 30,31 A11,11 0 0,0 30,9 Z" fill="#cd2e3a"/><path d="M30,9 A11,11 0 0,0 30,31 A5.5,5.5 0 0,1 30,20 A5.5,5.5 0 0,0 30,9 Z" fill="#0047a0"/></svg>`,
    zh_cn: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="60" height="40" fill="#de2910"/><polygon points="10,4 11.35,8.14 15.71,8.15 12.19,10.71 13.53,14.85 10,12.3 6.47,14.85 7.81,10.71 4.29,8.15 8.65,8.14" fill="#ffde00"/></svg>`,
};

function langFlagHtml(idioma, className = "card-tile-flag") {
    const svg = LANG_FLAG_SVGS[idioma];
    if (!svg) return "";
    return `<span class="${className}" title="${t("catalog_lang." + idioma) || idioma}">${svg}</span>`;
}

function debounce(fn, delayMs) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delayMs);
    };
}

// Detecta un código de carta tipo "DRI 116" o "DRI-116" (código corto del
// set + número impreso) para saltarse el buscador de Pokémon.
const CARD_CODE_PATTERN = /^([a-z0-9]{2,10})[\s-]+(\d{1,4}[a-z]?)$/i;

function initCollectionAdd() {
    const langSelect = document.getElementById("add-lang");
    const setSelect = document.getElementById("add-set");
    const pokemonInput = document.getElementById("add-pokemon-search");
    const pokemonResults = document.getElementById("add-pokemon-results");
    const cardsSection = document.getElementById("add-cards-section");
    const cardsTitle = document.getElementById("add-cards-title");
    const cardsGrid = document.getElementById("add-cards-grid");
    const banner = document.getElementById("add-result-banner");

    if (!pokemonInput) return;

    let selectedPokemon = null;
    let lastCode = null;

    const runSearch = debounce((q) => {
        if (!q) {
            pokemonResults.innerHTML = "";
            return;
        }
        const codeMatch = q.match(CARD_CODE_PATTERN);
        if (codeMatch) {
            pokemonResults.innerHTML = "";
            selectedPokemon = null;
            lastCode = { code: codeMatch[1], number: codeMatch[2] };
            loadCardsByCode(lastCode);
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

    function reloadCurrent() {
        if (selectedPokemon) loadCards(selectedPokemon);
        else if (lastCode) loadCardsByCode(lastCode);
    }

    function loadSetOptions(lang) {
        return fetch(`/collection/add/sets?lang=${encodeURIComponent(lang)}`)
            .then((r) => r.json())
            .then((sets) => {
                setSelect.innerHTML = `<option value="">${t("add.all_sets")}</option>`;
                sets.forEach((s) => {
                    const opt = document.createElement("option");
                    opt.value = s.id;
                    opt.textContent = s.name;
                    setSelect.appendChild(opt);
                });
                refreshCustomSelect(setSelect);
            })
            .catch(() => {});
    }

    langSelect.addEventListener("change", () => {
        loadSetOptions(langSelect.value).then(reloadCurrent);
    });

    setSelect.addEventListener("change", reloadCurrent);

    loadSetOptions(langSelect.value);

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
                lastCode = null;
                pokemonInput.value = p.name;
                pokemonResults.innerHTML = "";
                loadCards(p);
            });
            pokemonResults.appendChild(item);
        });
    }

    function loadCards(pokemon) {
        const lang = langSelect.value;
        const setId = setSelect.value;
        cardsSection.classList.remove("d-none");
        cardsTitle.textContent = t("add.loading_cards", { name: pokemon.name });
        cardsGrid.innerHTML = "";

        const url = new URL(`/collection/add/pokemon/${pokemon.id}/cards`, window.location.origin);
        url.searchParams.set("lang", lang);
        if (setId) url.searchParams.set("set", setId);

        fetch(url)
            .then((r) => r.json())
            .then((cards) => {
                cardsTitle.textContent = t("add.cards_of", { name: pokemon.name, lang: langSelect.selectedOptions[0].textContent });
                if (!cards.length) {
                    cardsGrid.innerHTML = `<p class="text-muted">${t("add.no_cards")}</p>`;
                    return;
                }
                cards.forEach((c) => cardsGrid.appendChild(buildCardTile(c, lang)));
            });
    }

    function loadCardsByCode({ code, number }) {
        const lang = langSelect.value;
        const codeUpper = code.toUpperCase();
        cardsSection.classList.remove("d-none");
        cardsTitle.textContent = t("add.searching_code", { code: codeUpper, number });
        cardsGrid.innerHTML = "";

        fetch(`/collection/add/lookup-card?lang=${encodeURIComponent(lang)}&code=${encodeURIComponent(code)}&number=${encodeURIComponent(number)}`)
            .then((r) => r.json())
            .then((cards) => {
                cardsTitle.textContent = t("add.result_for_code", { code: codeUpper, number, lang: langSelect.selectedOptions[0].textContent });
                if (!cards.length) {
                    cardsGrid.innerHTML = `<p class="text-muted">${t("add.no_code_match")}</p>`;
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
                <button type="button" class="btn btn-sm btn-primary mt-1 w-100 btn-add-card"><i class="bi bi-plus-circle-fill"></i> ${t("add.add_btn")}</button>
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
                    banner.innerHTML = `<div class="alert alert-danger alert-dismissible fade show"><i class="bi bi-exclamation-triangle-fill"></i> ${t("add.add_failed", { name: card.name, error: body.error || t("add.unknown_error") })}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${t("app.close")}"></button></div>`;
                    return;
                }
                banner.innerHTML = `<div class="alert alert-success alert-dismissible fade show"><i class="bi bi-check-circle-fill"></i> ${t("add.added", { name: card.name, n: body.cantidad })}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${t("app.close")}"></button></div>`;
                const tile = button.closest(".card-tile");
                if (tile) {
                    tile.classList.remove("just-added");
                    void tile.offsetWidth; // reinicia la animación si se pulsa varias veces seguidas
                    tile.classList.add("just-added");
                }
            })
            .catch(() => {
                button.disabled = false;
                banner.innerHTML = `<div class="alert alert-danger alert-dismissible fade show"><i class="bi bi-exclamation-triangle-fill"></i> ${t("add.connection_failed")}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${t("app.close")}"></button></div>`;
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
        const priceSymbol = tile.dataset.priceCurrency === "EUR" ? "€" : "$";
        const cantidad = parseInt(tile.dataset.cantidad, 10) || 1;
        const unitPrice = parseFloat(tile.dataset.price);
        // Con más de 1 copia, el valor mostrado es el total (precio unitario x
        // cantidad) — el unitario se deja al lado entre paréntesis para que no
        // parezca un error de cálculo.
        const priceHtml = tile.dataset.price
            ? `<p class="text-muted small mb-1">${t("modal.price")} <strong>${(unitPrice * cantidad).toFixed(2)} ${priceSymbol}</strong>${cantidad > 1 ? ` <span class="text-muted">(${unitPrice.toFixed(2)} ${priceSymbol} × ${cantidad})</span>` : ""}</p>`
            : "";
        bodyEl.innerHTML = `
            <img src="${tile.dataset.image}" class="card-modal-img" alt="${tile.dataset.name}">
            <p class="text-muted mb-1 mt-2">${tile.dataset.set}</p>
            ${tile.dataset.rarity ? `<p class="text-muted small">${tile.dataset.rarity}</p>` : ""}
            ${priceHtml}
            <p class="d-flex align-items-center justify-content-center gap-2">${t("modal.quantity")} <strong>${tile.dataset.cantidad}</strong> ${langFlagHtml(tile.dataset.idioma, "flag-icon")}</p>
            <button type="button" class="btn btn-outline-danger btn-delete-card" data-id="${tile.dataset.id}">
                <i class="bi bi-trash3-fill"></i> ${t("modal.delete_from_collection")}
            </button>
        `;
        modal.show();
    }

    function deleteCard(id, tile) {
        if (!confirm(t("collection.confirm_delete"))) return;
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
                            ? (remaining === 1 ? t("collection.count_one") : t("collection.count_other", { n: remaining }))
                            : "";
                    }
                    if (remaining === 0) {
                        grid.insertAdjacentHTML("afterend", `<p class="text-muted">${t("collection.empty")}</p>`);
                    }
                }, 250);
            });
    }
}

document.addEventListener("DOMContentLoaded", initCollectionAdd);
document.addEventListener("DOMContentLoaded", initCollectionView);
