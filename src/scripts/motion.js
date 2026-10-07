// Motion do site: GSAP + ScrollTrigger + Lenis (rolagem suave).
// Tudo respeita prefers-reduced-motion: com ele ativo, o conteúdo aparece sem animação.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (reduced) document.documentElement.classList.add('reduced');

/* ---------- Rolagem suave + âncoras ---------- */
let lenis = null;
let hscroll = null; // preenchido quando a rolagem horizontal de Soluções está ativa (desktop)
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
// Um módulo dentro da faixa horizontal não tem posição vertical própria:
// calcula o ponto da rolagem em que a faixa o traz para a tela.
function hscrollY(target) {
  if (!hscroll || !hscroll.track.contains(target)) return null;
  const { st, track, dist } = hscroll;
  const left = target.getBoundingClientRect().left - track.getBoundingClientRect().left;
  const d = dist();
  const p = d ? Math.min(1, Math.max(0, (left - window.innerWidth * 0.06) / d)) : 0;
  return st.start + p * (st.end - st.start);
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#topo' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const y = hscrollY(target);
    if (y !== null) lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y });
    else if (lenis) lenis.scrollTo(target, { offset: id === '#topo' ? 0 : -72 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    // "Pular para o conteúdo" também leva o foco do teclado
    if (a.classList.contains('skip')) target.focus({ preventScroll: true });
  });
});

/* ---------- Hub do Hero: cada módulo acende a ligação e mostra o que é ---------- */
const caption = $('[data-hub-caption]');
$$('[data-node-link]').forEach((n) => {
  const link = $(`[data-link="${n.dataset.nodeLink}"]`);
  const on = () => {
    link?.classList.add('is-on');
    if (caption) {
      $('strong', caption).textContent = n.dataset.nome;
      $('span', caption).textContent = n.dataset.tag;
      caption.classList.add('is-on');
    }
  };
  const off = () => { link?.classList.remove('is-on'); caption?.classList.remove('is-on'); };
  n.addEventListener('pointerenter', on);
  n.addEventListener('pointerleave', off);
  n.addEventListener('focus', on);
  n.addEventListener('blur', off);
});

/* ---------- Header ---------- */
const header = $('[data-header]');
let lastY = 0;
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-solid', y > 40);
  header.classList.toggle('is-hidden', y > 600 && y > lastY && !header.classList.contains('menu-open'));
  lastY = y;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = $('[data-burger]');
const menu = $('[data-mobile-menu]');
const scrim = $('[data-scrim]');
function closeMenu() {
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Abrir menu');
  menu.hidden = true;
  if (scrim) scrim.hidden = true;
  document.documentElement.classList.remove('menu-lock');
  lenis?.start();
  header.classList.remove('menu-open', 'is-solid-force');
}
burger?.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  if (!open) { closeMenu(); return; }
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Fechar menu');
  menu.hidden = false;
  if (scrim) scrim.hidden = false;
  // a página atrás do menu não rola
  document.documentElement.classList.add('menu-lock');
  lenis?.stop();
  header.classList.add('menu-open', 'is-solid');
  $('a', menu)?.focus();
});
scrim?.addEventListener('click', closeMenu);
// Esc fecha o menu e devolve o foco ao botão
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    burger.focus();
  }
});

/* ---------- Formulário ---------- */
const form = $('[data-form]');
// Mensagem de erro de cada campo obrigatório (vazia = campo ok)
const erroDe = (f) => {
  const v = f.value.trim();
  if (f.name === 'nome' && !v) return 'Informe seu nome.';
  if (f.name === 'email' && !v) return 'Informe seu e-mail.';
  if (f.name === 'email' && !/^\S+@\S+\.\S+$/.test(v)) return 'Confira o e-mail. Ele precisa ter o formato nome@empresa.com.br.';
  return '';
};
const marcarCampo = (f) => {
  const msg = erroDe(f);
  const err = $('[data-err]', f.closest('.field'));
  f.closest('.field').classList.toggle('is-error', !!msg);
  f.setAttribute('aria-invalid', String(!!msg));
  if (msg) f.setAttribute('aria-describedby', err.id); else f.removeAttribute('aria-describedby');
  err.textContent = msg;
  return !msg;
};
// depois de um erro, o campo volta a ficar ok assim que a pessoa corrige
$$('[required]', form || document).forEach((f) => f.addEventListener('input', () => {
  if (f.getAttribute('aria-invalid') === 'true') marcarCampo(f);
}));
// Rascunho: o que a pessoa digitou sobrevive a um recarregamento da página (fica só nesta aba)
const RASCUNHO = 's4hub-contato';
const camposRascunho = form ? $$('input:not([name="site"]):not([type="hidden"]), textarea', form) : [];
const salvarRascunho = () => {
  try { sessionStorage.setItem(RASCUNHO, JSON.stringify(Object.fromEntries(camposRascunho.map((f) => [f.name, f.value])))); } catch {}
};
try {
  const salvo = JSON.parse(sessionStorage.getItem(RASCUNHO) || 'null');
  if (salvo) camposRascunho.forEach((f) => { if (salvo[f.name]) f.value = salvo[f.name]; });
} catch {}
camposRascunho.forEach((f) => f.addEventListener('input', salvarRascunho));

