/*
==================================================================
ARCHIVO: form/backend/adapter.js
Punto unico de seleccion de backend para el formulario actual.
==================================================================
*/

import { BACKEND_TARGET } from '../config.js';
import { sendLeadToAppsScript, sendAbandonedToAppsScript } from './apps-script.js';
import { sendLeadToCloudflare, sendAbandonedToCloudflare } from './cloudflare.js';

export async function sendLead(form, formData) {
    if (BACKEND_TARGET === 'cloudflare') {
        return sendLeadToCloudflare(form, formData);
    }
    return sendLeadToAppsScript(form, formData);
}

export function sendAbandonedLead(data) {
    if (BACKEND_TARGET === 'cloudflare') {
        return sendAbandonedToCloudflare(data);
    }
    return sendAbandonedToAppsScript(data);
}
