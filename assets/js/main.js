(function initTheme() {
  try {
    const saved = localStorage.getItem('gd-theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) { /* localStorage no disponible */ }
})();

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.querySelector('.theme-toggle');
  const themeToast = document.querySelector('.theme-toast');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', isDark ? 'light' : 'dark');
      try { localStorage.setItem('gd-theme', isDark ? 'light' : 'dark'); } catch (e) {}
      if (themeToast) {
        themeToast.textContent = isDark ? 'Fondo claro activado' : 'Fondo oscuro activado';
        themeToast.classList.add('show');
        clearTimeout(themeBtn._toastTimer);
        themeBtn._toastTimer = setTimeout(() => themeToast.classList.remove('show'), 2200);
      }
    });
  }

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 8 ? '0 8px 20px -14px rgba(11,43,76,.35)' : 'none';
    });
  }

  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    const slides = [...carousel.querySelectorAll('.hero-slide')];
    const dots = [...carousel.querySelectorAll('.hero-dots button')];
    let i = slides.findIndex(s => s.classList.contains('active'));
    if (i < 0) i = 0;
    let timer;

    const show = (n) => {
      slides[i].classList.remove('active');
      dots[i]?.classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active');
      dots[i]?.classList.add('active');
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => show(i + 1), 6000);
    };

    dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); restart(); }));
    carousel.querySelector('.hero-prev')?.addEventListener('click', () => { show(i - 1); restart(); });
    carousel.querySelector('.hero-next')?.addEventListener('click', () => { show(i + 1); restart(); });

    restart();
  }

  // ---- barra de progreso de scroll ----
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      progress.style.width = pct + '%';
    });
  }

  // ---- animaciones al hacer scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ---- contadores animados (trust-strip) ----
  const counters = document.querySelectorAll('.stat b[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => io2.observe(el));
  }
});
