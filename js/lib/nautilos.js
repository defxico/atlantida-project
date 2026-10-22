// Cérebro do Náutilos IA. Hoje responde com um roteiro local; para ligar uma API depois,
// preencha ENDPOINT (um proxy que guarda as chaves) e o roteiro vira plano B se a rede falhar.
const ENDPOINT = null;

export const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const tem = (t, ...palavras) => palavras.some(p => t.includes(p));

export const BOAS_VINDAS = 'Bem-vindo à Rede Náutilus. Sou Náutilos, a IA que cuida das cúpulas de Atlântida. Pergunte sobre os setores, os habitantes ou o que está acontecendo na cidade.';
export const SEM_SINAL = 'Meu sinal oscilou e não captei sua pergunta. Tente falar de um setor, de um habitante, do Residencial A ou das linhas de transporte.';

export function respostaLocal(texto, { setores = [], habitantes = [] } = {}) {
  const t = norm(texto);
  if (!t.trim()) return SEM_SINAL;

  const hab = habitantes.find(h => h.nome.split(' ').some(p => p.length > 2 && t.includes(norm(p))));
  if (hab) return `${hab.nome} é ${hab.funcao.toLowerCase()}, especialista em ${hab.especialidade.toLowerCase()}. Mora no ${hab.mora} e atua em ${hab.atua}. Agora: ${hab.situacao}`;

  if (tem(t, 'residencial a', 'setor a', 'fechad', 'gerador', 'manutencao')) return 'O Residencial A está fechado: os geradores de oxigênio foram isolados para manutenção. Uma equipe autorizada mede pressão e qualidade do ar, e as famílias foram acolhidas no Residencial B. Aviso pela Rede assim que houver previsão segura de reabertura.';
  if (tem(t, 'linha', 'trem', 'transporte', 'rota', 'estacao')) return 'As linhas A e B estão interditadas. As rotas alternativas atravessam o anel externo; peça horários ao mensageiro Darian Flux ou consulte o Mural antes de sair de casa.';
  if (tem(t, 'oscila', 'servidor', 'rede caiu', 'falha', 'instavel')) return 'Há oscilações nos servidores. Pressão, oxigênio e energia têm prioridade e seguem sob controle; as respostas da Rede é que podem demorar. O engenheiro Kael Vetra investiga a causa.';
  const setor = setores.find(s => t.includes(norm(s.nome)));
  if (setor) return `${setor.regiao} · ${setor.titulo}. ${setor.texto}`;

  if (tem(t, 'quem e voce', 'quem voce', 'o que voce', 'nautilos', 'quem e vc')) return 'Sou Náutilos, a inteligência que mantém as cúpulas de Atlântida conectadas: sistemas essenciais, rotas e a Rede Náutilus onde os habitantes se comunicam.';
  if (tem(t, 'missao', 'missoes', 'tripulacao', 'embarcar')) return 'No Mural, a aba Missões reúne tripulações: projetos, estudos em grupo, mentorias e freelas. Embarque em uma para liberar os contatos e ganhar reputação.';
  if (tem(t, 'ajuda', 'preciso', 'socorro', 'pedir')) return 'Para pedir ajuda, abra o Mural, escolha Recados e publique um Pedido de ajuda. Seus vizinhos recebem pela Rede, e eu aviso as equipes quando for urgente.';
  if (tem(t, 'mural', 'recado', 'aviso', 'publicar')) return 'O Mural é o coração da convivência: avisos, pedidos, ofertas e conhecimento dos habitantes, além das mensagens dos visitantes e das Missões.';
  if (tem(t, 'habitante', 'morador', 'quem mora', 'pessoas')) return `Conheço ${habitantes.length || 'vários'} habitantes em destaque este mês. Pergunte por um nome (Kael, Lívia, Torak, Seren, Darian ou Nami) ou abra a área Habitantes.`;
  if (tem(t, 'setor', 'cidade', 'atlantida', 'mapa', 'cupula')) return 'Atlântida tem nove setores ao redor do Núcleo da IA: Científico, Industrial, Exploração, Comercial, Cívico e os Residenciais A, B e C. Pergunte por qualquer um deles.';
  if (tem(t, 'oxigenio', 'pressao', 'energia')) return 'Oxigênio, pressão e energia são prioridade máxima. Os filtros de ar, os geradores e as cúpulas são monitorados sem pausa pelo Núcleo da IA.';
  if (/\b(oi|ola|e ai)\b/.test(t) || tem(t, 'bom dia', 'boa tarde', 'boa noite')) return 'Olá, habitante. Estou ouvindo. O que você quer saber sobre Atlântida?';
  return SEM_SINAL;
}

export async function responder(texto, contexto) {
  if (ENDPOINT) {
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensagem: texto }) });
      if (r.ok) return (await r.json()).resposta;
    } catch { /* cai no roteiro local */ }
  }
  return respostaLocal(texto, contexto);
}
