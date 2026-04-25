/*
==================================================================
ARCHIVO: form/sidebar.js
==================================================================
*/

import { ISAPRES, RANGOS_RENTA } from './config.js';
import {
    initComunaAutocomplete,
    initSistemaToggle,
    initCargasModal,
    initPhoneField,
    validateSidebar,
} from './fields.js';
import {
    submitSidebarForm,
    saveProgress,
    loadProgress,
    sendAbandonedBeacon,
    setCTASource,
} from './submit.js';

let sidebarOpen = false;
let ctaSource   = 'Orgánico';

// ─── Init ─────────────────────────────────────────────────────
export function initSidebar() {
    injectHTML();
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
    });
    window.addEventListener('pagehide', () => sendAbandonedBeacon(ctaSource));
}

// ─── HTML del sidebar ─────────────────────────────────────────
function injectHTML() {
    if (document.getElementById('sb-overlay')) return;

    const isapreOpts = ISAPRES.map((i) => `<option value="${i}">${i}</option>`).join('');
    const rentaOpts  = RANGOS_RENTA.map((r) => `<option value="${r}">${r}</option>`).join('');

    document.body.insertAdjacentHTML('beforeend', `
<!-- Overlay -->
<div id="sb-overlay" class="sb-overlay" aria-hidden="true"></div>

<!-- Sidebar -->
<aside id="sb-panel" class="sb-panel" role="dialog" aria-modal="true"
       aria-label="Formulario de contacto" tabindex="-1">

  <!-- Drag handle (visible solo en móvil) -->
  <div class="sb-drag-handle" aria-hidden="true"></div>

  <!-- ══ HEADER premium ══════════════════════════════════════ -->
  <div class="sb-header">
    <div class="sb-header-left">
      <div class="sb-header-icon">
        <i class="fas fa-shield-alt" aria-hidden="true"></i>
      </div>
      <div class="sb-header-copy">
        <span class="sb-header-title">Analizar mi plan</span>
        <span class="sb-header-sub">Gratis · Sin compromiso</span>
      </div>
    </div>
    <button type="button" id="sb-close-btn" class="sb-close-btn" aria-label="Cerrar">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  </div>

  <!-- ══ CUERPO ═══════════════════════════════════════════════ -->
  <div class="sb-body" id="sb-body">

    <!-- Panel formulario -->
    <div id="sb-form-panel">

      <form id="sb-form" novalidate autocomplete="on">

        <!-- ── SECCIÓN 1: Plan ──────────────────────────── -->
        <div class="sb-section">
          <p class="sb-section-label">
            <i class="fas fa-heartbeat" aria-hidden="true"></i> Situación actual
          </p>

          <!-- FILA 1: Comuna | Fonasa o Isapre -->
          <div class="sb-row sb-row--2">

            <div class="sb-field-group">
              <label class="sb-label" for="sb-comuna">
                Comuna <span class="sb-req">*</span>
              </label>
              <div class="sb-autocomplete-wrap">
                <input type="text" id="sb-comuna" name="comuna"
                       class="sb-input" placeholder="Ej: Providencia"
                       required autocomplete="off" />
              </div>
              <!-- hidden: región para DB -->
              <input type="hidden" id="sb-region" name="region" />
              <span class="sb-field-error">Ingresa tu comuna</span>
            </div>

            <div class="sb-field-group">
              <label class="sb-label" for="sb-sistema">
                Sistema <span class="sb-req">*</span>
              </label>
              <select id="sb-sistema" name="sistema_actual" class="sb-input" required>
                <option value="" disabled>Selecciona…</option>
                <option value="Isapre">Isapre</option>
                <option value="Fonasa" selected>Fonasa</option>
              </select>
              <span class="sb-field-error">Selecciona un sistema</span>
            </div>

          </div><!-- /fila 1 -->

          <!-- FILA 2a — Solo si Isapre: ¿cuál? + cargas -->
          <div class="sb-row sb-row--2 sb-row-hidden" id="sb-row-isapre">

            <div class="sb-field-group">
              <label class="sb-label" for="sb-isapre">
                ¿Cuál Isapre? <span class="sb-req">*</span>
              </label>
              <select id="sb-isapre" name="isapre_especifica" class="sb-input">
                <option value="" disabled selected>Selecciona…</option>
                ${isapreOpts}
              </select>
              <span class="sb-field-error">Selecciona tu Isapre</span>
            </div>

            <div class="sb-field-group">
              <label class="sb-label" for="sb-cargas-isapre">
                N° de cargas <span class="sb-req">*</span>
              </label>
              <select id="sb-cargas-isapre" name="num_cargas" class="sb-input">
                <option value="0">Sin cargas</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 o más</option>
              </select>
              <span class="sb-field-error">Indica el número</span>
            </div>

          </div><!-- /fila 2a -->

          <!-- FILA 2b — Solo si Fonasa: cargas + renta -->
          <div class="sb-row sb-row--2 sb-row-hidden" id="sb-row-fonasa">

            <div class="sb-field-group">
              <label class="sb-label" for="sb-cargas-fonasa">
                N° de cargas <span class="sb-req">*</span>
              </label>
              <select id="sb-cargas-fonasa" name="num_cargas" class="sb-input">
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
              <label class="sb-label" for="sb-renta">
                Rango de renta <span class="sb-req">*</span>
              </label>
              <select id="sb-renta" name="rango_renta" class="sb-input">
                <option value="" disabled selected>Selecciona…</option>
                ${rentaOpts}
              </select>
              <span class="sb-field-error">Selecciona un rango</span>
            </div>

          </div><!-- /fila 2b -->

          <!-- Hidden: edades de cargas (para DB) -->
          <input type="hidden" id="sb-edad-cargas" name="edad_cargas" />
        </div>

        <!-- ── SECCIÓN 2: Datos personales ─────────────── -->
        <div class="sb-section">
          <p class="sb-section-label">
            <i class="fas fa-user" aria-hidden="true"></i> Tus datos
          </p>

          <!-- FILA 3: Nombre | Rango de edad -->
          <div class="sb-row sb-row--2">

            <div class="sb-field-group">
              <label class="sb-label" for="sb-nombre">
                Nombre <span class="sb-req">*</span>
              </label>
              <input type="text" id="sb-nombre" name="nombre"
                     class="sb-input" placeholder="Juan Pérez"
                     required autocomplete="name" />
              <span class="sb-field-error">Ingresa tu nombre</span>
            </div>

            <div class="sb-field-group">
              <label class="sb-label" for="sb-edad">
                Rango de edad <span class="sb-req">*</span>
              </label>
              <select id="sb-edad" name="rango_edad" class="sb-input" required>
                <option value="" disabled selected>Selecciona…</option>
                <option value="20-24">20 – 24</option>
                <option value="25-34">25 – 34</option>
                <option value="35-44">35 – 44</option>
                <option value="45-54">45 – 54</option>
                <option value="55-64">55 – 64</option>
                <option value="65+">65 o más</option>
              </select>
              <span class="sb-field-error">Selecciona tu rango</span>
            </div>

          </div><!-- /fila 3 -->

          <!-- FILA 4: Email | Teléfono -->
          <div class="sb-row sb-row--2">

            <div class="sb-field-group">
              <label class="sb-label" for="sb-email">
                Correo <span class="sb-req">*</span>
              </label>
              <input type="email" id="sb-email" name="email"
                     class="sb-input" placeholder="correo@ejemplo.cl"
                     required autocomplete="email" />
              <span class="sb-field-error">Correo inválido</span>
            </div>

            <div class="sb-field-group">
              <label class="sb-label" for="sb-telefono">
                Teléfono <span class="sb-req">*</span>
              </label>
              <div class="sb-phone-wrap">
                <span class="sb-phone-prefix">+56</span>
                <input type="tel" id="sb-telefono" name="telefono"
                       class="sb-input sb-input--phone"
                       placeholder="9 XXXX XXXX"
                       required maxlength="9" inputmode="numeric"
                       autocomplete="tel-national" />
              </div>
              <span class="sb-field-error">9 dígitos requeridos</span>
            </div>

          </div><!-- /fila 4 -->
        </div>

        <!-- ── SECCIÓN 3: Extras ────────────────────────── -->
        <div class="sb-section sb-section--last">

          <!-- Archivo -->
          <div class="sb-field-group">
            <label class="sb-label" for="sb-archivo">
              Cartola PDF
              <span class="sb-badge-opt">Opcional</span>
            </label>
            <label class="sb-file-label" for="sb-archivo">
              <i class="fas fa-paperclip" aria-hidden="true"></i>
              <span id="sb-file-name">Adjuntar archivo (máx. 5 MB)</span>
            </label>
            <input type="file" id="sb-archivo" name="archivo"
                   class="sb-file-input" accept=".pdf" />
            <span class="sb-field-error" id="sb-archivo-error"></span>
          </div>

          <!-- Comentario -->
          <div class="sb-field-group">
            <label class="sb-label" for="sb-comentarios">
              Comentario
              <span class="sb-badge-opt">Opcional</span>
            </label>
            <textarea id="sb-comentarios" name="comentarios"
                      class="sb-input sb-textarea"
                      placeholder="¿Algo que quieras contarnos?"
                      rows="3" maxlength="500"></textarea>
          </div>

          <!-- Error envío -->
          <input type="hidden" id="sb-cita-estado" name="cita_estado" value="" />
          <input type="hidden" id="sb-cita-fecha-hora" name="cita_fecha_hora" value="" />
          <input type="hidden" id="sb-cita-calendar-event-id" name="cita_calendar_event_id" value="" />
          <input type="hidden" id="sb-cita-calendar-url" name="cita_calendar_url" value="" />

          <p id="sb-submit-error" class="sb-submit-error" style="display:none"></p>

          <!-- CTA -->
          <button type="submit" id="sb-submit-btn" class="sb-submit-btn">
            <i class="fas fa-paper-plane" aria-hidden="true"></i>
            Obtener análisis gratuito
          </button>

          <p class="sb-legal">
            <i class="fas fa-lock" aria-hidden="true"></i>
            Tus datos están seguros · Sin spam
          </p>
        </div>

      </form>
    </div><!-- /sb-form-panel -->

    <!-- Panel de éxito -->
    <div id="sb-success-panel" class="sb-success-panel" style="display:none"
         role="status" aria-live="polite">
      <div class="sb-success-icon"><i class="fas fa-check-circle" aria-hidden="true"></i></div>
      <h3 class="sb-success-title">¡Recibido!</h3>
      <p class="sb-success-text">
        Revisaremos tu caso y te contactaremos pronto.<br>
        Si tienes urgencia, escríbenos por WhatsApp.
      </p>
      <a href="https://wa.me/56958785580" class="sb-wa-btn"
         target="_blank" rel="noopener noreferrer">
        <i class="fab fa-whatsapp" aria-hidden="true"></i> Abrir WhatsApp
      </a>
    </div>

  </div><!-- /sb-body -->

  <!-- ══ MODAL DE ABANDONO (dentro del sidebar) ═══════════════ -->
  <div id="sb-abandon-modal" class="sb-inner-modal"
       aria-hidden="true" role="alertdialog">
    <div class="sb-inner-modal-box sb-abandon-box">
      <div class="sb-abandon-icon"><i class="fas fa-exclamation-circle" aria-hidden="true"></i></div>
      <h3 class="sb-abandon-title">¡Estás a un paso!</h3>
      <p class="sb-abandon-text">Tu análisis gratuito está casi listo.<br>¿Seguro que quieres salir?</p>
      <div class="sb-abandon-actions">
        <button type="button" id="sb-abandon-continue" class="sb-submit-btn">
          Continuar
        </button>
        <button type="button" id="sb-abandon-exit" class="sb-abandon-exit-btn">
          Sí, salir
        </button>
      </div>
    </div>
  </div>

  <!-- Sticky footer móvil (CTA siempre visible) -->
  <div class="sb-sticky-footer">
    <button type="button" id="sb-sticky-submit" class="sb-sticky-submit">
      <i class="fas fa-paper-plane" aria-hidden="true"></i>
      Obtener análisis gratuito
    </button>
    <p class="sb-sticky-legal">
      <i class="fas fa-lock" aria-hidden="true"></i>
      Tus datos están seguros · Sin spam
    </p>
  </div>

</aside>
    `);
}

