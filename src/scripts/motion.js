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
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#topo' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: id === '#topo' ? 0 : -72 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
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
function closeMenu() {
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
  header.classList.remove('menu-open', 'is-solid-force');
}
burger?.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  header.classList.toggle('menu-open', open);
  header.classList.add('is-solid');
});

/* ---------- Acordeão (FAQ) ---------- */
$$('[data-acc]').forEach((item) => {
  const btn = $('[data-acc-btn]', item);
  const panel = $('[data-acc-panel]', item);
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (reduced) { panel.style.height = open ? '0' : 'auto'; return; }
    gsap.to(panel, { height: open ? 0 : 'auto', duration: 0.6, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
  });
});

/* ---------- Formulário ---------- */
const form = $('[data-form]');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = $('[data-form-status]', form);
  let ok = true;
  $$('[required]', form).forEach((f) => {
    const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
    f.closest('.field').classList.toggle('is-error', bad);
    if (bad) ok = false;
  });
  if (!ok) { status.textContent = 'Preencha nome e um e-mail válido.'; return; }
  status.textContent = 'Enviando...';
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.erro || 'falha');
    form.reset();
    status.textContent = 'Recebemos sua mensagem. Retornaremos em breve.';
  } catch {
    status.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
  }
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
    .from('.hub__core, .hub__label', { scale: 0, svgOrigin: '300 300', duration: 1.2 }, 0.3)
    .from('.hub .link', { attr: { x2: 300, y2: 300 }, duration: 1.4, stagger: 0.08 }, 0.5)
    .from(nodes, { opacity: 0, scale: 0.4, duration: 1.1, stagger: 0.08 }, 0.7)
    .from('.hub__orbits circle', { opacity: 0, scale: 0.7, svgOrigin: '300 300', duration: 1.6, stagger: 0.1 }, 0.2);

  // hub vivo
  gsap.to('.orbit', { rotation: 360, svgOrigin: '300 300', duration: 80, repeat: -1, ease: 'none' });
  gsap.to('.orbit--b', { rotation: -360, svgOrigin: '300 300', duration: 120, repeat: -1, ease: 'none' });
  $$('.hub .pulse').forEach((p, i) => {
    const len = p.getTotalLength ? p.getTotalLength() : 260;
    gsap.fromTo(p, { strokeDashoffset: 14 }, { strokeDashoffset: -len, duration: 1.8, ease: 'power1.in', repeat: -1, repeatDelay: 1.2 + (i % 3) * 0.4, delay: 1.6 + i * 0.35 });
  });
  $$('.hub__ring').forEach((r, i) => {
    gsap.fromTo(r, { scale: 1, opacity: 0.7, svgOrigin: '300 300' }, { scale: 2.6, svgOrigin: '300 300', opacity: 0, duration: 2.8, ease: 'power2.out', repeat: -1, delay: 1.2 + i * 1.4 });
  });
  nodes.forEach((n, i) => {
    gsap.to(n, { y: i % 2 ? 8 : -8, duration: 2.6 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });
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

  /* ---------- Títulos que sobem por linha ---------- */
  $$('[data-split]').forEach((el) => {
    gsap.from($$('.line > span', el), {
      yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  /* ---------- Reveal genérico ---------- */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });

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
    return () => t.kill();
  });
  mm.add('(max-width: 900px)', () => {
    $$('.sol .card, .sol__intro, .sol__end').forEach((c) => {
      gsap.from(c, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 88%' } });
    });
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
    gsap.from(steps, { opacity: 0, y: 30, duration: 1, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: tlEl, start: 'top 80%' } });
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
