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

  const toast = (msg) => {
    if (!themeToast) return;
    themeToast.textContent = msg;
    themeToast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => themeToast.classList.remove('show'), 2400);
  };

  const page = location.pathname.split('/').pop() || 'index.html';
  const topic = {
    'desintare.html': 'los servicios legales de Desintare',
    'sivomaco.html': 'los servicios administrativos de Sivomaco',
    'kd1.html': 'los servicios de KDI Construcciones',
  }[page] || 'los servicios de Grupo Desisivo';
  const greeting = `Hola, me gustaría recibir información sobre ${topic}.`;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;

  // ---- WhatsApp: abre el chat directo (app en celular, WhatsApp Web en computadora) ----
  document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
    const phone = a.getAttribute('href').match(/wa\.me\/(\d+)/)?.[1];
    if (!phone) return;
    const text = encodeURIComponent(greeting);
    a.href = isMobile
      ? `https://wa.me/${phone}?text=${text}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
  });

  // ---- Correo: mailto falla sin app de correo configurada, así que se ofrecen alternativas ----
  const mailMenu = document.createElement('div');
  mailMenu.className = 'mail-menu';
  mailMenu.setAttribute('role', 'menu');
  mailMenu.hidden = true;
  document.body.appendChild(mailMenu);
  const closeMail = () => { mailMenu.hidden = true; };

  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const email = a.getAttribute('href').slice(7).split('?')[0];
      const subject = encodeURIComponent('Solicitud de información — sitio web');
      const body = encodeURIComponent(greeting);
      mailMenu.innerHTML = `
        <p class="mail-menu-title">Escríbenos a <b>${email}</b></p>
        <a role="menuitem" href="mailto:${email}?subject=${subject}&body=${body}">Abrir mi app de correo</a>
        <a role="menuitem" target="_blank" rel="noopener" href="https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}">Escribir desde Gmail</a>
        <a role="menuitem" target="_blank" rel="noopener" href="https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${subject}&body=${body}">Escribir desde Outlook</a>
        <button type="button" role="menuitem" data-copy="${email}">Copiar dirección de correo</button>`;
      mailMenu.hidden = false;
      if (isMobile || innerWidth < 600) {
        mailMenu.classList.add('sheet');
        mailMenu.style.left = mailMenu.style.top = '';
      } else {
        mailMenu.classList.remove('sheet');
        const r = a.getBoundingClientRect();
        const w = mailMenu.offsetWidth, h = mailMenu.offsetHeight;
        const left = Math.min(Math.max(12, r.left), innerWidth - w - 12);
        const top = r.bottom + 8 + h > innerHeight ? r.top - h - 8 : r.bottom + 8;
        mailMenu.style.left = left + 'px';
        mailMenu.style.top = top + 'px';
      }
      mailMenu.querySelector('a, button').focus();
    });
  });

  mailMenu.addEventListener('click', (e) => {
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const email = copy.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject())
        .then(() => toast('Correo copiado: ' + email))
        .catch(() => toast(email));
    }
    if (e.target.closest('a, button')) closeMail();
  });
  document.addEventListener('click', (e) => { if (!mailMenu.hidden && !mailMenu.contains(e.target)) closeMail(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMail(); });
  addEventListener('scroll', () => { if (!mailMenu.hidden && !mailMenu.classList.contains('sheet')) closeMail(); }, { passive: true });

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
