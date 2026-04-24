/*
==================================================================
ARCHIVO: formulario/sidebar/sidebar.js
Orquestador principal del sidebar form
==================================================================
*/

import { ISAPRES, RANGOS_RENTA } from './_config.js';
import {
    initComunaAutocomplete,
    initSistemaToggle,
    initCargasModal,
    initPhoneField,
    validateSidebar,
} from './_fields.js';
import {
    submitSidebarForm,
    saveProgress,
    loadProgress,
    sendAbandonedBeacon,
    setCTASource,
} from './_submit.js';

let sidebarOpen = false;
let ctaSource = 'Orgánico';

// ─── Punto de entrada ─────────────────────────────────────────
export function initSidebar() {
    injectSidebarHTML();

    // Esperar al DOM inyectado
    requestAnimationFrame(() => {
        bindTriggers();
        bindCloseLogic();
        initComunaAutocomplete();
        initSistemaToggle();
        initCargasModal();
        initPhoneField();
        bindFormSubmit();
        bindFileUpload();
        bindProgressSave();
        loadProgress(document.getElementById('sb-form'));

        // Abandono al salir de la página
        window.addEventListener('pagehide', () => sendAbandonedBeacon(ctaSource));
    });
}

// ─── Inyección del HTML del sidebar ──────────────────────────
function injectSidebarHTML() {
    if (document.getElementById('sb-overlay')) return; // ya existe

    const isapreOptions = ISAPRES.map(
        (i) => `<option value="${i}">${i}</option>`
    ).join('');

    const rentaOptions = RANGOS_RENTA.map(
        (r) => `<option value="${r}">${r}</option>`
    ).join('');

    const html = `
<!-- Sidebar Overlay -->
<div id="sb-overlay" class="sb-overlay" aria-hidden="true"></div>

<!-- Sidebar Panel -->
<aside id="sb-panel" class="sb-panel" role="dialog" aria-modal="true" aria-label="Formulario de contacto" tabindex="-1">

    <!-- Header -->
    <div class="sb-header">
        <div class="sb-header-brand">
            <img src="assets/logos_pp/logo-planespro.obs.webp" alt="PlanesPro" class="sb-header-logo" width="32" height="32">
            <span class="sb-header-title">Analizar mi plan</span>
        </div>
        <button type="button" id="sb-close-btn" class="sb-close-btn" aria-label="Cerrar formulario">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    </div>

    <!-- Cuerpo scrollable -->
    <div class="sb-body">

        <!-- Panel del formulario -->
        <div id="sb-form-panel">
            <p class="sb-intro">Cuéntanos sobre tu situación y te ayudamos a optimizar tu plan de salud. <strong>100% gratis.</strong></p>

            <form id="sb-form" novalidate autocomplete="on">

                <!-- ── Sección: Datos del Plan ─────────────── -->
                <div class="sb-section">
                    <h3 class="sb-section-title">
                        <i class="fas fa-map-marker-alt" aria-hidden="true"></i> Datos del plan
                    </h3>

                    <!-- L1: Comuna + Región -->
                    <div class="sb-row sb-row--2col">
                        <div class="sb-field-group">
                            <label for="sb-comuna">Comuna <span class="sb-required">*</span></label>
                            <div class="sb-autocomplete-wrap">
                                <input type="text" id="sb-comuna" name="comuna" class="sb-input"
                                    placeholder="Ej: Providencia" required autocomplete="off"
                                    aria-describedby="sb-comuna-error" />
                            </div>
                            <span class="sb-field-error" id="sb-comuna-error">Ingresa tu comuna</span>
                        </div>
                        <div class="sb-field-group">
                            <label for="sb-region">Región</label>
                            <input type="text" id="sb-region" name="region" class="sb-input sb-input--readonly"
                                placeholder="Auto" readonly tabindex="-1" />
                        </div>
                    </div>

                    <!-- L2: Sistema actual -->
                    <div class="sb-field-group">
                        <label for="sb-sistema">Sistema actual <span class="sb-required">*</span></label>
                        <select id="sb-sistema" name="sistema_actual" class="sb-input" required>
                            <option value="" disabled selected>Selecciona...</option>
                            <option value="Isapre">Isapre</option>
                            <option value="Fonasa">Fonasa</option>
                        </select>
                        <span class="sb-field-error">Selecciona una opción</span>
                    </div>

                    <!-- L2b: ¿Cuál Isapre? (condicional) -->
                    <div class="sb-field-group sb-field-hidden" id="sb-isapre-row">
                        <label for="sb-isapre">¿Cuál Isapre? <span class="sb-required">*</span></label>
                        <select id="sb-isapre" name="isapre_especifica" class="sb-input">
                            <option value="" disabled selected>Selecciona tu Isapre...</option>
                            ${isapreOptions}
                        </select>
                        <span class="sb-field-error">Selecciona tu Isapre</span>
                    </div>

                    <!-- L3: Cargas + Renta -->
                    <div class="sb-row sb-row--2col">
                        <div class="sb-field-group">
                            <label for="sb-cargas">N° de cargas <span class="sb-required">*</span></label>
                            <select id="sb-cargas" name="num_cargas" class="sb-input" required>
                                <option value="0">Sin cargas</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5 o más</option>
                            </select>
                            <span class="sb-field-error">Indica el número</span>
                        </div>
                        <div class="sb-field-group">
                            <label for="sb-renta">Rango de renta <span class="sb-required">*</span></label>
                            <select id="sb-renta" name="rango_renta" class="sb-input" required>
                                <option value="" disabled selected>Selecciona...</option>
                                ${rentaOptions}
                            </select>
                            <span class="sb-field-error">Selecciona un rango</span>
                        </div>
                    </div>
                    <!-- Hidden: edades de cargas -->
                    <input type="hidden" id="sb-edad-cargas" name="edad_cargas" />
                </div>

                <!-- ── Sección: Datos Personales ──────────── -->
                <div class="sb-section">
                    <h3 class="sb-section-title">
                        <i class="fas fa-user" aria-hidden="true"></i> Tus datos
                    </h3>

                    <!-- L4: Nombre + Teléfono -->
                    <div class="sb-field-group">
                        <label for="sb-nombre">Nombre completo <span class="sb-required">*</span></label>
                        <input type="text" id="sb-nombre" name="nombre" class="sb-input"
                            placeholder="Ej: Juan Pérez" required autocomplete="name"
                            aria-describedby="sb-nombre-error" />
                        <span class="sb-field-error" id="sb-nombre-error">Ingresa tu nombre</span>
                    </div>

                    <div class="sb-field-group">
                        <label for="sb-telefono">Teléfono <span class="sb-required">*</span></label>
                        <div class="sb-phone-wrap">
                            <span class="sb-phone-prefix">+56</span>
                            <input type="tel" id="sb-telefono" name="telefono" class="sb-input sb-input--phone"
                                placeholder="9 XXXX XXXX" required maxlength="9"
                                inputmode="numeric" autocomplete="tel-national"
                                aria-describedby="sb-telefono-error" />
                        </div>
                        <span class="sb-field-error" id="sb-telefono-error">Ingresa 9 dígitos válidos</span>
                    </div>

                    <!-- L5: Email + Archivo -->
                    <div class="sb-field-group">
                        <label for="sb-email">Correo electrónico <span class="sb-required">*</span></label>
                        <input type="email" id="sb-email" name="email" class="sb-input"
                            placeholder="nombre@correo.cl" required autocomplete="email"
                            aria-describedby="sb-email-error" />
                        <span class="sb-field-error" id="sb-email-error">Ingresa un correo válido</span>
                    </div>

                    <div class="sb-field-group">
                        <label for="sb-archivo">
                            Adjuntar cartola PDF
                            <span class="sb-optional-badge">Opcional</span>
                        </label>
                        <label class="sb-file-label" for="sb-archivo">
                            <i class="fas fa-paperclip" aria-hidden="true"></i>
                            <span id="sb-file-name">Seleccionar archivo (máx. 5 MB)</span>
                        </label>
                        <input type="file" id="sb-archivo" name="archivo"
                            class="sb-file-input" accept=".pdf" />
                        <span class="sb-field-error" id="sb-archivo-error"></span>
                    </div>

                    <!-- L6: Comentario -->
                    <div class="sb-field-group">
                        <label for="sb-comentarios">
                            Comentario
                            <span class="sb-optional-badge">Opcional</span>
                        </label>
                        <textarea id="sb-comentarios" name="comentarios" class="sb-input sb-textarea"
                            placeholder="¿Algo que quieras contarnos sobre tu situación actual?"
                            rows="3" maxlength="500"></textarea>
                    </div>
                </div>

                <!-- Error de envío -->
                <p id="sb-submit-error" class="sb-submit-error" style="display:none;"></p>

                <!-- Botón enviar -->
                <button type="submit" id="sb-submit-btn" class="sb-submit-btn">
                    <i class="fas fa-paper-plane" aria-hidden="true"></i> Obtener análisis gratuito
                </button>

                <p class="sb-legal">
                    <i class="fas fa-lock" aria-hidden="true"></i>
                    Tus datos están seguros. No hacemos spam.
                </p>

            </form>
        </div>

        <!-- Panel de éxito -->
        <div id="sb-success-panel" class="sb-success-panel" style="display:none;" role="status" aria-live="polite">
            <div class="sb-success-icon">
                <i class="fas fa-check-circle" aria-hidden="true"></i>
            </div>
            <h3 class="sb-success-title">¡Recibido!</h3>
            <p class="sb-success-text">
                Revisaremos tu caso y te contactaremos en las próximas horas.<br>
                Si tienes urgencia, escríbenos directamente por WhatsApp.
            </p>
            <a href="https://wa.me/56958785580" class="sb-wa-btn" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-whatsapp" aria-hidden="true"></i> Abrir WhatsApp
            </a>
        </div>

    </div><!-- /.sb-body -->

    <!-- Modal de abandono (dentro del sidebar) -->
    <div id="sb-abandon-modal" class="sb-abandon-modal" aria-hidden="true" role="alertdialog">
        <div class="sb-abandon-box">
            <div class="sb-abandon-icon">
                <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            </div>
            <h3 class="sb-abandon-title">¡Estás a un paso!</h3>
            <p class="sb-abandon-text">Tu análisis gratuito está casi listo. ¿Seguro que quieres salir?</p>
            <div class="sb-abandon-actions">
                <button type="button" id="sb-abandon-continue" class="sb-submit-btn">
                    Continuar llenando
                </button>
                <button type="button" id="sb-abandon-exit" class="sb-abandon-exit-btn">
                    Sí, salir
                </button>
            </div>
        </div>
    </div>

</aside>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

// ─── Triggers (botones CTA) ───────────────────────────────────
function bindTriggers() {
    document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger="formModal"]');
        if (!trigger) return;
        e.preventDefault();
        ctaSource = trigger.id || 'CTA desconocido';
        setCTASource(ctaSource);
        openSidebar();
    });
}

// ─── Abrir / Cerrar sidebar ───────────────────────────────────
function openSidebar() {
    if (sidebarOpen) return;
    sidebarOpen = true;
    const panel = document.getElementById('sb-panel');
    const overlay = document.getElementById('sb-overlay');
    document.body.classList.add('sb-no-scroll');
    overlay?.removeAttribute('aria-hidden');
    panel?.removeAttribute('aria-hidden');
    panel?.classList.add('sb-panel--open');
    overlay?.classList.add('sb-overlay--visible');
    // Focus trap: primer campo
    setTimeout(() => panel?.querySelector('input, select')?.focus(), 350);
}

function closeSidebar(force = false) {
    const form = document.getElementById('sb-form');
    const hasData = form && hasFormData(form);

    if (!force && hasData) {
        showAbandonModal();
        return;
    }

    sidebarOpen = false;
    const panel = document.getElementById('sb-panel');
    const overlay = document.getElementById('sb-overlay');
    panel?.classList.remove('sb-panel--open');
    overlay?.classList.remove('sb-overlay--visible');
    document.body.classList.remove('sb-no-scroll');
    panel?.setAttribute('aria-hidden', 'true');
    overlay?.setAttribute('aria-hidden', 'true');
    hideAbandonModal();
}

function hasFormData(form) {
    return Array.from(form.querySelectorAll('input:not([type=hidden]):not([type=file]), select, textarea'))
        .some((el) => el.value.trim() !== '' && el.id !== 'sb-region');
}

// ─── Lógica de cierre ─────────────────────────────────────────
function bindCloseLogic() {
    document.getElementById('sb-close-btn')?.addEventListener('click', () => closeSidebar());
    document.getElementById('sb-overlay')?.addEventListener('click', () => closeSidebar());

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });

    // Modal abandono
    document.getElementById('sb-abandon-continue')?.addEventListener('click', hideAbandonModal);
    document.getElementById('sb-abandon-exit')?.addEventListener('click', () => {
        sendAbandonedBeacon(ctaSource);
        closeSidebar(true);
    });
}

function showAbandonModal() {
    const modal = document.getElementById('sb-abandon-modal');
    modal?.classList.add('sb-abandon-modal--visible');
    modal?.removeAttribute('aria-hidden');
}

function hideAbandonModal() {
    const modal = document.getElementById('sb-abandon-modal');
    modal?.classList.remove('sb-abandon-modal--visible');
    modal?.setAttribute('aria-hidden', 'true');
}

// ─── Submit ───────────────────────────────────────────────────
function bindFormSubmit() {
    document.getElementById('sb-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (!validateSidebar(form)) {
            form.querySelector('.sb-has-error input, .sb-has-error select')?.focus();
            return;
        }
        await submitSidebarForm(form);
    });
}

// ─── Archivo PDF ──────────────────────────────────────────────
function bindFileUpload() {
    const fileInput = document.getElementById('sb-archivo');
    const fileName = document.getElementById('sb-file-name');
    const fileError = document.getElementById('sb-archivo-error');
    if (!fileInput) return;

    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) { fileName && (fileName.textContent = 'Seleccionar archivo (máx. 5 MB)'); return; }

        if (file.size > 5 * 1024 * 1024) {
            if (fileError) { fileError.textContent = 'El archivo supera los 5 MB.'; fileError.style.display = 'block'; }
            fileInput.value = '';
            return;
        }
        if (file.type !== 'application/pdf') {
            if (fileError) { fileError.textContent = 'Solo se aceptan archivos PDF.'; fileError.style.display = 'block'; }
            fileInput.value = '';
            return;
        }
        if (fileError) fileError.style.display = 'none';
        if (fileName) {
            fileName.textContent = `📎 ${file.name}`;
            fileName.classList.add('sb-file-selected');
        }
    });
}

// ─── Guardar progreso al escribir ─────────────────────────────
function bindProgressSave() {
    const form = document.getElementById('sb-form');
    if (!form) return;
    form.addEventListener('input', () => saveProgress(form));
    form.addEventListener('change', () => saveProgress(form));
}
