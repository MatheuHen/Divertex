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
      "Qual foi a última foto que você tirou?",
      "Qual aplicativo você mais usa no celular?",
      "Qual animal te representa melhor?",
      "Qual cor combina com sua personalidade?",
      "Qual foi o último vídeo engraçado que você viu?",
      "Quem da roda parece mais dorminhoco?",
      "Qual é o seu prato favorito?",
      "Qual foi a última coisa que te fez rir muito?",
      "Qual é o seu lugar favorito para relaxar?",
      "Você prefere praia ou montanha?",
      "Qual é a sua estação do ano favorita?",
      "Quem da roda parece mais distraído?",
      "Qual é o seu sorvete favorito?",
      "Qual foi a última série que você assistiu?",
      "Qual é o seu hobby secreto?",
      "Quem da roda parece mais solitário?",
      "Qual é a palavra que você mais usa?",
      "Qual foi o presente mais estranho que você já ganhou?",
      "Qual é o seu meme favorito?",
      "Quem da roda parece mais aventureiro?",
      "Qual é a sua comida favorita para comer assistindo série?",
      "Qual foi a última mentira branca que você contou?",
      "Qual é o seu jeito favorito de passar o fim de semana?",
      "Qual animal você nunca se tornaria?",
      "Quem da roda parece mais preguiçoso?",
      "Qual é o seu superpoder de bagunça?",
      "Qual é a sua palavra favorita em português?",
      "Qual foi o último livro ou história que você leu?",
      "Quem da roda parece mais organizado?",
      "Qual é a sua maior habilidade culinária?",
      "Qual foi a última vez que você fez algo por impulso?",
      "Qual é o seu programa favorito na TV aberta?",
      "Quem da roda parece mais nostálgico?",
      "Qual é o seu tipo de clima preferido?",
      "Qual foi a última música que ficou na sua cabeça?",
      "Qual é a coisa mais engraçada que já aconteceu com você?",
      "Quem da roda parece mais curioso?",
      "Qual é o seu lanche favorito?",
      "Qual foi a última vez que você se perdeu?",
      "Qual é a sua memória mais vaga da infância?",
      "Quem da roda parece mais teimoso?",
      "Qual é o seu gênero de filme favorito?",
      "Qual foi a última viagem que você fez?",
      "Qual é a sua maior fraqueza com doces?",
      "Quem da roda parece mais calmo?",
      "Qual é o seu jeito favorito de acordar?",
      "Qual foi a última coisa que te deixou com preguiça?",
      "Qual é o seu jogo favorito?",
      "Quem da roda parece mais competitivo?",
      "Qual é a sua bebida favorita?",
      "Qual foi a última vez que você ficou animado com algo pequeno?",
      "Qual é o seu animal de estimação dos sonhos?",
      "Quem da roda parece mais otimista?",
      "Qual é a sua maior distração diária?",
      "Qual foi a última vez que você ajudou alguém?",
      "Qual é o seu momento favorito do dia?",
      "Quem da roda parece mais escandaloso?",
      "Qual é a sua frase favorita?",
      "Qual foi o último desejo que você fez?",
      "Qual é a sua cor de cabelo dos sonhos?",
      "Quem da roda parece mais reservado?",
      "Qual é a sua rede social favorita?",
      "Qual foi a última vez que você dançou sem ter ninguém vendo?",
      "Qual é o seu estilo de roupa favorito?",
      "Quem da roda parece mais criativo?",
      "Qual é o seu maior prazer culposo?",
      "Qual foi a última vez que você se surpreendeu?",
      "Qual é a sua forma favorita de se divertir?",
      "Quem da roda parece mais detalhista?",
      "Qual é o seu tipo de música favorito?",
      "Qual foi a última vez que você fez algo novo?",
      "Qual é o seu sonho de viagem?",
      "Quem da roda parece mais extrovertido?",
      "Qual é a sua maior qualidade segundo você mesmo?",
      "Qual foi a última vez que você chorou de rir?",
      "Qual é o seu personagem favorito de animação?",
      "Quem da roda parece mais inteligente?",
      "Qual é a coisa mais estranha que você já comeu?",
      "Qual foi a última vez que você fez algo completamente aleatório?",
      "Qual é o seu tipo de abraço favorito?",
      "Quem da roda parece mais sensível?",
      "Qual é a sua maior conquista recente?",
      "Qual foi a última coisa que te deu orgulho?",
      "Qual é o seu dia da semana favorito?",
      "Quem da roda parece mais divertido numa festa?",
      "Qual é a sua comida de conforto?",
      "Qual foi a última vez que você fez algo espontâneo?",
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
      "Qual foi o pior término de relacionamento que você teve?",
      "Você já mandou mensagem para a pessoa errada?",
      "Qual foi a situação mais constrangedora com um crush?",
      "Você já mentiu sobre onde estava?",
      "Qual foi a maior bagunça que você causou?",
      "Quem da roda você chamaria para uma aventura?",
      "Você já ficou com alguém que não devia?",
      "Qual foi o maior mal-entendido que você já teve?",
      "Você já fez algo para impressionar alguém e deu errado?",
      "Qual foi a última vez que você foi completamente honesto com alguém?",
      "Quem da roda você acha que guarda mais segredos?",
      "Você já se arrependeu de algo que disse?",
      "Qual foi o momento mais embaraçoso num encontro?",
      "Você já stalkeou alguém nas redes sociais?",
      "Quem da roda você acha que mais se preocupa com aparência?",
      "Qual foi a última vez que você ficou vermelho de vergonha?",
      "Você já cancelou planos usando uma desculpa falsa?",
      "Qual foi a mentira que quase te pegou?",
      "Quem da roda você acha que tem mais charme sem perceber?",
      "Você já gostou de alguém que não devia?",
      "Qual foi a situação mais inesperada que você já viveu?",
      "Você já saiu com alguém sem contar para ninguém?",
      "Qual foi o presente mais sem sentido que você já deu?",
      "Quem da roda você acha que apaixona mais rápido?",
      "Você já fez algo que seus amigos não aprovam?",
      "Qual foi a decisão mais impulsiva que deu certo?",
      "Você já fingiu gostar de algo para agradar alguém?",
      "Qual foi o seu pior momento em público?",
      "Quem da roda você acha que mais esconde o jogo?",
      "Você já deixou alguém esperando de propósito?",
      "Qual foi a fofoca que você não devia ter espalhado?",
      "Você já se arrependeu de um corte de cabelo?",
      "Quem da roda você acha que mais ilude as pessoas?",
      "Você já fez algo envergonhante por amor?",
      "Qual foi a situação mais imprevista que te surpreendeu?",
      "Você já deu like sem querer em foto antiga de alguém?",
      "Quem da roda você acha que tem mais paciência?",
      "Qual foi a última vez que você fez algo que te deixou com vergonha alheia?",
      "Você já comprou algo caro por impulso?",
      "Qual foi a última vez que você se sentiu completamente fora de lugar?",
      "Quem da roda você acha que mais chora em filme?",
      "Você já escondeu algo de um amigo próximo?",
      "Qual foi a situação mais constrangedora com sua família?",
      "Você já fingiu não gostar de algo que gosta?",
      "Quem da roda você ligaria às 3 da manhã se precisasse?",
      "Qual foi a última vez que você se sentiu mal por algo que fez?",
      "Você já se perdeu numa discussão por teimosia?",
      "Qual foi o momento que você mais precisou de coragem?",
      "Quem da roda você acha que tem mais autoconfiança?",
      "Você já fez algo engraçado tentando ser sério?",
      "Qual foi a maior mentira que você já contou para se safar?",
      "Quem da roda você acha que mais se vende bem?",
      "Você já fez alguém se apaixonar por você sem querer?",
      "Qual foi a última situação em que você perdeu a compostura?",
      "Você já fingiu gostar de uma pessoa que não suportava?",
      "Quem da roda você acha que tem mais habilidade social?",
      "Qual foi a mensagem que você escreveu mas não enviou?",
      "Você já saiu de uma situação ruim inventando uma história?",
      "Quem da roda você acha que mais esconde os sentimentos?",
      "Você já gostou de alguém do grupo de amigos do seu ex?",
      "Qual foi a última vez que você precisou pedir desculpas sinceras?",
      "Quem da roda você acha que tem mais dificuldade em dizer não?",
      "Você já curtiu alguém só por curiosidade?",
      "Qual foi a situação em que você se sentiu mais corajoso?",
      "Quem da roda você acha que mais finge estar bem?",
      "Você já fez algo para chamar atenção de alguém?",
      "Qual foi a última vez que você foi completamente surpreendido por alguém?",
      "Quem da roda você acha que tem mais segredos do passado?",
      "Você já ficou com inveja de alguém aqui da roda?",
      "Qual foi a situação mais embaraçosa que você saiu bem?",
      "Quem da roda você escolheria como companheiro de viagem?",
      "Você já desistiu de algo importante por medo?",
      "Qual foi a última vez que você atuou para impressionar alguém?",
      "Quem da roda você acha que mais guarda rancor?",
      "Você já fez algo completamente fora do seu feitio?",
      "Qual foi a reação mais engraçada que você já teve?",
      "Quem da roda você acha que tem mais personalidade marcante?",
      "Você já gostou de duas pessoas ao mesmo tempo?",
      "Qual foi o momento mais humilhante que superou?",
      "Quem da roda você acha que mais sente ciúme?",
      "Você já revelou um segredo que jurou guardar?",
      "Qual foi a última vez que você tomou uma atitude inesperada?",
      "Quem da roda você acha que é mais difícil de entender?",
      "Você já teve um crush que todo mundo achou estranho?",
      "Qual foi a situação em que você mais errou a leitura de alguém?",
      "Quem da roda você acha que mais se contradiz?",
      "Você já deixou de fazer algo por opinião alheia?",
      "Qual foi a última vez que você agiu no impulso e deu errado?",
      "Quem da roda você acha que mais se subestima?",
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
      "Qual é o pensamento que você tem vergonha de admitir?",
      "Qual foi a pior decisão que você tomou conscientemente?",
      "Quem da roda você acha que tem mais segredos obscuros?",
      "Você já magoou alguém sem se importar?",
      "Qual foi a pior fase da sua vida até agora?",
      "Você já fez algo que contradizia completamente seus valores?",
      "Quem da roda você acha que mais vive uma mentira?",
      "Qual foi a situação em que você perdeu totalmente a compostura?",
      "Você já se vingou de alguém? Como foi?",
      "Qual é o maior medo que você esconde de todos?",
      "Quem da roda você acha que tem o pior passado amoroso?",
      "Você já manipulou alguém para conseguir o que queria?",
      "Qual foi a atitude que você tomou que te envergonha até hoje?",
      "Você já fingiu estar bem enquanto estava completamente destruído por dentro?",
      "Quem da roda você acha que mais faz teatro no dia a dia?",
      "Qual foi a maior traição que você sofreu?",
      "Você já descartou alguém de forma fria?",
      "Qual é o segredo que você carrega que poderia mudar a opinião das pessoas sobre você?",
      "Você já fez algo antiético para se dar bem?",
      "Quem da roda você acha que mais esconde sua vida real?",
      "Qual foi a vez que você mais errou uma leitura de situação?",
      "Você já deixou alguém se machucar por omissão?",
      "Qual é a sua maior fraqueza de caráter?",
      "Quem da roda você acha que tem mais esqueletos no armário?",
      "Você já se sentiu aliviado com o fim de uma amizade?",
      "Qual foi a maior mentira que você sustentou por muito tempo?",
      "Você já agiu de má-fé com alguém que confiava em você?",
      "Quem da roda você acha que mais usa a simpatia para esconder algo?",
      "Qual foi a decisão difícil que você tomou e não se arrepende?",
      "Você já preferiu se calar quando devia ter falado?",
      "Quem da roda você acha que mais carga emocional carrega?",
      "Qual foi o momento em que você foi mais egoísta?",
      "Você já aproveitou da fraqueza de alguém?",
      "Qual é a parte de você que você menos gosta e nunca conta?",
      "Quem da roda você acha que já passou por algo muito pesado?",
      "Você já fez amigos por interesse?",
      "Qual foi a situação em que você se sentiu mais envergonhado de si mesmo?",
      "Você já desapontou alguém que acreditava em você?",
      "Quem da roda você acha que mais tem dificuldade com honestidade?",
      "Qual foi a última vez que você agiu contra sua consciência?",
      "Você já foi cruel com alguém sem necessidade?",
      "Quem da roda você acha que mais esconde dor?",
      "Qual foi sua maior vergonha que ainda não contou para ninguém?",
      "Você já saiu de uma situação difícil jogando a culpa em outro?",
      "Qual é a coisa mais feia que você já fez por ciúme?",
      "Quem da roda você acha que mais usaria o grupo para alguma vantagem?",
      "Você já terminou algo importante sem nenhuma explicação?",
      "Qual foi a vez que você mais agiu na covardia?",
      "Você já deixou de defender alguém quando deveria?",
      "Quem da roda você acha que mais evita responsabilidade?",
      "Qual foi a situação em que você foi mais falso?",
      "Você já se aproveitou de alguém emocionalmente?",
      "Qual foi a atitude mais covarde que você já teve?",
      "Quem da roda você acha que mais se fecha emocionalmente?",
      "Você já fingi amar ou gostar de alguém?",
      "Qual foi a situação em que você sentiu mais remorso?",
      "Quem da roda você acha que mais se arrepende de algo grande?",
      "Você já machucou alguém que te amava de verdade?",
      "Qual foi a pior coisa que você já disse para alguém em raiva?",
      "Quem da roda você acha que guarda mais mágoa antiga?",
      "Você já fez algo que contradisse completamente o que prega?",
      "Qual é o defeito que você reconhece e não consegue mudar?",
      "Quem da roda você acha que mais evita conflito mas ferve por dentro?",
      "Você já usou alguém como bode expiatório?",
      "Qual foi a decisão que mais custou emocionalmente?",
      "Quem da roda você acha que mais se magoa fácil?",
      "Você já afastou alguém que te fazia bem por medo?",
      "Qual foi a situação em que você preferiu a mentira confortável?",
      "Quem da roda você acha que mais carrega trauma disfarçado?",
      "Você já rompeu uma amizade sem dar satisfação?",
      "Qual foi a maior lealdade que você quebrou?",
      "Quem da roda você acha que tem o coração mais difícil de abrir?",
      "Você já cobrou algo de alguém que você mesmo não cumpre?",
      "Qual foi a vez que você mais desapontou a si mesmo?",
      "Quem da roda você acha que mais aparenta ser algo que não é?",
      "Você já pediu desculpa sem realmente sentir?",
      "Qual foi a situação em que você percebeu que havia cruzado um limite?",
      "Quem da roda você acha que mais tem medo de se conhecer de verdade?",
      "Você já acabou com algo por medo de se comprometer?",
      "Qual foi a maior contradição que você viveu?",
      "Quem da roda você acha que mais evita olhar para si mesmo?",
      "Você já fez algo que envergonharia sua família?",
      "Qual foi a situação onde você mais precisou de coragem e fugiu?",
      "Quem da roda você acha que mais tem dificuldade de ser feliz?",
      "Você já usou a fragilidade de alguém a seu favor?",
      "Qual foi a situação mais sombria que você enfrentou?",
      "Quem da roda você acha que mais precisa de uma conversa honesta?",
      "Você já abandonou alguém quando mais precisava de você?",
      "Qual foi a mentira que mais te pesou?",
      "Quem da roda você acha que mais tem dificuldade de perdoar?",
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
      "Quem da roda você acha que tem mais ego inflado?",
      "Quem da roda você acha que mais finge ser algo que não é?",
      "Quem da roda você menos confiaria um segredo?",
      "Quem da roda você acha que mais usa as pessoas?",
      "Quem da roda você acha que menos merece confiança?",
      "Quem da roda você acha que mais faz joguinho?",
      "Quem da roda você acha que mais desperdiça oportunidade?",
      "Quem da roda você acha que mais faz vítima de si mesmo?",
      "Quem da roda você acha que mais muda de humor sem avisar?",
      "Quem da roda você acha que mais cobra dos outros o que não faz?",
      "Quem da roda você acha que mais tem dificuldade de pedir desculpa?",
      "Quem da roda você acha que mais teria razão num briga e nunca admitiria?",
      "Quem da roda você acha que mais joga para a plateia?",
      "Quem da roda você acha que mais tem inveja escondida?",
      "Quem da roda você acha que mais evita se comprometer?",
      "Quem da roda você acha que mais atropela os outros sem perceber?",
      "Quem da roda você acha que teria mais facilidade de trair alguém?",
      "Quem da roda você menos chamaria para te ajudar numa crise?",
      "Quem da roda você acha que mais faz drama por nada?",
      "Quem da roda você acha que mais tem dificuldade de crescer?",
      "Quem da roda você acha que mais repete os mesmos erros?",
      "Quem da roda você acha que mais não assume o que fez?",
      "Quem da roda você acha que mais passa pano para si mesmo?",
      "Quem da roda você acha que mais anda com más companhias?",
      "Quem da roda você acha que menos resiste a pressão social?",
      "Quem da roda você acha que mais muda de opinião de acordo com quem está?",
      "Quem da roda você acha que mais tem dupla personalidade?",
      "Quem da roda você acha que mais é influenciável?",
      "Quem da roda você acha que mais aparenta o que não sente?",
      "Quem da roda você acha que mais guarda rancor silencioso?",
      "Quem da roda você acha que mais teria jogo sujo numa discussão?",
      "Quem da roda você acha que mais faz de conta que não viu?",
      "Quem da roda você acha que tem mais cara de quem vive reclamando?",
      "Quem da roda você acha que mais dificilmente admite um erro?",
      "Quem da roda você acha que mais tem coisa para resolver consigo mesmo?",
      "Quem da roda você acha que mais subestima as pessoas?",
      "Quem da roda você acha que mais joga sujo no amor?",
      "Quem da roda você acha que mais finge que está de boa?",
      "Quem da roda você acha que mais tem dificuldade de ser feliz sozinho?",
      "Quem da roda você acha que mais teria atitude questionável sob pressão?",
      "Quem da roda você acha que menos enfrenta os problemas de frente?",
      "Quem da roda você acha que mais dá trabalho em grupo?",
      "Quem da roda você acha que mais teria o instinto de se salvar antes dos outros?",
      "Quem da roda você acha que mais envolve o ego nas discussões?",
      "Quem da roda você acha que mais tem historial de relacionamentos bagunçados?",
      "Quem da roda você acha que mais tem carisma de fachada?",
      "Quem da roda você acha que menos sustenta a palavra?",
      "Quem da roda você acha que mais usa humor para desviar de assuntos sérios?",
      "Quem da roda você acha que mais deixa as pessoas esperando?",
      "Quem da roda você acha que mais tem dois pesos e duas medidas?",
      "Quem da roda você menos chamaria para um conselho honesto?",
      "Quem da roda você acha que mais teria dificuldade de viver sem validação alheia?",
      "Quem da roda você acha que mais finge superação?",
      "Quem da roda você acha que mais teria medo de ser exposto?",
      "Quem da roda você acha que mais vive no modo automático sem se questionar?",
      "Quem da roda você acha que menos aprende com os próprios erros?",
      "Quem da roda você acha que mais tem necessidade de controle?",
      "Quem da roda você acha que mais tem dificuldade de ouvir crítica?",
      "Quem da roda você acha que mais tem cara de quem nunca se responsabilizou por nada?",
      "Quem da roda você acha que mais usa a frase 'eu sou assim mesmo'?",
      "Quem da roda você acha que mais teria reação desproporcional numa situação difícil?",
      "Quem da roda você acha que menos valoriza o que tem?",
      "Quem da roda você acha que mais teria dificuldade de mudar?",
      "Quem da roda você acha que mais evita olhar no espelho metaforicamente?",
      "Quem da roda você acha que mais teria comportamento tóxico num relacionamento?",
      "Quem da roda você acha que mais teria discurso diferente da prática?",
      "Quem da roda você acha que mais tem traço de manipulação?",
      "Quem da roda você acha que mais é difícil de ser verdadeiro?",
      "Quem da roda você acha que mais teria dois lados muito diferentes?",
      "Quem da roda você acha que menos valoriza amizade verdadeira?",
      "Quem da roda você acha que mais confunde intensidade com toxicidade?",
      "Quem da roda você acha que mais teria dificuldade de pedir ajuda?",
      "Quem da roda você acha que mais teria trouble maker dentro de um grupo?",
      "Quem da roda você acha que mais faz barulho por nada e silêncio no que importa?",
      "Quem da roda você acha que mais tem cara de que esconde coisa grave?",
      "Quem da roda você acha que mais justificaria um erro com outra coisa?",
      "Quem da roda você acha que mais teria saído de cena num momento difícil?",
      "Quem da roda você acha que mais tem atitude que não combina com a fala?",
      "Quem da roda você acha que menos enfrenta a si mesmo?",
      "Quem da roda você acha que mais teria feito algo que o grupo reprovaria?",
      "Quem da roda você acha que mais tem coisa escondida que mudaria a percepção do grupo?",
      "Quem da roda você acha que mais tem padrão de comportamento problemático?",
      "Quem da roda você acha que mais teria feito algo para se arrepender profundamente?",
      "Quem da roda você acha que mais tem dificuldade de ser leal de verdade?",
      "Quem da roda você acha que mais causaria conflito sem perceber que está causando?",
      "Quem da roda você acha que mais tem cara de pessoa que some quando o assunto fica sério?",
      "Quem da roda você acha que mais tem dificuldade de admitir que precisa de ajuda?",
      "Quem da roda você acha que mais teria dificuldade de ser honesto sobre si mesmo?",
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
      "Qual a parte do corpo que você mais gosta no parceiro?",
      "Você já ficou com alguém famoso ou influente?",
      "Qual foi o sexting mais ousado que você já fez?",
      "Você prefere mais romance ou mais intensidade na hora H?",
      "Qual foi a situação mais ousada que você já topou?",
      "Você já ficou com alguém que tinha um parceiro?",
      "Qual é o seu fetiche principal que poucos sabem?",
      "Qual foi a fantasia mais louca que você realizou?",
      "Você já foi o pivô de uma separação?",
      "Qual foi a abordagem mais direta que te fizeram ou você fez?",
      "Você já usou desculpa criativa para ficar com alguém?",
      "Qual a posição favorita que você nunca contaria para a família?",
      "Você já fez algo ousado em lugar público?",
      "Quem da roda você acha que tem mais apetite sexual?",
      "Qual foi a mentira mais criativa que você usou para ir a um encontro?",
      "Você já ficou com alguém do sexo que não esperava?",
      "Qual é a parte mais ousada da sua personalidade na cama?",
      "Você já recebeu nudes de alguém surpreendente?",
      "Qual foi a proposta mais ousada que você já recusou?",
      "Você já fingi ter orgasmo?",
      "Qual é o seu limite que você nunca cruzaria na cama?",
      "Você já seduzido alguém para conseguir algo?",
      "Qual foi o momento mais quente que você passou com alguém da roda?",
      "Você prefere iluminar o ambiente ou prefere no escuro?",
      "Qual o recado mais ousado que você já deixou para alguém?",
      "Você já ficou com alguém muito mais velho ou mais novo?",
      "Qual foi a situação mais constrangedora que passou na cama?",
      "Você já ficou com alguém só pela atração física?",
      "Qual é o lugar dos seus sonhos para um encontro proibido?",
      "Você já foi seduzi-do sem perceber?",
      "Qual foi a proposta mais surpreendente que você já recebeu?",
      "Você já trocou mensagens picantes com alguém da roda?",
      "Quem da roda você acha que tem mais desenvoltura na cama?",
      "Você já viveu uma situação de filme adulto?",
      "Qual é a sua fantasia que envolve alguém da roda?",
      "Você já ficou com o ex de um amigo?",
      "Qual foi o roleplay mais criativo que você já fez?",
      "Você prefere quem toma a iniciativa ou quem espera?",
      "Qual foi a provocação mais ousada que você jogou para alguém?",
      "Você já se arrependeu de ter ficado com alguém por ser bom demais?",
      "Qual é o seu maior kink que nunca admitiu abertamente?",
      "Você já ficou com alguém que acabou virando mais do que esperava?",
      "Qual foi a noite que você claramente foi o melhor ou o pior da história da outra pessoa?",
      "Você já terminou um encontro antes do tempo por falta de química?",
      "Quem da roda você mandaria uma mensagem às 2 da manhã na vibe de 'oi, acordado'?",
      "Qual é a coisa mais selvagem que você já fez num encontro?",
      "Você já ficou com alguém na mesma noite em que tinham se conhecido?",
      "Qual foi o pior desempenho que você já teve?",
      "Você já saiu com alguém só para testar se era tão bom quanto diziam?",
      "Qual é a sua zona erógena favorita que você não conta?",
      "Você já enviou uma mensagem picante para a pessoa errada?",
      "Qual é a coisa mais engraçada que aconteceu durante uma intimidade?",
      "Você já ficou com alguém por pura competição ou desafio?",
      "Qual foi a noite mais longa e mais intensa da sua vida?",
      "Você tem alguma regra pessoal sobre o que faria ou não faria?",
      "Quem da roda você acha que levaria a vida amorosa mais intensa?",
      "Você já teve um amigo com benefícios? Como terminou?",
      "Qual foi a experiência mais diferente que você teve por curiosidade?",
      "Você já ficou com alguém que era completamente o oposto de você?",
      "Qual é o maior tabu que você já quebrou na vida íntima?",
      "Você já se apaixonado por alguém que era proibido?",
      "Qual foi a situação mais ousada que você participou em grupo?",
      "Você já foi contatado por alguém da roda de forma inesperada e picante?",
      "Qual é o seu critério mais inusitado para se atrair por alguém?",
      "Você já fez algo íntimo pensando em alguém da roda?",
      "Qual foi a decisão mais impulsiva que você tomou por atração?",
      "Você já criou um alter ego para conquistar alguém?",
      "Qual é a sua confissão mais quente que nunca contou para ninguém aqui?",
      "Quem da roda você levaria para uma noite sem volta e sem explicação?",
      "Qual foi a situação em que você foi mais audacioso em termos de conquista?",
      "Você já se apaixonado por alguém durante um encontro casual?",
      "Qual é a coisa mais louca que você faria por atração física?",
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
      "O que você mudaria na nossa rotina para ser mais especial?",
      "Qual foi a vez que você mais me surpreendeu?",
      "O que você sente quando me vê depois de muito tempo longe?",
      "Qual é a coisa que você nunca se cansa de fazer comigo?",
      "O que te fez perceber que eu era especial para você?",
      "Qual foi o dia mais feliz que passamos juntos?",
      "O que você diria para mim se soubesse que seria a última conversa?",
      "Qual é a coisa mais boba que eu faço e você ama?",
      "O que te deixa mais apaixonado por mim hoje?",
      "Qual é o hábito meu que mais te incomoda mas você suporta por amor?",
      "O que você mais gosta de fazer quando estamos sozinhos?",
      "Qual é a memória nossa que mais te faz sorrir?",
      "O que você gostaria que eu soubesse mas nunca falei?",
      "Qual é a coisa mais inesquecível que já fizemos juntos?",
      "O que você mais sente falta quando estamos separados?",
      "Qual foi a vez que você mais me amou de verdade?",
      "O que você mais admira em mim sem me dizer?",
      "Qual é o plano secreto que você tem para nós?",
      "O que você quer criar de novo juntos?",
      "Qual é a coisa que você faria para me surpreender se pudesse?",
      "O que você acha que eu aprendi com você?",
      "Qual é o nosso maior defeito como casal e como você acha que podemos resolver?",
      "O que você sente quando a gente discute?",
      "Qual é a coisa que me faz único para você?",
      "O que você mais gosta no jeito que nos amamos?",
      "Qual é a sua memória favorita da nossa primeira fase?",
      "O que você mudaria no início da nossa história se pudesse?",
      "Qual é o maior crescimento que você acha que tivemos juntos?",
      "O que você mais teme perder em nós?",
      "Qual é a coisa que você nunca me disse que acha lindo em mim?",
      "O que você faria diferente se tivesse a chance de reconquistar?",
      "Qual é o momento em que você mais precisou de mim e eu estava lá?",
      "O que você diria para o início de nós dois sabendo o que sabe hoje?",
      "Qual é a coisa mais romântica que você já pensou em fazer por mim?",
      "O que você quer que eu saiba sobre como te amo?",
      "Qual é a tradição nossa que mais te faz feliz?",
      "O que você quer construir comigo que ainda não começamos?",
      "Qual é a coisa que você considera que eu trouxe de melhor para a sua vida?",
      "O que você sente quando me vê feliz?",
      "Qual é o sonho que você quer que a gente realize juntos?",
      "O que você mais gosta no jeito que eu te amo?",
      "Qual é a coisa que eu faço que te faz sentir mais amado?",
      "O que você acha que a gente ainda precisa aprender um com o outro?",
      "Qual é a coisa mais corajosa que você já fez por mim?",
      "O que você quer que eu nunca esqueça sobre nós?",
      "Qual é a coisa mais engraçada que aconteceu em nosso relacionamento?",
      "O que você quer melhorar em nós?",
      "Qual é a coisa que você acha que nos une de verdade?",
      "O que você diria para quem duvidou de nós?",
      "Qual é a coisa que mais te surpreende em mim até hoje?",
      "O que você quer fazer na próxima vez que tivermos um dia só nosso?",
      "Qual é a coisa que eu faço que te faz se sentir seguro?",
      "O que você quer que eu saiba sobre o que sinto por você?",
      "Qual foi o momento em que você mais sentiu que daria certo entre nós?",
      "O que te faz ter certeza de que me ama?",
      "Qual é a coisa mais simples que eu faço que te conquista todo dia?",
      "O que você quer experimentar comigo que ainda não tentamos?",
      "Qual é a coisa que você mais aprecia em como nos cuidamos?",
      "O que você sente quando a gente ri junto?",
      "Qual é a parte da nossa história que você mais gosta de contar?",
      "O que você mais gosta de receber de mim?",
      "Qual é o lado meu que você descobriu e te surpreendeu?",
      "O que você mais gosta no modo como eu expresso meu amor?",
      "Qual é a coisa que faz você querer ficar para sempre?",
      "O que você quer criar de especial na nossa história?",
      "Qual é o maior presente que eu já te dei sem ser material?",
      "O que você sente quando pensamos no futuro juntos?",
      "Qual é a coisa que nenhum outro relacionamento te deu que eu dou?",
      "O que você mais gosta de descobrir novo em mim?",
      "Qual é a coisa que faz você ter certeza de que somos certos um para o outro?",
      "O que você quer que eu saiba que você ama em mim mas nunca disse?",
      "Qual é o momento em que você mais sentiu orgulho de mim?",
      "O que você quer que seja a marca da nossa história juntos?",
      "Qual é a coisa mais doce que você já pensou em fazer por mim?",
      "O que te fez escolher ficar mesmo nos momentos difíceis?",
      "Qual é o maior aprendizado que o nosso relacionamento te deu?",
      "O que você quer que a gente proteja de tudo que construímos?",
      "Qual é a coisa que define para você o que é amor de verdade com base em nós?",
      "O que você mais ama no modo como a gente se entende sem precisar falar?",
      "Qual é o sonho que você tem e ainda não me contou?",
      "O que você quer que a gente nunca perca com o tempo?",
      "Qual é a coisa mais preciosa que temos juntos?",
      "O que você me daria de presente se pudesse dar qualquer coisa?",
      "Qual é a coisa que você mais quer me ver realizar na vida?",
      "O que você quer que eu saiba sobre como me ver te faz sentir?",
      "Qual é a coisa mais inesperada que você sentiu por mim?",
      "O que você quer que seja a nossa próxima grande aventura?",
      "Qual é a coisa que te faz olhar para mim diferente, do jeito mais bonito?",
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
      "Se você fosse um tipo de clima, qual seria?",
      "Qual seria o nome do seu cachorro robô?",
      "Se sua vida fosse uma novela, qual seria o capítulo de hoje?",
      "Qual seria seu superpoder que só funciona em situações inúteis?",
      "Se você fosse um aplicativo, qual seria sua função principal?",
      "Qual seria a ementa do restaurante que você abriria com nome absurdo?",
      "Se você fosse um vilão de cartoon, qual seria seu plano?",
      "Qual seria seu discurso de vitória num concurso ridículo?",
      "Se você fosse uma planta, como seria sua personalidade?",
      "Qual seria o nome da sua banda de rock que durou 3 dias?",
      "Se você pudesse inventar um dia feriado, qual seria?",
      "Qual seria o título da sua autobiografia honesta demais?",
      "Se você fosse um personagem de videogame, qual seria a sua habilidade especial?",
      "Qual seria o pior nome que você poderia dar para um pet?",
      "Se você fosse um ingrediente de pizza, qual seria?",
      "Qual seria seu plano de negócio completamente absurdo?",
      "Se você fosse um emoji ainda inexistente, o que representaria?",
      "Qual seria a tagline da sua marca pessoal sem-noção?",
      "Se você fosse um tipo de dança, qual seria e por quê?",
      "Qual seria o enredo do seu livro de ficção científica ruim?",
      "Se você fosse um super-vilão com poderes ridículos, qual seria seu nome?",
      "Qual seria a sua profecia de um oráculo que nunca acerta?",
      "Se você fosse um prato típico de um país imaginário, qual seria?",
      "Qual seria o seu lema de vida se fosse completamente honesto?",
      "Se você fosse contratado para um trabalho impossível, qual seria?",
      "Qual seria o nome da sua linha de produtos sem sentido?",
      "Se você fosse um tipo de música, em qual gênero você se encaixaria?",
      "Qual seria o argumento da sua tese de doutorado absurda?",
      "Se você pudesse criar uma nova lei completamente ridícula, qual seria?",
      "Qual seria sua desculpa mais criativa para não pagar conta?",
      "Se você fosse uma inteligência artificial, qual seria o seu maior bug?",
      "Qual seria o nome do seu documentário sobre sua própria vida?",
      "Se você fosse um planeta do sistema solar, qual seria?",
      "Qual seria o slogan da sua campanha política para presidente da Lua?",
      "Se você fosse um tipo de queijo, qual seria sua personalidade?",
      "Qual seria o roteiro da sua série de terror com 3 temporadas?",
      "Se você fosse um estilo arquitetônico, como seria descrito?",
      "Qual seria a missão impossível que você aceitaria sem pensar?",
      "Se você fosse um fenômeno natural, qual seria e por quê?",
      "Qual seria o nome do seu time de esporte inventado?",
      "Se você fosse um tipo de tempero, qual seria e em qual receita?",
      "Qual seria o manifesto da sua religião inventada?",
      "Se você fosse uma constelação nova, o que representaria?",
      "Qual seria a moeda do seu reino pessoal e qual seria seu valor?",
      "Se você fosse um tipo de terreno, qual seria?",
      "Qual seria o nome do seu alter ego secreto?",
      "Se você fosse um problema matemático, qual seria?",
      "Qual seria a sua resposta para uma pergunta filosófica sem sentido?",
      "Se você fosse um tipo de chuva, qual seria?",
      "Qual seria a propaganda do produto mais inútil que você inventaria?",
      "Se você fosse um estilo de decoração, como seria a sala da sua vida?",
      "Qual seria o nome do seu laboratório secreto de experimentos absurdos?",
      "Se você fosse uma figura histórica em situação moderna, quem seria e o que faria?",
      "Qual seria o seu apelido de superespião?",
      "Se você fosse uma cerimônia de premiação, quem você premiaria?",
      "Qual seria o roteiro da sua peça de teatro experimental sem sentido?",
      "Se você fosse um universo paralelo de si mesmo, qual diferença teria?",
      "Qual seria o nome do seu time de esportistas de sofá?",
      "Se você fosse um tipo de silêncio, como seria descrito?",
      "Qual seria o seu superpoder de persuasão completamente inútil?",
      "Se você fosse um instrumento musical, qual seria?",
      "Qual seria o título do seu álbum de músicas sobre sua rotina?",
      "Se você fosse um tipo de café, como seria servido?",
      "Qual seria o seu plano para dominar o mundo usando apenas itens de escritório?",
      "Se você fosse um tipo de nuvem, o que pensaria enquanto flutua?",
      "Qual seria a sua habilidade ninja completamente inútil?",
      "Se você fosse um tipo de erro de ortografia, qual seria?",
      "Qual seria o nome da sua academia de treinamentos absurdos?",
      "Se você fosse um inventor maluco, qual seria sua invenção mais perigosa?",
      "Qual seria a sua estratégia de negociação com aliens?",
      "Se você fosse um tipo de barulho, qual seria?",
      "Qual seria o enredo da soap opera sobre sua vida?",
      "Se você fosse um dado de RPG, qual seria o número que sempre tiraria?",
      "Qual seria o seu guia de sobrevivência no apocalipse mais inútil?",
      "Se você fosse um efeito especial de cinema, qual seria?",
      "Qual seria o nome do seu aplicativo de tecnologia completamente desnecessário?",
      "Se você fosse um tipo de tráfego na internet, qual seria?",
      "Qual seria a sua receita de bolo para momento de crise existencial?",
      "Se você fosse um meme que ainda não foi criado, qual seria?",
      "Qual seria o seu método secreto de procrastinação científica?",
      "Se você fosse um erro 404, o que sua página diria?",
      "Qual seria a missão da sua ONG absurda?",
      "Se você fosse um tipo de ruído de fundo, em qual cena de filme você apareceria?",
      "Qual seria o seu depoimento no tribunal do bom senso?",
      "Se você fosse uma versão alternativa de si mesmo num universo de comédia, o que faria diferente?",
      "Qual seria o seu plano B caso o plano A fosse completamente um fracasso glorioso?",
      "Se você fosse um troféu, por qual conquista você seria dado?",
      "Qual seria a sua entrada triunfal numa festa a fantasia que ninguém entenderia?",
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
      "Imite o andar de um pinguim.",
      "Diga o alfabeto ao contrário o mais rápido que conseguir.",
      "Faça a expressão de quem acabou de provar algo horrível.",
      "Invente um apelido para alguém da roda agora.",
      "Fale apenas sussurrando por 1 minuto.",
      "Imite um personagem de desenho sem falar o nome.",
      "Faça uma flexão ou tente por 10 segundos.",
      "Cante parabéns para alguém inventando um motivo.",
      "Imite um apresentador de telejornal lendo uma notícia absurda.",
      "Faça a pose de estátua por 15 segundos.",
      "Diga três palavras que começam com a mesma letra em 5 segundos.",
      "Imite alguém da roda sem falar o nome — o grupo tenta adivinhar.",
      "Fale como se fosse um comercial de televisão dos anos 90.",
      "Faça o som de três animais diferentes em sequência.",
      "Use apenas mímica para explicar sua profissão ou hobby.",
      "Aja como se fosse uma pessoa bem animada recebendo notícia ruim.",
      "Fale sobre o tempo como se fosse o apresentador mais dramático do mundo.",
      "Invente um aperto de mão especial com alguém da roda agora.",
      "Fale cinco coisas positivas sobre você em 10 segundos.",
      "Imite uma câmera lenta nas próximas duas ações que fizer.",
      "Crie um trocadilho horrível usando os nomes dos jogadores.",
      "Faça sua melhor imitação de alguém chorando de alegria.",
      "Fale com sotaque nordestino por 1 minuto.",
      "Diga um trabalho-língua (trava-língua) três vezes rápido.",
      "Imite um robô tentando dançar funk.",
      "Faça expressão de satisfação total ao comer algo imaginário.",
      "Fale como se você fosse o protagonista de um comercial de shampoo.",
      "Invente um verso de rap sobre alguém da roda em 20 segundos.",
      "Aja como um ator dramático de telenovela por 30 segundos.",
      "Imite como seria um gato dando palestra.",
      "Faça o som de uma porta enferrujada com a voz.",
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
      "Ligue para alguém e diga 'eu precisava te contar uma coisa' e depois desligue.",
      "Fale por 30 segundos sem parar sobre o tema que o grupo escolher.",
      "Imite um youtuber famoso fazendo intro de vídeo.",
      "Conte uma história em que você foi o herói — mas exagerando demais.",
      "Fique 2 minutos sem falar e responda tudo apenas por gestos.",
      "Faça a melhor cena de choro de novela possível por 15 segundos.",
      "Conte um segredo que não é tão pesado mas nunca contou aqui.",
      "Faça uma propaganda de você mesmo como se fosse produto à venda.",
      "Imite como você agiria num encontro às cegas muito ruim.",
      "Fale a última coisa que pesquisou no celular sem mentir.",
      "Mande áudio para alguém do contato dizendo 'oi saudade'.",
      "Leia a última mensagem do WhatsApp em voz alta.",
      "Imite como você seria como professor de uma matéria que odeia.",
      "Faça o discurso que você daria ao receber o Oscar de melhor ator da sua própria vida.",
      "Fale como se estivesse me entrevistando para o emprego mais absurdo.",
      "Aja como se você fosse um personagem de filme de ação por 20 segundos.",
      "Conte a história da pior decisão que tomou exagerando os detalhes.",
      "Faça uma propaganda de um produto usando alguém da roda como modelo.",
      "Imite como seria você se fosse do século XIX.",
      "Fale por 1 minuto usando apenas palavras positivas.",
      "Conte um pesadelo recente como se fosse uma obra prima de suspense.",
      "Faça sua entrada de herói de filme de ação sem contexto.",
      "Escreva no ar com o dedo uma mensagem enquanto o grupo tenta adivinhar.",
      "Imite um detetive interrogando alguém da roda por um crime ridículo.",
      "Fale como se fosse um comentarista esportivo narrando algo do cotidiano.",
      "Dê um discurso motivacional de 30 segundos sobre algo completamente trivial.",
      "Imite como seria você com 80 anos tentando explicar o TikTok.",
      "Faça uma entrevista de emprego para o cargo de 'campeão do grupo'.",
      "Aja como se você fosse o protagonista de um comercial de cerveja.",
      "Conte uma mentira convincente sobre sua história de vida — o grupo decide se acredita.",
      "Imite como seria você acordando num universo alternativo onde todos são ao contrário.",
      "Fale sobre sua semana como se fosse notícia de jornal de grande impacto.",
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
      "Mostre o histórico de pesquisa do celular para o grupo.",
      "Leia a última mensagem que você enviou em voz alta.",
      "Deixe alguém da roda checar suas últimas fotos sem filtrar.",
      "Fique de olhos fechados enquanto o grupo decide seu próximo desafio.",
      "Fale uma coisa que você pensa mas nunca diz sobre alguém da roda.",
      "Conte a situação mais constrangedora que você já viveu em detalhes.",
      "Ligue para alguém fora da roda ao vivo e explique por que você pensa nela.",
      "Peça algo ao grupo usando apenas onomatopeias por 1 minuto.",
      "Deixe o grupo te dar um apelido que você usará pelo resto da noite.",
      "Conte sua maior derrota amorosa sem poupar detalhes.",
      "Fique 3 minutos fazendo tudo que o grupo mandar.",
      "Imite alguém da roda de forma tão fiel que eles reconheçam.",
      "Mostre a última conversa que teve com alguém romântico.",
      "Confesse algo que nunca contou para ninguém da roda.",
      "Fale o que realmente pensa de cada pessoa da roda em 10 segundos por pessoa.",
      "Escolha o jogador que mais te incomoda e diga por quê na cara dura.",
      "Faça uma ligação ao vivo e diga 'estava pensando em você' sem rir.",
      "Conte um segredo sobre seu passado que a maioria do grupo não sabe.",
      "Fique 5 minutos sem usar o celular nem olhar para ele.",
      "Responda com total honestidade à pergunta que o grupo fizer.",
      "Deixe alguém da roda escolher um contato para você mandar áudio agora.",
      "Fale sobre a situação mais ridícula que você já viveu por amor.",
      "Confesse qual jogador da roda você já julgou injustamente.",
      "Deixe o grupo criar uma situação para você atuar — sem recusar.",
      "Fique 2 rodadas servindo o grupo no que pedirem dentro do razoável.",
      "Revele qual é o segredo que mais te pesa carregar.",
      "Fale com honestidade quem você acha que menos merece estar na roda.",
      "Deixe o grupo decidir sua penalidade se você se recusar ao desafio principal.",
      "Conte uma história que te envergonha e que você nunca contou aqui.",
      "Fique 30 segundos sendo interrogado pelo grupo sem poder desviar.",
      "Mostre o contato que você mais evita responder e explique o porquê.",
      "Admita qual é a maior fraqueza que você esconde de todo mundo.",
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
      "Fale algo pesado que pensa sobre alguém da roda sem esconder.",
      "Deixe o grupo te fazer três perguntas que você deve responder com total honestidade.",
      "Conte algo que fez que o grupo provavelmente reprovaria.",
      "Mostre os últimos 10 contatos ligados e explique o contexto de cada um.",
      "Fique 5 minutos sendo julgado pelo grupo sobre uma decisão real da sua vida.",
      "Confesse qual é o seu maior segredo atual sem omitir detalhes.",
      "Deixe alguém da roda postar algo no seu story (dentro do razoável).",
      "Diga o nome de alguém que você magoou e não pediu desculpa.",
      "Fale o que realmente pensa do parceiro ou ex de alguém da roda.",
      "Admita qual é o maior arrependimento da sua vida até hoje.",
      "Deixe o grupo criar uma penitência para você executar agora.",
      "Conte o episódio mais pesado da sua vida amorosa sem romantizar.",
      "Fale quem da roda você menos chamaria em uma emergência real.",
      "Admita uma inveja que você tem de alguém da roda.",
      "Conte algo que fez por impulso e que te deixa constrangido até hoje.",
      "Deixe o grupo decidir a quem você precisa pedir desculpas agora mesmo.",
      "Fale a verdade sobre o que pensa da amizade com cada pessoa da roda.",
      "Confesse qual jogador da roda você já comentou negativamente com outra pessoa.",
      "Revele qual é o maior julgamento que você faz de alguém silenciosamente.",
      "Mostre a última foto que você curtiu nas redes sociais sem contexto.",
      "Admita o que você faria se soubesse que não haveria consequência.",
      "Deixe o grupo escolher uma frase que você deve mandar para alguém agora.",
      "Fale a coisa mais pesada que você já pensou sobre uma pessoa aqui.",
      "Conte a situação de que mais se envergonha e que nunca comentou com o grupo.",
      "Admita qual é o limite que você já cruzou e não devia ter cruzado.",
      "Deixe o grupo montar um desafio pesado — você tem que cumprir ou perde 3 vidas.",
      "Fale quem da roda você acha que mais esconde a verdade do próprio passado.",
      "Confesse algo que você fez que foi completamente antiético.",
      "Admita quem da roda mais te incomoda profundamente e por quê.",
      "Conte o maior erro que você cometeu num relacionamento honestamente.",
      "Deixe o grupo fazer três afirmações sobre você — concorde ou discorde explicando.",
      "Fale sem rodeios qual é a sua maior red flag que você ainda não resolveu.",
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
      "Descreva a pessoa mais atraente da roda sem citar o nome — o grupo tenta adivinhar.",
      "Conte com detalhes a situação mais quente que você já viveu.",
      "Faça uma canetada para alguém fora da roda ao vivo.",
      "Diga o que você faria em 24 horas com alguém da roda se ninguém soubesse.",
      "Imite como você age quando está tentando conquistar alguém.",
      "Fale a sua fantasia mais ousada sem esconder nada.",
      "Deixe o grupo escolher quem vai ficar sentado do seu lado pelo resto da noite.",
      "Conte a situação mais constrangedora que você já viveu na cama.",
      "Imite alguém sendo flagrado em algo proibido.",
      "Fale qual é o seu maior fetiche sem rodeios.",
      "Mande áudio para alguém dizendo que está pensando nela agora — ao vivo.",
      "Mostre o perfil da última pessoa que você stalkeou nas redes.",
      "Faça sua melhor cena de filme adulto usando apenas voz e expressão.",
      "Deixe alguém da roda adivinhar sua fantasia não realizada pela mímica.",
      "Conte a história da noite mais louca da sua vida em detalhes.",
      "Diga qual pessoa da roda você chamaria para um rolê a dois às 2 da manhã.",
      "Imite como você se comporta na primeira transa com alguém novo.",
      "Fale os três requisitos principais que alguém precisa ter para você se interessar na cama.",
      "Descreva o encontro perfeito para você em termos físicos e de conexão.",
      "Faça uma proposta ousada para alguém da roda fingindo que é real.",
      "Conte qual foi a situação mais ousada que você já topou por atração.",
      "Diga quem da roda você acha que tem mais desenvoltura — e explique por quê.",
      "Imite como você pediria para ficar com alguém da roda agora.",
      "Fale o que você faria se tivesse uma noite livre com quem quisesse da roda.",
      "Conte a situação mais embaraçosa que aconteceu antes, durante ou depois de um encontro.",
      "Deixe o grupo decidir quem da roda você precisa elogiar fisicamente agora.",
      "Revele qual é o seu maior tabu que você já quebrou.",
      "Diga o que você pensa quando vê a pessoa mais atraente da roda — sem censura.",
    ],
    casal: [
      "Faça um elogio sincero.",
      "Faça uma declaração dramática.",
      "Dê um apelido novo.",
      "Conte uma memória boa.",
      "Faça uma promessa engraçada.",
      "Diga uma verdade que nunca falou.",
      "Crie um plano de encontro em 30 segundos.",
      "Segure a mão da pessoa e diga algo que você não dizia há muito tempo.",
      "Escreva numa folha (ou no ar) o que você mais ama na pessoa.",
      "Recrie o momento em que você percebeu que estava apaixonado.",
      "Diga três coisas que você nunca disse em voz alta sobre sua parceria.",
      "Faça uma declaração de amor usando apenas emojis gestuais.",
      "Reconte como vocês se conheceram exagerando nos detalhes dramáticos.",
      "Crie uma música de 10 segundos sobre algo que ama na pessoa.",
      "Escreva um bilhete de amor com menos de 10 palavras agora.",
      "Faça uma promessa séria para o próximo mês.",
      "Conte um plano secreto que você tem para surpreender a pessoa.",
      "Faça uma declaração pública que você nunca tinha feito.",
      "Imite como a pessoa fica quando está feliz — carinhosamente.",
      "Crie um ritual novo para vocês dois a partir de hoje.",
      "Diga qual hábito da pessoa te conquista todo dia silenciosamente.",
      "Faça uma lista oral das cinco melhores coisas dela em 30 segundos.",
      "Revele algo que você pensa ao olhar para a pessoa que nunca disse.",
      "Crie uma memória nova agora — façam algo pequeno e especial juntos.",
      "Diga qual foi o momento em que mais sentiu orgulho da pessoa.",
      "Imite como seria vocês dois daqui a 40 anos discutindo sobre algo trivial.",
      "Faça uma proposta de encontro absurdo mas que você gostaria de fazer de verdade.",
      "Diga o que você mudaria no início para ter chegado aqui mais rápido.",
      "Faça uma homenagem de 30 segundos ao relacionamento de vocês.",
      "Revele um presente simbólico que você daria se pudesse agora.",
      "Diga qual é a coisa da pessoa que mais te faz querer ficar para sempre.",
      "Crie uma promessa engraçada mas que você vai cumprir de verdade.",
      "Conte qual é a memória mais engraçada que vocês têm juntos.",
      "Faça uma cena dramática de novela baseada num episódio real de vocês.",
      "Revele qual é o próximo passo que você quer dar juntos.",
      "Diga o que você sente mas raramente expressa em palavras.",
      "Imite como você age quando fica com ciúme — honestamente.",
      "Faça uma declaração de amor no estilo de carta antiga de época.",
      "Crie em 30 segundos uma tradição nova que seria de vocês dois.",
      "Diga o que você quer que a pessoa saiba que você nunca disse em voz alta.",
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
      "Invente um produto revolucionário usando objetos da sala.",
      "Faça a cena de abertura do seu próprio filme.",
      "Imite um documentário sobre você mesmo em terceira pessoa.",
      "Crie o slogan da marca pessoal mais sem-noção possível.",
      "Faça uma entrevista de emprego para o cargo de 'melhor jogador da roda'.",
      "Invente uma profissão que não existe mas deveria.",
      "Narre as últimas 5 horas da sua vida como se fossem um épico de aventura.",
      "Crie um personagem fictício baseado em alguém da roda sem citar o nome.",
      "Faça um discurso de vitória para uma conquista completamente irrelevante.",
      "Invente uma lei absurda que você aplicaria se fosse presidente.",
      "Imite um influencer digital fazendo um review do evento de agora.",
      "Crie a cena final do filme sobre sua vida.",
      "Invente um super poder ridículo e explique como mudaria o mundo.",
      "Faça o trailer de uma série baseada em alguém da roda.",
      "Crie um personagem de videogame baseado em você com habilidades reais.",
      "Invente uma religião com três mandamentos absurdos.",
      "Faça uma propaganda de cerveja usando alguém da roda como protagonista.",
      "Narre uma batalha épica entre duas pessoas da roda por um motivo ridículo.",
      "Imite um robo mal configurado tentando ser humano numa festa.",
      "Invente o nome e a ementa de um restaurante que nunca daria certo.",
      "Crie um jingle de 10 segundos para um produto imaginário.",
      "Faça a abertura do seu programa de televisão que nunca foi ao ar.",
      "Invente o enredo de uma trilogia de filmes sobre sua rotina.",
      "Faça um discurso como o vilão de um filme de ação.",
      "Imite um jornalista ao vivo cobrindo algo completamente banal como se fosse urgente.",
      "Crie um personagem de anime baseado em alguém da roda.",
      "Invente uma conspiração ridícula e defenda com total seriedade.",
      "Faça o pitch de um aplicativo completamente inútil para investidores.",
      "Narre como seria o capítulo final da novela da sua vida.",
      "Crie um trocadilho usando os nomes de todos da roda.",
      "Invente uma tradição cultural de um país imaginário.",
      "Faça a cena mais épica possível usando apenas objetos da mesa.",
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
    customModeEnabled: false,
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
    syncDifficultyPicker();
    // Show/hide timer config based on mode
    const timerConfig = document.getElementById("timerConfig");
    if (timerConfig) timerConfig.hidden = state.roundMode !== "tempo";
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
    if (isWheelOn("questions")) els.roundResultGrid.appendChild(roundItemEl("Pergunta", state.roundResult.question || "—"));
    if (isWheelOn("challenges")) els.roundResultGrid.appendChild(roundItemEl("Desafio", state.roundResult.challenge || "—"));
    if (isWheelOn("time")) els.roundResultGrid.appendChild(roundItemEl("Tempo", state.roundResult.time || "—"));
    if (isWheelOn("percent")) els.roundResultGrid.appendChild(roundItemEl("Porcentagem", state.roundResult.percent || "—"));
    if (isWheelOn("number")) els.roundResultGrid.appendChild(roundItemEl("Número", state.roundResult.number || "—"));
    if (isWheelOn("penalty")) els.roundResultGrid.appendChild(roundItemEl("Penalidade", state.roundResult.penalty || "—"));
    if (isWheelOn("bonus")) els.roundResultGrid.appendChild(roundItemEl("Bônus", state.roundResult.bonus || "—"));
    if (isWheelOn("custom")) els.roundResultGrid.appendChild(roundItemEl("Personalizada", state.roundResult.custom || "—"));
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
    const modeQ = QUESTIONS[state.roundMode] || [];
    if (!state.customModeEnabled || !state.customWheelItems.length) {
      return modeQ.length ? pickFrom(modeQ) : null;
    }
    const combined = [...modeQ, ...state.customWheelItems.filter(Boolean)];
    return combined.length ? pickFrom(combined) : null;
  }

  function pickChallengeForMode() {
    const modeList = CHALLENGES_BY_MODE[state.roundMode];
    const base = modeList && modeList.length ? modeList : state.challenges;
    if (!state.customModeEnabled || !state.challenges.length) {
      return base.length ? pickFrom(base) : null;
    }
    const uniqueCustom = state.challenges.filter(c => !base.includes(c));
    const combined = [...base, ...uniqueCustom];
    return combined.length ? pickFrom(combined) : null;
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
    const colors = ["#ff3df2","#22e6ff","#ff6b35","#4ade80","#f59e0b","#a855f7","#fb4d89","#ffb703","#ffffff","#60a5fa"];

    // Burst from center + rain from top
    const burstX = cvs.width / 2, burstY = cvs.height * 0.45;
    const particles = Array.from({ length: 220 }, (_, i) => {
      const isBurst = i < 80;
      const angle = isBurst ? (Math.random() * Math.PI * 2) : 0;
      const speed = isBurst ? (4 + Math.random() * 10) : 0;
      return {
        x: isBurst ? burstX : Math.random() * cvs.width,
        y: isBurst ? burstY : -10 - Math.random() * 200,
        vx: isBurst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 5,
        vy: isBurst ? Math.sin(angle) * speed : 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: 6 + Math.random() * 10,
        h: 3 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.22,
        shape: Math.random() > 0.6 ? "circle" : "rect",
        alpha: 1,
      };
    });

    let raf;
    const deadline = nowMs() + 7000;
    const tick = () => {
      c.clearRect(0, 0, cvs.width, cvs.height);
      const alive = particles.filter(p => p.y < cvs.height + 40 && p.alpha > 0.05);
      alive.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.055; p.rot += p.rotV;
        p.vx *= 0.998;
        if (p.y > cvs.height * 0.7) p.alpha = Math.max(0.05, p.alpha - 0.008);
        c.save(); c.globalAlpha = p.alpha;
        c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = p.color;
        if (p.shape === "circle") {
          c.beginPath(); c.arc(0, 0, p.w / 2, 0, Math.PI * 2); c.fill();
        } else {
          c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
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
    els.victoryOverlay.classList.remove("victoryOverlay--show");
    void els.victoryOverlay.offsetWidth;
    els.victoryOverlay.classList.add("victoryOverlay--show");
    launchConfetti();
    playSound("win");
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
    const show = state.customModeEnabled;
    els.customEditorPanel.hidden = !show;
    if (show) els.customEditorPanel.open = true;
  }

  function syncDifficultyPicker() {
    document.querySelectorAll(".diffBtn").forEach(btn => {
      btn.classList.toggle("diffBtn--active", btn.dataset.difficulty === state.roundMode);
    });
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
      const t0 = ctx.currentTime;

      const note = (freq, startT, dur, gainPeak = 0.15, oscType = "sine") => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startT);
        g.gain.setValueAtTime(0.0001, startT);
        g.gain.exponentialRampToValueAtTime(gainPeak, startT + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(startT);
        osc.stop(startT + dur + 0.05);
        return osc;
      };

      if (type === "spin") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.3);
        osc.frequency.exponentialRampToValueAtTime(280, t0 + 0.65);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.75);
        osc.onended = () => ctx.close().catch(() => {});
      } else if (type === "result") {
        note(740, t0, 0.18, 0.12, "triangle");
        note(520, t0 + 0.08, 0.15, 0.08, "triangle");
        setTimeout(() => ctx.close().catch(() => {}), 400);
      } else if (type === "eliminate") {
        note(300, t0, 0.1, 0.18, "sawtooth");
        note(200, t0 + 0.1, 0.2, 0.12, "sawtooth");
        note(120, t0 + 0.28, 0.4, 0.08, "sine");
        setTimeout(() => ctx.close().catch(() => {}), 900);
      } else if (type === "win") {
        // Fanfare
        const fanfare = [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32], [784, 0.5], [1047, 0.62]];
        fanfare.forEach(([freq, dt]) => note(freq, t0 + dt, 0.22, 0.13, "triangle"));
        setTimeout(() => ctx.close().catch(() => {}), 1200);
      } else if (type === "click") {
        note(880, t0, 0.06, 0.06, "sine");
        setTimeout(() => ctx.close().catch(() => {}), 200);
      }
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

    playSound(eliminated ? "eliminate" : "result");
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
        if (mode === "proibidona") {
          showScreen("wheel");
          showModal18(state.roundMode);
        } else {
          showScreen("wheel");
          setRoundMode(mode);
        }
      });
    });

    // Difficulty picker buttons
    document.querySelectorAll(".diffBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.difficulty || "normal";
        if (mode === "proibidona") {
          showModal18(state.roundMode);
        } else {
          setRoundMode(mode);
        }
      });
    });

    // Personalizado toggle
    const customToggleBtn = document.getElementById("customModeToggleBtn");
    customToggleBtn?.addEventListener("click", () => {
      state.customModeEnabled = !state.customModeEnabled;
      customToggleBtn.setAttribute("aria-pressed", state.customModeEnabled ? "true" : "false");
      customToggleBtn.classList.toggle("toggle--on", state.customModeEnabled);
      state.activeWheels.custom = state.customModeEnabled;
      if (els.wheelCustom) els.wheelCustom.checked = state.customModeEnabled;
      syncCustomEditorVisibility();
      syncConfigDisabled();
      renderRoundResult();
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
