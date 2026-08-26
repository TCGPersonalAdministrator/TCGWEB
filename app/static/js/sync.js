function showSyncOverlay(text) {
    const overlay = document.getElementById("sync-overlay");
    const textEl = document.getElementById("sync-overlay-text");
    if (textEl) textEl.textContent = text;
    if (overlay) overlay.classList.remove("d-none");
}

function updateSyncOverlayText(text) {
    const textEl = document.getElementById("sync-overlay-text");
    if (textEl) textEl.textContent = text;
}

function hideSyncOverlay() {
    const overlay = document.getElementById("sync-overlay");
    if (overlay) overlay.classList.add("d-none");
}

function showSyncBanner(message, type) {
    const banner = document.getElementById("sync-result-banner");
    if (!banner) return;
    const icon = type === "success" ? "bi-check-circle-fill" : type === "warning" ? "bi-exclamation-circle-fill" : "bi-exclamation-triangle-fill";
    banner.innerHTML = `<div class="alert alert-${type}" role="alert"><i class="bi ${icon}"></i> ${message}</div>`;
}

function buildSyncResultMessage(result) {
    const parts = [];
    if (result.inserted !== undefined) {
        parts.push(`${result.inserted} nuevos`, `${result.updated} actualizados`, `${result.unchanged} sin cambios`);
        if (result.failed) parts.push(`${result.failed} fallidos`);
    }
    let msg = "Sincronización completada: " + parts.join(", ");
    if (result.duration_ms !== undefined) msg += ` en ${result.duration_ms} ms.`;
    if (result.failed_pages && result.failed_pages.length) {
        msg += ` Páginas que fallaron y se saltaron: ${JSON.stringify(result.failed_pages)} (vuelve a sincronizar para reintentarlas).`;
    }
    return msg;
}

// Arranca una sincronización (POST a startUrl) y muestra el overlay con el progreso
// en vivo (polling a /sync-status) hasta que termine. onDone(status) se llama al acabar.
function runSync(startUrl, onDone) {
    showSyncOverlay("Iniciando sincronización...");

    fetch(startUrl, { method: "POST" })
        .then((resp) => {
            if (resp.status === 409) {
                hideSyncOverlay();
                showSyncBanner("Ya hay una sincronización en curso, espera a que termine.", "warning");
                return;
            }
            if (!resp.ok) {
                hideSyncOverlay();
                showSyncBanner("No se pudo iniciar la sincronización.", "danger");
                return;
            }
            pollSyncStatus(onDone);
        })
        .catch(() => {
            hideSyncOverlay();
            showSyncBanner("No se pudo conectar con el servidor para iniciar la sincronización.", "danger");
        });
}

function pollSyncStatus(onDone) {
    fetch("/sync-status")
        .then((r) => r.json())
        .then((status) => {
            if (status.running) {
                const total = status.total || 0;
                const current = status.current || 0;
                updateSyncOverlayText(total > 0 ? `Sincronizando... ${current}/${total}` : "Sincronizando...");
                setTimeout(() => pollSyncStatus(onDone), 700);
                return;
            }

            hideSyncOverlay();
            if (status.error) {
                showSyncBanner("Error: " + status.error, "danger");
            } else if (status.result) {
                showSyncBanner(buildSyncResultMessage(status.result), "success");
            }
            if (onDone) onDone(status);
        })
        .catch((err) => {
            console.error("Error consultando /sync-status, reintentando en 1.5s:", err);
            setTimeout(() => pollSyncStatus(onDone), 1500);
        });
}

function initSyncButton(buttonId, startUrl, onDone) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener("click", () => runSync(startUrl, onDone));
}
