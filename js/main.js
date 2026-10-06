(() => {
  'use strict';
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const viewer = document.querySelector('#viewer');
  let opener = null;
  let gallery = [];
  let current = 0;
  const viewerImage = document.querySelector('#viewer-image');

  // Native modal dialogs contain focus. Restore it explicitly on every close path.
  function openDialog(dialog, trigger) {
    opener = trigger;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function closeDialog(dialog) { dialog.close(); }
  [menu, viewer].forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      toggle.setAttribute('aria-expanded', 'false');
      const returnTo = opener;
      opener = null;
      if (returnTo) returnTo.focus({ preventScroll: true });
    });
  });
  toggle.addEventListener('click', () => {
    openDialog(menu, toggle);
    toggle.setAttribute('aria-expanded', 'true');
  });
  menu.querySelector('.menu-close').addEventListener('click', () => closeDialog(menu));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDialog(menu)));
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches && menu.open) closeDialog(menu);
  });

  function renderImage() {
    const image = gallery[current].querySelector('img');
    viewerImage.src = image.getAttribute('src');
    viewerImage.alt = image.alt;
    viewerImage.width = image.width;
    viewerImage.height = image.height;
    document.querySelector('#viewer-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
  }
  function move(direction) {
    current = (current + direction + gallery.length) % gallery.length;
    renderImage();
  }
  document.querySelectorAll('.project-photo').forEach(button => {
    button.addEventListener('click', () => {
      gallery = Array.from(button.closest('.project').querySelectorAll('.project-photo'));
      current = Number(button.dataset.index);
      document.querySelector('#viewer-title').textContent = button.dataset.project;
      renderImage();
      openDialog(viewer, button);
    });
  });
  viewer.querySelector('.viewer-close').addEventListener('click', () => closeDialog(viewer));
  viewer.querySelector('.viewer-prev').addEventListener('click', () => move(-1));
  viewer.querySelector('.viewer-next').addEventListener('click', () => move(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let touchStart = null;
  viewerImage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  viewerImage.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });
  viewerImage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  const form = document.querySelector('#contact-form');
  const name = form.elements.name;
  const contact = form.elements.contact;
  function validate() {
    name.setCustomValidity(name.value.trim() ? '' : 'Пожалуйста, укажите имя.');
    const value = contact.value.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const phone = /^[+\d\s()−-]+$/.test(value) && value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 15;
    contact.setCustomValidity(email || phone ? '' : 'Укажите корректный e-mail или телефон (от 7 до 15 цифр).');
  }
  [name, contact].forEach(input => input.addEventListener('input', () => {
    input.setCustomValidity('');
    document.querySelector('#form-status').textContent = '';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    validate();
    if (!form.reportValidity()) return;
    document.querySelector('#form-status').textContent = 'Спасибо. Это демонстрационная форма — данные не отправляются.';
  });

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-head, .intro, .about-text, .service-row, .steps li, .statement h2').forEach(element => {
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
    motion.addEventListener('change', () => {
      if (motion.matches) {
        observer.disconnect();
        document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible'));
      }
    });
  }
})();
