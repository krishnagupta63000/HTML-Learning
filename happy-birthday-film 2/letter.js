/* =====================================================================
   HER LETTER. Edit ONLY the SCENES list. One scene = one screen.

   Templates (copy any line into SCENES):
     { type: 'paragraph', eyebrow: 'optional small label', text: 'your paragraph' }
     { type: 'line', text: 'one short sentence, shown large in script' }
     { type: 'closing', text: 'final words', sign: 'your name' }   // last screen only

   Keep each paragraph to about 40 to 60 words so it reads on a phone.
   ===================================================================== */
(function () {
  'use strict';

  const SCENES = [
    { type: 'paragraph', eyebrow: 'To Begin With...',
      text: 'A depth and passion that I have felt for no one else in this life' },
    { type: 'paragraph', eyebrow: '"A sweet day celebrating a sweet gurl, How lucky I am to know you.."',
      text: 'Hoping this webiste will make ur special day even more special and bring a smile on ur face..may god give yiu every thing that yiu have ever wished for and bless yiu and ur family with good health, wealth and very good time' },
    { type: 'line', text: 'You make ordinary days feel like something worth keeping.' },
    { type: 'paragraph',
      text: 'Here is the part where you say what she means to you, plainly and without hurry.' },
    { type: 'closing', text: 'Thank you for being exactly who you are. Happy birthday.',
      sign: 'with all my love, your name' }
  ];

  const gsap = window.gsap;
  if (!gsap) return;                       // birthday.js already reports a GSAP error
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const replayBtn = document.getElementById('replay');

  /* ---------- overlay ---------- */
  const root = document.createElement('div');
  root.className = 'letter';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'A letter for you');
  root.innerHTML =
    '<div class="letter__light" aria-hidden="true"></div>' +
    '<div class="letter__stage"></div>' +
    '<button class="letter__close" type="button">close</button>' +
    '<p class="letter__hint" aria-hidden="true">tap to continue</p>';
  for (let k = 0; k < 14; k++) {           // slow drifting motes, like the film
    const m = document.createElement('span');
    m.className = 'lmote';
    root.insertBefore(m, root.firstChild);
    const s = 6 + Math.random() * 14;
    gsap.set(m, { width: s, height: s, left: (Math.random() * 100) + '%',
                  top: (Math.random() * 100) + '%', opacity: 0.25 + Math.random() * 0.5 });
    if (!reduce) gsap.to(m, { x: (Math.random() - 0.5) * 60, y: -(20 + Math.random() * 40),
                              duration: 6 + Math.random() * 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
  document.body.appendChild(root);
  const stage = root.querySelector('.letter__stage');
  const light = root.querySelector('.letter__light');
  gsap.set(light, { xPercent: -50, yPercent: -50, opacity: 0 });

  const start = document.createElement('button');
  start.className = 'letter__start';
  start.type = 'button';
  start.textContent = 'open her letter';
  document.body.appendChild(start);

  /* ---------- building and revealing one scene ---------- */
  function buildScene(sc) {
    const el = document.createElement('section');
    el.className = 'lscene lscene--' + sc.type;
    gsap.set(el, { yPercent: -50 });
    if (sc.eyebrow) {
      const e = document.createElement('p');
      e.className = 'lscene__eyebrow';
      e.textContent = sc.eyebrow;
      el.appendChild(e);
    }
    const body = document.createElement('p');
    body.className = 'lscene__text';
    const words = sc.text.trim().split(/\s+/);
    words.forEach((w, k) => {              // each word sits in a mask, so it rises out of it
      const mask = document.createElement('span');
      mask.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = w;
      mask.appendChild(inner);
      body.appendChild(mask);
      if (k < words.length - 1) body.appendChild(document.createTextNode(' '));
    });
    el.appendChild(body);
    el.appendChild(Object.assign(document.createElement('span'), { className: 'lscene__rule' }));
    if (sc.sign) {
      const s = document.createElement('p');
      s.className = 'lscene__sign';
      s.textContent = sc.sign;
      el.appendChild(s);
    }
    if (sc.type === 'closing') {
      const again = document.createElement('button');
      again.className = 'lscene__again';
      again.type = 'button';
      again.textContent = 'watch again';
      again.addEventListener('click', e => {
        e.stopPropagation();
        closeLetter();
        if (replayBtn) replayBtn.click();
      });
      el.appendChild(again);
    }
    return el;
  }

  function reveal(el) {
    const tl = gsap.timeline({ paused: true });
    const eyebrow = el.querySelector('.lscene__eyebrow');
    const words = el.querySelectorAll('.wi');
    const rule = el.querySelector('.lscene__rule');
    const sign = el.querySelector('.lscene__sign');
    const again = el.querySelector('.lscene__again');
    if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 10, duration: 0.9, ease: 'power2.out' }, 0);
    tl.from(words, { yPercent: 110, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.035 }, 0.25);
    tl.from(rule, { scaleX: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.5');
    if (sign) tl.from(sign, { opacity: 0, y: 12, duration: 1, ease: 'power2.out' }, '-=0.6');
    if (again) tl.fromTo(again, { opacity: 0, pointerEvents: 'none' },
                         { opacity: 1, pointerEvents: 'auto', duration: 0.8 }, '-=0.4');
    return tl;
  }

  /* ---------- navigation ---------- */
  let index = -1, current = null, tl = null, delayed = null;

  function go(n) {
    n = Math.max(0, Math.min(SCENES.length - 1, n));
    if (n === index) return;
    const old = current;
    if (delayed) delayed.kill();
    if (tl) tl.kill();
    const el = buildScene(SCENES[n]);
    stage.appendChild(el);
    index = n;
    current = el;
    tl = reveal(el);
    root.classList.toggle('is-end', n === SCENES.length - 1);

    gsap.fromTo(light, { opacity: 0, scale: 0.7 },
      { opacity: 0.9, scale: 1.15, duration: reduce ? 0 : 0.9, ease: 'sine.out', yoyo: true, repeat: 1 });
    if (old) gsap.to(old, { opacity: 0, yPercent: -58, duration: reduce ? 0 : 0.5, ease: 'power2.in',
                            onComplete: () => old.remove() });

    const wait = reduce ? 0 : (old ? 0.55 : 0.6);   // let the old paragraph leave first
    const thisTl = tl;
    delayed = gsap.delayedCall(wait, () => thisTl.play());
    if (reduce) tl.progress(1);
  }

  function advance() {
    if (!current) return;
    if (tl && tl.progress() < 1) { tl.progress(1); return; }   // first tap finishes the reveal
    go(index + 1);
  }

  function back() { go(index - 1); }

  function openLetter() {
    gsap.killTweensOf(root);
    start.classList.remove('is-shown');
    root.classList.add('is-open');
    gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 1.2, ease: 'power1.out' });
    stage.innerHTML = '';
    index = -1; current = null; tl = null;
    go(0);
  }

  function closeLetter() {
    gsap.to(root, { opacity: 0, duration: reduce ? 0 : 0.8, ease: 'power1.in', onComplete: () => {
      if (delayed) delayed.kill();
      if (tl) tl.kill();
      stage.innerHTML = '';
      index = -1; current = null; tl = null;
      root.classList.remove('is-open', 'is-end');
    } });
  }

  root.addEventListener('click', e => {
    if (e.target.closest('button')) return;
    advance();
  });
  root.querySelector('.letter__close').addEventListener('click', e => {
    e.stopPropagation();
    closeLetter();
  });
  document.addEventListener('keydown', e => {
    if (!root.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeLetter(); return; }
    if (e.target.tagName === 'BUTTON') return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); }
    else if (e.key === 'ArrowLeft') back();
  });

  /* ---------- the button that opens the letter after the film ---------- */
  start.addEventListener('click', openLetter);
  if (replayBtn) replayBtn.addEventListener('click', () => start.classList.remove('is-shown'));
  window.addEventListener('bday:done', () => start.classList.add('is-shown'));
  if (reduce) start.classList.add('is-shown');
})();