// ─── Triggers ─────────────────────────────────────────────────
function bindTriggers() {
    // Usamos capture=true para que funcione incluso dentro del menú móvil,
    // donde `navMobile` detiene la propagación en fase bubble.
    document.addEventListener(
        'click',
        (e) => {
            const trigger = e.target.closest('[data-modal-trigger="formModal"]');
            if (!trigger) return;
            e.preventDefault();
            ctaSource = trigger.id || 'CTA';
            setCTASource(ctaSource);
            openSidebar();
        },
        true
    );
}

// ─── Abrir / Cerrar ───────────────────────────────────────────
function openSidebar() {
    if (sidebarOpen) return;
    sidebarOpen = true;
    document.body.classList.add('sb-no-scroll');
    document.getElementById('sb-overlay')?.classList.add('sb-overlay--visible');
    document.getElementById('sb-panel')?.classList.add('sb-panel--open');
    setTimeout(() => document.getElementById('sb-comuna')?.focus(), 350);
}

function closeSidebar(force = false) {
    const form = document.getElementById('sb-form');
    if (!force && hasData(form)) { showAbandModal(); return; }
    sidebarOpen = false;
    document.body.classList.remove('sb-no-scroll');
    document.getElementById('sb-overlay')?.classList.remove('sb-overlay--visible');
    document.getElementById('sb-panel')?.classList.remove('sb-panel--open');
    hideAbandModal();
}