// tecla "Próximo" do teclado (Enter num campo de uma linha): vai para o campo seguinte em vez de enviar
camposRascunho.forEach((f, i) => {
  if (f.tagName !== 'INPUT') return;
  f.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    camposRascunho[i + 1]?.focus();
  });
});

const done = $('[data-form-done]');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = $('[data-form-status]', form);
  const btn = $('[data-submit]', form);
  status.classList.remove('is-error');
  const invalidos = $$('[required]', form).filter((f) => !marcarCampo(f));
  if (invalidos.length) {
    status.textContent = 'Corrija os campos indicados para enviar.';
    invalidos[0].focus();
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  status.textContent = '';
  // sem resposta em 15s, desiste: "Enviando..." nunca fica travado para sempre
  const ctrl = new AbortController();
  const limite = setTimeout(() => ctrl.abort(), 15000);
  // tempo desde que a página abriu: o servidor descarta envios rápidos demais (robôs)
  form.elements.decorrido.value = Math.round(performance.now());
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: ctrl.signal });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) throw Object.assign(new Error('limite'), { name: 'Limite' });
    if (!res.ok || !data.ok) throw new Error(data.erro || 'falha');
    // sucesso: o formulário dá lugar à confirmação (sem chance de envio duplicado)
    form.reset();
    try { sessionStorage.removeItem(RASCUNHO); } catch {}
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(done, { offset: -160 });
    else done.scrollIntoView({ block: 'center' });
    btn.textContent = btn.dataset.texto; // texto original do botão (vem do painel)
  } catch (err) {
    // falha: os dados continuam no formulário e o botão vira "Tentar de novo"
    status.classList.add('is-error');
    status.textContent = err.name === 'AbortError'
      ? 'O envio demorou demais. Confira sua conexão e tente de novo. Seus dados continuam aqui.'
      : err.name === 'Limite'
        ? 'Recebemos vários envios seguidos daqui. Aguarde alguns minutos e tente de novo. Seus dados continuam aqui.'
        : 'Não foi possível enviar agora. Seus dados continuam aqui. Tente de novo em instantes.';
    btn.textContent = 'Tentar de novo';
  } finally {
    clearTimeout(limite);
    btn.disabled = false;
  }
});
$('[data-form-again]')?.addEventListener('click', () => {
  done.hidden = true;
  form.hidden = false;
  $('#nome', form).focus();
});

if (reduced) {
  // sem animações: mostra estado final de tudo
  $$('[data-scrub-text] .w').forEach((w) => w.classList.add('on'));
  $$('[data-step]').forEach((s) => s.classList.add('is-on'));
} else {
  initMotion();
}

