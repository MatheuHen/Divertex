/**
 * error-guard.js — Rede de segurança global de erros do Divertex.
 *
 * Carregado ANTES dos outros módulos. Garante que nenhuma falha inesperada
 * deixe a tela travada ou mostre uma mensagem técnica crua: registra o erro no
 * console (para depuração) e mostra um toast amigável, com limite para não
 * spammar. Erros benignos conhecidos (ResizeObserver, extensões) são ignorados.
 */

// Toast global reutilizável — cria o container se ainda não existir.
function divertexToast(message, type = 'info') {
  try {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.className = 'toast-container';
      c.setAttribute('aria-live', 'polite');
      document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = message;
    c.appendChild(t);
    requestAnimationFrame(() => t.classList.add('toast--show'));
    setTimeout(() => { t.classList.remove('toast--show'); setTimeout(() => t.remove(), 300); }, 3200);
  } catch { /* nunca deixa o próprio toast quebrar algo */ }
}
window.DivertexToast = divertexToast;

// Mensagens benignas que não devem incomodar o usuário.
const IGNORE = [
  'ResizeObserver loop',
  'Script error.',
  'Non-Error promise rejection',
  'ResizeObserver loop completed',
];

let _lastToast = 0;
function _maybeToast(rawMsg) {
  const msg = String(rawMsg || '');
  if (IGNORE.some(s => msg.includes(s))) return;
  const now = Date.now();
  if (now - _lastToast < 6000) return; // no máx. 1 aviso a cada 6s
  _lastToast = now;
  // Mensagem clara, nunca o texto técnico cru.
  const friendly = /network|fetch|timeout|conexã|conexao|offline/i.test(msg)
    ? 'Sem conexão. Verifique sua internet e tente novamente.'
    : 'Algo deu errado. Se persistir, recarregue a página.';
  divertexToast(friendly, 'error');
}

window.addEventListener('error', (e) => {
  if (e?.message) { console.warn('[Divertex] erro global:', e.message); _maybeToast(e.message); }
}, { passive: true });

window.addEventListener('unhandledrejection', (e) => {
  const reason = e?.reason;
  const msg = reason?.message || reason?.error_description || reason;
  console.warn('[Divertex] promessa rejeitada sem tratamento:', msg);
  _maybeToast(msg);
}, { passive: true });
