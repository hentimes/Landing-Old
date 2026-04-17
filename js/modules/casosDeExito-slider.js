// ===================================
// Módulo para Casos Reales
// ===================================
import { casosDeExitoData } from '../../data/casosDeExito.js';

const CASE_AVATARS = [
  'assets/avatares/hero/avatar1.jpg',
  'assets/avatares/hero/avatar2.jpg',
  'assets/avatares/hero/avatar3.jpg',
  'assets/avatares/hero/avatar4.jpg',
  'assets/avatares/asesores/betzabeth-pereira.jpg',
  'assets/avatares/asesores/daniela-rojas.webp',
  'assets/avatares/asesores/henry-farias.jpg',
  'assets/avatares/asesores/sofia-marquez.jpg'
];

export function initCasosDeExitoSlider() {
  const panelMount = document.querySelector('#casos-exito .case-study-slider');
  const tabsContainer = document.querySelector('#casos-exito .case-study-tabs');
  const descEl = document.querySelector('#casos-exito .case-study-tabs-desc');

  if (!panelMount || !tabsContainer || !descEl) return;

  panelMount.innerHTML = '';
  tabsContainer.innerHTML = '';
  descEl.textContent = '';

  const panel = document.createElement('div');
  panel.className = 'case-study-panel';
  panelMount.appendChild(panel);

  let currentIndex = 0;

  const tabs = casosDeExitoData.map((study, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'case-study-tab';
    tab.dataset.index = String(index);
    tab.setAttribute('aria-label', `Caso ${index + 1}`);
    tab.innerHTML = '<span class="case-study-tab__dot" aria-hidden="true"></span>';
    tabsContainer.appendChild(tab);
    return tab;
  });

  function setActive(index) {
    const safeIndex = Math.max(0, Math.min(index, casosDeExitoData.length - 1));
    currentIndex = safeIndex;

    const study = casosDeExitoData[currentIndex];
    if (!study) return;

    panel.innerHTML = createCaseStudyPanelHtml(study, currentIndex);
    descEl.textContent = study.description || study.title || '';

    tabs.forEach((t) => t.classList.remove('is-active'));
    if (tabs[currentIndex]) tabs[currentIndex].classList.add('is-active');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      if (Number.isNaN(idx)) return;
      setActive(idx);
    });
  });

  setActive(0);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAvatarSrc(index) {
  return CASE_AVATARS[index % CASE_AVATARS.length];
}

function createCaseStudyPanelHtml(study, caseIndex) {
  const wins = Array.isArray(study.wins) ? study.wins : [];
  const winsHtml = wins
    .map(
      (w) =>
        `<li class="case-study-panel__win"><i class="fas fa-check-circle" aria-hidden="true"></i><span>${escapeHtml(
          w
        )}</span></li>`
    )
    .join('');

  const avatarSrc = getAvatarSrc(caseIndex);
  const name = study.name ? escapeHtml(study.name) : 'C. Cliente';
  const origin = study.origin ? escapeHtml(study.origin) : '';
  const icon = study.icon ? escapeHtml(study.icon) : 'fas fa-briefcase-medical';
  const originHtml = origin ? `<span class="case-meta__pill">Venía de: ${origin}</span>` : '';
  const savingsHtml = study.savings
    ? `<span class="case-meta__pill case-meta__pill--em">Ahorro: ${escapeHtml(study.savings)}</span>`
    : '';

  return `
    <div class="case-study-panel__top">
      <div class="case-title">
        <div class="case-avatar" aria-hidden="true">
          <img src="${avatarSrc}" alt="" class="case-avatar__img" loading="lazy" decoding="async">
        </div>
        <div class="case-title__text">
          <div class="case-title__row">
            <div class="case-title__lead">
              <i class="${icon} case-title__icon" aria-hidden="true"></i>
              <h3>${escapeHtml(study.title)}</h3>
            </div>
          </div>
          <div class="case-meta">
            <span class="case-meta__name">${name}</span>
            ${originHtml}
            ${savingsHtml}
          </div>
        </div>
      </div>
    </div>

    <div class="case-study-panel__grid">
      <div class="case-study-panel__col case-study-panel__col--before">
        <h4>${escapeHtml(study.leftTitle || 'Punto de partida')}</h4>
        <p>${escapeHtml(study.leftBody || '')}</p>
      </div>
      <div class="case-study-panel__col case-study-panel__col--after">
        <h4>${escapeHtml(study.rightTitle || 'Optimización')}</h4>
        <p>${escapeHtml(study.rightBody || '')}</p>
      </div>
    </div>

    <div class="case-study-panel__wins">
      <h4>Lo que ganó</h4>
      <ul class="case-study-panel__wins-list">${winsHtml}</ul>
    </div>
  `;
}
