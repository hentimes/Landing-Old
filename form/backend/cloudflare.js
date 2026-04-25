/*
==================================================================
ARCHIVO: form/backend/cloudflare.js
Stub para la futura implementacion sobre Cloudflare Worker + D1 + R2.
==================================================================
*/

import { WORKER_URL } from '../config.js';

const buildUrl = (path) => `${WORKER_URL.replace(/\/$/, '')}${path}`;

export async function sendLeadToCloudflare(_form, formData) {
    const response = await fetch(buildUrl('/api/form/leads'), {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('No se pudo enviar el formulario a Cloudflare.');
    }
}

export function sendAbandonedToCloudflare(data) {
    const payload = JSON.stringify(data);
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(buildUrl('/api/form/leads/abandoned'), blob);
}
