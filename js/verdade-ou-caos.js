/**
 * verdade-ou-caos.js
 * Minigame "Verdade ou Caos" — escolha verdade (responda) ou caos (desafio).
 * Recusar = perde 1 vida. 0 vidas = eliminado. Último de pé vence.
 */

import { submitGameStats } from './game-service.js';

(function VerdadeOuCaos() {
  const $ = id => document.getElementById(id);

  const TRUTHS = [
    'Qual é o maior mico que você já passou?',
    'Se você pudesse namorar alguém neste grupo, quem seria?',
    'Qual é a coisa mais estranha que você já fez sozinho(a)?',
    'Qual é o maior segredo que você guarda até hoje?',
    'Você já mentiu para um amigo(a) para não sair? Para quem?',
    'Qual foi a última vez que você chorou e por quê?',
    'Que hábito seu você teria vergonha que os outros soubessem?',
    'Qual é a coisa mais ridícula que você já comprou?',
    'Se você pudesse apagar uma memória de alguém deste grupo, quem seria e qual memória?',
    'Você já fez algo ilegal? O que foi?',
    'Qual é a pior nota que você já tirou?',
    'Com quem você menos esperaria namorar neste grupo?',
    'Qual é a pessoa que você mais inveja e por quê?',
    'Já entrou na fila errada de propósito para não ter que falar com alguém?',
    'Qual é o apelido mais constrangedor que alguém já te deu?',
    'O que você faz quando está com raiva que as pessoas não sabem?',
    'Qual é a mentira que você conta com mais frequência?',
    'Qual é o pior presente que você já recebeu?',
    'Você já fingiu estar doente para evitar algo? O quê?',
    'Qual é o seu maior medo que você nunca contou para ninguém?',
    'Já falou mal de alguém deste grupo? O que disse?',
    'Se você tivesse que escolher uma pessoa deste grupo para ser seu chefe, quem não escolheria nunca?',
    'Qual é a coisa mais feia que você já fez por dinheiro?',
    'Você já roubou algo, mesmo que pequeno? O quê?',
    'Qual é o seu pior defeito que você tenta esconder?',
    'Qual é a coisa mais constrangedora que está no seu histórico de pesquisa?',
    'Você já fingiou gostar de um presente que odiou? De quem foi?',
    'Qual é a promessa que você fez e não cumpriu?',
    'O que você faria com R$1 milhão que envergonharia sua família?',
    'Qual é a coisa mais mesquinha que você já fez?',
  ];

  const DARES = [
    'Imite o jogador à sua esquerda por 30 segundos.',
    'Faça sua melhor dança de 20 segundos. Sem parar.',
    'Diga três elogios sinceros para a pessoa à sua direita.',
    'Fale com sotaque de outro estado pelo próximo turno inteiro.',
    'Faça 10 polichinelos agora. Todo mundo conta.',
    'Ligue para um contato aleatório do celular e diga "Eu sei o que você fez".',
    'Imite um animal a sua escolha por 20 segundos. O grupo decide se foi bom.',
    'Cante os primeiros 30 segundos de uma música a sua escolha.',
    'Fale uma frase completa usando apenas palavras com a letra S.',
    'Tente fazer todo mundo rir sem falar nada por 30 segundos.',
    'Descreva o jogador à sua frente usando só três palavras. Seja honesto.',
    'Faça uma reverência e peça desculpas para alguém do grupo por algo real.',
    'Fique em pé sobre uma perna por 30 segundos enquanto todos contam histórias.',
    'Diga algo que você nunca disse em voz alta mas sempre pensou.',
    'Tente dobrar a língua. Se não conseguir, faça 5 flexões.',
    'Mande mensagem para alguém fora do grupo dizendo "Você é demais!".',
    'Tente equilibrar um objeto qualquer na cabeça por 20 segundos.',
    'Imite um comercial de TV antigo. O grupo deve adivinhar o produto.',
    'Fale por 1 minuto sem parar sobre qualquer assunto. Sem silêncio.',
    'Dê um abraço de pelo menos 10 segundos para alguém do grupo.',
    'Escreva no papel o nome da pessoa que você menos quer perder neste grupo.',
    'Tente tocar o nariz com a língua.',
    'Faça uma careta o mais feia possível e fique assim por 15 segundos.',
    'Grite o nome do grupo tão alto quanto possível.',
    'Tente resolver 13 × 7 em 10 segundos sem calculadora.',
    'Fique de olhos fechados por 30 segundos enquanto o grupo muda algo na sala.',
    'Mova apenas as sobrancelhas por 20 segundos tentando se comunicar.',
    'Faça uma pose de estátua e fique imóvel por 30 segundos.',
    'Escolha alguém do grupo para trocar de lugar na próxima rodada.',
    'Conte uma piada. Se ninguém rir, perde 1 vida extra.',
  ];

  let state = {
    players: [],
    currentIdx: 0,
    roundNumber: 0,
    currentChoice: null,
    gameStarted: false,
  };

  function livesHtml(n) {
    if (n <= 0) return '💀';
    return '❤️'.repeat(Math.min(n, 5)) + (n > 5 ? ` ×${n}` : '');
  }

  function activePlayers() {
    return state.players.filter(p => p.lives > 0);
  }

  function showPhase(id) {
    ['vcSetup', 'vcTurn', 'vcFinal'].forEach(p => {
      const el = $(p);
      if (el) el.setAttribute('hidden', '');
    });
    const target = $(id);
    if (target) target.removeAttribute('hidden');
  }

  function renderScoreboard() {
    const sb = $('vcScoreBoard');
    if (!sb) return;
    sb.innerHTML = state.players.map((p, i) => {
      const isCurrent = i === state.currentIdx && p.lives > 0;
      const isEliminated = p.lives <= 0;
      return `<div class="vc-score-item ${isCurrent ? 'vc-score-item--current' : ''} ${isEliminated ? 'vc-score-item--eliminated' : ''}">
        <span class="vc-score-name">${esc(p.name)}</span>
        <span class="vc-score-lives">${livesHtml(p.lives)}</span>
      </div>`;
    }).join('');
  }

  function nextTurn() {
    const active = activePlayers();
    if (active.length <= 1) {
      endGame(active[0]);
      return;
    }

    // Advance to next player with lives
    let tries = 0;
    do {
      state.currentIdx = (state.currentIdx + 1) % state.players.length;
      tries++;
    } while (state.players[state.currentIdx].lives <= 0 && tries < state.players.length);

    state.currentChoice = null;
    state.roundNumber++;
    showTurn();
  }

  function showTurn() {
    showPhase('vcTurn');
    const p = state.players[state.currentIdx];
    const turnPlayer = $('vcTurnPlayer');
    const turnLives = $('vcTurnLives');
    if (turnPlayer) turnPlayer.textContent = p.name;
    if (turnLives) turnLives.textContent = livesHtml(p.lives);

    const choiceRow = $('vcChoiceRow');
    const contentCard = $('vcContentCard');
    const actionRow = $('vcActionRow');

    if (choiceRow) choiceRow.removeAttribute('hidden');
    if (contentCard) contentCard.setAttribute('hidden', '');
    if (actionRow) actionRow.setAttribute('hidden', '');

    renderScoreboard();
  }

  function showContent(type) {
    state.currentChoice = type;
    const pool = type === 'truth' ? TRUTHS : DARES;
    const text = pool[Math.floor(Math.random() * pool.length)];

    const choiceRow = $('vcChoiceRow');
    const contentCard = $('vcContentCard');
    const actionRow = $('vcActionRow');
    const typeEl = $('vcContentType');
    const textEl = $('vcContentText');

    if (choiceRow) choiceRow.setAttribute('hidden', '');
    if (contentCard) contentCard.removeAttribute('hidden');
    if (actionRow) actionRow.removeAttribute('hidden');

    if (typeEl) {
      typeEl.textContent = type === 'truth' ? '💬 VERDADE' : '🔥 CAOS';
      typeEl.className = `vc-content-type vc-content-type--${type}`;
    }
    if (textEl) textEl.textContent = text;
  }

  function endGame(winner) {
    showPhase('vcFinal');
    const w = $('vcFinalWinner');
    if (w) w.textContent = winner ? winner.name : 'Empate!';

    const scoresEl = $('vcFinalScores');
    if (scoresEl) {
      scoresEl.innerHTML = state.players
        .sort((a, b) => b.lives - a.lives)
        .map(p => `<div class="vc-score-item">
          <span class="vc-score-name">${esc(p.name)}</span>
          <span class="vc-score-lives">${livesHtml(p.lives)}</span>
        </div>`).join('');
    }

    if (window.DivertexUser && winner) {
      submitGameStats({
        wins: window.DivertexUser.name === winner.name ? 1 : 0,
        rounds: state.roundNumber,
        livesLost: state.players.reduce((a, p) => a + (3 - Math.max(0, p.lives)), 0),
        streak: state.roundNumber,
        scoreDelta: state.roundNumber * 8 + 30,
      }).catch(() => {});
    }
  }

  function resetGame() {
    state = { players: [], currentIdx: 0, roundNumber: 0, currentChoice: null, gameStarted: false };
    const list = $('vcPlayersList');
    if (list) list.innerHTML = '';
    const startBtn = $('vcStartBtn');
    if (startBtn) startBtn.disabled = true;
    showPhase('vcSetup');
  }

  function renderPlayerChips() {
    const list = $('vcPlayersList');
    if (!list) return;
    list.innerHTML = state.players.map((p, i) => `
      <div class="vc-chip">
        <span>${esc(p.name)}</span>
        <span class="vc-chip__remove" data-i="${i}" title="Remover">✕</span>
      </div>`).join('');
    list.querySelectorAll('.vc-chip__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.players.splice(Number(btn.dataset.i), 1);
        renderPlayerChips();
        updateStartBtn();
      });
    });
  }

  function updateStartBtn() {
    const btn = $('vcStartBtn');
    if (btn) btn.disabled = state.players.length < 2;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function goToMenu() {
    document.getElementById('screenVerdade')?.classList.remove('screen--active');
    document.getElementById('screenMenu')?.classList.add('screen--active');
  }

  // ---- Bind events ----
  function init() {
    // Back buttons
    $('vcBackMenuBtn')?.addEventListener('click', goToMenu);
    $('vcBackMenuFinalBtn')?.addEventListener('click', goToMenu);

    // Player form
    $('vcPlayerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('vcNameInput');
      const name = input?.value?.trim();
      if (!name || state.players.length >= 10) return;
      if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        input.value = '';
        return;
      }

      // Auto-add logged-in user on first add
      if (state.players.length === 0 && window.DivertexUser?.name && name !== window.DivertexUser.name) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
      }

      state.players.push({ name, lives: 3 });
      input.value = '';
      renderPlayerChips();
      updateStartBtn();
    });

    // Sala online: preenche o elenco compartilhado.
    window.addEventListener('divertex:roster', e => {
      if (e.detail?.game !== 'verdade') return;
      state.players = (e.detail.players || []).slice(0, 10).map(name => ({ name, lives: 3 }));
      renderPlayerChips();
      updateStartBtn();
    });

    // Start
    $('vcStartBtn')?.addEventListener('click', () => {
      if (state.players.length < 2) return;
      state.gameStarted = true;
      state.roundNumber = 1;
      // Find first player index
      state.currentIdx = 0;
      if (window.DivertexUser) {
        const myIdx = state.players.findIndex(p => p.name === window.DivertexUser.name);
        if (myIdx >= 0) state.currentIdx = myIdx;
      }
      showTurn();
    });

    // Choice buttons
    $('vcTruthBtn')?.addEventListener('click', () => showContent('truth'));
    $('vcDareBtn')?.addEventListener('click', () => showContent('dare'));

    // Action buttons
    $('vcDoneBtn')?.addEventListener('click', () => nextTurn());
    $('vcRefusedBtn')?.addEventListener('click', () => {
      const p = state.players[state.currentIdx];
      p.lives = Math.max(0, p.lives - 1);
      renderScoreboard();
      const turnLives = $('vcTurnLives');
      if (turnLives) turnLives.textContent = livesHtml(p.lives);

      const active = activePlayers();
      if (active.length <= 1) {
        setTimeout(() => endGame(active[0]), 800);
      } else {
        setTimeout(() => nextTurn(), 600);
      }
    });

    // Play again
    $('vcPlayAgainBtn')?.addEventListener('click', () => {
      resetGame();
      // Re-add logged-in user automatically
      if (window.DivertexUser) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
        renderPlayerChips();
        updateStartBtn();
      }
    });

    // Open button
    $('openVerdadeBtn')?.addEventListener('click', () => {
      document.getElementById('screenMenu')?.classList.remove('screen--active');
      document.getElementById('screenVerdade')?.classList.add('screen--active');
      showPhase('vcSetup');
      if (window.DivertexUser && state.players.length === 0) {
        state.players.push({ name: window.DivertexUser.name, lives: 3 });
        renderPlayerChips();
        updateStartBtn();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
