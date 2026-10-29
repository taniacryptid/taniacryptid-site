(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- liquid metal reform ---- */
  const disp = document.getElementById('disp');
  const turb = document.getElementById('turb');
  const t0 = performance.now();
  function reform(now) {
    const k = Math.min((now - t0) / 2200, 1);
    const ease = 1 - Math.pow(1 - k, 3);
    disp.setAttribute('scale', (140 * (1 - ease) + 3).toFixed(1));
    const wob = Math.sin(now / 900) * 0.002;
    turb.setAttribute('baseFrequency', (0.012 + wob) + ' ' + (0.04 + wob));
    requestAnimationFrame(reform);
  }
  if (reduce) disp.setAttribute('scale', '0'); else requestAnimationFrame(reform);

  /* ---- machine-vision readout ---- */
  const lines = [
    { t: 'SCAN: VISITOR' },
    { t: 'ORIGIN: THE INTERNET' },
    { t: 'MATCH: FELLOW STORY FAN  98.6%' },
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
        if (j < l.t.length) setTimeout(type, 28);
        else { p.classList.remove('caret'); setTimeout(next, 140); }
      };
      l.t.length ? type() : (p.classList.remove('caret'), setTimeout(next, 120));
    };
    setTimeout(next, 900);
  }

  const tg = document.getElementById('target'), ret = document.getElementById('ret'), ro = document.getElementById('ro');

  const subject = tg.dataset.subject || 'CRT BUDDY';

  /* ---- pixel CRT Buddy wireframe (shown when no photo is set) ---- */
  const cv = document.getElementById('cv');
  if (cv) {
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const V = [], E = [];
  const add = (x, y, z) => V.push([x, y, z]) - 1;
  const b = [];
  for (const bx of [-1.2, 1.2]) for (const by of [-.9, .9]) for (const bz of [-.8, .8]) b.push(add(bx, by, bz));
  [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(([a, c]) => E.push([b[a], b[c]]));
  const s = [add(-.9,-.6,-.81), add(.9,-.6,-.81), add(.9,.6,-.81), add(-.9,.6,-.81)];
  E.push([s[0],s[1]], [s[1],s[2]], [s[2],s[3]], [s[3],s[0]]);
  const top = add(0,-.9,0);
  E.push([top, add(-.6,-1.6,0)], [top, add(.7,-1.5,0)]);
  E.push([add(-.8,.9,0), add(-.95,1.2,0)], [add(.8,.9,0), add(.95,1.2,0)]);

  let rotY = 0.6, tick = 0;
  const rotX = -0.2;
  const proj = ([px, py, pz]) => {
    const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
    const x1 = px * cy - pz * sy, z1 = px * sy + pz * cy;
    const y1 = py * cx - z1 * sx, z2 = py * sx + z1 * cx;
    const f = 95 / (z2 + 4.2);
    return [W / 2 + x1 * f, H * .48 + y1 * f, z2];
  };
  const line = (a, c, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(Math.round(a[0]) + .5, Math.round(a[1]) + .5);
    ctx.lineTo(Math.round(c[0]) + .5, Math.round(c[1]) + .5); ctx.stroke();
  };
  function draw() {
    const g = ctx.createRadialGradient(W * .4, H * .4, 4, W / 2, H / 2, H * .8);
    g.addColorStop(0, '#5a0a0c'); g.addColorStop(1, '#0c0203');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(142,15,18,.4)';
    for (let gy = 100; gy < H; gy += 6) ctx.fillRect(0, gy, W, 1);
    const P = V.map(proj);
    E.forEach(([a, c]) => line(P[a], P[c], (P[a][2] + P[c][2]) > 0 ? '#6b1a16' : '#ff3b26'));
    if (Math.cos(rotY) > 0) {
      const blink = (tick % 180) < 6;
      ctx.fillStyle = '#f2b705';
      for (const ex of [-.35, .35]) {
        const p = proj([ex, -.1, -.82]);
        ctx.fillRect(Math.round(p[0]) - 2, Math.round(p[1]) - (blink ? 0 : 2), 4, blink ? 1 : 4);
      }
      line(proj([-.3, .25, -.82]), proj([.3, .25, -.82]), '#f2b705');
    }
  }
  (function loop() {
    if (!ret.classList.contains('locked')) { rotY += 0.012; tick++; }
    draw();
    if (!reduce) requestAnimationFrame(loop);
  })();
  }

  /* ---- target reticle: follow the pointer, click to lock on (and freeze Buddy) ---- */
  const pad = n => String(Math.round(n)).padStart(3, '0');
  let x = 50, y = 42;
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
