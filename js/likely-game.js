// js/likely-game.js — "Quem é Mais Provável" minigame
import { submitGameStats } from './game-service.js';
import Room from './realtime-room.js';

const QUESTIONS = [
  // Cotidiano
  "Quem é mais provável de esquecer o aniversário de alguém?",
  "Quem é mais provável de mandar mensagem para a pessoa errada?",
  "Quem é mais provável de dormir no trabalho ou na aula?",
  "Quem é mais provável de comer a comida do outro sem pedir?",
  "Quem é mais provável de chegar atrasado para a própria festa?",
  "Quem é mais provável de fingir que não está em casa?",
  "Quem é mais provável de cair na rua sem tropeçar em nada?",
  "Quem é mais provável de comprar coisa que nunca vai usar?",
  "Quem é mais provável de cancelar planos de última hora?",
  "Quem é mais provável de passar horas no banheiro?",
  "Quem é mais provável de esquecer o celular em algum lugar?",
  "Quem é mais provável de gritar de susto em filme de terror?",
  "Quem é mais provável de repetir a mesma história várias vezes?",
  "Quem é mais provável de esquecer o que ia falar no meio da frase?",
  "Quem é mais provável de pedir para sair da foto e depois querer estar nela?",
  "Quem é mais provável de começar dieta e desistir no mesmo dia?",
  "Quem é mais provável de fazer promessa de Ano Novo e quebrar em janeiro?",
  "Quem é mais provável de chorar em filme de animação?",
  "Quem é mais provável de passar horas escolhendo o que assistir e não assistir nada?",
  "Quem é mais provável de perguntar 'onde a gente vai?' sem dar nenhuma sugestão?",
  "Quem é mais provável de esquecer as chaves dentro do carro?",
  "Quem é mais provável de deixar o celular cair no vaso?",
  "Quem é mais provável de falar no sono?",
  "Quem é mais provável de brigar com máquina de autoatendimento?",
  "Quem é mais provável de ser expulso de um grupo do WhatsApp?",
  "Quem é mais provável de passar do ponto do ônibus distraído?",
  "Quem é mais provável de comer alimento vencido e achar que está bem?",
  "Quem é mais provável de terminar a comida primeiro?",
  "Quem é mais provável de acordar mais tarde do grupo?",
  "Quem é mais provável de fazer drama quando fica doente?",
  // Ousado / Personalidade
  "Quem é mais provável de fazer uma tatuagem por impulso?",
  "Quem é mais provável de apostar dinheiro que não tem?",
  "Quem é mais provável de falar o que pensa na cara dura?",
  "Quem é mais provável de ligar para o ex depois de beber?",
  "Quem é mais provável de desafiar um estranho numa disputa?",
  "Quem é mais provável de comprar algo caro por impulso total?",
  "Quem é mais provável de sair de situação chata inventando desculpa?",
  "Quem é mais provável de ser pego mentindo?",
  "Quem é mais provável de ganhar um reality show de sobrevivência?",
  "Quem é mais provável de processar alguém por coisa boba?",
  // Divertido / Estranho
  "Quem é mais provável de se tornar famoso nas redes sociais?",
  "Quem é mais provável de dançar sozinho em casa?",
  "Quem é mais provável de cantar no chuveiro todo dia?",
  "Quem é mais provável de conversar com animais como se fossem pessoas?",
  "Quem é mais provável de acreditar em maldição?",
  "Quem é mais provável de dar nome de super-herói para o filho?",
  "Quem é mais provável de escolher comida pelo nome sem saber o que é?",
  "Quem é mais provável de perder uma aposta e tentar renegociar?",
  "Quem é mais provável de chorar em casamento de desconhecido?",
  "Quem é mais provável de usar a roupa ao contrário sem perceber?",
  "Quem é mais provável de esquentar a cabeça por coisa pequena?",
  "Quem é mais provável de entrar em pânico antes de uma viagem?",
  "Quem é mais provável de se perder em cidade que conhece bem?",
  "Quem é mais provável de ligar errado e fingir que foi intencional?",
  "Quem é mais provável de fazer barulho comendo?",
  "Quem é mais provável de enviar print para a pessoa errada?",
  "Quem é mais provável de seguir dieta só quando tem companhia?",
  "Quem é mais provável de passar 30 minutos escolhendo um emoji?",
  "Quem é mais provável de ser o mais animado de uma festa?",
  "Quem é mais provável de dormir primeiro em uma festa?",
  "Quem é mais provável de exagerar na história quando está contando?",
  "Quem é mais provável de sair sem dinheiro e pedir emprestado?",
];

