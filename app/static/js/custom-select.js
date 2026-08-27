function buildCustomSelect(select) {
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select form-select";
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-haspopup", "listbox");
    wrapper.setAttribute("aria-expanded", "false");

    const label = document.createElement("span");
    label.className = "custom-select-label";

    const caret = document.createElement("i");
    caret.className = "bi bi-chevron-down custom-select-caret";
    caret.setAttribute("aria-hidden", "true");

    const menu = document.createElement("div");
    menu.className = "custom-select-menu";
    menu.setAttribute("role", "listbox");

    const searchWrap = document.createElement("div");
    searchWrap.className = "custom-select-search-wrap";
    const search = document.createElement("input");
    search.type = "text";
    search.className = "custom-select-search";
    search.placeholder = t("select.search_placeholder");
    search.autocomplete = "off";
    search.spellcheck = false;
    searchWrap.appendChild(search);

    const list = document.createElement("div");
    list.className = "custom-select-list list-group";

    const empty = document.createElement("div");
    empty.className = "custom-select-empty text-muted small d-none";
    empty.textContent = t("select.no_results");

    menu.appendChild(searchWrap);
    menu.appendChild(list);
    menu.appendChild(empty);

    select.classList.add("custom-select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(label);
    wrapper.appendChild(caret);
    wrapper.appendChild(menu);

    let highlightedIndex = select.selectedIndex;

    const items = Array.from(select.options).map((opt, i) => {
        const item = document.createElement("button");
        item.type = "button";
        item.setAttribute("role", "option");
        item.className = "list-group-item list-group-item-action custom-select-option";
        item.textContent = opt.textContent;
        item.dataset.searchText = opt.textContent.toLowerCase();
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            selectIndex(i);
            close();
        });
        list.appendChild(item);
        return item;
    });

    function syncLabel() {
        const selected = select.options[select.selectedIndex];
        label.textContent = selected ? selected.textContent : "";
    }

    function updateActive() {
        items.forEach((item, i) => {
            item.classList.toggle("active", i === select.selectedIndex);
        });
    }

    function selectIndex(i) {
        if (select.selectedIndex !== i) {
            select.selectedIndex = i;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        syncLabel();
        updateActive();
    }

    function visibleItems() {
        return items.filter((item) => !item.classList.contains("d-none"));
    }

    function highlight(i) {
        highlightedIndex = i;
        items.forEach((item, idx) => {
            item.classList.toggle("highlighted", idx === i);
            if (idx === i) item.scrollIntoView({ block: "nearest" });
        });
    }

    function applyFilter() {
        const q = search.value.trim().toLowerCase();
        items.forEach((item) => {
            item.classList.toggle("d-none", !(!q || item.dataset.searchText.includes(q)));
        });
        const visible = visibleItems();
        empty.classList.toggle("d-none", visible.length > 0);
        const stillVisible = highlightedIndex >= 0 && !items[highlightedIndex].classList.contains("d-none");
        highlight(stillVisible ? highlightedIndex : items.indexOf(visible[0]));
    }

    function isOpen() {
        return menu.classList.contains("show");
    }

    function open() {
        menu.classList.add("show");
        wrapper.classList.add("open");
        wrapper.setAttribute("aria-expanded", "true");
        search.value = "";
        applyFilter();
        highlight(select.selectedIndex);
        document.addEventListener("click", onDocClick);
        setTimeout(() => search.focus(), 0);
    }

    function close() {
        menu.classList.remove("show");
        wrapper.classList.remove("open");
        wrapper.setAttribute("aria-expanded", "false");
        document.removeEventListener("click", onDocClick);
    }

    function onDocClick(e) {
        if (!wrapper.contains(e.target)) close();
    }

    wrapper.addEventListener("click", (e) => {
        if (e.target === search) return;
        if (isOpen()) close();
        else open();
    });

    wrapper.addEventListener("keydown", (e) => {
        if (document.activeElement === search) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isOpen()) open();
        } else if (e.key === "Escape") {
            close();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen()) open();
        }
    });

    search.addEventListener("input", applyFilter);

    search.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
            close();
            wrapper.focus();
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0) selectIndex(highlightedIndex);
            close();
            wrapper.focus();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const visible = visibleItems();
            if (!visible.length) return;
            const pos = visible.indexOf(items[highlightedIndex]);
            const nextPos = e.key === "ArrowDown"
                ? Math.min(pos + 1, visible.length - 1)
                : Math.max(pos - 1, 0);
            highlight(items.indexOf(visible[Math.max(nextPos, 0)]));
        }
    });

    syncLabel();
    updateActive();

    menu.style.display = "flex";
    const naturalWidth = menu.scrollWidth;
    menu.style.display = "";
    if (naturalWidth <= 300) {
        wrapper.style.minWidth = naturalWidth + "px";
    }
}

function enhanceAllSelects() {
    document.querySelectorAll("select.form-select").forEach(buildCustomSelect);
}

// Reconstruye el desplegable personalizado de un <select> cuyas <option> se
// acaban de reemplazar por JS (ej. la lista de sets cambia según el idioma
// elegido) — deshace el envoltorio anterior y vuelve a construirlo desde cero.
function refreshCustomSelect(select) {
    const wrapper = select.closest(".custom-select");
    if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.insertBefore(select, wrapper);
        wrapper.remove();
    }
    select.classList.remove("custom-select-native");
    select.removeAttribute("tabindex");
    select.removeAttribute("aria-hidden");
    select.removeAttribute("style");
    buildCustomSelect(select);
}

document.addEventListener("DOMContentLoaded", enhanceAllSelects);
