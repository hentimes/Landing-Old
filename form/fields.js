/*
==================================================================
ARCHIVO: form/fields.js
Lógica de campos: autocomplete comunas, toggle Isapre/Fonasa,
modal de cargas (dentro del sidebar), teléfono +56, validación.
==================================================================
*/

import { comunasRegiones } from './config.js';

// ─── Levenshtein Distance ─────────────────────────────────────
function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = Array.from({ length: b.length + 1 }, (_, j) =>
        Array.from({ length: a.length + 1 }, (_, i) => (j === 0 ? i : i === 0 ? j : 0))
    );
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }
    return matrix[b.length][a.length];
}

const normalize = (t) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─── Autocomplete de Comunas ──────────────────────────────────
export function initComunaAutocomplete() {
    const input = document.getElementById('sb-comuna');
    const regionInput = document.getElementById('sb-region'); // hidden
    if (!input) return;

    const allComunas = Object.keys(comunasRegiones).sort();
    let dropdown = null;

    const selectComuna = (name) => {
        input.value = name;
        if (regionInput) regionInput.value = comunasRegiones[name] || '';
        hideDropdown();
        input.classList.remove('sb-input--error');
        input.classList.add('sb-input--valid');
    };

    const hideDropdown = () => { dropdown?.remove(); dropdown = null; };

    const showDropdown = (matches) => {
        hideDropdown();
        if (!matches.length) return;
        dropdown = document.createElement('ul');
        dropdown.className = 'sb-autocomplete-list';
        matches.slice(0, 8).forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            li.addEventListener('mousedown', (e) => { e.preventDefault(); selectComuna(name); });
            dropdown.appendChild(li);
        });
        input.closest('.sb-autocomplete-wrap').appendChild(dropdown);
    };

    input.addEventListener('input', () => {
        const val = input.value;
        if (!val) { hideDropdown(); return; }
        const norm = normalize(val);
        showDropdown(allComunas.filter((c) => normalize(c).includes(norm)));
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            hideDropdown();
            const val = input.value.trim();
            if (!val) return;
            const normVal = normalize(val);
            let best = null, minDist = Infinity;
            for (const c of allComunas) {
                const d = levenshtein(normVal, normalize(c));
                if (d < minDist) { minDist = d; best = c; }
                if (d === 0) break;
            }
            if (best && minDist <= 1) { selectComuna(best); }
            else { input.classList.add('sb-input--error'); }
        }, 160);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown?.contains(e.target)) hideDropdown();
    });
}

// ─── Toggle Isapre / Fonasa ───────────────────────────────────
// Fila 2a (isapre): sb-row-isapre  → cuál isapre + cargas
// Fila 2b (fonasa): sb-row-fonasa  → cargas + renta
export function initSistemaToggle() {
    const select = document.getElementById('sb-sistema');
    const rowIsapre = document.getElementById('sb-row-isapre');
    const rowFonasa = document.getElementById('sb-row-fonasa');
    if (!select) return;

    const isapreSelect = document.getElementById('sb-isapre');
    const rentaSelect  = document.getElementById('sb-renta');

    const update = () => {
        const val = select.value;
        const isIsapre = val === 'Isapre';
        const isFonasa = val === 'Fonasa';

        if (rowIsapre) rowIsapre.classList.toggle('sb-row-hidden', !isIsapre);
        if (rowFonasa) rowFonasa.classList.toggle('sb-row-hidden', !isFonasa);

        // required dinámico
        if (isapreSelect) isapreSelect.required = isIsapre;
        if (rentaSelect)  rentaSelect.required  = isFonasa;
    };

    select.addEventListener('change', update);
    update();
}

// ─── Modal de Cargas — dentro del sidebar ─────────────────────
export function initCargasModal() {
    // Puede haber dos selects de cargas (isapre y fonasa)
    document.addEventListener('change', (e) => {
        if (e.target.id === 'sb-cargas-isapre' || e.target.id === 'sb-cargas-fonasa') {
            const n = parseInt(e.target.value, 10);
            const hiddenInput = document.getElementById('sb-edad-cargas');
            if (isNaN(n) || n === 0) {
                if (hiddenInput) hiddenInput.value = '';
                return;
            }
            openCargasModal(n, hiddenInput, e.target);
        }
    });
}

