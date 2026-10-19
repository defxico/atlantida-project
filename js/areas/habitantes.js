const card = h => `
  <li class="card" tabindex="0">
    <figure class="card__media">
      <img src="${h.img}" alt="Retrato de ${h.nome}" loading="lazy">
      <span class="card__scan" aria-hidden="true"></span>
    </figure>
    <div class="card__body">
      ${h.naTaverna ? '<span class="tag tag--live">● na taverna agora</span>' : ''}
      <h3>${h.nome}</h3>
      <p class="card__role">${h.funcao}</p>
      <p>${h.descricao}</p>
      <dl class="sheet">
        <div><dt>Setor</dt><dd>${h.setor}</dd></div>
        <div><dt>Especialidade</dt><dd>${h.especialidade}</dd></div>
      </dl>
    </div>
  </li>`;

export async function render(container) {
  const habitantes = await fetch('data/habitantes.json').then(r => r.json());
  container.innerHTML = `
    <header class="panel__header">
      <p class="eyebrow">Quem vive aqui</p>
      <h2 id="panel-title">Habitantes</h2>
      <p class="lead">Conheça as pessoas que fazem parte de Atlântida. Cada morador tem uma história, um talento e um papel na cidade. Passe o olhar sobre um card para escanear a ficha.</p>
    </header>
    <ul class="grid grid--cards" role="list">${habitantes.map(card).join('')}</ul>`;

  container.querySelectorAll('.card__media img').forEach(img =>
    img.addEventListener('error', () => img.classList.add('is-missing'), { once: true }));
}
