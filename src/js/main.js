/* ==========================================================
   Treppenhausreinigung Rostock – Interaktion & Motion
   ========================================================== */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Ladebildschirm ---------- */
const preloader = document.getElementById('preloader');
if (preloader) {
  const skip = document.documentElement.classList.contains('no-preloader') || reducedMotion;
  if (skip) {
    preloader.remove();
    sessionStorage.setItem('thr-loaded', '1');
  } else {
    document.documentElement.style.overflow = 'hidden';
    const minShow = 3100; // komplette Logo-Choreografie durchlaufen lassen
    const started = performance.now();
    const hide = () => {
      preloader.classList.add('is-done');
      document.documentElement.style.overflow = '';
      sessionStorage.setItem('thr-loaded', '1');
      setTimeout(() => preloader.remove(), 600);
    };
    window.addEventListener('load', () => {
      setTimeout(hide, Math.max(0, minShow - (performance.now() - started)));
    });
    setTimeout(hide, 4000); // Sicherheitsnetz, falls "load" ausbleibt
  }
}

/* ---------- Mobile-Navigation ---------- */
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- Scrollspy: aktive Sektion in der Navigation markieren ---------- */
const sections = Array.from(document.querySelectorAll('section[id]'));
const navLinks = Array.from(document.querySelectorAll('.nav__link'));
const header = document.querySelector('.header');

function updateSpy() {
  if (!sections.length || !navLinks.length) return;
  const probe = window.scrollY + window.innerHeight * 0.4;
  let currentId = sections[0].id;
  sections.forEach((s) => {
    if (s.offsetTop <= probe) currentId = s.id;
  });
  // Ganz unten angekommen: letzte Sektion markieren
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
    currentId = sections[sections.length - 1].id;
  }
  navLinks.forEach((link) => {
    const active = link.getAttribute('href').endsWith('#' + currentId);
    link.classList.toggle('nav__link--active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

/* ---------- Header schrumpft beim Scrollen ---------- */
function updateHeader() {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateSpy();
    updateHeader();
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
updateSpy();
updateHeader();

/* ---------- Scroll-Reveal mit Richtungs-Varianten ---------- */
const revealGroups = [
  { selector: '.intro__image', variant: 'reveal--left' },
  { selector: '.intro__content', variant: 'reveal--right' },
  { selector: '.loesungen .h1, .loesungen__text', variant: '' },
  { selector: '.stats', variant: '' },
  { selector: '.kompetenzen__grid > .card--green', variant: 'reveal--left' },
  { selector: '.kompetenzen__grid > .card--image', variant: 'reveal--right' },
  { selector: '.kompetenzen__grid--cards > .card:first-child', variant: 'reveal--left' },
  { selector: '.kompetenzen__grid--cards > .card:last-child', variant: 'reveal--right' },
  { selector: '.jobs .h1', variant: '' },
  { selector: '.jobs__team', variant: 'reveal--left' },
  { selector: '.jobs__grid > .card--yellow', variant: 'reveal--right' },
  { selector: '.jobs__slider', variant: 'reveal--zoom' },
  { selector: '.kontakt__form-col', variant: 'reveal--left' },
  { selector: '.kontakt__text', variant: 'reveal--right' },
  { selector: '.besuch .h1, .besuch__intro', variant: '' },
  { selector: '.besuch__box', variant: 'reveal--zoom' },
];

if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealGroups.forEach(({ selector, variant }) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add('reveal');
      if (variant) el.classList.add(variant);
      revealer.observe(el);
    });
  });
}

/* ---------- Kennzahlen zählen hoch, wenn sie sichtbar werden ---------- */
if (!reducedMotion && 'IntersectionObserver' in window) {
  const stats = document.querySelectorAll('.stats .mono-label');
  const counter = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counter.unobserve(entry.target);
        const el = entry.target;
        const original = el.textContent;
        const match = original.match(/^(\d+)/);
        if (!match) return;
        const target = parseInt(match[1], 10);
        const rest = original.slice(match[1].length);
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + rest;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((s) => counter.observe(s));
}

/* ---------- Sanfte Parallaxe im Hero ---------- */
const heroInner = document.querySelector('.hero .container');
if (heroInner && !reducedMotion && window.innerWidth > 900) {
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroInner.style.transform = 'translateY(' + y * 0.14 + 'px)';
      }
    },
    { passive: true }
  );
}

/* ---------- Team-Slider (mittleres Bild groß, äußere 60% kleiner) ---------- */
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  if (slides.length < 2) return;
  let current = Math.min(1, slides.length - 1); // mittleres Bild startet groß

  function render() {
    const n = slides.length;
    slides.forEach((img, i) => {
      img.classList.remove('slide--left', 'slide--center', 'slide--right');
      if (i === current) img.classList.add('slide--center');
      else if (i === (current - 1 + n) % n) img.classList.add('slide--left');
      else if (i === (current + 1) % n) img.classList.add('slide--right');
    });
  }
  function go(dir) {
    current = (current + dir + slides.length) % slides.length;
    render();
  }

  slider.querySelector('.slider__btn--prev').addEventListener('click', () => go(-1));
  slider.querySelector('.slider__btn--next').addEventListener('click', () => go(1));

  // Klick auf ein Seitenbild holt es in die Mitte
  slides.forEach((img, i) => {
    img.addEventListener('click', () => {
      if (i !== current) {
        current = i;
        render();
      }
    });
  });

  // Tastatur & Wischgesten
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  let startX = null;
  slider.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX = null;
  });

  render();
});

/* ---------- Custom-Dropdown (Kontaktformular) ---------- */
document.querySelectorAll('[data-dropdown]').forEach((dd) => {
  const btn = dd.querySelector('.dropdown__toggle');
  const list = dd.querySelector('.dropdown__list');
  const valueEl = dd.querySelector('[data-dropdown-value]');
  const input = dd.querySelector('input[type="hidden"]');
  const options = Array.from(list.querySelectorAll('[role="option"]'));

  function setOpen(open) {
    dd.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    list.hidden = !open;
    if (open) (options.find((o) => o.getAttribute('aria-selected') === 'true') || options[0]).focus();
  }
  function select(option) {
    options.forEach((o) => o.setAttribute('aria-selected', o === option));
    valueEl.textContent = option.dataset.value;
    input.value = option.dataset.value;
    setOpen(false);
    btn.focus();
  }

  btn.addEventListener('click', () => setOpen(list.hidden));
  options.forEach((o) => {
    o.addEventListener('click', () => select(o));
    o.addEventListener('keydown', (e) => {
      const i = options.indexOf(o);
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(o); }
      if (e.key === 'ArrowDown') { e.preventDefault(); (options[i + 1] || options[0]).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (options[i - 1] || options[options.length - 1]).focus(); }
      if (e.key === 'Escape') { setOpen(false); btn.focus(); }
    });
  });
  document.addEventListener('click', (e) => {
    if (!dd.contains(e.target)) setOpen(false);
  });
});
