'use strict';
(() => {
  const track = document.getElementById('screens-carousel');
  if (!track) return;
  const slides = [...track.children];
  const dots = [...document.querySelectorAll('.gallery-dots button')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, frame;
  const update = () => {
    frame = undefined;
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    let nearest = 0, distance = Infinity;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const delta = Math.abs(rect.left + rect.width / 2 - center);
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
    if (event.target !== track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  new ResizeObserver(update).observe(track);
  update();
})();
