export async function render(container) {
  const m = await fetch('data/mundo.json').then(r => r.json());

  container.innerHTML = `
    <div class="mundo" style="--bg:url('${m.imagem}')">
      <header class="panel__header">
        <p class="eyebrow">A cidade no fundo do mar</p>
        <h2 id="panel-title">O Mundo</h2>
        <p class="lead">${m.intro}</p>
      </header>
      <div class="tabs" role="tablist" aria-label="Sobre Atlântida">
        ${m.abas.map((a, i) => `<button type="button" role="tab" id="tab-${a.id}" aria-controls="tp-${a.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${a.titulo}</button>`).join('')}
      </div>
      ${m.abas.map((a, i) => `
        <section role="tabpanel" id="tp-${a.id}" aria-labelledby="tab-${a.id}" ${i ? 'hidden' : ''}>
          ${a.paragrafos.map(p => `<p>${p}</p>`).join('')}
        </section>`).join('')}
      <h3 class="mundo__subtitle">Setores de Atlântida</h3>
      <div class="map">
        <svg class="map__svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          ${m.setores.filter(s => s.id !== 'central').map(s => `<line x1="50" y1="30" x2="${s.x}" y2="${s.y}"/>`).join('')}
        </svg>
        ${m.setores.map((s, i) => `<button type="button" class="map__node${i === 0 ? ' is-active' : ''}" style="--x:${s.x};--y:${s.y}" data-id="${s.id}" aria-describedby="map-info">${s.nome}</button>`).join('')}
      </div>
      <p id="map-info" class="map__info" aria-live="polite">${m.setores[0].descricao}</p>
    </div>`;

  const tabs = [...container.querySelectorAll('[role="tab"]')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      container.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (step) select(tabs[(i + step + tabs.length) % tabs.length]);
    });
  });

  const info = container.querySelector('#map-info');
  const nodes = [...container.querySelectorAll('.map__node')];
  const activate = node => {
    nodes.forEach(n => n.classList.toggle('is-active', n === node));
    info.textContent = m.setores.find(s => s.id === node.dataset.id).descricao;
  };
  nodes.forEach(n => ['mouseenter', 'focus', 'click'].forEach(ev => n.addEventListener(ev, () => activate(n))));
}
