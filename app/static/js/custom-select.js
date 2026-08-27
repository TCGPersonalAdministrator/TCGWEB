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
    menu.className = "custom-select-menu list-group";
    menu.setAttribute("role", "listbox");

    select.classList.add("custom-select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(label);
    wrapper.appendChild(caret);
    wrapper.appendChild(menu);

    let highlightedIndex = select.selectedIndex;

    Array.from(select.options).forEach((opt, i) => {
        const item = document.createElement("button");
        item.type = "button";
        item.setAttribute("role", "option");
        item.className = "list-group-item list-group-item-action custom-select-option";
        item.textContent = opt.textContent;
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            selectIndex(i);
            close();
        });
        menu.appendChild(item);
    });

    function syncLabel() {
        const selected = select.options[select.selectedIndex];
        label.textContent = selected ? selected.textContent : "";
    }

    function updateActive() {
        Array.from(menu.children).forEach((item, i) => {
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

    function highlight(i) {
        highlightedIndex = i;
        Array.from(menu.children).forEach((item, idx) => {
            item.classList.toggle("highlighted", idx === i);
            if (idx === i) item.scrollIntoView({ block: "nearest" });
        });
    }

    function isOpen() {
        return menu.classList.contains("show");
    }

    function open() {
        menu.classList.add("show");
        wrapper.classList.add("open");
        wrapper.setAttribute("aria-expanded", "true");
        highlight(select.selectedIndex);
        document.addEventListener("click", onDocClick);
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

    wrapper.addEventListener("click", () => {
        if (isOpen()) close();
        else open();
    });

    wrapper.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isOpen()) {
                selectIndex(highlightedIndex);
                close();
            } else {
                open();
            }
        } else if (e.key === "Escape") {
            close();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen()) open();
            else highlight(Math.min(highlightedIndex + 1, select.options.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen()) open();
            else highlight(Math.max(highlightedIndex - 1, 0));
        }
    });

    syncLabel();
    updateActive();

    menu.style.display = "block";
    const naturalWidth = menu.scrollWidth;
    menu.style.display = "";
    if (naturalWidth <= 300) {
        wrapper.style.minWidth = naturalWidth + "px";
    }
}

function enhanceAllSelects() {
    document.querySelectorAll("select.form-select").forEach(buildCustomSelect);
}

document.addEventListener("DOMContentLoaded", enhanceAllSelects);
