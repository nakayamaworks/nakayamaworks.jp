const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.sr-only').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.querySelector('.sr-only').textContent = 'メニューを開く';
  });
});

const lightbox = document.querySelector('#image-lightbox');
const lightboxImage = lightbox?.querySelector('.lightbox-image');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
let lastFocusedElement = null;

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage) return;

  lastFocusedElement = trigger;
  lightboxImage.src = trigger.dataset.lightboxSrc;
  lightboxImage.alt = trigger.dataset.lightboxAlt;
  lightbox.hidden = false;
  document.body.classList.add('is-lightbox-open');
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;

  lightbox.hidden = true;
  document.body.classList.remove('is-lightbox-open');
  lightboxImage?.removeAttribute('src');
  lastFocusedElement?.focus();
}

document.querySelectorAll('[data-lightbox-src]').forEach((trigger) => {
  trigger.addEventListener('click', () => openLightbox(trigger));
});

lightbox?.addEventListener('click', (event) => {
  if (event.target.closest('.lightbox-backdrop, .lightbox-close')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return;

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    lightboxClose?.focus();
  }
});
