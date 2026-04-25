/*
==================================================================
ARCHIVO: form/backend/apps-script.js
Implementacion transitoria para el backend actual en Google Apps Script.
==================================================================
*/

import { APPS_SCRIPT_URL } from '../config.js';

async function appendPdfAsBase64(form, formData) {
    const file = form.querySelector('#sb-archivo')?.files?.[0];
    if (!file) return formData;

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
    return formData;
}

export async function sendLeadToAppsScript(form, formData) {
    const payload = await appendPdfAsBase64(form, formData);
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: payload,
        redirect: 'manual',
    });

    const ok = response.type === 'opaqueredirect' || response.ok;
    if (!ok) throw new Error('No se pudo enviar el formulario.');
}

export function sendAbandonedToAppsScript(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value ?? ''));
    });
    navigator.sendBeacon(APPS_SCRIPT_URL, formData);
}