const FUNNY_MSGS = [
  "O grupo falou. A roleta confirmou.",
  "Sem surpresas aqui, né?",
  "Sabe que foi merecido.",
  "O grupo não mente... ou mente?",
  "Alguém tinha que ser escolhido.",
  "O destino escolheu bem.",
  "Não foi por mal. Foi por votos.",
  "O grupo decidiu por unanimidade (mais ou menos).",
  "Bem feito. Bem votado.",
  "Próximo!",
];

(() => {
  const $ = id => document.getElementById(id);

  const LIVES = 3;

  let state = {
    phase: 'setup',
    players: [],
    round: 0,
    totalRounds: 5,
    questionQueue: [],
    currentQuestion: '',
    votes: {},
  };

  // ─── Estado do modo ONLINE (sala com voto secreto por celular) ────────────
  // online: jogando "likely" dentro de uma sala. host: este aparelho conduz.
  // roundId: cresce a cada rodada — descarta eventos atrasados de rodadas velhas.
  // roundVotes: { voterId: nomeEscolhido } coletado pelo host na rodada atual.
  // myVote: nome em que ESTE aparelho votou na rodada (null = ainda não votou).
  let online = false, isHost = false, roundId = 0, revealed = false;
  let roundVotes = {};
  let myVote = null;
  let roomUnsub = null;

  const _myId = () => window.DivertexUser?.id || 'host';
  const _voterTotal = () => (Room.isActive() ? Math.max(1, Room.getMembers().length) : 1);
  const _broadcast = (kind, payload) => { try { Room.syncEvent(kind, payload); } catch { /* noop */ } };

  const phases = {
    setup: $('likelySetup'),
    question: $('likelyQuestion'),
    reveal: $('likelyReveal'),
    final: $('likelyFinal'),
  };

  function showPhase(name) {
    Object.values(phases).forEach(el => el?.setAttribute('hidden', ''));
    $('likelyWaiting')?.setAttribute('hidden', '');
    phases[name]?.removeAttribute('hidden');
    state.phase = name;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function goToMenu() {
    $('screenLikely').classList.remove('screen--active');
    $('screenMenu').classList.add('screen--active');
    _leaveOnline();
    state = { phase: 'setup', players: [], round: 0, totalRounds: 5, questionQueue: [], currentQuestion: '', votes: {} };
    renderSetup();
    showPhase('setup');
  }

  // ─── Setup ────────────────────────────────────────────────

  function renderSetup() {
    const list = $('likelyPlayersList');
    if (!list) return;
    list.innerHTML = state.players.map((p, i) => `
      <div class="lk-chip${p.isMe ? ' lk-chip--me' : ''}">
        <span class="lk-chip__name">${p.name}${p.isMe ? ' <span class="lk-chip__you">você</span>' : ''}</span>
        <button class="lk-chip__remove" data-i="${i}" aria-label="Remover ${p.name}">✕</button>
      </div>`).join('');
    const startBtn = $('likelyStartBtn');
    if (startBtn) startBtn.disabled = state.players.length < 2;

    // Mostra banner de perfil se logado
    _renderUserBanner();
  }

  function _renderUserBanner() {
    let banner = $('likelyUserBanner');
    const user = window.DivertexUser;
    if (!user) { banner?.remove(); return; }

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'likelyUserBanner';
      banner.className = 'lk-user-banner';
      $('likelyPlayerForm')?.insertAdjacentElement('afterend', banner);
    }
    const alreadyAdded = state.players.some(p => p.isMe);
    banner.innerHTML = alreadyAdded
      ? `<span class="lk-user-banner__name">Jogando como <strong>${user.name}</strong> ✓</span>`
      : `<span class="lk-user-banner__name">Logado como <strong>${user.name}</strong></span>
         <button id="likelyAddMeBtn" class="btn btn--soft btn--sm">+ Entrar no jogo</button>`;
    if (!alreadyAdded) {
      banner.querySelector('#likelyAddMeBtn')?.addEventListener('click', () => {
        if (state.players.length >= 8) return;
        state.players.push({ name: user.name, lives: LIVES, eliminated: false, isMe: true });
        renderSetup();
      });
    }
  }

  $('likelyPlayerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('likelyNameInput');
    const name = input.value.trim();
    if (!name || state.players.find(p => p.name === name) || state.players.length >= 8) return;
    state.players.push({ name, lives: LIVES, eliminated: false });
    input.value = '';
    input.focus();
    renderSetup();
  });

  $('likelyPlayersList')?.addEventListener('click', e => {
    const btn = e.target.closest('.lk-chip__remove');
    if (!btn) return;
    state.players.splice(+btn.dataset.i, 1);
    renderSetup();
  });

  // Sala online: preenche o elenco compartilhado e entra no modo online.
  window.addEventListener('divertex:roster', e => {
    if (e.detail?.game !== 'likely') return;
    state.players = (e.detail.players || []).slice(0, 8)
      .map(name => ({ name, lives: LIVES, eliminated: false, isMe: window.DivertexUser?.name === name }));
    _enterOnline();
  });

  $('likelyAddSampleBtn')?.addEventListener('click', () => {
    ['Ana', 'Bruno', 'Carol', 'Diego', 'Elena'].forEach(name => {
      if (state.players.length < 8 && !state.players.find(p => p.name === name))
        state.players.push({ name, lives: LIVES, eliminated: false });
    });
    renderSetup();
  });

  $('likelyStartBtn')?.addEventListener('click', () => {
    if (online && !isHost) return; // na sala, só o host inicia
    if (state.players.length < 2) return;
    state.totalRounds = Math.max(3, Math.min(20, +($('likelyRoundsInput')?.value || 5)));
    state.questionQueue = shuffle(QUESTIONS);
    state.round = 0;
    state.players.forEach(p => { p.lives = LIVES; p.eliminated = false; });
    nextRound();
  });

  // ─── Question phase ───────────────────────────────────────

  function nextRound() {
    const active = state.players.filter(p => !p.eliminated);
    if (active.length < 2 || state.round >= state.totalRounds) { showFinal(); return; }
    state.round++;
    state.currentQuestion = state.questionQueue.length
      ? state.questionQueue.pop()
      : QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    state.votes = {};
    active.forEach(p => { state.votes[p.name] = 0; });

    // ── Online: abre rodada de voto secreto (host autoritativo) ──
    if (online) {
      roundId++;
      revealed = false;
      roundVotes = {};
      myVote = null;
      const payload = {
        roundId, round: state.round, totalRounds: state.totalRounds,
        question: state.currentQuestion, candidates: active.map(p => p.name),
      };
      _broadcast('lkv:round', payload);
      _showVotePhase(payload);
      _emitProgress(); // inicia o contador "0 de N votaram…"
      return;
    }

    // ── Offline: votação local (passa o celular) ──
    const qRound = $('likelyQRound');
    const qText = $('likelyQText');
    if (qRound) qRound.textContent = `Rodada ${state.round} de ${state.totalRounds}`;
    if (qText) qText.textContent = state.currentQuestion;
    renderVoteGrid();
    showPhase('question');
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MODO ONLINE — voto secreto por celular (host autoritativo)
  // ════════════════════════════════════════════════════════════════════════

  function _enterOnline() {
    online = Room.isActive() && Room.getGame() === 'likely';
    isHost = online && Room.isHost();
    if (!online) { renderSetup(); return; }
    window.DivertexSelfSync?.add('screenLikely');
    _wireRoomVoting();
    roundId = 0; revealed = false; roundVotes = {}; myVote = null;
    if (isHost) renderSetup();                  // host configura rodadas e inicia
    else _renderGuestWaiting('Aguardando o host iniciar a partida…');
  }

  function _leaveOnline() {
    window.DivertexSelfSync?.delete('screenLikely');
    online = false; isHost = false;
    roundVotes = {}; myVote = null; revealed = false;
    $('likelyWaiting')?.setAttribute('hidden', '');
  }

  // Liga os eventos da sala uma única vez por carga de página.
  function _wireRoomVoting() {
    if (roomUnsub) return;
    roomUnsub = Room.on('event', (e) => {
      const { kind, payload } = e.detail || {};
      if (!online) return;
      if (kind === 'lkv:round') { if (!isHost) _onRound(payload); }
      else if (kind === 'lkv:vote') { if (isHost) _recordVote(payload.roundId, payload.voterId, payload.choice); }
      else if (kind === 'lkv:progress') { if (!isHost) _updateProgress(payload.voted, payload.total); }
      else if (kind === 'lkv:reveal') { if (!isHost) { revealed = true; renderReveal(payload); } }
      else if (kind === 'lkv:final') { if (!isHost) { renderFinal(payload); _submitMyStats(payload); } }
    });
    // Se alguém entra/sai durante a votação, recalcula se já votaram todos.
    Room.on('members', () => { if (online && isHost && state.phase === 'question') _checkComplete(); });
  }

  // Convidado: recebeu uma nova rodada do host.
  function _onRound(p) {
    if (isHost) return;
    roundId = p.roundId;
    revealed = false;
    myVote = null;
    state.round = p.round;
    state.totalRounds = p.totalRounds;
    _showVotePhase(p);
  }

  function _renderGuestWaiting(text) {
    let w = $('likelyWaiting');
    if (!w) {
      w = document.createElement('div');
      w.id = 'likelyWaiting';
      w.className = 'lk-phase';
      (phases.setup?.parentElement || $('screenLikely'))?.appendChild(w);
    }
    w.innerHTML = `
      <div class="lk-q-wrap"><div class="card lk-q-card" style="text-align:center">
        <div class="lk-round-badge">🎮 Sala online</div>
        <div style="font-size:18px;font-weight:800;margin:22px 0 6px">${text}</div>
        <div style="font-size:34px">⏳</div>
      </div></div>`;
    Object.values(phases).forEach(el => el?.setAttribute('hidden', ''));
    w.removeAttribute('hidden');
    state.phase = 'waiting';
  }

  // Tela de votação (host e convidados): cada um escolhe UM nome, em segredo.
  function _showVotePhase(p) {
    myVote = null;
    if ($('likelyQRound')) $('likelyQRound').textContent = `Rodada ${p.round} de ${p.totalRounds}`;
    if ($('likelyQText')) $('likelyQText').textContent = p.question;
    const hint = document.querySelector('#likelyQuestion .lk-vote-hint');
    if (hint) hint.textContent = '🤫 Vote em segredo — o resultado aparece quando todos votarem';

    const grid = $('likelyVoteGrid');
    if (grid) {
      grid.innerHTML = '';
      (p.candidates || []).forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'lk-vote-btn';
        btn.dataset.name = name;
        btn.innerHTML = `<span class="lk-vote-btn__name">${name}</span><span class="lk-vote-btn__count">Votar</span>`;
        btn.addEventListener('click', () => _castVote(name, p.roundId));
        grid.appendChild(btn);
      });
    }
    _setupOnlineQActions();
    showPhase('question');
  }

  function _qActions() { return document.querySelector('#likelyQuestion .lk-q-actions'); }

  // Restaura o botão "Revelar resultado" original (usado no offline).
  function _resetQActionsOffline() {
    const a = _qActions();
    if (!a) return;
    a.querySelector('#lkvProgress')?.remove();
    a.querySelector('#lkvForceReveal')?.remove();
    const rb = $('likelyRevealBtn');
    if (rb) rb.style.display = '';
  }

  // Substitui o botão de revelar por um contador de votos (+ "Revelar agora" no host).
  function _setupOnlineQActions() {
    const a = _qActions();
    if (!a) return;
    const rb = $('likelyRevealBtn');
    if (rb) rb.style.display = 'none';
    let prog = a.querySelector('#lkvProgress');
    if (!prog) {
      prog = document.createElement('div');
      prog.id = 'lkvProgress';
      prog.className = 'lk-vote-hint';
      a.appendChild(prog);
    }
    prog.textContent = `0 de ${_voterTotal()} votaram…`;
    let fr = a.querySelector('#lkvForceReveal');
    if (isHost) {
      if (!fr) {
        fr = document.createElement('button');
        fr.id = 'lkvForceReveal';
        fr.className = 'btn btn--soft btn--sm';
        fr.type = 'button';
        fr.textContent = 'Revelar agora';
        fr.addEventListener('click', _hostReveal);
        a.appendChild(fr);
      }
      fr.style.display = '';
    } else if (fr) {
      fr.remove();
    }
  }

  function _castVote(name, rid) {
    if (myVote || rid !== roundId) return; // um voto por rodada; ignora rodada velha
    myVote = name;
    const grid = $('likelyVoteGrid');
    grid?.querySelectorAll('.lk-vote-btn').forEach(b => {
      b.disabled = true;
      const c = b.querySelector('.lk-vote-btn__count');
      if (b.dataset.name === name) { b.classList.add('lk-vote-btn--voted'); if (c) c.textContent = 'Seu voto ✓'; }
      else if (c) c.textContent = '';
    });
    window.DivertexSFX?.click?.();
    _broadcast('lkv:vote', { roundId: rid, voterId: _myId(), choice: name });
    if (isHost) _recordVote(rid, _myId(), name); // host conta o próprio voto (broadcast não volta para si)
  }

  // Host: registra um voto (dedup por votante) e checa se a rodada fechou.
  function _recordVote(rid, voterId, choice) {
    if (!isHost || rid !== roundId || revealed) return;
    roundVotes[voterId] = choice;
    _emitProgress();
    _checkComplete();
  }

  function _emitProgress() {
    if (!isHost) return;
    const voted = Object.keys(roundVotes).length;
    const total = _voterTotal();
    _broadcast('lkv:progress', { roundId, voted, total });
    _updateProgress(voted, total);
  }

  function _updateProgress(voted, total) {
    const el = document.getElementById('lkvProgress');
    if (el) el.textContent = voted >= total ? 'Revelando…' : `${voted} de ${total} votaram…`;
  }

  function _checkComplete() {
    if (!isHost || revealed) return;
    if (Object.keys(roundVotes).length >= _voterTotal()) _hostReveal();
  }

  // Host: apura os votos da rodada e transmite a revelação para todos.
  function _hostReveal() {
    if (!isHost || revealed) return;
    revealed = true;
    const active = state.players.filter(p => !p.eliminated);
    state.votes = {};
    active.forEach(p => { state.votes[p.name] = 0; });
    Object.values(roundVotes).forEach(name => { if (name in state.votes) state.votes[name]++; });
    const d = computeReveal();
    renderReveal(d);
    _broadcast('lkv:reveal', d);
  }

  function renderVoteGrid() {
    _resetQActionsOffline(); // restaura o botão "Revelar" caso venha de uma sala online
    const grid = $('likelyVoteGrid');
    if (!grid) return;
    const active = state.players.filter(p => !p.eliminated);
    grid.innerHTML = '';
    active.forEach(p => {
      const v = state.votes[p.name] || 0;
      const btn = document.createElement('button');
      btn.className = 'lk-vote-btn';
      btn.dataset.name = p.name;
      btn.innerHTML = `
        <span class="lk-vote-btn__name">${p.name}</span>
        <span class="lk-vote-btn__lives">${'❤️'.repeat(p.lives)}</span>
        <span class="lk-vote-btn__count">${v > 0 ? `${v} voto${v > 1 ? 's' : ''}` : 'Votar'}</span>
      `;
      btn.addEventListener('click', () => {
        state.votes[p.name] = (state.votes[p.name] || 0) + 1;
        btn.classList.add('lk-vote-btn--voted');
        setTimeout(() => btn.classList.remove('lk-vote-btn--voted'), 400);
        renderVoteGrid();
      });
      grid.appendChild(btn);
    });
  }

  // ─── Reveal phase ─────────────────────────────────────────

  $('likelyRevealBtn')?.addEventListener('click', revealResult);

  // Apura o resultado da rodada (autoritativo: muta vidas/eliminação) e devolve
  // um pacote de dados + HTML pronto para renderizar. No online, o host envia
  // este pacote aos convidados para que vejam a MESMA revelação.
  function computeReveal() {
    const active = state.players.filter(p => !p.eliminated);
    const total = Object.values(state.votes).reduce((a, b) => a + b, 0);

    // Se ninguém votou, distribuir 1 voto aleatório para gerar resultado
    if (total === 0) {
      const rnd = active[Math.floor(Math.random() * active.length)];
      state.votes[rnd.name] = 1;
    }

    let maxV = 0;
    active.forEach(p => { if ((state.votes[p.name] || 0) > maxV) maxV = state.votes[p.name] || 0; });
    const tied = active.filter(p => (state.votes[p.name] || 0) === maxV);
    const loser = tied[Math.floor(Math.random() * tied.length)];

    loser.lives--;
    if (loser.lives <= 0) { loser.lives = 0; loser.eliminated = true; }

    const totalVotes = Object.values(state.votes).reduce((a, b) => a + b, 0);
    const pct = totalVotes > 0 ? Math.round((maxV / totalVotes) * 100) : 0;
    const wasTie = tied.length > 1;

    const votesText = wasTie
      ? `Empate! ${maxV} voto${maxV > 1 ? 's' : ''} (${pct}%) — sorteado entre empatados`
      : `${maxV} voto${maxV > 1 ? 's' : ''} — ${pct}% do grupo`;
    const msg = loser.eliminated
      ? `${loser.name} foi eliminado! 💀`
      : FUNNY_MSGS[Math.floor(Math.random() * FUNNY_MSGS.length)];

    const allPlayers = [...active].filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i);
    const sortedB = allPlayers.sort((a, b) => (state.votes[b.name] || 0) - (state.votes[a.name] || 0));
    const breakdownHtml = sortedB.map(p => {
      const v = state.votes[p.name] || 0;
      const isLoser = p.name === loser.name;
      return `<div class="lk-breakdown-row${isLoser ? ' lk-breakdown-row--loser' : ''}">
        <span>${p.name}</span>
        <span class="lk-breakdown-v">${v} voto${v !== 1 ? 's' : ''}</span>
        <span>${p.eliminated ? '💀' : '❤️'.repeat(p.lives)}</span>
      </div>`;
    }).join('');

    const sortedS = [...state.players].sort((a, b) => b.lives - a.lives);
    const scoreboardHtml = '<div class="lk-sb-title">Placar</div>' + sortedS.map(p => `
      <div class="lk-sb-row${p.eliminated ? ' lk-sb-row--out' : ''}">
        <span>${p.name}</span>
        <span>${p.eliminated ? '💀 Eliminado' : '❤️'.repeat(p.lives)}</span>
      </div>`).join('');

    const activeAfter = state.players.filter(p => !p.eliminated);
    const gameOver = activeAfter.length < 2 || state.round >= state.totalRounds;
    const nextLabel = gameOver
      ? '🏆 Ver resultado final'
      : `Próxima rodada (${state.round + 1}/${state.totalRounds}) →`;

    return {
      loserName: loser.name, votesText, msg, breakdownHtml, scoreboardHtml,
      nextLabel, gameOver, round: state.round, totalRounds: state.totalRounds,
      players: state.players.map(p => ({ name: p.name, lives: p.lives, eliminated: p.eliminated })),
    };
  }

  // Preenche a fase de revelação a partir do pacote de computeReveal. Serve para
  // o host (dados locais) e para os convidados (dados recebidos pela sala).
  function renderReveal(d) {
    const revealName = $('likelyRevealName');
    const revealVotes = $('likelyRevealVotes');
    const revealMsg = $('likelyRevealMsg');
    const breakdown = $('likelyRevealBreakdown');
    const scoreboard = $('likelyScoreBoard');
    const nextBtn = $('likelyNextRoundBtn');

    if (revealName) {
      revealName.textContent = d.loserName;
      revealName.classList.remove('lk-reveal-anim');
      void revealName.offsetWidth;
      revealName.classList.add('lk-reveal-anim');
    }
    if (revealVotes) revealVotes.textContent = d.votesText;
    if (revealMsg) revealMsg.textContent = d.msg;
    if (breakdown) breakdown.innerHTML = d.breakdownHtml;
    if (scoreboard) scoreboard.innerHTML = d.scoreboardHtml;
    if (nextBtn) {
      // Só o host avança a partida; convidados aguardam.
      if (online && !isHost) { nextBtn.disabled = true; nextBtn.textContent = '⏳ Aguardando o host…'; }
      else { nextBtn.disabled = false; nextBtn.textContent = d.nextLabel; }
    }

    showPhase('reveal');
  }

  function revealResult() {
    const d = computeReveal();
    renderReveal(d);
  }

  $('likelyNextRoundBtn')?.addEventListener('click', () => {
    if (online && !isHost) return; // só o host avança a partida
    const active = state.players.filter(p => !p.eliminated);
    if (active.length < 2 || state.round >= state.totalRounds) showFinal();
    else nextRound();
  });

  // ─── Final phase ──────────────────────────────────────────

  function computeFinal() {
    const alive = state.players.filter(p => !p.eliminated);
    const winner = alive.length > 0
      ? alive.reduce((a, b) => b.lives > a.lives ? b : a)
      : [...state.players].reduce((a, b) => b.lives > a.lives ? b : a);

    const sorted = [...state.players].sort((a, b) => {
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      return b.lives - a.lives;
    });
    const scoresHtml = sorted.map((p, i) => `
      <div class="lk-final-row${i === 0 ? ' lk-final-row--winner' : ''}${p.eliminated ? ' lk-final-row--out' : ''}">
        <span class="lk-final-rank">${i + 1}º</span>
        <span>${p.name}</span>
        <span>${p.eliminated ? '💀' : '❤️'.repeat(p.lives)}</span>
      </div>`).join('');

    return {
      winnerName: winner.name, scoresHtml, round: state.round,
      players: state.players.map(p => ({ name: p.name, lives: p.lives, eliminated: p.eliminated })),
    };
  }

  function renderFinal(d) {
    const finalWinner = $('likelyFinalWinner');
    const finalScores = $('likelyFinalScores');
    if (finalWinner) finalWinner.textContent = d.winnerName;
    if (finalScores) finalScores.innerHTML = d.scoresHtml;
    showPhase('final');
  }

  // Cada aparelho envia ao ranking os stats do PRÓPRIO jogador logado, usando o
  // placar autoritativo do pacote final (no online vem do host; offline é local).
  function _submitMyStats(d) {
    const user = window.DivertexUser;
    if (!user) return;
    const mine = (d.players || []).find(p => p.name === user.name);
    if (!mine) return;
    const isWinner = !mine.eliminated && mine.name === d.winnerName;
    const livesLost = LIVES - mine.lives;
    const score = isWinner ? 120 + d.round * 8 : Math.max(0, d.round * 4 - livesLost * 5);
    submitGameStats({
      wins: isWinner ? 1 : 0,
      rounds: d.round,
      livesLost,
      streak: d.round,
      scoreDelta: score,
    }).catch(() => {});
  }

  function showFinal() {
    const d = computeFinal();
    renderFinal(d);
    if (online && isHost) _broadcast('lkv:final', d);
    _submitMyStats(d);
  }

  $('likelyPlayAgainBtn')?.addEventListener('click', () => {
    if (online && !isHost) return; // só o host reinicia a partida da sala
    state.players.forEach(p => { p.lives = LIVES; p.eliminated = false; });
    state.round = 0;
    state.questionQueue = shuffle(QUESTIONS);
    nextRound();
  });

  $('likelyBackMenuBtn')?.addEventListener('click', goToMenu);
  $('likelyBackMenuFinalBtn')?.addEventListener('click', goToMenu);

  // ─── Entry point: card no menu ────────────────────────────

  $('openLikelyBtn')?.addEventListener('click', () => {
    $('screenMenu').classList.remove('screen--active');
    const screen = $('screenLikely');
    screen.classList.add('screen--active');
    // Abertura direta (fora de sala) é offline. Quando vem da sala, o evento
    // divertex:roster dispara logo depois e religa o modo online.
    if (!(Room.isActive() && Room.getGame() === 'likely')) _leaveOnline();
    state = { phase: 'setup', players: [], round: 0, totalRounds: 5, questionQueue: [], currentQuestion: '', votes: {} };

    // Auto-adiciona o usuário logado
    const user = window.DivertexUser;
    if (user?.name) {
      state.players.push({ name: user.name, lives: LIVES, eliminated: false, isMe: true });
    }

    renderSetup();
    showPhase('setup');
  });
})();
