/*
==================================================================
ARCHIVO: form/submit.js
Coordinador de envio del formulario actual.
La UI solo conversa con este modulo; el backend real se resuelve
por adaptador para facilitar la migracion Apps Script -> Cloudflare.
==================================================================
*/

import { SIDEBAR_STORAGE_KEY } from './config.js';
import { sendLead, sendAbandonedLead } from './backend/adapter.js';

let isSubmitting = false;
let ctaSource = 'Organico';

const APPOINTMENT_DEFAULTS = {
    cita_estado: '',
    cita_fecha_hora: '',
    cita_calendar_event_id: '',
    cita_calendar_url: '',
};

function buildLeadPayload(form) {
    const formData = new FormData(form);

    const rangoRenta = String(formData.get('rango_renta') || '').trim();
    const rangoCosto = String(formData.get('rango_costo') || '').trim();
    if (rangoRenta && !rangoCosto) formData.set('rango_costo', rangoRenta);

    const urlParams = new URLSearchParams(window.location.search);
    formData.set('fuente_cta', urlParams.get('fuente') || ctaSource || 'Organico');
    formData.set('campana', urlParams.get('campana') || 'No especificado');

    Object.entries(APPOINTMENT_DEFAULTS).forEach(([key, value]) => {
        if (!formData.has(key)) formData.set(key, value);
    });

    return formData;
}

function setSendingState(button, isSending) {
    if (!button) return;
    button.disabled = isSending;
    button.innerHTML = isSending
        ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...'
        : '<i class="fas fa-paper-plane" aria-hidden="true"></i> Obtener analisis gratuito';
}

export async function submitSidebarForm(form) {
    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = form.querySelector('#sb-submit-btn');
    const stickyBtn = document.getElementById('sb-sticky-submit');
    const submitError = document.getElementById('sb-submit-error');
    const successPanel = document.getElementById('sb-success-panel');
    const formPanel = document.getElementById('sb-form-panel');

    setSendingState(submitBtn, true);
    setSendingState(stickyBtn, true);
    if (submitError) submitError.style.display = 'none';

    try {
        const formData = buildLeadPayload(form);
        await sendLead(form, formData);

        localStorage.removeItem(SIDEBAR_STORAGE_KEY);

        if (formPanel) formPanel.style.display = 'none';
        if (successPanel) {
            successPanel.style.display = 'flex';
            successPanel.classList.add('sb-fade-in');
        }
    } catch (error) {
        if (submitError) {
            submitError.textContent = 'Hubo un error al enviar. Intentalo nuevamente.';
            submitError.style.display = 'block';
        }
    } finally {
        setSendingState(submitBtn, false);
        setSendingState(stickyBtn, false);
        isSubmitting = false;
    }
}

export function sendAbandonedBeacon(source) {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        data.status = 'Abandonado';
        data.fuente_cta = source || ctaSource || 'Organico';
        data.campana = new URLSearchParams(window.location.search).get('campana') || 'No especificado';
        Object.entries(APPOINTMENT_DEFAULTS).forEach(([key, value]) => {
            if (!(key in data)) data[key] = value;
        });
        sendAbandonedLead(data);
    } finally {
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
}

const debounce = (fn, ms = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    };
};

export const saveProgress = debounce((form) => {
    if (isSubmitting || !form) return;
    const data = {};
    form.querySelectorAll('input:not([type=file]), select, textarea').forEach((field) => {
        if (field.id) data[field.id] = field.value;
    });
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(data));
}, 400);

export function loadProgress(form) {
    if (!form) return;
    try {
        const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (!raw) return;

        const data = JSON.parse(raw);
        Object.entries(data).forEach(([id, value]) => {
            const field = form.querySelector(`#${id}`);
            if (!field) return;
            field.value = value;
            field.dispatchEvent(new Event('change', { bubbles: true }));
        });
    } catch {
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
}

export function setCTASource(id) {
    ctaSource = id || 'Organico';
}

export function getCTASource() {
    return ctaSource;
}
