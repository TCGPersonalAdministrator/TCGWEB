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
    banner.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert"><i class="bi ${icon}"></i> ${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${t("app.close")}"></button></div>`;
}

// Convierte una duración en milisegundos a un texto legible, mostrando solo
// las unidades que hacen falta (ej. "3 s", "2 min 5 s", "1 h 4 min").
function formatDuration(ms) {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return t("time.hours_minutes", { h: hours, m: minutes });
    if (minutes > 0) return t("time.minutes_seconds", { m: minutes, s: seconds });
    if (totalSeconds > 0) return t("time.seconds", { s: totalSeconds });
    return `${ms} ms`;
}

function buildSyncResultMessage(result) {
    const parts = [];
    if (result.inserted !== undefined) {
        parts.push(
            `${result.inserted} ${t("sync.new")}`,
            `${result.updated} ${t("sync.updated_count")}`,
            `${result.unchanged} ${t("sync.unchanged")}`
        );
        if (result.failed) parts.push(`${result.failed} ${t("sync.failed_count")}`);
    } else if (result.priced_eur !== undefined) {
        parts.push(`${result.priced_eur} ${t("sync.priced_eur")}`);
        if (result.priced_usd) parts.push(`${result.priced_usd} ${t("sync.priced_usd")}`);
        if (result.no_price) parts.push(`${result.no_price} ${t("sync.no_price")}`);
        if (result.failed) parts.push(`${result.failed} ${t("sync.failed_count")}`);
    }
    let msg = t("sync.completed") + parts.join(", ");
    if (result.duration_ms !== undefined) msg += t("sync.duration_prefix") + formatDuration(result.duration_ms) + ".";
    if (result.failed_pages && result.failed_pages.length) {
        msg += t("sync.failed_pages", { pages: JSON.stringify(result.failed_pages) });
    }
    return msg;
}

// Arranca una sincronización (POST a startUrl) y muestra el overlay con el progreso
// en vivo (polling a /sync-status) hasta que termine. onDone(status) se llama al acabar.
function runSync(startUrl, onDone) {
    showSyncOverlay(t("sync.starting"));

    fetch(startUrl, { method: "POST" })
        .then((resp) => {
            if (resp.status === 409) {
                hideSyncOverlay();
                showSyncBanner(t("sync.already_running"), "warning");
                return;
            }
            if (!resp.ok) {
                hideSyncOverlay();
                showSyncBanner(t("sync.start_failed"), "danger");
                return;
            }
            pollSyncStatus(onDone);
        })
        .catch(() => {
            hideSyncOverlay();
            showSyncBanner(t("sync.connection_failed"), "danger");
        });
}

function pollSyncStatus(onDone) {
    fetch("/sync-status")
        .then((r) => r.json())
        .then((status) => {
            if (status.running) {
                const total = status.total || 0;
                const current = status.current || 0;
                updateSyncOverlayText(total > 0 ? t("sync.progress", { current, total }) : t("sync.in_progress"));
                setTimeout(() => pollSyncStatus(onDone), 700);
                return;
            }

            hideSyncOverlay();
            if (status.error) {
                showSyncBanner(t("sync.error_prefix") + status.error, "danger");
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
