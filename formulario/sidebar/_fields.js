/*
==================================================================
ARCHIVO: formulario/sidebar/_fields.js
Lógica de campos: autocomplete comunas, toggle Isapre/Fonasa,
modal de cargas, teléfono con prefijo, validación inline.
Portado y adaptado desde context/formulario-main/_form-logic.js
==================================================================
*/

import { comunasRegiones } from './_config.js';

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
    const regionInput = document.getElementById('sb-region');
    if (!input || !regionInput) return;

    const allComunas = Object.keys(comunasRegiones).sort();
    let dropdown = null;

    const selectComuna = (name) => {
        input.value = name;
        regionInput.value = comunasRegiones[name] || '';
        hideDropdown();
        input.classList.remove('sb-error');
        input.classList.add('sb-valid');
    };

    const hideDropdown = () => {
        dropdown?.remove();
        dropdown = null;
    };

    const showDropdown = (matches) => {
        hideDropdown();
        if (!matches.length) return;
        dropdown = document.createElement('ul');
        dropdown.className = 'sb-autocomplete-list';
        matches.slice(0, 8).forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            li.addEventListener('mousedown', (e) => {
                e.preventDefault(); // evita blur antes del click
                selectComuna(name);
            });
            dropdown.appendChild(li);
        });
        input.parentElement.appendChild(dropdown);
    };

    input.addEventListener('input', () => {
        const val = input.value;
        if (!val) { hideDropdown(); return; }
        const norm = normalize(val);
        const matches = allComunas.filter((c) => normalize(c).includes(norm));
        showDropdown(matches);
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            hideDropdown();
            const val = input.value.trim();
            if (!val) return;
            // Autocorrección con Levenshtein
            const normVal = normalize(val);
            let best = null, minDist = Infinity;
            for (const c of allComunas) {
                const d = levenshtein(normVal, normalize(c));
                if (d < minDist) { minDist = d; best = c; }
                if (d === 0) break;
            }
            if (best && minDist <= 1) {
                selectComuna(best);
            } else {
                input.classList.add('sb-error');
                input.classList.remove('sb-valid');
            }
        }, 160);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown?.contains(e.target)) {
            hideDropdown();
        }
    });
}

// ─── Toggle Isapre / Fonasa ───────────────────────────────────
export function initSistemaToggle() {
    const select = document.getElementById('sb-sistema');
    const isapreRow = document.getElementById('sb-isapre-row');
    if (!select || !isapreRow) return;

    const isapreSelect = document.getElementById('sb-isapre');

    const update = () => {
        const isIsapre = select.value === 'Isapre';
        isapreRow.classList.toggle('sb-field-hidden', !isIsapre);
        if (isapreSelect) isapreSelect.required = isIsapre;
    };

    select.addEventListener('change', update);
    update(); // estado inicial
}

// ─── Modal de Cargas ──────────────────────────────────────────
export function initCargasModal() {
    const cargasSelect = document.getElementById('sb-cargas');
    const hiddenEdades = document.getElementById('sb-edad-cargas');
    if (!cargasSelect) return;

    cargasSelect.addEventListener('change', () => {
        const n = parseInt(cargasSelect.value, 10);
        if (isNaN(n) || n === 0) {
            if (hiddenEdades) hiddenEdades.value = '';
            return;
        }
        openCargasModal(n, hiddenEdades);
    });
}

function openCargasModal(numCargas, hiddenInput) {
    // Remove previous instance
    document.getElementById('sb-cargas-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'sb-cargas-modal';
    modal.className = 'sb-cargas-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    let inputsHtml = '';
    for (let i = 1; i <= numCargas; i++) {
        inputsHtml += `
        <div class="sb-field-group">
            <label for="sb-carga-edad-${i}">Edad Carga ${i} <span class="sb-required">*</span></label>
            <input type="number" id="sb-carga-edad-${i}" class="sb-carga-edad-input sb-input"
                   min="0" max="120" placeholder="Ej: 5" required />
            <span class="sb-field-error">Ingresa la edad</span>
        </div>`;
    }

    modal.innerHTML = `
        <div class="sb-cargas-modal-box">
            <div class="sb-cargas-modal-header">
                <span><i class="fas fa-child" aria-hidden="true"></i> Edades de tus cargas</span>
                <button type="button" class="sb-cargas-modal-close" aria-label="Cerrar">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
            <div class="sb-cargas-modal-body">
                <p class="sb-cargas-modal-hint">Ingresa la edad de cada carga familiar.</p>
                <form id="sb-cargas-form" novalidate>
                    ${inputsHtml}
                    <button type="submit" class="sb-submit-btn sb-cargas-confirm-btn">
                        <i class="fas fa-check" aria-hidden="true"></i> Confirmar
                    </button>
                </form>
            </div>
        </div>`;

    document.body.appendChild(modal);

    // Animar entrada
    requestAnimationFrame(() => modal.classList.add('sb-cargas-modal-visible'));

    // Focus en primer input
    modal.querySelector('.sb-carga-edad-input')?.focus();

    // Cerrar con ✕
    modal.querySelector('.sb-cargas-modal-close').addEventListener('click', () => {
        modal.classList.remove('sb-cargas-modal-visible');
        setTimeout(() => modal.remove(), 300);
        // Resetear select si se cancela
        document.getElementById('sb-cargas').value = '0';
        if (hiddenInput) hiddenInput.value = '';
    });

    // Confirm submit
    modal.querySelector('#sb-cargas-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = modal.querySelectorAll('.sb-carga-edad-input');
        let valid = true;
        const ages = [];

        inputs.forEach((inp) => {
            const grp = inp.closest('.sb-field-group');
            if (!inp.value.trim()) {
                grp.classList.add('sb-has-error');
                valid = false;
            } else {
                grp.classList.remove('sb-has-error');
                ages.push(inp.value);
            }
        });

        if (!valid) return;
        if (hiddenInput) hiddenInput.value = ages.join(', ');
        modal.classList.remove('sb-cargas-modal-visible');
        setTimeout(() => modal.remove(), 300);
    });
}

// ─── Teléfono con prefijo +56 ─────────────────────────────────
export function initPhoneField() {
    const input = document.getElementById('sb-telefono');
    if (!input) return;

    input.addEventListener('input', () => {
        // Solo dígitos, máximo 9
        input.value = input.value.replace(/\D/g, '').slice(0, 9);
    });

    input.addEventListener('blur', () => {
        const val = input.value.replace(/\D/g, '');
        const grp = input.closest('.sb-field-group');
        if (val.length !== 9) {
            grp?.classList.add('sb-has-error');
        } else {
            grp?.classList.remove('sb-has-error');
        }
    });
}

// ─── Validación general del form ──────────────────────────────
export function validateSidebar(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
        // Ignorar campos en filas ocultas
        if (field.closest('.sb-field-hidden')) return;
        const grp = field.closest('.sb-field-group');
        if (!field.value.trim()) {
            grp?.classList.add('sb-has-error');
            valid = false;
        } else {
            grp?.classList.remove('sb-has-error');
        }
    });
    // Validar teléfono específicamente
    const tel = form.querySelector('#sb-telefono');
    if (tel && tel.value.replace(/\D/g, '').length !== 9) {
        tel.closest('.sb-field-group')?.classList.add('sb-has-error');
        valid = false;
    }
    return valid;
}
