/*
==================================================================
ARCHIVO: formulario/sidebar/_submit.js
Lógica de envío (modo actual: Apps Script)
Cloudflare Worker se conecta en la siguiente fase.
==================================================================
*/

import { APPS_SCRIPT_URL, SIDEBAR_STORAGE_KEY } from './_config.js';

let isSubmitting = false;

// ────────────────────────────────────────────────────────────────
// Envío principal (Apps Script)
// ────────────────────────────────────────────────────────────────
export async function submitSidebarForm(form) {
    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = form.querySelector('#sb-submit-btn');
    const stickyBtn = document.getElementById('sb-sticky-submit');
    const submitError = document.getElementById('sb-submit-error');

    const successPanel = document.getElementById('sb-success-panel');
    const formPanel = document.getElementById('sb-form-panel');

    const setSendingState = (btn, sending) => {
        if (!btn) return;
        btn.disabled = !!sending;
        btn.innerHTML = sending
            ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...'
            : '<i class="fas fa-paper-plane" aria-hidden="true"></i> Obtener análisis gratuito';
    };

    setSendingState(submitBtn, true);
    setSendingState(stickyBtn, true);
    if (submitError) submitError.style.display = 'none';

    try {
        const formData = new FormData(form);

        // Compatibilidad con el Apps Script actual:
        // El Sheet guarda "Costo Plan" como `rango_costo`. En el sidebar usamos `rango_renta` (Fonasa).
        const rangoRenta = String(formData.get('rango_renta') || '').trim();
        const rangoCosto = String(formData.get('rango_costo') || '').trim();
        if (rangoRenta && !rangoCosto) formData.set('rango_costo', rangoRenta);

        // Fuente/UTMs
        const urlParams = new URLSearchParams(window.location.search);
        formData.append('fuente_cta', urlParams.get('fuente') || _ctaSource || 'Orgánico');
        formData.append('campana', urlParams.get('campana') || 'No especificado');

        // Archivo PDF opcional -> Apps Script espera `base64pdf` (+ filename opcional)
        const file = form.querySelector('#sb-archivo')?.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera los 5 MB.');
            if (file.type !== 'application/pdf') throw new Error('Solo se aceptan PDFs.');

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const customName = `${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}_planespro.pdf`;
            formData.append('base64pdf', base64);
            formData.append('filename', customName);
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            redirect: 'manual',
        });

        const ok = response.type === 'opaqueredirect' || response.ok;
        if (!ok) throw new Error('No se pudo enviar el formulario.');

        localStorage.removeItem(SIDEBAR_STORAGE_KEY);

        if (formPanel) formPanel.style.display = 'none';
        if (successPanel) {
            successPanel.style.display = 'flex';
            successPanel.classList.add('sb-fade-in');
        }
    } catch (err) {
        if (submitError) {
            submitError.textContent = 'Hubo un error al enviar. Inténtalo nuevamente.';
            submitError.style.display = 'block';
        }
    } finally {
        setSendingState(submitBtn, false);
        setSendingState(stickyBtn, false);
        isSubmitting = false;
    }
}

// ────────────────────────────────────────────────────────────────
// Abandono (Apps Script)
// ────────────────────────────────────────────────────────────────
export function sendAbandonedBeacon(ctaSource) {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        data.status = 'Abandonado';
        data.fuente_cta = ctaSource || 'Orgánico';
        data.campana = new URLSearchParams(window.location.search).get('campana') || 'No especificado';

        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? '')));
        navigator.sendBeacon(APPS_SCRIPT_URL, fd);
    } catch {
        // ignore
    } finally {
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
}

// ────────────────────────────────────────────────────────────────
// Progreso en localStorage
// ────────────────────────────────────────────────────────────────
const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
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
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    } catch {
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
}

// ────────────────────────────────────────────────────────────────
// Fuente del CTA
// ────────────────────────────────────────────────────────────────
let _ctaSource = 'Orgánico';
export function setCTASource(id) {
    _ctaSource = id || 'Orgánico';
}
export function getCTASource() {
    return _ctaSource;
}

