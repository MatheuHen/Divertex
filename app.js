(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    screenMenu: $("#screenMenu"),
    screenWheel: $("#screenWheel"),
    openWheelBtn: $("#openWheelBtn"),
    backToMenuBtn: $("#backToMenuBtn"),
    roundModeSelect: $("#roundModeSelect"),
    roundModePill: $("#roundModePill"),
    wheelPlayers: $("#wheelPlayers"),
    wheelLives: $("#wheelLives"),
    wheelQuestions: $("#wheelQuestions"),
    wheelChallenges: $("#wheelChallenges"),
    wheelTime: $("#wheelTime"),
    wheelPercent: $("#wheelPercent"),
    wheelNumber: $("#wheelNumber"),
    wheelPenalty: $("#wheelPenalty"),
    wheelBonus: $("#wheelBonus"),
    wheelCustom: $("#wheelCustom"),
    addPlayerForm: $("#addPlayerForm"),
    nameInput: $("#nameInput"),
    livesInput: $("#livesInput"),
    addSampleBtn: $("#addSampleBtn"),
    playersList: $("#playersList"),
    playersCountPill: $("#playersCountPill"),
    wheelCanvas: $("#wheelCanvas"),
    spinBtn: $("#spinBtn"),
    resultName: $("#resultName"),
    resultMessage: $("#resultMessage"),
    roundResultGrid: $("#roundResultGrid"),
    resultChallenge: $("#resultChallenge"),
    actionBtns: $("#actionBtns"),
    cumpriumBtn: $("#cumpriumBtn"),
    respondeuBtn: $("#respondeuBtn"),
    falhouBtn: $("#falhouBtn"),
    pulouBtn: $("#pulouBtn"),
    applyPenaltyBtn: $("#applyPenaltyBtn"),
    spinAgainBtn: $("#spinAgainBtn"),
    verManualBtn: $("#verManualBtn"),
    modal18: $("#modal18"),
    modal18ConfirmBtn: $("#modal18ConfirmBtn"),
    modal18CancelBtn: $("#modal18CancelBtn"),
    modalManual: $("#modalManual"),
    modalManualContent: $("#modalManualContent"),
    modalManualCloseBtn: $("#modalManualCloseBtn"),
    victoryOverlay: $("#victoryOverlay"),
    victoryOverlayName: $("#victoryOverlay__name"),
    victoryCloseBtn: $("#victoryCloseBtn"),
    historyPanel: $("#historyPanel"),
    historyList: $("#historyList"),
    exportHistoryBtn: $("#exportHistoryBtn"),
    customEditorPanel: $("#customEditorPanel"),
    customWheelInput: $("#customWheelInput"),
    updateCustomWheelBtn: $("#updateCustomWheelBtn"),
    themeSelect: $("#themeSelect"),
    soundToggle: $("#soundToggle"),
    resetBtn: $("#resetBtn"),
    timerSecondsInput: $("#timerSecondsInput"),
    countdown: $("#countdown"),
    countdownValue: $("#countdownValue"),
    ringProgress: $("#ringProgress"),
    endTurnBtn: $("#endTurnBtn"),
    challengesInput: $("#challengesInput"),
    updateChallengesBtn: $("#updateChallengesBtn"),
    shuffleChallengesBtn: $("#shuffleChallengesBtn"),
  };

  // Mensagens para deixar a punição mais "Divertex"
  const FUNNY_LOSS = [
    "Ai. Doeu no coração (literalmente).",
    "O universo escolheu você. Parabéns.",
    "Menos 1. Respira e finge que tá tudo bem.",
    "O azar te abraçou com carinho.",
    "Foi mal… mas foi lindo de ver.",
    "Isso foi pessoal? Não. Foi a roleta.",
  ];

  const FUNNY_ELIM = [
    "Foi de base.",
    "Descanse em paz, guerreiro(a).",
    "Eliminado(a) com honra (ou não).",
    "A roleta não perdoa. Nunca perdoou.",
  ];

  const DEFAULT_CHALLENGES = [
    "Imitar um animal por 5 segundos.",
    "Falar com sotaque até a próxima rodada.",
    "Dizer 3 frutas em 2 segundos.",
    "Fazer pose de super-herói por 3 segundos.",
    "Cantar 1 linha de uma música.",
    "Contar de 10 a 1 bem rápido.",
    "Fazer uma careta e segurar por 3 segundos.",
    "Dizer uma verdade aleatória (sem expor ninguém).",
    "Fazer um elogio criativo para alguém.",
    "Fazer um mini discurso dramático: eu declaro…",
  ];

  const PERCENT_VALUES = ["10%","20%","30%","40%","50%","60%","70%","80%","90%","100%"];
  const TIME_WHEEL_VALUES = [10, 15, 20, 30, 45, 60, 90, 120];

  const DEFAULT_PENALTIES = [
    "Perde mais 1 vida.",
    "Faz o desafio com o dobro da intensidade.",
    "Faz uma ação escolhida pelo grupo.",
    "Fica uma rodada sem poder pular.",
    "Perde 2 vidas ou aceita desafio extra.",
    "Escolhe alguém para dividir a penalidade.",
    "O grupo decide sua punição.",
  ];

  const DEFAULT_BONUSES = [
    "Ganha 1 vida extra.",
    "Pode pular a próxima penalidade.",
    "Escolhe quem é sorteado na próxima rodada.",
    "Fica imune por 1 rodada.",
    "Rouba 1 vida de outro jogador.",
    "Pode escolher o desafio da próxima rodada.",
  ];

  const QUESTIONS = {
    leve: [
      "Qual sua mania mais estranha?",
      "Qual música te representa?",
      "Quem da roda parece mais engraçado?",
      "Qual comida você nunca recusaria?",
      "Quem da roda sobreviveria melhor em um apocalipse?",
      "Qual talento inútil você tem?",
      "Qual apelido combinaria com você?",
      "Quem da roda tem mais cara de famoso?",
      "Qual foi a última coisa aleatória que você pesquisou?",
      "Quem da roda é mais dramático?",
      "Qual filme você assistiria de novo?",
      "Qual emoji te define hoje?",
      "Qual seria seu bordão?",
      "Quem da roda mais demora para responder mensagem?",
    ],
    medio: [
      "Qual foi a maior vergonha que você já passou?",
      "Quem da roda você acha mais bonito?",
      "Quem da roda você chamaria para sair?",
      "Qual foi a mensagem mais vergonhosa que você já mandou?",
      "Você já fingiu que não viu uma mensagem?",
      "Qual foi o pior fora que você já levou?",
      "Quem da roda parece mais perigoso no amor?",
      "Quem da roda você acha que tem mais lábia?",
      "Você já teve crush em alguém da roda?",
      "Qual segredo leve você consegue contar?",
      "Quem da roda você acha que beijaria melhor?",
      "Quem da roda daria mais trabalho em relacionamento?",
    ],
    dificil: [
      "Qual verdade você evita contar?",
      "Qual foi sua maior red flag?",
      "Quem da roda você não deixaria ver seu celular?",
      "Quem da roda você acha mais imprevisível?",
      "Você já se arrependeu de ter ficado com alguém?",
      "Qual foi a maior burrada que você fez por impulso?",
      "Quem da roda você acha que mais mente bem?",
      "Você já ignorou alguém de propósito?",
      "Quem da roda você acha que causaria mais ciúmes?",
      "Qual foi sua maior derrota amorosa?",
    ],
    pesadao: [
      "Quem da roda você acha mais falso?",
      "Quem da roda você acha que mais se acha?",
      "Quem da roda você acha que não aguenta pressão?",
      "Quem da roda você acha que mais passa vergonha?",
      "Quem da roda você acha que mais mente?",
      "Quem da roda você acha que mais enrola alguém?",
      "Quem da roda você acha que tem mais cara de problema?",
      "Quem da roda você acha que dá mais trabalho?",
      "Quem da roda você acha que mais se faz de santo?",
      "Quem da roda você acha que já iludiu alguém?",
    ],
    proibidona: [
      "Quem da roda você beijaria sem pensar muito?",
      "Quem da roda você acha mais atraente?",
      "Quem da roda você acha que beija melhor?",
      "Quem da roda você já teve vontade de ficar?",
      "Quem da roda você chamaria para um encontro escondido?",
      "Quem da roda você acha que tem mais pegada?",
      "Quem da roda você acha mais provocante?",
      "Quem da roda você acha que ilude melhor?",
      "Quem da roda você levaria para um role a dois?",
      "Quantas pessoas você já beijou em uma noite?",
      "Você prefere romance ou pegação?",
      "Você já deu gelo em alguém?",
      "Quem da roda você não deixaria ver suas conversas?",
      "Quem da roda você já transou?",
      "Com quem da roda você teria um affair secreto?",
      "Qual foi a situação mais quente que você já viveu?",
      "Você já ficou com mais de uma pessoa no mesmo dia?",
      "Qual o lugar mais inusitado onde você já ficou com alguém?",
      "Quem da roda você acha que performa melhor na cama?",
      "Você tem algum fetiche que nunca contou pra ninguém?",
      "Qual a fantasia que você ainda não realizou?",
      "Já mandou nudes para alguém da roda?",
      "Quem da roda você acha que tem mais experiência?",
      "Qual foi a noite mais louca que você já teve?",
      "Você já ficou com alguém da sua turma de trabalho ou faculdade?",
      "Qual o crush que você ainda não agiu?",
      "Quem da roda você acha que iniciaria no relacionamento?",
      "Você prefere ser dominante ou submisso?",
      "Já traiu ou foi traído? Como foi?",
    ],
    casal: [
      "Qual foi a primeira coisa que você reparou em mim?",
      "O que eu faço que te deixa com sorriso bobo?",
      "Qual momento nosso você repetiria?",
      "Qual mania minha você acha mais fofa?",
      "Qual música combina com a gente?",
      "Qual seria nosso encontro perfeito?",
      "O que você quer fazer comigo algum dia?",
      "O que você acha mais bonito em mim?",
      "O que eu faço que te deixa com ciúmes?",
      "Qual seria uma viagem perfeita para nós?",
    ],
    criativo: [
      "Se você fosse um personagem, qual seria?",
      "Qual seria seu poder inútil?",
      "Qual seria seu bordão?",
      "Qual jogador da roda seria vilão?",
      "Qual seria o nome de um filme sobre sua vida?",
      "Que música tocaria quando você entra em cena?",
      "Qual objeto representa sua personalidade?",
      "Qual seria sua profissão absurda?",
      "Qual seria sua desculpa para chegar atrasado em Marte?",
    ],
  };

  const CHALLENGES_BY_MODE = {
    leve: [
      "Faça uma careta.",
      "Imite um animal.",
      "Fale uma frase como narrador de futebol.",
      "Faça uma pose engraçada.",
      "Cante uma linha de música.",
      "Faça um elogio criativo para alguém.",
      "Diga uma verdade aleatória.",
      "Faça uma dança de 5 segundos.",
      "Fale com voz de robô por uma rodada.",
    ],
    medio: [
      "Fale uma verdade sobre você.",
      "Deixe alguém te fazer uma pergunta.",
      "Imite uma pessoa famosa.",
      "Faça 10 segundos de dança.",
      "Fale com voz engraçada até a próxima rodada.",
      "Conte uma vergonha.",
      "Faça uma atuação dramática.",
      "Fique uma rodada sem poder pular.",
    ],
    dificil: [
      "Perca 2 vidas ou responda.",
      "Deixe o grupo escolher sua pergunta.",
      "Fique 1 minuto sem rir.",
      "Faça uma atuação exagerada.",
      "Conte uma história vergonhosa.",
      "Deixe outro jogador escolher seu próximo desafio.",
      "Faça 15 segundos de dança.",
      "Escolha entre perder vida ou responder pergunta pesada.",
    ],
    pesadao: [
      "Faça o desafio com intensidade máxima.",
      "Deixe o grupo escolher uma consequência.",
      "Responda sem fugir ou perca 2 vidas.",
      "Escolha alguém para te julgar.",
      "Faça uma provocação engraçada para alguém.",
      "Fique uma rodada sendo chamado por apelido.",
      "Faça uma confissão ou perca vida.",
      "O grupo decide se você cumpriu ou falhou.",
    ],
    proibidona: [
      "Escolha alguém da roda para te fazer uma pergunta sem filtro.",
      "Faça uma cantada para alguém da roda.",
      "Deixe o grupo escolher uma pergunta para você.",
      "Fique uma rodada sem poder pular.",
      "Conte uma história de beijo sem citar nomes.",
      "Mande uma mensagem ousada para alguém do seu contato (sem mostrar a tela).",
      "Faça uma pose sedutora por 5 segundos.",
      "Sussurre algo provocante no ouvido de alguém da roda.",
      "Deixe alguém da roda checar sua última conversa de WhatsApp.",
      "Fale sobre sua última paquera com detalhes.",
      "Imite alguém da roda sendo seduzido.",
      "Dê um apelido ousado para alguém da roda.",
    ],
    casal: [
      "Faça um elogio sincero.",
      "Faça uma declaração dramática.",
      "Dê um apelido novo.",
      "Conte uma memória boa.",
      "Faça uma promessa engraçada.",
      "Diga uma verdade que nunca falou.",
      "Crie um plano de encontro em 30 segundos.",
    ],
    criativo: [
      "Crie uma propaganda absurda.",
      "Invente uma fofoca falsa e engraçada.",
      "Faça uma cena de novela.",
      "Crie uma música de 10 segundos.",
      "Faça uma pose de capa de álbum.",
      "Venda um objeto inútil.",
      "Faça um discurso como presidente.",
      "Narre sua própria derrota.",
    ],
  };

  const state = {
    players: [],
    selectedPlayerId: null,
    isSpinning: false,
    mode: "classic",
    roundMode: "normal",
    timerSeconds: 10,
    timer: null,
    soundEnabled: false,
    challenges: DEFAULT_CHALLENGES.slice(),
    theme: "neon",
    lastLoss: null,
    spinSeq: 0,
    currentSpinId: null,
    penaltyAppliedSpinId: null,
    awaitingAction: false,
    pendingAction: null,
    drawnTimerSeconds: null,
    history: [],
    activeWheels: {
      players: true,
      lives: true,
      questions: false,
      challenges: true,
      time: false,
      percent: false,
      number: false,
      penalty: false,
      bonus: false,
      custom: false,
    },
    customWheelItems: [],
    roundResult: {
      player: null,
      mode: null,
      lives: null,
      question: null,
      challenge: null,
      time: null,
      percent: null,
      number: null,
      penalty: null,
      bonus: null,
      custom: null,
    },
  };

  const wheel = {
    ctx: els.wheelCanvas.getContext("2d"),
    angle: 0,
    anim: null,
    dpr: 1,
    sizePx: 640,
  };

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function nowMs() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  function randomId() {
    return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  }

  function normalizeAngle(rad) {
    const t = rad % (Math.PI * 2);
    return t < 0 ? t + Math.PI * 2 : t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function pickFrom(arr) {
    if (!arr || !arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function roundModeLabel(mode) {
    switch (mode) {
      case "tempo":
        return "Tempo";
      case "desafio":
        return "Desafio";
      case "leve":
        return "Leve";
      case "medio":
        return "Médio";
      case "dificil":
        return "Difícil";
      case "pesadao":
        return "Pesadão";
      case "proibidona":
        return "Proibidona 18+";
      case "casal":
        return "Casal";
      case "criativo":
        return "Criativo";
      case "personalizado":
        return "Personalizado";
      default:
        return "Normal";
    }
  }

  function isWheelOn(key) {
    return Boolean(state.activeWheels[key]);
  }

  function syncWheelsToUI() {
    if (!els.wheelPlayers) return;
    els.wheelPlayers.checked = true;
    els.wheelLives.checked = isWheelOn("lives");
    els.wheelQuestions.checked = isWheelOn("questions");
    els.wheelChallenges.checked = isWheelOn("challenges");
    els.wheelTime.checked = isWheelOn("time");
    els.wheelPercent.checked = isWheelOn("percent");
    els.wheelNumber.checked = isWheelOn("number");
    els.wheelPenalty.checked = isWheelOn("penalty");
    els.wheelBonus.checked = isWheelOn("bonus");
    els.wheelCustom.checked = isWheelOn("custom");
  }

  function syncConfigDisabled() {
    const locked = state.isSpinning || Boolean(state.timer);
    if (els.roundModeSelect) els.roundModeSelect.disabled = locked;
    if (els.wheelLives) els.wheelLives.disabled = locked;
    if (els.wheelQuestions) els.wheelQuestions.disabled = locked;
    if (els.wheelChallenges) els.wheelChallenges.disabled = locked;
    if (els.wheelPercent) els.wheelPercent.disabled = locked;
    if (els.wheelNumber) els.wheelNumber.disabled = locked;
    if (els.wheelPenalty) els.wheelPenalty.disabled = locked;
    if (els.wheelBonus) els.wheelBonus.disabled = locked;
    if (els.wheelCustom) els.wheelCustom.disabled = locked;

    if (els.wheelTime) {
      const timeForced = state.roundMode === "tempo";
      els.wheelTime.disabled = locked || timeForced;
    }
    if (els.wheelChallenges) {
      const forced = state.roundMode === "desafio";
      els.wheelChallenges.disabled = locked || forced;
    }
  }

  function applyRoundModeConstraints() {
    const presets = {
      normal:       { lives: true,  questions: false, challenges: false, time: false, percent: false, number: false, penalty: false, bonus: false, custom: false },
      tempo:        { lives: true,  questions: false, challenges: true,  time: true,  percent: false, number: false, penalty: true,  bonus: false, custom: false },
      desafio:      { lives: true,  questions: false, challenges: true,  time: false, percent: false, number: false, penalty: true,  bonus: false, custom: false },
      leve:         { lives: true,  questions: true,  challenges: true,  time: false, percent: false, number: false, penalty: false, bonus: false, custom: false },
      medio:        { lives: true,  questions: true,  challenges: true,  time: false, percent: false, number: false, penalty: false, bonus: false, custom: false },
      dificil:      { lives: true,  questions: true,  challenges: true,  time: false, percent: false, number: false, penalty: true,  bonus: false, custom: false },
      pesadao:      { lives: true,  questions: true,  challenges: true,  time: false, percent: true,  number: false, penalty: true,  bonus: true,  custom: false },
      proibidona:   { lives: true,  questions: true,  challenges: true,  time: false, percent: true,  number: false, penalty: true,  bonus: false, custom: false },
      casal:        { lives: true,  questions: true,  challenges: true,  time: true,  percent: false, number: false, penalty: false, bonus: true,  custom: false },
      criativo:     { lives: true,  questions: true,  challenges: true,  time: true,  percent: false, number: true,  penalty: false, bonus: false, custom: false },
      personalizado:{ lives: true,  questions: false, challenges: false, time: false, percent: false, number: false, penalty: false, bonus: false, custom: true  },
    };
    state.activeWheels.players = true;
    const preset = presets[state.roundMode] || presets.normal;
    Object.assign(state.activeWheels, preset);
    syncWheelsToUI();
    syncConfigDisabled();
  }

  function setRoundMode(mode) {
    state.roundMode = mode || "normal";
    if (els.roundModeSelect) els.roundModeSelect.value = state.roundMode;
    if (els.roundModePill) els.roundModePill.textContent = roundModeLabel(state.roundMode);
    setMode(state.roundMode === "tempo" ? "timer" : "classic");
    applyRoundModeConstraints();
    renderRoundResult();
    syncCustomEditorVisibility();
  }

  function clearRoundResult() {
    state.roundResult = {
      player: null,
      mode: null,
      lives: null,
      question: null,
      challenge: null,
      time: null,
      percent: null,
      number: null,
      penalty: null,
      bonus: null,
      custom: null,
    };
    renderRoundResult();
  }

  function setRoundResult(patch) {
    state.roundResult = { ...state.roundResult, ...patch };
    renderRoundResult();
  }

  function roundItemEl(k, v) {
    const row = document.createElement("div");
    row.className = "roundItem";
    const key = document.createElement("div");
    key.className = "roundItem__k";
    key.textContent = k;
    const val = document.createElement("div");
    val.className = "roundItem__v";
    val.textContent = v;
    row.appendChild(key);
    row.appendChild(val);
    return row;
  }

  function renderRoundResult() {
    if (!els.roundResultGrid) return;
    els.roundResultGrid.innerHTML = "";

    const player = state.roundResult.player || "—";
    const mode = state.roundResult.mode || roundModeLabel(state.roundMode);

    els.roundResultGrid.appendChild(roundItemEl("Jogador", player));
    els.roundResultGrid.appendChild(roundItemEl("Modo", mode));

    if (isWheelOn("lives") && state.roundResult.lives) els.roundResultGrid.appendChild(roundItemEl("Vidas", state.roundResult.lives));
    if (isWheelOn("questions")) els.roundResultGrid.appendChild(roundItemEl("Pergunta", state.roundResult.question || "Em breve"));
    if (isWheelOn("challenges")) els.roundResultGrid.appendChild(roundItemEl("Desafio", state.roundResult.challenge || "—"));
    if (isWheelOn("time")) els.roundResultGrid.appendChild(roundItemEl("Tempo", state.roundResult.time || "—"));
    if (isWheelOn("percent")) els.roundResultGrid.appendChild(roundItemEl("Porcentagem", state.roundResult.percent || "Em breve"));
    if (isWheelOn("number")) els.roundResultGrid.appendChild(roundItemEl("Número", state.roundResult.number || "Em breve"));
    if (isWheelOn("penalty")) els.roundResultGrid.appendChild(roundItemEl("Penalidade", state.roundResult.penalty || "Em breve"));
    if (isWheelOn("bonus")) els.roundResultGrid.appendChild(roundItemEl("Bônus", state.roundResult.bonus || "Em breve"));
    if (isWheelOn("custom")) els.roundResultGrid.appendChild(roundItemEl("Personalizada", state.roundResult.custom || "Em breve"));
  }

  // ===== Controle de telas (Divertex) =====
  function showScreen(name) {
    const isMenu = name === "menu";
    const isWheel = name === "wheel";
    if (!els.screenMenu || !els.screenWheel) return;

    if (isMenu) {
      stopCountdown();
      clearPendingAction();
    }

    els.screenMenu.classList.toggle("screen--active", isMenu);
    els.screenWheel.classList.toggle("screen--active", isWheel);

    const active = isMenu ? els.screenMenu : els.screenWheel;
    active.classList.remove("screen--enter");
    void active.offsetWidth;
    active.classList.add("screen--enter");

    if (isWheel) {
      requestAnimationFrame(() => {
        renderWheel();
        updateControls();
      });
    }
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    renderWheel();
  }

  function setMode(mode) {
    state.mode = mode;
    updateControls();
  }

  function setTimerSeconds(value) {
    state.timerSeconds = clamp(Number(value) || 10, 1, 600);
    els.timerSecondsInput.value = String(state.timerSeconds);
  }

  function setSoundEnabled(enabled) {
    state.soundEnabled = Boolean(enabled);
    els.soundToggle.checked = state.soundEnabled;
  }

  function stopCountdown() {
    if (state.timer) {
      clearInterval(state.timer.intervalId);
      state.timer = null;
    }
    els.countdown.hidden = true;
  }

  function updateControls() {
    const activePlayers = state.players.length;
    const canSpin = activePlayers >= 2 && !state.isSpinning && !state.timer && !state.awaitingAction;

    els.spinBtn.disabled = !canSpin;
    els.timerSecondsInput.disabled = state.isSpinning || Boolean(state.timer);
    if (els.backToMenuBtn) els.backToMenuBtn.disabled = state.isSpinning || Boolean(state.timer);
    els.addPlayerForm.querySelectorAll("input, button").forEach((el) => {
      if (el === els.addSampleBtn) return;
      el.disabled = state.isSpinning || Boolean(state.timer);
    });

    if (activePlayers < 2) {
      els.resultMessage.textContent = "Adicione pelo menos 2 jogadores para girar.";
    }

    // Botões de ação pós-sorteio
    const hasResult = Boolean(state.selectedPlayerId) && !state.isSpinning;
    const showActions = state.awaitingAction && hasResult;
    const showSpinAgain = hasResult && !state.awaitingAction && !state.timer;

    if (els.actionBtns) {
      els.actionBtns.hidden = !showActions;
      if (showActions) {
        const hasQ  = isWheelOn("questions");
        const hasC  = isWheelOn("challenges");
        const hasDes = hasC || ["desafio","criativo","personalizado"].includes(state.roundMode);
        if (els.cumpriumBtn)    els.cumpriumBtn.hidden   = !hasDes;
        if (els.respondeuBtn)   els.respondeuBtn.hidden  = !hasQ;
        if (els.falhouBtn)      els.falhouBtn.hidden      = false;
        if (els.pulouBtn)       els.pulouBtn.hidden       = false;
        if (els.applyPenaltyBtn) els.applyPenaltyBtn.hidden = false;
      }
    }
    if (els.spinAgainBtn) {
      els.spinAgainBtn.hidden = !showSpinAgain;
    }

    syncConfigDisabled();
  }

  function setResult({ name, message, challenge }) {
    els.resultName.textContent = name || "—";
    els.resultMessage.textContent = message || "";

    if (challenge) {
      els.resultChallenge.hidden = false;
      els.resultChallenge.textContent = challenge;
    } else {
      els.resultChallenge.hidden = true;
      els.resultChallenge.textContent = "";
    }
  }

  function parseChallenges(text) {
    const lines = String(text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length ? lines : [];
  }

  function pickQuestion() {
    const list = QUESTIONS[state.roundMode] || [];
    return list.length ? pickFrom(list) : null;
  }

  function pickChallengeForMode() {
    const modeList = CHALLENGES_BY_MODE[state.roundMode];
    const list = modeList && modeList.length ? modeList : state.challenges;
    return list.length ? pickFrom(list) : null;
  }

  function pickPercent() {
    return pickFrom(PERCENT_VALUES);
  }

  function pickNumber() {
    return String(1 + Math.floor(Math.random() * 20));
  }

  function usesActionButtons() {
    return state.roundMode !== "normal";
  }

  function modeSpinMessage(playerName) {
    const msgs = {
      tempo:        `${playerName} foi sorteado! Cronômetro valendo...`,
      desafio:      `${playerName} foi sorteado! Cumpra o desafio ou pague o preço.`,
      leve:         `${playerName} foi sorteado! Desafio leve — sem desculpa.`,
      medio:        `${playerName} foi sorteado! Nível médio. Pensa antes de responder.`,
      dificil:      `${playerName} foi sorteado! Difícil. Vai encarar?`,
      pesadao:      `${playerName} foi sorteado! Pesadão. Sem frescura.`,
      proibidona:   `${playerName} foi sorteado! Proibidona 18+. Vai encarar?`,
      casal:        `${playerName} foi sorteado! Momento romântico...`,
      criativo:     `${playerName} foi sorteado! Improvise — crie algo absurdo.`,
      personalizado:`${playerName} foi sorteado! Modo personalizado.`,
    };
    return msgs[state.roundMode] || `${playerName} foi sorteado!`;
  }

  function clearPendingAction() {
    state.awaitingAction = false;
    state.pendingAction = null;
    state.drawnTimerSeconds = null;
  }

  function applyPendingPenalty() {
    if (!state.pendingAction) return;
    const { playerId, spinId } = state.pendingAction;
    clearPendingAction();
    applyPenaltyForPlayer(playerId, spinId);
    updateControls();
  }

  function closePendingClean() {
    const player = state.roundResult.player;
    if (player) {
      addToHistory({
        player,
        outcome: "Cumpriu / Respondeu",
        challenge: state.roundResult.challenge,
        question: state.roundResult.question,
      });
    }
    clearPendingAction();
    updateControls();
  }

  // ===== Manuais (Etapa 11) =====
  const MANUALS = {
    normal: {
      title: "Normal",
      objetivo: "Sobreviver ao sorteio de nomes.",
      roletas: "Jogadores e Vidas.",
      perdaVida: "Automaticamente ao ser sorteado.",
      vence: "Último jogador com vida.",
      exemplo: "Matheus foi sorteado e perdeu 1 vida.",
    },
    tempo: {
      title: "Tempo",
      objetivo: "Cumprir desafio antes do cronômetro acabar.",
      roletas: "Jogadores, Desafios, Tempo e Penalidade.",
      perdaVida: "Se falhar, pular ou deixar o tempo acabar.",
      vence: "Quem permanecer com vidas.",
      exemplo: "Matheus tem 20 segundos para imitar alguém.",
    },
    desafio: {
      title: "Desafio",
      objetivo: "Cumprir desafios sorteados.",
      roletas: "Jogadores, Desafios, Penalidade e Bônus.",
      perdaVida: "Ao falhar ou pular.",
      vence: "Quem sobreviver.",
      exemplo: "Ana deve cantar uma música; se falhar, perde 1 vida.",
    },
    leve: {
      title: "Leve",
      objetivo: "Perguntas e desafios tranquilos.",
      roletas: "Jogadores, Perguntas e Desafios.",
      perdaVida: "Ao pular ou recusar.",
      vence: "Último com vida.",
      exemplo: "Faz uma careta ou perde uma vida.",
    },
    medio: {
      title: "Médio",
      objetivo: "Perguntas mais diretas e desafios sociais.",
      roletas: "Jogadores, Perguntas e Desafios.",
      perdaVida: "Ao pular ou não responder.",
      vence: "Último com vida.",
      exemplo: "Qual foi a maior vergonha que você já passou?",
    },
    dificil: {
      title: "Difícil",
      objetivo: "Penalidades maiores, escolhas e pressão.",
      roletas: "Jogadores, Perguntas, Desafios e Penalidade.",
      perdaVida: "Ao pular, falhar ou receber penalidade sorteada.",
      vence: "Último com vida.",
      exemplo: "Conte uma história vergonhosa ou perca 2 vidas.",
    },
    pesadao: {
      title: "Pesadão",
      objetivo: "Caos com intensidade, porcentagem e consequências.",
      roletas: "Jogadores, Perguntas, Desafios, Porcentagem, Penalidade e Bônus.",
      perdaVida: "Ao recusar, falhar ou sofrer penalidade sorteada.",
      vence: "Quem suportar o caos até o final.",
      exemplo: "João recebeu pergunta pesada com intensidade 80%.",
    },
    proibidona: {
      title: "Proibidona 18+",
      objetivo: "Responder perguntas ousadas de festa e relacionamento.",
      roletas: "Jogadores, Perguntas, Porcentagem e Penalidade.",
      perdaVida: "Ao pular ou falhar.",
      vence: "Quem ficar com vida.",
      exemplo: "Maria deve responder quem da roda beijaria sem pensar; se pular, perde 1 vida.",
    },
    casal: {
      title: "Casal",
      objetivo: "Interação romântica, provocativa e divertida.",
      roletas: "Jogadores, Perguntas, Desafios, Tempo e Bônus.",
      perdaVida: "Ao pular pergunta ou desafio combinado.",
      vence: "Quem terminar com mais vidas (ou terminar quando quiser).",
      exemplo: "Um jogador responde uma pergunta romântica em 30 segundos.",
    },
    criativo: {
      title: "Criativo",
      objetivo: "Improvisar, atuar e criar coisas absurdas.",
      roletas: "Jogadores, Perguntas, Desafios, Número e Tempo.",
      perdaVida: "Ao travar, pular ou falhar.",
      vence: "Quem sobreviver.",
      exemplo: "Crie uma propaganda absurda em 20 segundos.",
    },
    personalizado: {
      title: "Personalizado",
      objetivo: "Você cria as regras.",
      roletas: "Ative as que quiser. Use a roleta personalizada para seus próprios itens.",
      perdaVida: "Definido pelo grupo.",
      vence: "Definido pelo grupo.",
      exemplo: "Configure perguntas, desafios e itens da roleta personalizada.",
    },
  };

  function showManual() {
    const m = MANUALS[state.roundMode] || MANUALS.normal;
    if (!els.modalManualContent || !els.modalManual) return;
    els.modalManualContent.innerHTML = `
      <h2>${m.title}</h2>
      <ul>
        <li><strong>Objetivo:</strong> ${m.objetivo}</li>
        <li><strong>Roletas recomendadas:</strong> ${m.roletas}</li>
        <li><strong>Quando perde vida:</strong> ${m.perdaVida}</li>
        <li><strong>Como vence:</strong> ${m.vence}</li>
        <li><strong>Exemplo:</strong> ${m.exemplo}</li>
      </ul>`;
    els.modalManual.hidden = false;
  }

  // ===== Modal 18+ (Etapa 7) =====
  function showModal18(prevMode) {
    if (!els.modal18) return;
    els.modal18.hidden = false;
    const onConfirm = () => { els.modal18.hidden = true; setRoundMode("proibidona"); cleanup(); };
    const onCancel  = () => {
      els.modal18.hidden = true;
      state.roundMode = prevMode;
      if (els.roundModeSelect) els.roundModeSelect.value = prevMode;
      if (els.roundModePill) els.roundModePill.textContent = roundModeLabel(prevMode);
      cleanup();
    };
    function cleanup() {
      els.modal18ConfirmBtn.removeEventListener("click", onConfirm);
      els.modal18CancelBtn.removeEventListener("click", onCancel);
    }
    els.modal18ConfirmBtn.addEventListener("click", onConfirm);
    els.modal18CancelBtn.addEventListener("click", onCancel);
  }

  // ===== Confetti (Etapa 13) =====
  function launchConfetti() {
    const cvs = document.createElement("canvas");
    cvs.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998;";
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    document.body.appendChild(cvs);
    const c = cvs.getContext("2d");
    const colors = ["#ff3df2","#22e6ff","#ff6b35","#4ade80","#f59e0b","#a855f7","#fb4d89","#ffb703"];
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * cvs.width,
      y: -10 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 5,
      vy: 1.5 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: 7 + Math.random() * 8,
      h: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
    }));
    let raf;
    const deadline = nowMs() + 5500;
    const tick = () => {
      c.clearRect(0, 0, cvs.width, cvs.height);
      const alive = particles.filter(p => p.y < cvs.height + 30);
      alive.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rot += p.rotV;
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      });
      if (alive.length && nowMs() < deadline) { raf = requestAnimationFrame(tick); }
      else { cancelAnimationFrame(raf); cvs.remove(); }
    };
    raf = requestAnimationFrame(tick);
  }

  // ===== Shake animation (Etapa 13) =====
  function shakePlayer(playerId) {
    const card = els.playersList?.querySelector(`[data-player-id="${playerId}"]`);
    if (!card) return;
    card.classList.remove("player--shake");
    void card.offsetWidth;
    card.classList.add("player--shake");
    card.addEventListener("animationend", () => card.classList.remove("player--shake"), { once: true });
  }

  // ===== Victory overlay (Etapa 13) =====
  function showVictoryOverlay(name) {
    if (!els.victoryOverlay) return;
    els.victoryOverlayName.textContent = name;
    els.victoryOverlay.hidden = false;
    launchConfetti();
  }

  // ===== Histórico (Etapa 12) =====
  const LS_HISTORY_KEY = "divertex_history";

  function addToHistory(entry) {
    const item = { round: state.history.length + 1, ...entry, ts: Date.now() };
    state.history.push(item);
    renderHistory();
    window.DivertexApp?.onRoundComplete?.(item);
  }

  function renderHistory() {
    if (!els.historyList) return;
    if (!state.history.length) {
      els.historyList.innerHTML = "<div style='color:var(--muted);font-size:12px;padding:4px 0'>Nenhuma rodada ainda.</div>";
      return;
    }
    els.historyList.innerHTML = state.history.slice().reverse().map(h => {
      const parts = [h.player, h.outcome, h.challenge, h.question].filter(Boolean).join(" · ");
      return `<div class="historyItem"><span class="historyItem__round">#${h.round}</span><span class="historyItem__text">${parts}</span></div>`;
    }).join("");
  }

  function exportHistory() {
    if (!state.history.length) return;
    const txt = "Histórico Divertex\n" + state.history.map(h => {
      const parts = [h.player, h.outcome, h.challenge, h.question].filter(Boolean).join(" | ");
      return `Rodada ${h.round}: ${parts}`;
    }).join("\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "divertex_historico.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ===== Personalizado — localStorage (Etapa 10) =====
  const LS_CUSTOM_KEY = "divertex_custom";

  function loadCustomContent() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_CUSTOM_KEY) || "{}");
      state.customWheelItems = Array.isArray(d.wheelItems) ? d.wheelItems : [];
      if (els.customWheelInput) els.customWheelInput.value = state.customWheelItems.join("\n");
    } catch {}
  }

  function saveCustomContent() {
    try {
      localStorage.setItem(LS_CUSTOM_KEY, JSON.stringify({ wheelItems: state.customWheelItems }));
    } catch {}
  }

  function syncCustomEditorVisibility() {
    if (!els.customEditorPanel) return;
    const show = state.roundMode === "personalizado";
    els.customEditorPanel.hidden = !show;
    if (show) els.customEditorPanel.open = true;
  }

  function pickChallenge() {
    if (!state.challenges.length) return null;
    const i = Math.floor(Math.random() * state.challenges.length);
    return state.challenges[i];
  }

  function addPlayer(name, lives) {
    const cleanName = String(name || "").trim();
    const cleanLives = clamp(Number(lives) || 0, 1, 20);
    if (!cleanName) return;

    state.players.push({
      id: randomId(),
      name: cleanName,
      lives: cleanLives,
      maxLives: cleanLives,
    });

    els.nameInput.value = "";
    els.nameInput.focus();

    state.selectedPlayerId = null;
    renderAll();
  }

  function removePlayer(id) {
    state.players = state.players.filter((p) => p.id !== id);
    if (state.selectedPlayerId === id) state.selectedPlayerId = null;
    renderAll();
  }

  function decLife(id) {
    const p = state.players.find((x) => x.id === id);
    if (!p) return { eliminated: false, player: null };
    if (p.lives <= 0) return { eliminated: false, player: p };

    p.lives -= 1;
    const eliminated = p.lives <= 0;
    if (eliminated) {
      state.players = state.players.filter((x) => x.id !== id);
      if (state.selectedPlayerId === id) state.selectedPlayerId = null;
    }
    return { eliminated, player: p };
  }

  function svgHeart(isOn, isLoss) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", `heartSvg ${isOn ? "" : "heart--off"} ${isLoss ? "heart--loss" : ""}`.trim());
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M12 21s-6.716-4.11-9.192-8.19C.93 9.41 2.43 6.52 5.2 5.4c1.64-.66 3.43-.19 4.68 1 1.25-1.19 3.04-1.66 4.68-1 2.77 1.12 4.27 4.01 2.392 7.41C18.716 16.89 12 21 12 21z"
    );
    path.setAttribute("fill", isOn ? "#ff2e54" : "rgba(255,255,255,0.30)");
    svg.appendChild(path);
    return svg;
  }

  function renderPlayers() {
    els.playersList.innerHTML = "";

    const players = state.players.slice();
    els.playersCountPill.textContent = `${players.length} ativo${players.length === 1 ? "" : "s"}`;

    if (!players.length) {
      const empty = document.createElement("div");
      empty.className = "player";
      empty.innerHTML =
        '<div class="player__name">Nenhum jogador</div><div class="player__meta">Adicione nomes para começar.</div>';
      els.playersList.appendChild(empty);
      return;
    }

    for (const p of players) {
      const card = document.createElement("div");
      card.className = `player ${p.id === state.selectedPlayerId ? "player--selected" : ""}`.trim();
      card.dataset.playerId = p.id;

      const top = document.createElement("div");
      top.className = "player__top";

      const name = document.createElement("div");
      name.className = "player__name";
      name.textContent = p.name;

      const meta = document.createElement("div");
      meta.className = "player__meta";
      meta.textContent = `${p.lives}/${p.maxLives}`;

      top.appendChild(name);
      top.appendChild(meta);

      const hearts = document.createElement("div");
      hearts.className = "player__hearts";
      for (let i = 0; i < p.maxLives; i++) {
        const isOn = i < p.lives;
        const isRecentLoss =
          state.lastLoss &&
          state.lastLoss.playerId === p.id &&
          state.lastLoss.lostIndex === i &&
          !isOn &&
          nowMs() - state.lastLoss.atMs < 900;
        hearts.appendChild(svgHeart(isOn, isRecentLoss));
      }

      const actions = document.createElement("div");
      actions.className = "player__actions";

      const removeBtn = document.createElement("button");
      removeBtn.className = "btnTiny";
      removeBtn.type = "button";
      removeBtn.textContent = "Remover";
      removeBtn.disabled = state.isSpinning || Boolean(state.timer);
      removeBtn.addEventListener("click", () => removePlayer(p.id));

      actions.appendChild(removeBtn);

      card.appendChild(top);
      card.appendChild(hearts);
      card.appendChild(actions);

      els.playersList.appendChild(card);
    }
  }

  function themeHueBase() {
    switch (state.theme) {
      case "caos":    return 20;
      case "casal":   return 200;
      case "darklove":return 330;
      case "minimal": return 0;
      default:
        return 275;
    }
  }

  function segmentColor(i, total) {
    if (state.theme === "minimal") {
      const v = 14 + (i / Math.max(1, total - 1)) * 24;
      return `hsl(0 0% ${v}%)`;
    }
    const base = themeHueBase();
    const hue = (base + (i * 360) / Math.max(1, total)) % 360;
    return `hsl(${hue} 88% 52%)`;
  }

  function ensureCanvasSize() {
    const rect = els.wheelCanvas.getBoundingClientRect();
    const size = Math.max(260, Math.floor(Math.min(rect.width, 640)));
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    wheel.sizePx = size;
    wheel.dpr = dpr;

    els.wheelCanvas.width = Math.floor(size * dpr);
    els.wheelCanvas.height = Math.floor(size * dpr);
  }

  function renderWheel() {
    if (!wheel.ctx) return;
    ensureCanvasSize();

    const ctx = wheel.ctx;
    const w = els.wheelCanvas.width;
    const h = els.wheelCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.46;
    const players = state.players;

    ctx.save();
    ctx.translate(cx, cy);

    const ring = Math.max(14, Math.floor(r * 0.08));
    const innerR = r - ring;

    const bgGrad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
    bgGrad.addColorStop(0, "rgba(255,255,255,0.18)");
    bgGrad.addColorStop(1, "rgba(0,0,0,0.25)");

    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    if (!players.length) {
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = `900 ${Math.floor(r * 0.09)}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Adicione", 0, -Math.floor(r * 0.04));
      ctx.fillText("jogadores", 0, Math.floor(r * 0.07));
      ctx.restore();
      return;
    }

    const n = players.length;
    const slice = (Math.PI * 2) / n;
    const start = wheel.angle;

    for (let i = 0; i < n; i++) {
      const a0 = start + i * slice;
      const a1 = a0 + slice;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, innerR, a0, a1);
      ctx.closePath();
      ctx.fillStyle = segmentColor(i, n);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2 * wheel.dpr;
      ctx.stroke();

      const label = players[i].name;
      const mid = a0 + slice / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(innerR * 0.62, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.font = `900 ${Math.floor(r * 0.06)}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 0, innerR * 0.72);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, ring, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, ring - 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();

    ctx.restore();
  }

  function playSound(type) {
    if (!state.soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const t0 = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);

      if (type === "spin") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.exponentialRampToValueAtTime(720, t0 + 0.25);
        osc.frequency.exponentialRampToValueAtTime(260, t0 + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        osc.start(t0);
        osc.stop(t0 + 0.62);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(740, t0);
        osc.frequency.exponentialRampToValueAtTime(520, t0 + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      }

      osc.onended = () => {
        ctx.close().catch(() => {});
      };
    } catch {
      return;
    }
  }

  // ===== Vidas / Penalidade (com trava para não descontar 2x no mesmo giro) =====
  function applyPenaltyForPlayer(playerId, spinId) {
    if (typeof spinId === "number") {
      if (state.currentSpinId !== spinId) return;
      if (state.penaltyAppliedSpinId === spinId) return;
      state.penaltyAppliedSpinId = spinId;
    }

    const p = state.players.find((x) => x.id === playerId);
    if (!p) {
      setResult({
        name: "—",
        message: "Esse jogador já foi eliminado. Gire novamente.",
        challenge: null,
      });
      state.selectedPlayerId = null;
      renderAll();
      return;
    }

    const before = p.lives;
    const { eliminated } = decLife(playerId);
    const after = Math.max(0, before - 1);

    state.lastLoss = { playerId: p.id, lostIndex: after, atMs: nowMs() };

    let msg = `${p.name} perdeu uma vida! (${after}/${p.maxLives}) ${pickFrom(FUNNY_LOSS)}`;
    if (eliminated) msg = `${p.name} foi ELIMINADO! ${pickFrom(FUNNY_ELIM)}`;

    const challenge = isWheelOn("challenges") ? pickChallenge() : null;

    setResult({
      name: p.name,
      message: msg,
      challenge,
    });

    setRoundResult({
      player: p.name,
      mode: roundModeLabel(state.roundMode),
      lives: isWheelOn("lives") ? `-1 → ${after}/${p.maxLives}` : null,
      penalty: isWheelOn("penalty") ? (eliminated ? "Eliminado" : "Perdeu 1 vida") : null,
      challenge: isWheelOn("challenges") ? challenge : null,
      time: isWheelOn("time") ? state.roundResult.time : null,
    });

    playSound("result");
    shakePlayer(playerId);
    renderAll();

    addToHistory({
      player: p.name,
      outcome: eliminated ? "Eliminado" : `Perdeu 1 vida (${after}/${p.maxLives})`,
      challenge: isWheelOn("challenges") ? challenge : undefined,
      question: isWheelOn("questions") ? state.roundResult.question : undefined,
    });

    if (state.players.length === 1) {
      const winner = state.players[0];
      setResult({
        name: winner.name,
        message: `${winner.name} venceu! (último sobrevivente)`,
        challenge: null,
      });
      state.selectedPlayerId = winner.id;
      renderPlayers();
      renderWheel();
      updateControls();
      setTimeout(() => showVictoryOverlay(winner.name), 400);
      const totalLivesLost = state.history.filter(h => h.outcome && h.outcome.includes("Perdeu")).length;
      window.DivertexApp?.onWinner?.({ winnerName: winner.name, totalRounds: state.history.length, totalLivesLost });
    }

    if (state.players.length === 0) {
      setResult({
        name: "—",
        message: "Fim de jogo! Não sobrou ninguém. Resetar e tentar de novo?",
        challenge: null,
      });
      renderAll();
    }
  }

  // ===== Modo Tempo =====
  function startCountdownForPlayer(playerId, spinId) {
    stopCountdown();

    const seconds = state.drawnTimerSeconds
      ? clamp(state.drawnTimerSeconds, 1, 600)
      : clamp(Number(state.timerSeconds) || 10, 1, 600);
    const startTime = nowMs();
    const endTime = startTime + seconds * 1000;
    const circumference = 314;

    els.countdown.hidden = false;
    els.endTurnBtn.disabled = false;

    setRoundResult({
      player: state.roundResult.player,
      mode: roundModeLabel(state.roundMode),
      time: isWheelOn("time") ? `${seconds}s` : null,
    });

    function tick() {
      const t = nowMs();
      const remainingMs = Math.max(0, endTime - t);
      const remaining = Math.ceil(remainingMs / 1000);
      const progress = clamp(1 - remainingMs / (seconds * 1000), 0, 1);
      const dash = circumference * (1 - progress);

      els.countdownValue.textContent = String(remaining);
      els.ringProgress.style.strokeDasharray = String(circumference);
      els.ringProgress.style.strokeDashoffset = String(dash);

      if (remainingMs <= 0) {
        stopCountdown();
        applyPenaltyForPlayer(playerId, spinId);
      }
    }

    tick();
    const intervalId = setInterval(tick, 100);
    state.timer = { intervalId, playerId, spinId };
    updateControls();
  }

  // ===== Roleta =====
  function spinOnce() {
    if (state.isSpinning || state.timer) return;
    if (state.players.length < 2) return;

    state.isSpinning = true;
    state.selectedPlayerId = null;
    state.lastLoss = null;
    updateControls();
    renderPlayers();

    const spinId = (state.spinSeq += 1);
    state.currentSpinId = spinId;
    state.penaltyAppliedSpinId = null;

    const n = state.players.length;
    const slice = (Math.PI * 2) / n;
    const selectedIndex = Math.floor(Math.random() * n);

    const pointer = -Math.PI / 2;
    const centerRel = selectedIndex * slice + slice / 2;
    const targetAbs = pointer - centerRel;
    const baseDelta = normalizeAngle(targetAbs - wheel.angle);
    const extraSpins = 6 + Math.floor(Math.random() * 4);
    const delta = baseDelta + extraSpins * Math.PI * 2;

    const startAngle = wheel.angle;
    const endAngle = startAngle + delta;
    const duration = 4200 + Math.floor(Math.random() * 700);
    const startT = nowMs();

    playSound("spin");

    const frame = () => {
      const t = nowMs();
      const p = clamp((t - startT) / duration, 0, 1);
      const e = easeOutCubic(p);

      wheel.angle = startAngle + (endAngle - startAngle) * e;
      renderWheel();

      if (p < 1) {
        wheel.anim = requestAnimationFrame(frame);
        return;
      }

      wheel.angle = normalizeAngle(endAngle);
      state.isSpinning = false;

      const picked = state.players[selectedIndex];
      if (!picked) {
        setResult({ name: "—", message: "Algo mudou na lista de jogadores. Tente novamente.", challenge: null });
        renderAll();
        return;
      }

      state.selectedPlayerId = picked.id;
      renderPlayers();
      renderWheel();

      const challenge = isWheelOn("challenges") ? pickChallengeForMode() : null;
      const question  = isWheelOn("questions")  ? pickQuestion()          : null;
      const percent   = isWheelOn("percent")    ? pickPercent()            : null;
      const number    = isWheelOn("number")     ? pickNumber()             : null;
      const penalty   = isWheelOn("penalty")    ? pickFrom(DEFAULT_PENALTIES) : null;
      const bonus     = isWheelOn("bonus")      ? pickFrom(DEFAULT_BONUSES)   : null;
      const custom    = isWheelOn("custom") && state.customWheelItems.length
                          ? pickFrom(state.customWheelItems)
                          : isWheelOn("custom") ? "Configure a roleta personalizada" : null;
      setRoundResult({
        player: picked.name,
        mode: roundModeLabel(state.roundMode),
        lives: null,
        question,
        challenge,
        time: (() => {
          if (!isWheelOn("time")) return null;
          const drawn = pickFrom(TIME_WHEEL_VALUES);
          state.drawnTimerSeconds = drawn;
          return `${drawn}s`;
        })(),
        percent,
        number,
        penalty,
        bonus,
        custom,
      });

      if (state.mode === "timer") {
        setResult({ name: picked.name, message: modeSpinMessage(picked.name), challenge });
        startCountdownForPlayer(picked.id, spinId);
      } else if (usesActionButtons()) {
        setResult({ name: picked.name, message: modeSpinMessage(picked.name), challenge });
        state.awaitingAction = true;
        state.pendingAction = { playerId: picked.id, spinId };
      } else {
        setResult({
          name: picked.name,
          message: `${picked.name} foi sorteado! Perde 1 vida...`,
          challenge,
        });
        applyPenaltyForPlayer(picked.id, spinId);
      }

      updateControls();
    };

    wheel.anim = requestAnimationFrame(frame);
  }

  function resetGame() {
    stopCountdown();
    if (wheel.anim) cancelAnimationFrame(wheel.anim);
    wheel.anim = null;
    wheel.angle = 0;
    state.players = [];
    state.selectedPlayerId = null;
    state.isSpinning = false;
    state.lastLoss = null;
    state.currentSpinId = null;
    state.penaltyAppliedSpinId = null;
    state.awaitingAction = false;
    state.pendingAction = null;
    state.drawnTimerSeconds = null;
    state.history = [];
    if (els.victoryOverlay) els.victoryOverlay.hidden = true;
    state.activeWheels = {
      players: true,
      lives: true,
      questions: false,
      challenges: true,
      time: false,
      percent: false,
      number: false,
      penalty: false,
      bonus: false,
      custom: false,
    };
    clearRoundResult();
    setRoundMode("normal");
    setResult({ name: "—", message: "Jogo resetado. Adicione jogadores e gire a roleta.", challenge: null });
    renderHistory();
    renderAll();
  }

  function addSamplePlayers() {
    if (state.isSpinning || state.timer) return;
    if (state.players.length) return;
    addPlayer("Matheus", 3);
    addPlayer("Ana", 3);
    addPlayer("João", 3);
    addPlayer("Bia", 3);
  }

  function renderAll() {
    renderPlayers();
    renderWheel();
    updateControls();
  }

  function bindEvents() {
    if (els.openWheelBtn) {
      els.openWheelBtn.addEventListener("click", () => showScreen("wheel"));
    }

    // Cards de modalidade do menu — abre o jogo com o modo pré-definido
    document.querySelectorAll(".openModeBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode || "normal";
        showScreen("wheel");
        setRoundMode(mode);
      });
    });

    if (els.backToMenuBtn) {
      els.backToMenuBtn.addEventListener("click", () => showScreen("menu"));
    }

    els.addPlayerForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      addPlayer(els.nameInput.value, els.livesInput.value);
    });

    els.addSampleBtn.addEventListener("click", () => addSamplePlayers());

    els.spinBtn.addEventListener("click", () => spinOnce());

    els.resetBtn.addEventListener("click", () => resetGame());

    els.themeSelect.addEventListener("change", (ev) => setTheme(ev.target.value));

    els.soundToggle.addEventListener("change", (ev) => setSoundEnabled(ev.target.checked));

    if (els.roundModeSelect) {
      els.roundModeSelect.addEventListener("change", (ev) => {
        if (ev.target.value === "proibidona") {
          showModal18(state.roundMode);
        } else {
          setRoundMode(ev.target.value);
        }
      });
    }

    function onWheelChange() {
      state.activeWheels.players = true;
      state.activeWheels.lives = Boolean(els.wheelLives?.checked);
      state.activeWheels.questions = Boolean(els.wheelQuestions?.checked);
      state.activeWheels.challenges = Boolean(els.wheelChallenges?.checked);
      state.activeWheels.time = Boolean(els.wheelTime?.checked);
      state.activeWheels.percent = Boolean(els.wheelPercent?.checked);
      state.activeWheels.number = Boolean(els.wheelNumber?.checked);
      state.activeWheels.penalty = Boolean(els.wheelPenalty?.checked);
      state.activeWheels.bonus = Boolean(els.wheelBonus?.checked);
      state.activeWheels.custom = Boolean(els.wheelCustom?.checked);
      syncConfigDisabled();
      renderRoundResult();
    }

    [
      els.wheelLives,
      els.wheelQuestions,
      els.wheelChallenges,
      els.wheelTime,
      els.wheelPercent,
      els.wheelNumber,
      els.wheelPenalty,
      els.wheelBonus,
      els.wheelCustom,
    ].forEach((el) => el && el.addEventListener("change", onWheelChange));

    els.timerSecondsInput.addEventListener("change", (ev) => setTimerSeconds(ev.target.value));
    els.timerSecondsInput.addEventListener("input", (ev) => setTimerSeconds(ev.target.value));

    els.endTurnBtn.addEventListener("click", () => {
      if (!state.timer) return;
      const pid = state.timer.playerId;
      const spinId = state.timer.spinId;
      stopCountdown();
      state.awaitingAction = true;
      state.pendingAction = { playerId: pid, spinId };
      updateControls();
    });

    els.updateChallengesBtn.addEventListener("click", () => {
      const next = parseChallenges(els.challengesInput.value);
      state.challenges = next.length ? next : [];
      setResult({
        name: els.resultName.textContent,
        message: next.length ? `Brincadeiras atualizadas! (${next.length})` : "Brincadeiras limpas. (sem desafios)",
        challenge: null,
      });
    });

    if (els.cumpriumBtn) els.cumpriumBtn.addEventListener("click", () => closePendingClean());
    if (els.respondeuBtn) els.respondeuBtn.addEventListener("click", () => closePendingClean());
    if (els.falhouBtn) els.falhouBtn.addEventListener("click", () => applyPendingPenalty());
    if (els.pulouBtn) els.pulouBtn.addEventListener("click", () => applyPendingPenalty());
    if (els.applyPenaltyBtn) els.applyPenaltyBtn.addEventListener("click", () => applyPendingPenalty());
    if (els.spinAgainBtn) els.spinAgainBtn.addEventListener("click", () => { clearPendingAction(); spinOnce(); });

    if (els.verManualBtn) els.verManualBtn.addEventListener("click", () => showManual());
    if (els.modalManualCloseBtn) els.modalManualCloseBtn.addEventListener("click", () => { if (els.modalManual) els.modalManual.hidden = true; });
    if (els.modalManual) els.modalManual.addEventListener("click", (e) => { if (e.target === els.modalManual) els.modalManual.hidden = true; });

    if (els.exportHistoryBtn) els.exportHistoryBtn.addEventListener("click", (e) => { e.stopPropagation(); exportHistory(); });

    if (els.victoryCloseBtn) els.victoryCloseBtn.addEventListener("click", () => {
      if (els.victoryOverlay) els.victoryOverlay.hidden = true;
      resetGame();
    });

    if (els.updateCustomWheelBtn) els.updateCustomWheelBtn.addEventListener("click", () => {
      const lines = (els.customWheelInput?.value || "").split("\n").map(s => s.trim()).filter(Boolean);
      state.customWheelItems = lines;
      saveCustomContent();
    });

    els.shuffleChallengesBtn.addEventListener("click", () => {
      shuffleInPlace(state.challenges);
      els.challengesInput.value = state.challenges.join("\n");
      setResult({
        name: els.resultName.textContent,
        message: state.challenges.length ? "Brincadeiras embaralhadas!" : "Sem brincadeiras para embaralhar.",
        challenge: null,
      });
    });

    const ro = new ResizeObserver(() => renderWheel());
    ro.observe(els.wheelCanvas);

    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) spinOnce();
      if (ev.key === "Escape") {
        if (state.awaitingAction) {
          closePendingClean();
        } else if (state.timer) {
          const pid = state.timer.playerId;
          const spinId = state.timer.spinId;
          stopCountdown();
          state.awaitingAction = true;
          state.pendingAction = { playerId: pid, spinId };
          updateControls();
        }
      }
    });
  }

  function init() {
    els.themeSelect.value = state.theme;
    els.challengesInput.value = state.challenges.join("\n");
    setTheme(state.theme);
    setTimerSeconds(els.timerSecondsInput.value);
    setSoundEnabled(false);
    syncWheelsToUI();
    setRoundMode(els.roundModeSelect?.value || "normal");
    clearRoundResult();
    setResult({ name: "—", message: "Adicione jogadores e gire a roleta.", challenge: null });
    bindEvents();
    loadCustomContent();
    renderHistory();
    syncCustomEditorVisibility();
    renderAll();
    showScreen("menu");
  }

  init();

  // ===== DivertexApp bridge (para integração Supabase) =====
  window.DivertexApp = {
    getState: () => ({
      players:      state.players.map(p => ({ ...p })),
      roundMode:    state.roundMode,
      activeWheels: { ...state.activeWheels },
      history:      state.history.slice(),
    }),
    getHistory:  () => state.history.slice(),
    currentUser: null,
    onRoundComplete: null,
    onWinner:        null,
    onReset:         null,
  };
})();