function openCargasModal(numCargas, hiddenInput, triggerSelect) {
    // Inyectar el modal dentro del sb-panel para que quede en el sidebar
    const panel = document.getElementById('sb-panel');
    document.getElementById('sb-cargas-modal')?.remove();

    let inputsHtml = '';
    for (let i = 1; i <= numCargas; i++) {
        inputsHtml += `
        <div class="sb-field-group">
            <label for="sb-carga-edad-${i}">Edad Carga ${i}</label>
            <input type="number" id="sb-carga-edad-${i}"
                   class="sb-carga-edad-input sb-input"
                   min="0" max="120" placeholder="Ej: 5" required />
            <span class="sb-field-error">Ingresa la edad</span>
        </div>`;
    }

    const modal = document.createElement('div');
    modal.id = 'sb-cargas-modal';
    modal.className = 'sb-inner-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="sb-inner-modal-box">
            <div class="sb-inner-modal-header">
                <span><i class="fas fa-users" aria-hidden="true"></i> Edades de tus cargas</span>
                <button type="button" class="sb-close-btn sb-cargas-close" aria-label="Cerrar">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
            <div class="sb-inner-modal-body">
                <p class="sb-hint">Ingresa la edad de cada carga familiar.</p>
                <form id="sb-cargas-form" novalidate>
                    ${inputsHtml}
                    <button type="submit" class="sb-submit-btn sb-cargas-confirm-btn">
                        <i class="fas fa-check" aria-hidden="true"></i> Confirmar edades
                    </button>
                </form>
            </div>
        </div>`;

    // Montar DENTRO del panel del sidebar
    panel.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('sb-inner-modal--visible'));
    modal.querySelector('.sb-carga-edad-input')?.focus();

    modal.querySelector('.sb-cargas-close').addEventListener('click', () => {
        modal.classList.remove('sb-inner-modal--visible');
        setTimeout(() => modal.remove(), 280);
        if (triggerSelect) triggerSelect.value = '0';
        if (hiddenInput) hiddenInput.value = '';
    });

    modal.querySelector('#sb-cargas-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = modal.querySelectorAll('.sb-carga-edad-input');
        let valid = true;
        const ages = [];
        inputs.forEach((inp) => {
            const grp = inp.closest('.sb-field-group');
            if (!inp.value.trim()) { grp.classList.add('sb-has-error'); valid = false; }
            else { grp.classList.remove('sb-has-error'); ages.push(inp.value); }
        });
        if (!valid) return;
        if (hiddenInput) hiddenInput.value = ages.join(', ');
        modal.classList.remove('sb-inner-modal--visible');
        setTimeout(() => modal.remove(), 280);
    });
}

// ─── Teléfono +56 ─────────────────────────────────────────────
export function initPhoneField() {
    const input = document.getElementById('sb-telefono');
    if (!input) return;
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 9);
    });
    input.addEventListener('blur', () => {
        const grp = input.closest('.sb-field-group');
        const ok = input.value.replace(/\D/g, '').length === 9;
        grp?.classList.toggle('sb-has-error', !ok);
    });
}

// ─── Toggle agenda/cita ─────────────────────────────────────────
export function initAppointmentToggle() {
    const checkbox = document.getElementById('sb-agendar-cita');
    const wrap = document.getElementById('sb-cita-wrap');
    const dt = document.getElementById('sb-cita-fecha-hora');
    const estado = document.getElementById('sb-cita-estado');
    if (!checkbox || !wrap || !dt) return;

    const update = () => {
        const active = checkbox.checked;
        wrap.classList.toggle('sb-field-hidden', !active);
        if (active) {
            if (estado) estado.value = 'Pendiente';
            dt.focus?.();
        } else {
            dt.value = '';
            if (estado) estado.value = '';
            wrap.classList.remove('sb-has-error');
        }
    };

    checkbox.addEventListener('change', update);
    update();
}


// ─── Validación del formulario ────────────────────────────────
export function validateSidebar(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
        if (field.closest('.sb-row-hidden') || field.closest('.sb-field-hidden')) return;
        const grp = field.closest('.sb-field-group');
        const empty = !field.value.trim();
        grp?.classList.toggle('sb-has-error', empty);
        if (empty) valid = false;
    });
    // Email básico
    const email = form.querySelector('#sb-email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.closest('.sb-field-group')?.classList.add('sb-has-error');
        valid = false;
    }
    // Teléfono
    const tel = form.querySelector('#sb-telefono');
    if (tel && tel.value.replace(/\D/g, '').length !== 9) {
        tel.closest('.sb-field-group')?.classList.add('sb-has-error');
        valid = false;
    }


    // Cita opcional: si se activa, requiere fecha/hora
    const agendar = form.querySelector('#sb-agendar-cita');
    const citaWrap = form.querySelector('#sb-cita-wrap');
    const citaDt = form.querySelector('#sb-cita-fecha-hora');
    if (agendar?.checked) {
        const empty = !String(citaDt?.value || '').trim();
        citaWrap?.classList.toggle('sb-has-error', empty);
        if (empty) valid = false;
    } else {
        citaWrap?.classList.remove('sb-has-error');
    }
    return valid;
}
