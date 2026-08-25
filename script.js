// ============================================
// Pipeline trace animation (hero signature)
// ============================================
(function traceAnimation() {
  const stages = document.querySelectorAll('.trace-stage');
  if (!stages.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  function tick() {
    stages.forEach((s) => s.classList.remove('active'));
    const stage = stages[current];
    stage.classList.add('active');

    const base = parseInt(stage.dataset.ms, 10) || 10;
    const jitter = Math.max(1, Math.round(base * (0.9 + Math.random() * 0.25)));
    stage.querySelector('.ms').textContent = jitter + 'ms';

    current = (current + 1) % stages.length;
  }

  tick();
  if (!reduceMotion) {
    setInterval(tick, 850);
  }
})();

// ============================================
// Scroll-reveal for cards, timeline rows, stack groups
// ============================================
(function scrollReveal() {
  const targets = document.querySelectorAll('.card, .tl-row, .stack-group');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((t) => observer.observe(t));
})();

// ============================================
// Project filter
// ============================================
(function projectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach((card) => {
        const tags = card.dataset.tags || '';
        const match = filter === 'all' || tags.split(' ').includes(filter);
        card.style.display = match ? '' : 'none';
      });
    });
  });
})();

// ============================================
// Copy email to clipboard
// ============================================
(function copyEmail() {
  const btn = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  if (!btn || !toast) return;

  let toastTimer;

  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch (err) {
      showToast('Copy failed — email is ' + email);
    }
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
})();

// ============================================
// Dhaka / Tokyo live clocks
// ============================================
(function liveClocks() {
  const dhaka = document.getElementById('clock-dhaka');
  const tokyo = document.getElementById('clock-tokyo');
  if (!dhaka || !tokyo) return;

  function update() {
    const now = new Date();
    dhaka.textContent = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
    });
    tokyo.textContent = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  update();
  setInterval(update, 1000);
})();

// ============================================
// Nav background on scroll
// ============================================
(function navScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 20) {
      nav.style.borderBottomColor = 'var(--border)';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
