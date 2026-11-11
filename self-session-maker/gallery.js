'use strict';
(() => {
  const track = document.getElementById('screens-carousel');
  if (!track) return;
  const slides = [...track.children];
  const dots = [...document.querySelectorAll('.product-gallery-dots button')];
  const mobile = window.matchMedia('(max-width: 650px)');
  const syncMode = () => {
    if (mobile.matches) {
      track.setAttribute('tabindex', '0');
      slides.forEach((slide, index) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-label', `${index + 1} / ${slides.length}`);
      });
      update();
    } else {
      slides.forEach(slide => ['role', 'aria-label'].forEach(attr => slide.removeAttribute(attr)));
      track.scrollLeft = 0;
    }
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, frame;
  const update = () => {
    frame = undefined;
    if (!mobile.matches) return;
    const left = track.getBoundingClientRect().left;
    const maximum = track.scrollWidth - track.clientWidth;
    let nearest = 0, distance = Infinity;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const target = Math.min(maximum, Math.max(0, track.scrollLeft + rect.left - left));
      const delta = Math.abs(target - track.scrollLeft);
      if (delta < distance) {distance = delta; nearest = index;}
    });
    current = nearest;
    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === current)));
  };
  const goTo = index => {
    const slide = slides[Math.max(0, Math.min(slides.length - 1, index))];
    const delta = slide.getBoundingClientRect().left - track.getBoundingClientRect().left;
    track.scrollTo({left:track.scrollLeft + delta,behavior:reducedMotion.matches ? 'auto' : 'smooth'});
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
  track.addEventListener('scroll', () => {if (frame === undefined) frame = requestAnimationFrame(update);}, {passive:true});
  track.addEventListener('keydown', event => {
    if (!mobile.matches || event.target !== track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  new ResizeObserver(update).observe(track);
  mobile.addEventListener('change', syncMode);
  syncMode();
})();
