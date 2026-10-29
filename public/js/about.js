(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- machine-vision readout ---- */
  const lines = [
    { t: 'SCAN: VISITOR' },
    { t: 'ORIGIN: THE INTERNET' },
    { t: 'MATCH: FELLOW GODZILLA FAN  98.6%' },
    { t: 'THREAT ASSESSMENT: NONE' },
    { t: '' },
    { t: 'RESPONSE OPTIONS:' },
    { t: 'TERMINATE', c: 'opt' },
    { t: 'SHARE A GOOD STORY', c: 'opt' },
    { t: 'SAY HELLO', c: 'opt picked' },
  ];
  const box = document.getElementById('hudlines');
  if (reduce) {
    lines.forEach(l => { const p = document.createElement('p'); p.textContent = l.t; if (l.c) p.className = l.c; box.appendChild(p); });
  } else {
    let i = 0;
    const next = () => {
      if (i >= lines.length) return;
      const l = lines[i++], p = document.createElement('p');
      if (l.c) p.className = l.c;
      p.classList.add('caret'); box.appendChild(p);
      let j = 0;
      const type = () => {
        p.textContent = l.t.slice(0, ++j);
        if (j < l.t.length) setTimeout(type, 16);
        else { p.classList.remove('caret'); setTimeout(next, 70); }
      };
      l.t.length ? type() : (p.classList.remove('caret'), setTimeout(next, 60));
    };
    setTimeout(next, 350);
  }

  const tg = document.getElementById('target'), ret = document.getElementById('ret'), ro = document.getElementById('ro');

  const subject = tg.dataset.subject || 'TANIACRYPTID';

  /* ---- target reticle: follow the pointer, click to lock on ---- */
  const pad = n => String(Math.round(n)).padStart(3, '0');
  let x = 47, y = 34;
  const readout = () => {
    const locked = ret.classList.contains('locked');
    ro.replaceChildren('SUBJECT: ' + subject, document.createElement('br'), locked ? 'LOCKED\u00a0\u00a0·\u00a0\u00a0STATUS: FRIENDLY' : 'TRACKING\u00a0\u00a0X ' + pad(x) + ' Y ' + pad(y));
  };
  tg.addEventListener('pointermove', e => {
    if (ret.classList.contains('locked')) return;
    const r = tg.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width * 100; y = (e.clientY - r.top) / r.height * 100;
    ret.style.left = x + '%'; ret.style.top = y + '%';
    readout();
  });
  tg.addEventListener('click', e => {
    const r = tg.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width * 100; y = (e.clientY - r.top) / r.height * 100;
    ret.style.left = x + '%'; ret.style.top = y + '%';
    ret.classList.toggle('locked');
    readout();
  });
})();
