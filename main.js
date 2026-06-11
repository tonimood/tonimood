/* =============================================
   THEME TOGGLE
============================================= */
const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');

// Apply saved preference (default: dark)
html.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.classList.add('theme-transitioning');
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setTimeout(() => html.classList.remove('theme-transitioning'), 380);
});

/* =============================================
   NAV: scroll + blur + active links
============================================= */
const nav     = document.getElementById('nav');
const burger  = document.getElementById('burger');
const navMenu = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  highlightActiveSection();
}, { passive: true });

burger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

function highlightActiveSection() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');
  const scrollMid = window.scrollY + window.innerHeight / 3;

  sections.forEach(sec => {
    if (scrollMid >= sec.offsetTop && scrollMid < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${sec.id}`);
      });
    }
  });
}

/* =============================================
   SMOOTH SCROLL (respects offset for fixed nav)
============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
  });
});

/* =============================================
   REVEAL ON SCROLL (Intersection Observer)
============================================= */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), i * 80);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* =============================================
   STAGGER SERVICE CARDS
============================================= */
document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 60}ms`;
  revealObs.observe(card);
});

/* =============================================
   FORM SUBMIT
============================================= */
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name    = form.querySelector('#name').value.trim();
    const phone   = form.querySelector('#phone').value.trim();
    const format  = form.querySelector('#format').value;
    const revenue = form.querySelector('#revenue').value;

    if (!name || !phone || !format) {
      shake(submitBtn);
      return;
    }

    submitBtn.textContent   = 'Sending…';
    submitBtn.disabled      = true;
    submitBtn.style.opacity = '0.7';

    const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw7qxs9M9sseKhz6wlLwTcf2XvkQU4bTOiXd3ChxgdHgLsb_qyTRmnKTEKF3mxSW4yjcg/exec';

    fetch(SHEET_URL, {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, format, revenue })
    })
    .then(() => {
      submitBtn.textContent       = 'Message Sent ✓';
      submitBtn.style.opacity     = '1';
      submitBtn.style.background  = '#22C55E';
      submitBtn.style.borderColor = '#22C55E';
      submitBtn.style.color       = '#fff';
      form.reset();
    })
    .catch(() => {
      submitBtn.textContent       = 'Error — try again';
      submitBtn.disabled          = false;
      submitBtn.style.opacity     = '1';
    });
  });
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
}

/* inject shake keyframes */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* =============================================
   STAT COUNT-UP ANIMATION
============================================= */
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat__num').forEach(el => countUp(el));
    statObs.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statObs.observe(statsBar);

function countUp(el) {
  const raw = el.textContent;
  // Extract numeric part
  const match = raw.match(/[\d,]+/);
  if (!match) return;
  const target = parseInt(match[0].replace(/,/g, ''), 10);
  const prefix = raw.slice(0, raw.indexOf(match[0]));
  const suffix = raw.slice(raw.indexOf(match[0]) + match[0].length);
  const duration = 1400;
  const start    = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(ease * target);
    el.textContent = prefix + current.toLocaleString('en-US') + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