function initMotion() {
  /* ---------- Hero: entrada ---------- */
  const heroLines = $$('[data-split-hero] .line > span');
  const nodes = $$('[data-node]');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(heroLines, { yPercent: 110, duration: 1.4, stagger: 0.09 }, 0.15)
    .from('[data-hero-fade]', { opacity: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.55)
    .from('.hub__core, .hub__label', { scale: 0.6, opacity: 0, svgOrigin: '300 300', duration: 1.2 }, 0.3)
    .from('.hub .link', { attr: { x2: 300, y2: 300 }, duration: 1.4, stagger: 0.08 }, 0.5)
    .from(nodes, { opacity: 0, scale: 0.4, duration: 1.1, stagger: 0.08 }, 0.7)
    .from('.hub__orbits circle', { opacity: 0, scale: 0.7, svgOrigin: '300 300', duration: 1.6, stagger: 0.1 }, 0.2);

  // hub vivo: órbitas lentas, pulsos do centro aos módulos (explicam o hub) e anéis espaçados.
  // Os módulos ficam parados: são links, e alvo de clique não pode se mexer.
  const loops = [
    gsap.to('.orbit', { rotation: 360, svgOrigin: '300 300', duration: 80, repeat: -1, ease: 'none' }),
    gsap.to('.orbit--b', { rotation: -360, svgOrigin: '300 300', duration: 120, repeat: -1, ease: 'none' }),
  ];
  $$('.hub .pulse').forEach((p, i) => {
    const len = p.getTotalLength ? p.getTotalLength() : 260;
    loops.push(gsap.fromTo(p, { strokeDashoffset: 14 }, { strokeDashoffset: -len, duration: 1.8, ease: 'none', repeat: -1, repeatDelay: 1.2 + (i % 3) * 0.4, delay: 1.6 + i * 0.35 }));
  });
  $$('.hub__ring').forEach((r, i) => {
    loops.push(gsap.fromTo(r, { scale: 1, opacity: 0.7, svgOrigin: '300 300' }, { scale: 2.6, svgOrigin: '300 300', opacity: 0, duration: 2.8, ease: 'power2.out', repeat: -1, repeatDelay: 4, delay: 1.2 + i * 1.4 }));
  });
  // fora da tela o hub para de animar (sem processamento à toa enquanto a pessoa lê o resto)
  ScrollTrigger.create({
    trigger: '.hero', start: 'top bottom', end: 'bottom top',
    onToggle: (st) => loops.forEach((t) => (st.isActive ? t.resume() : t.pause())),
  });
  const hub = $('[data-hub]');
  if (hub && finePointer) {
    const qx = gsap.quickTo(hub, 'x', { duration: 1.2, ease: 'power3.out' });
    const qy = gsap.quickTo(hub, 'y', { duration: 1.2, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      qx((e.clientX / window.innerWidth - 0.5) * 24);
      qy((e.clientY / window.innerHeight - 0.5) * 24);
    });
  }
  // hub afasta levemente ao rolar
  gsap.to('.hero__hub .hub', { yPercent: 12, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Texto que acende palavra por palavra ---------- */
  $$('[data-scrub-text]').forEach((el) => {
    const words = $$('.w', el);
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: (st) => {
        const n = Math.round(st.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < n));
      },
    });
  });

  /* ---------- Marquees (aceleram com a velocidade da rolagem) ---------- */
  $$('[data-marquee]').forEach((m) => {
    const track = $('.mq__track', m);
    const copies = Number(m.dataset.copies || 2);
    const dir = m.dataset.reverse === 'true' ? 1 : -1;
    const speed = Number(m.dataset.speed || 1);
    const dist = 100 / copies;
    const tween = gsap.fromTo(track,
      { xPercent: dir === -1 ? 0 : -dist },
      { xPercent: dir === -1 ? -dist : 0, duration: 28 / speed, ease: 'none', repeat: -1 });
    // pausa com o mouse em cima ou com foco dentro (conteúdo em movimento precisa poder parar)
    m.addEventListener('pointerenter', () => tween.pause());
    m.addEventListener('pointerleave', () => tween.resume());
    m.addEventListener('focusin', () => tween.pause());
    m.addEventListener('focusout', () => tween.resume());
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: (st) => {
        const v = Math.min(Math.abs(st.getVelocity()) / 600, 4);
        gsap.to(tween, { timeScale: 1 + v, duration: 0.3, overwrite: true });
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.3 });
      },
    });
  });

  /* ---------- Soluções: rolagem horizontal fixa (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const sec = $('[data-hscroll]');
    const track = $('[data-hscroll-track]', sec);
    const bar = $('[data-hscroll-bar]', sec);
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const t = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, pin: '.sol__pin', start: 'top top', end: () => '+=' + dist(),
        scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (st) => gsap.set(bar, { scaleX: st.progress }),
      },
    });
    hscroll = { st: t.scrollTrigger, track, dist };
    return () => { hscroll = null; t.kill(); };
  });

  /* ---------- Método: linha que se desenha ---------- */
  const tlEl = $('[data-timeline]');
  if (tlEl) {
    const fill = $('[data-timeline-fill]', tlEl);
    const steps = $$('[data-step]', tlEl);
    const vertical = () => window.innerWidth <= 860;
    ScrollTrigger.create({
      trigger: tlEl, start: 'top 75%', end: 'bottom 55%', scrub: true,
      onUpdate: (st) => {
        gsap.set(fill, vertical() ? { scaleY: st.progress, scaleX: 1 } : { scaleX: st.progress, scaleY: 1 });
        steps.forEach((s, i) => s.classList.toggle('is-on', st.progress >= i / steps.length + 0.02));
      },
    });
    gsap.from(steps, { opacity: 0, y: 24, duration: 0.6, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: tlEl, start: 'top 80%' } });
  }

  /* ---------- Botões magnéticos ---------- */
  if (finePointer) {
    $$('[data-magnetic]').forEach((b) => {
      const qx = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' });
      const qy = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.25);
        qy((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
