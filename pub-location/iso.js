      // ---------- isometric helpers ----------
      const C = 0.866, S = 0.5;
      const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
      const pts = (a) => a.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
      const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      const sh = (h, f) => "rgb(" + hex(h).map((v) => Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))).join(",") + ")";
      const poly = (a, fill, extra = "") => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;

      // ---------- Isometric car generator ----------
      function car(id, o) {
        const W = 190, c = o.color, out = [], all = [];
        const add = (s, a) => { out.push(s); a && all.push(...a); };
        const prof = o.prof;
        // ground shadow
        add(poly([P(-20, -20, 0), P(o.len + 20, -20, 0), P(o.len + 20, W + 20, 0), P(-20, W + 20, 0)], "#000", `opacity=".45" filter="url(#${id}b)"`));
        // far wheels
        const wheel = (x, y, r) => [...Array(28)].map((_, i) => P(x + r * Math.cos((i / 28) * 6.283), y, o.r + r * Math.sin((i / 28) * 6.283)));
        o.wx.forEach((x) => add(poly(wheel(x, 14, o.r), "#0b0c10")));
        // body strips (extruded profile)
        const strips = [];
        for (let i = 0; i < prof.length; i++) {
          const a = prof[i], b = prof[(i + 1) % prof.length];
          const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L;
          if (nx + nz <= 0.02) continue;
          const q = [P(a[0], 0, a[1]), P(b[0], 0, b[1]), P(b[0], W, b[1]), P(a[0], W, a[1])];
          const fill = a[2] === "g" ? `url(#${id}g)` : sh(c, 0.22 * nz - 0.28 * nx);
          strips.push(q);
          add(poly(q, fill, 'stroke="rgba(0,0,0,.25)" stroke-width="1"'), q);
        }
        // side face
        const side = prof.map((p) => P(p[0], W, p[1]));
        add(poly(side, `url(#${id}s)`, 'stroke="rgba(0,0,0,.3)" stroke-width="1.5"'), side);
        // windows, pillar, door line
        add(poly(o.win.map((p) => P(p[0], W + 0.5, p[1])), `url(#${id}g)`));
        add(`<polyline points="${pts([P(o.pillar, W + 1, o.win[0][1] - 4), P(o.pillar, W + 1, o.win[2][1] + 4)])}" stroke="${sh(c, -0.1)}" stroke-width="12"/>`);
        add(`<polyline points="${pts(o.doors.map((d) => P(d[0], W + 1, d[1])))}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>`);
        // mirror
        add(poly([P(o.mir, W, 96), P(o.mir + 16, W + 22, 100), P(o.mir + 16, W + 22, 112), P(o.mir, W, 110)], sh(c, -0.15)));
        // taillight + side marker
        add(poly([P(1, W + 1, o.tl[0]), P(26, W + 1, o.tl[0] + 2), P(24, W + 1, o.tl[1]), P(3, W + 1, o.tl[1])], "#ff2e4d"));
        // front face details (x = front plane)
        const fx = o.fx, F = (y1, y2, z1, z2) => [P(fx + 0.5, y1, z1), P(fx + 0.5, y2, z1), P(fx + 0.5, y2, z2), P(fx + 0.5, y1, z2)];
        if (o.kind === "bmw") {
          add(poly(F(70, 92, 38, 64), "#07080b", 'stroke="#9aa3b5" stroke-width="2"'));
          add(poly(F(98, 120, 38, 64), "#07080b", 'stroke="#9aa3b5" stroke-width="2"'));
          add(poly(F(14, 58, 58, 66), "#dff1ff"));
          add(poly(F(132, 176, 58, 66), "#dff1ff"));
        } else {
          add(poly(F(20, 170, 40, 54), "#07080b"));
          add(poly(F(16, 174, 60, 63), "#e8f3ff"));
          add(poly(F(14, 52, 58, 68), "#e8f3ff"));
          add(poly(F(138, 176, 58, 68), "#e8f3ff"));
          add(poly(F(86, 104, 46, 50), "#3d7bff"));
        }
        // near wheels (tyre thickness + rim + spokes)
        o.wx.forEach((x) => {
          add(poly(wheel(x, W - 16, o.r), "#0b0c10"));
          add(poly(wheel(x, W + 2, o.r), "#15171d"));
          add(poly(wheel(x, W + 3, o.r * 0.66), o.rim));
          for (let k = 0; k < 5; k++) {
            const t = (k / 5) * 6.283 + 0.3;
            add(`<polyline points="${pts([P(x, W + 4, o.r), P(x + o.r * 0.6 * Math.cos(t), W + 4, o.r + o.r * 0.6 * Math.sin(t))])}" stroke="${sh(o.rim.length > 4 ? o.rim : "#999999", -0.45)}" stroke-width="5"/>`);
          }
          add(poly(wheel(x, W + 5, o.r * 0.16), "#20232b"));
          if (o.caliper) add(poly(wheel(x - o.r * 0.3, W + 2.5, o.r * 0.16), o.caliper));
        });
        // bounds
        const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
        const x0 = Math.min(...xs) - 30, y0 = Math.min(...ys) - 30, w = Math.max(...xs) - x0 + 30, h = Math.max(...ys) - y0 + 60;
        const shine = `<g clip-path="url(#${id}c)"><rect id="${id}sh" x="${x0 - 300}" y="${y0}" width="120" height="${h}" fill="url(#${id}w)" transform="skewX(-25)"/></g>`;
        const defs = `<defs>
          <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(c, 0.18)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${sh(c, -0.35)}"/></linearGradient>
          <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b5378"/><stop offset=".45" stop-color="#0d1422"/><stop offset=".6" stop-color="#22324d"/><stop offset="1" stop-color="#090d16"/></linearGradient>
          <linearGradient id="${id}w" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
          <filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
          <clipPath id="${id}c">${[side, ...strips].map((a) => poly(a, "#fff")).join("")}</clipPath></defs>`;
        return `<svg viewBox="${x0.toFixed(0)} ${y0.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}">${defs}${out.join("")}${shine}</svg>`;
      }

      const GOLF = {
        len: 442, fx: 442, r: 38, wx: [92, 352], pillar: 172, mir: 316,
        prof: [[0, 30], [2, 76], [10, 106], [50, 140], [258, 143, "g"], [332, 100], [418, 88], [440, 72], [442, 34], [430, 20], [14, 20]],
        win: [[22, 106], [58, 135], [252, 138], [322, 102]],
        doors: [[172, 30], [172, 100]], tl: [80, 96], kind: "golf", caliper: "#3d7bff",
      };
      const BMW = {
        len: 480, fx: 480, r: 40, wx: [102, 382], pillar: 250, mir: 334,
        prof: [[0, 32], [0, 72], [24, 90], [150, 132], [276, 135, "g"], [352, 94], [452, 80], [478, 62], [480, 34], [468, 20], [14, 20]],
        win: [[46, 92], [150, 127], [270, 130], [342, 96]],
        doors: [[250, 30], [250, 92]], tl: [74, 88], kind: "bmw", caliper: "#1b4dd8",
      };
