export const bare = true; // sem moldura de página: ficha em HUD

const ficha = (h, i, total) => `
  <article class="ficha" aria-labelledby="ficha-nome">
    <header class="ficha__head"><b>Rede Náutilus / Registros de habitantes</b><span>Ficha ${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></header>
    <div class="ficha__main">
      <figure class="ficha__foto"><img src="${h.img}" alt="Retrato de ${h.nome}"></figure>
      <div class="ficha__info">
        <p class="ficha__reg">Registro ${h.registro}</p>
        <h3 id="ficha-nome">${h.nome}</h3>
        <p class="ficha__role">${h.funcao} · ${h.especialidade}</p>
        <dl class="ficha__dados">
          <div><dt>Mora</dt><dd>${h.mora}</dd></div>
          <div><dt>Atua</dt><dd>${h.atua}</dd></div>
        </dl>
        <p class="ficha__lbl">Quem é</p>
        <p class="ficha__txt">${h.descricao}</p>
        <p class="ficha__lbl ficha__lbl--gold">Situação atual</p>
        <p class="ficha__txt">${h.situacao}</p>
        <a class="ficha__mural" href="#mural">Ver mensagens no mural →</a>
      </div>
    </div>
  </article>`;

export async function render(container) {
  const hs = await fetch('data/habitantes.json').then(r => r.json());
  container.innerHTML = `
    <div class="habs">
      <h2 id="panel-title" class="sr-only">Habitantes de Atlântida</h2>
      <div class="habs__stage" aria-live="polite"></div>
      <p class="map__hint">Personalidades em destaque este mês</p>
      <div class="habs__nav" role="group" aria-label="Habitantes">
        ${hs.map(h => `<button type="button" class="map__node habs__btn" data-id="${h.id}" aria-pressed="false">${h.nome}</button>`).join('')}
      </div>
    </div>`;

  const stage = container.querySelector('.habs__stage');
  const btns = [...container.querySelectorAll('.habs__btn')];
  const show = (i, animate = true) => {
    stage.innerHTML = ficha(hs[i], i, hs.length);
    btns.forEach((b, j) => { b.classList.toggle('is-active', j === i); b.setAttribute('aria-pressed', j === i); });
    if (animate && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)
      gsap.from(stage.firstElementChild, { opacity: 0, y: 10, duration: .35, ease: 'power2.out' });
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0, false);
}