function hasData(form) {
    if (!form) return false;
    return Array.from(
        form.querySelectorAll('input:not([type=hidden]):not([type=file]), select, textarea')
    ).some((el) => el.value.trim() && el.id !== 'sb-region');
}

// ─── Lógica de cierre ─────────────────────────────────────────
function bindCloseLogic() {
    document.getElementById('sb-close-btn')?.addEventListener('click', () => closeSidebar());
    document.getElementById('sb-overlay')?.addEventListener('click', () => closeSidebar());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });
    document.getElementById('sb-abandon-continue')?.addEventListener('click', hideAbandModal);
    document.getElementById('sb-abandon-exit')?.addEventListener('click', () => {
        sendAbandonedBeacon(ctaSource);
        closeSidebar(true);
    });
}

function showAbandModal() {
    const m = document.getElementById('sb-abandon-modal');
    m?.classList.add('sb-inner-modal--visible');
    m?.removeAttribute('aria-hidden');
}
function hideAbandModal() {
    const m = document.getElementById('sb-abandon-modal');
    m?.classList.remove('sb-inner-modal--visible');
    m?.setAttribute('aria-hidden', 'true');
}

// ─── Submit ───────────────────────────────────────────────────
function bindFormSubmit() {
    const form = document.getElementById('sb-form');

    const doSubmit = async () => {
        if (!validateSidebar(form)) {
            form.querySelector('.sb-has-error .sb-input, .sb-has-error select')?.focus();
            // Scroll hasta el primer error
            form.querySelector('.sb-has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        await submitSidebarForm(form);
    };

    form?.addEventListener('submit', (e) => { e.preventDefault(); doSubmit(); });

    // Botón sticky móvil → mismo flujo
    document.getElementById('sb-sticky-submit')?.addEventListener('click', doSubmit);
}

// ─── Archivo ──────────────────────────────────────────────────
function bindFileUpload() {
    const fi = document.getElementById('sb-archivo');
    const fn = document.getElementById('sb-file-name');
    const fe = document.getElementById('sb-archivo-error');
    fi?.addEventListener('change', () => {
        const f = fi.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) {
            if (fe) { fe.textContent = 'El archivo supera los 5 MB.'; fe.style.display = 'block'; }
            fi.value = '';
            return;
        }
        if (f.type !== 'application/pdf') {
            if (fe) { fe.textContent = 'Solo se aceptan PDFs.'; fe.style.display = 'block'; }
            fi.value = '';
            return;
        }
        if (fe) fe.style.display = 'none';
        if (fn) { fn.textContent = `📎 ${f.name}`; fn.classList.add('sb-file-selected'); }
    });
}

// ─── Guardar progreso ─────────────────────────────────────────
function bindProgressSave() {
    const form = document.getElementById('sb-form');
    if (!form) return;
    const save = () => saveProgress(form);
    form.addEventListener('input', save);
    form.addEventListener('change', save);
}
