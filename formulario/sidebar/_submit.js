/*
==================================================================
ARCHIVO: formulario/sidebar/_submit.js
Lógica de envío — STUB (front-end only)
El envío real a Cloudflare Worker se conecta en la siguiente fase.
==================================================================
*/

import { SIDEBAR_STORAGE_KEY } from './_config.js';

let isSubmitting = false;

// ─── Envío principal (STUB) ───────────────────────────────────
export async function submitSidebarForm(form) {
    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = form.querySelector('#sb-submit-btn');
    const successPanel = document.getElementById('sb-success-panel');
    const formPanel = document.getElementById('sb-form-panel');

    // Estado visual: enviando
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';
    }

    // Simular delay de red (800ms)
    await new Promise((r) => setTimeout(r, 800));

    // TODO: conectar con Cloudflare Worker
    console.log('[Sidebar] Datos del formulario (pendiente Cloudflare):');
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach((el) => {
        if (el.id) data[el.id] = el.value;
    });
    console.table(data);

    localStorage.removeItem(SIDEBAR_STORAGE_KEY);

    // Mostrar pantalla de éxito
    if (formPanel) formPanel.style.display = 'none';
    if (successPanel) {
        successPanel.style.display = 'flex';
        successPanel.classList.add('sb-fade-in');
    }

    isSubmitting = false;
}

// ─── Abandono ─────────────────────────────────────────────────
export function sendAbandonedBeacon(_ctaSource) {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return;
    // TODO: conectar con Cloudflare Worker
    console.log('[Sidebar] Abandono registrado (pendiente Cloudflare):', JSON.parse(raw));
    localStorage.removeItem(SIDEBAR_STORAGE_KEY);
}

// ─── Progreso en localStorage ─────────────────────────────────
const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export const saveProgress = debounce((form) => {
    if (isSubmitting || !form) return;
    const data = {};
    form.querySelectorAll('input:not([type=file]), select, textarea').forEach((el) => {
        if (el.id) data[el.id] = el.value;
    });
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(data));
}, 400);

export function loadProgress(form) {
    if (!form) return;
    try {
        const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        Object.entries(data).forEach(([id, val]) => {
            const el = form.querySelector(`#${id}`);
            if (el) {
                el.value = val;
                // Disparar change para activar lógica condicional (ej: Isapre toggle)
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    } catch (e) {
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
}

// ─── Fuente del CTA ───────────────────────────────────────────
let _ctaSource = 'Orgánico';
export function setCTASource(id) { _ctaSource = id || 'Orgánico'; }
export function getCTASource() { return _ctaSource; }
