import { fetchPublicAvailability } from './backend/cloudflare.js';

const APPOINTMENT_RANGE_DAYS = 30;

const state = {
    slots: [],
    slotsByDay: new Map(),
    loaded: false,
    loading: false,
};

export function initContactPreferenceFlow() {
    const radios = Array.from(document.querySelectorAll('input[name="contacto_preferencia"]'));
    const wrap = document.getElementById('sb-cita-wrap');
    const daySelect = document.getElementById('sb-cita-dia');
    const slotSelect = document.getElementById('sb-cita-slot');
    const hiddenDateTime = document.getElementById('sb-cita-fecha-hora');
    const estado = document.getElementById('sb-cita-estado');
    const hint = document.getElementById('sb-cita-hint');
    if (!radios.length || !wrap || !daySelect || !slotSelect || !hiddenDateTime) return;

    const updateMode = async () => {
        const mode = getSelectedPreference(radios);
        const showAgenda = mode === 'agendar_reunion';
        wrap.classList.toggle('sb-field-hidden', !showAgenda);

        if (!showAgenda) {
            hiddenDateTime.value = '';
            slotSelect.value = '';
            daySelect.value = '';
            estado.value = '';
            return;
        }

        estado.value = 'Pendiente';
        if (!state.loaded && !state.loading) {
            await loadSlots(daySelect, slotSelect, hiddenDateTime, hint);
        } else {
            renderDayOptions(daySelect, slotSelect, hiddenDateTime);
        }
    };

    radios.forEach((radio) => radio.addEventListener('change', updateMode));
    daySelect.addEventListener('change', () => {
        renderSlotOptions(slotSelect, hiddenDateTime, daySelect.value);
    });
    slotSelect.addEventListener('change', () => {
        hiddenDateTime.value = slotSelect.value || '';
    });

    updateMode();
}

function getSelectedPreference(radios) {
    return radios.find((radio) => radio.checked)?.value || 'lo_antes_posible';
}

async function loadSlots(daySelect, slotSelect, hiddenDateTime, hint) {
    state.loading = true;
    try {
        if (hint) hint.textContent = 'Cargando horarios disponibles...';
        const from = todayIso();
        const to = addDaysIso(from, APPOINTMENT_RANGE_DAYS);
        const payload = await fetchPublicAvailability({ from, to });
        state.slots = Array.isArray(payload?.slots) ? payload.slots : [];
        state.slotsByDay = groupSlotsByDay(state.slots);
        state.loaded = true;
        renderDayOptions(daySelect, slotSelect, hiddenDateTime);
        if (hint) {
            hint.textContent = state.slots.length
                ? 'Citas de 45 min con 15 min de separacion.'
                : 'No hay bloques disponibles por ahora.';
        }
    } catch (error) {
        state.slots = [];
        state.slotsByDay = new Map();
        if (hint) hint.textContent = error.message || 'No se pudo cargar la disponibilidad.';
        renderDayOptions(daySelect, slotSelect, hiddenDateTime);
    } finally {
        state.loading = false;
    }
}

function renderDayOptions(daySelect, slotSelect, hiddenDateTime) {
    const days = Array.from(state.slotsByDay.keys());
    if (!days.length) {
        daySelect.innerHTML = '<option value="">Sin bloques</option>';
        slotSelect.innerHTML = '<option value="">Sin horas</option>';
        hiddenDateTime.value = '';
        return;
    }

    daySelect.innerHTML = days.map((day, index) => `
        <option value="${day}" ${index === 0 ? 'selected' : ''}>${formatDayLabel(day)}</option>
    `).join('');

    renderSlotOptions(slotSelect, hiddenDateTime, daySelect.value || days[0]);
}

function renderSlotOptions(slotSelect, hiddenDateTime, day) {
    const daySlots = state.slotsByDay.get(day) || [];
    if (!daySlots.length) {
        slotSelect.innerHTML = '<option value="">Sin horas</option>';
        hiddenDateTime.value = '';
        return;
    }

    slotSelect.innerHTML = daySlots.map((slot, index) => `
        <option value="${slot.starts_at}" ${index === 0 ? 'selected' : ''}>${formatTimeLabel(slot.starts_at)}</option>
    `).join('');

    hiddenDateTime.value = daySlots[0]?.starts_at || '';
}

function groupSlotsByDay(slots) {
    const map = new Map();
    slots.forEach((slot) => {
        const key = String(slot?.starts_at || '').slice(0, 10);
        if (!key) return;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(slot);
    });
    return map;
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function addDaysIso(dateText, days) {
    const date = new Date(`${dateText}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + Number(days || 0));
    return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateText) {
    const date = new Date(`${dateText}T12:00:00Z`);
    return new Intl.DateTimeFormat('es-CL', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }).format(date).replace('.', '');
}

function formatTimeLabel(dateTimeText) {
    const match = String(dateTimeText || '').match(/T(\d{2}):(\d{2})/);
    if (!match) return dateTimeText;
    return `${match[1]}:${match[2]}`;
}
