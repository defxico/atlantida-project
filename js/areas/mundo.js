export async function render(container) {
  const m = await fetch('data/mundo.json').then(r => r.json());

  container.innerHTML = `
    <div class="mundo" style="--bg:url('${new URL(m.imagem, document.baseURI).href}')">
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
        <video class="map__video" src="${m.video}" poster="${m.poster}" muted loop playsinline preload="metadata" aria-hidden="true"></video>
        ${m.setores.map((s, i) => `<button type="button" class="map__node${i === 0 ? ' is-active' : ''}${s.estado === 'fechado' ? ' is-closed' : ''}" style="--x:${s.x};--y:${s.y}" data-id="${s.id}" aria-describedby="map-info">${s.nome}</button>`).join('')}
      </div>
      <ul class="map__legend" aria-label="Legenda do mapa">
        ${m.legenda.map(l => `<li><i class="map__key map__key--${l.tipo}" aria-hidden="true"></i>${l.texto}</li>`).join('')}
      </ul>
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
    const setor = m.setores.find(s => s.id === node.dataset.id);
    info.textContent = setor.descricao;
    info.classList.toggle('is-closed', setor.estado === 'fechado');
  };
  nodes.forEach(n => ['mouseenter', 'focus', 'click'].forEach(ev => n.addEventListener(ev, () => activate(n))));

  const video = container.querySelector('.map__video');
  if (video && !matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {});
}
