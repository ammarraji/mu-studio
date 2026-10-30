// Murabbi Ummah poster engine: the canvas helpers every template shares.
// A template only describes its form fields and draws its own layout with these helpers.

const BRAND = { navy: "#1B325F", navyDeep: "#14264A", yellow: "#E9A742", white: "#FFFFFF" };
const HEAD = '"Krona One"', BODY = "Inter";
const W = 1080, H = 1350, M = 80;   // poster size and side margin
const FOOTER_Y = 1272;

const TEMPLATES = {};               // filled by templates/*.js
const OVER = {};                    // field id -> true when its text does not fit

const HARI = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
function tarikhPoster(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "";
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()} (${HARI[d.getDay()]})`;
}
function loadImg(src) {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
const upper = (t) => (t || "").toLocaleUpperCase("ms");
const BULAN_PENDEK = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];
// "2026-02-02" -> "2 Feb (Isnin)"
function tarikhPendek(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "";
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} (${HARI[d.getDay()]})`;
}
// "2026-02-02" -> "Februari 2026"
function bulanTahun(iso) {
  const m = /^(\d{4})-(\d{2})/.exec(iso || "");
  return m ? `${BULAN[+m[2] - 1]} ${m[1]}` : "";
}

/* ---------- canvas ---------- */
const cv = document.getElementById("poster");
const ctx = cv.getContext("2d");
const hasLS = "letterSpacing" in ctx;
// smooth, high-quality scaling so thin lines in logos stay intact when shrunk
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

function setFont(size, family, weight) { ctx.font = `${weight || 400} ${size}px ${family}`; }
function textW(t, track) { return ctx.measureText(t).width + (hasLS ? 0 : (track || 0) * Math.max(0, t.length - 1)); }
function wrap(text, maxW, track) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (textW(test, track) <= maxW || !line) line = test; else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}
function drawLine(l, x, base, track) {
  if (hasLS || !track) { ctx.fillText(l, x, base); return; }
  let cx = x; for (const ch of l) { ctx.fillText(ch, cx, base); cx += ctx.measureText(ch).width + track; }
}
// Shrink the font until the text fits its box; record overflow so the form can warn.
// o: x, y, w, h, family, weight, max, min, lh, lines, upper, color, align, track (em), ascent
function fitText(key, text, o) {
  const t = o.upper ? upper(text) : String(text || "");
  if (!t.trim()) { OVER[key] = false; return { h: 0, lines: [], size: o.max }; }
  let size = o.max, lines, ok = false;
  for (; size >= o.min; size -= 1) {
    setFont(size, o.family, o.weight);
    const track = (o.track || 0) * size;
    if (hasLS) ctx.letterSpacing = track + "px";
    lines = wrap(t, o.w, track);
    if (lines.length <= o.lines && lines.length * size * o.lh <= o.h + 0.5 && lines.every((l) => textW(l, track) <= o.w)) { ok = true; break; }
  }
  if (!ok) { size = o.min; setFont(size, o.family, o.weight); lines = wrap(t, o.w, (o.track || 0) * size).slice(0, o.lines); }
  OVER[key] = !ok;
  const track = (o.track || 0) * size;
  if (hasLS) ctx.letterSpacing = track + "px";
  ctx.fillStyle = o.color; ctx.textBaseline = "alphabetic";
  let y = o.y;
  for (const l of lines) {
    const lw = textW(l, track);
    const x = o.align === "right" ? o.x + o.w - lw : o.align === "center" ? o.x + (o.w - lw) / 2 : o.x;
    drawLine(l, x, y + size * (o.lh - 1) / 2 + size * (o.ascent || 0.78), track);
    y += size * o.lh;
  }
  if (hasLS) ctx.letterSpacing = "0px";
  return { h: lines.length * size * o.lh, lines, size };
}
// How tall a text would be at its largest size that fits (no drawing), for centring blocks.
function measureText(text, o) {
  const t = o.upper ? upper(text) : String(text || "");
  if (!t.trim()) return 0;
  let size = o.max, lines = [];
  for (; size >= o.min; size--) { setFont(size, o.family, o.weight); lines = wrap(t, o.w, 0); if (lines.length <= o.lines && lines.length * size * o.lh <= o.h) break; }
  return Math.min(lines.length * Math.max(size, o.min) * o.lh, o.h);
}

/* ---------- shapes and images ---------- */
// rectangle with a radius per corner: [top-left, top-right, bottom-right, bottom-left]
function rr(x, y, w, h, r) {
  const [a, b, c, d] = r;
  ctx.beginPath();
  ctx.moveTo(x + a, y); ctx.lineTo(x + w - b, y); ctx.arcTo(x + w, y, x + w, y + b, b);
  ctx.lineTo(x + w, y + h - c); ctx.arcTo(x + w, y + h, x + w - c, y + h, c);
  ctx.lineTo(x + d, y + h); ctx.arcTo(x, y + h, x, y + h - d, d);
  ctx.lineTo(x, y + a); ctx.arcTo(x, y, x + a, y, a); ctx.closePath();
}
function drawCover(img, x, y, w, h, zoom, px, py) {
  const s = Math.max(w / img.width, h / img.height) * (zoom || 1);
  const iw = img.width * s, ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2 + (px || 0) * (iw - w) / 2, y + (h - ih) / 2 + (py || 0) * (ih - h) / 2, iw, ih);
}
function drawContain(img, x, y, w, h, align) {
  const s = Math.min(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  const dx = align === "right" ? x + w - iw : align === "left" ? x : x + (w - iw) / 2;
  ctx.drawImage(img, dx, y + (h - ih) / 2, iw, ih);
  return iw;
}

/* ---------- icons (24×24 line drawings) ---------- */
const ICON = {
  tarikh: "M4.5 6h15A1.5 1.5 0 0 1 21 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-11A1.5 1.5 0 0 1 4.5 6zM3 10.5h18M8 3.5v4M16 3.5v4",
  masa: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7.5V12l3.2 2",
  tempat: "M12 21s-6.8-6-6.8-11.3a6.8 6.8 0 0 1 13.6 0C18.8 15 12 21 12 21zM12 7.2a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z",
  buku: "M3 5.8c3-1.2 6-1 9 1v12.7c-3-2-6-2.2-9-1zM21 5.8c-3-1.2-6-1-9 1v12.7c3-2 6-2.2 9-1z",
  quran: "M6 3.5h11.5A1.5 1.5 0 0 1 19 5v14.5H7.5A1.5 1.5 0 0 1 6 18zM6 18a1.5 1.5 0 0 1 1.5-1.5H19M14 7.3a2.7 2.7 0 1 0 0 4.6a3.2 3.2 0 1 1 0-4.6z",
  bahasa: "M4 5h16v10.5H9.5L4 19.5zM8 9h8M8 12h5",
  kumpulan: "M9 11a3 3 0 1 0 0-6a3 3 0 1 0 0 6zM3.5 19.5a5.5 5.5 0 0 1 11 0M16 11a2.6 2.6 0 1 0 0-5.2M17.2 14.3a4.6 4.6 0 0 1 3.3 4.4",
  kaunseling: "M12 19.5s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.3c0 4.9-7 9.2-7 9.2z",
  ceramah: "M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3zM6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M9 20h6",
};
const ICON_PATHS = Object.fromEntries(Object.entries(ICON).map(([k, d]) => [k, new Path2D(d)]));
function strokeIcon(name, x, y, size, color, width) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color; ctx.lineWidth = width || 2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(ICON_PATHS[name]); ctx.restore();
}
function fillIcon(d, x, y, size, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24); ctx.fillStyle = color; ctx.fill(new Path2D(d)); ctx.restore();
}

/* ---------- shared poster parts ---------- */
// Murabbi Ummah logo left (all-yellow version, the guide's colour on navy); partner logos right.
function drawHeader(S, imgs) {
  const y = 56, h = 80;
  if (imgs.muLogo) drawContain(imgs.muLogo, M, y, 340, h, "left");
  let rx = W - M;
  for (const img of [imgs.masjid, S.isma ? imgs.isma : null]) {
    if (!img) continue;
    rx -= drawContain(img, rx - 170, y - 12, 170, h + 24, "right") + 32;
  }
}
// yellow tag with a big rounded corner, echoing the logo strokes
function drawTag(text, x, y) {
  const t = upper(text).trim();
  if (!t) return 0;
  setFont(24, HEAD); const tw = ctx.measureText(t).width;
  ctx.fillStyle = BRAND.yellow; rr(x, y, tw + 48, 52, [26, 26, 26, 0]); ctx.fill();
  ctx.fillStyle = BRAND.navy; ctx.fillText(t, x + 24, y + 36);
  return tw + 48;
}
// speaker photo in a white rounded box, with a soft shadow
function drawPhotoBox(img, S, key, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = "rgba(8,18,40,.35)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
  ctx.fillStyle = BRAND.white; rr(x, y, w, h, [24, 24, 24, 24]); ctx.fill();
  ctx.restore();
  ctx.save(); rr(x, y, w, h, [24, 24, 24, 24]); ctx.clip();
  if (img) drawCover(img, x, y, w, h, +S[key + "Zoom"] || 1, +S[key + "X"] || 0, S[key + "Y"] == null ? -0.4 : +S[key + "Y"]);
  else {
    ctx.fillStyle = "rgba(27,50,95,.12)";
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.42, h * 0.18, 0, Math.PI * 2); ctx.fill();
    rr(x + w / 2 - w * 0.37, y + h * 0.66, w * 0.74, h * 0.5, [w * 0.37, w * 0.37, 0, 0]); ctx.fill();
    setFont(22, BODY, 600); ctx.fillStyle = BRAND.navy; ctx.textAlign = "center"; ctx.fillText("Gambar penceramah", x + w / 2, y + 58); ctx.textAlign = "left";
  }
  ctx.restore();
}
// form fields most templates share
const SOSIAL = [["facebook", "Facebook"], ["telegram", "Telegram"], ["instagram", "Instagram"], ["x", "X"], ["tiktok", "TikTok"]];
const LOGO_FIELDS = [
  { type: "section", title: "Logo rakan" },
  { type: "check", id: "isma", label: "Logo ISMA" },
  { type: "image", id: "masjid", label: "Logo masjid atau penganjur", opt: true, contain: true },
];
const HUBUNGI_FIELDS = [
  { type: "section", title: "Hubungi" },
  { type: "multi", id: "sosial", label: "Akaun media sosial", opt: true, options: SOSIAL },
  { type: "text", id: "akaun", ph: "cth. murabbiummah" },
  { type: "text", id: "telefon", label: "No. telefon", opt: true, ph: "cth. 012-345 6789", input: "tel" },
];
const CONTACT_FIELDS = LOGO_FIELDS.concat(HUBUNGI_FIELDS);

// footer: social accounts left, phone right
function drawFooter(S) {
  const fY = FOOTER_Y, fH = H - fY, cy = fY + fH / 2;
  ctx.fillStyle = BRAND.navyDeep; ctx.fillRect(0, fY, W, fH);
  let fx = M;
  const akaun = (S.akaun || "").trim(), tel = (S.telefon || "").trim(), sos = S.sosial || [];
  if (akaun && sos.length) {
    for (const key of SOSIAL.map((s) => s[0]).filter((k) => sos.includes(k))) {
      ctx.fillStyle = BRAND.yellow; ctx.beginPath(); ctx.arc(fx + 17, cy, 17, 0, Math.PI * 2); ctx.fill();
      fillIcon(SOCIAL_ICONS[key], fx + 7, cy - 10, 20, BRAND.navyDeep);
      fx += 42;
    }
    fx += 10;
  }
  if (tel) fitText("telefon", "HUBUNGI: " + tel, { x: W / 2 + 40, y: cy - 16, w: W / 2 - 40 - M, h: 32, family: BODY, weight: 700, max: 24, min: 16, lh: 1.25, lines: 1, align: "right", color: BRAND.yellow });
  else OVER.telefon = false;
  if (akaun) fitText("akaun", akaun, { x: fx, y: cy - 16, w: (tel ? W / 2 + 20 : W - M) - fx, h: 32, family: BODY, weight: 700, max: 24, min: 15, lh: 1.25, lines: 1, color: BRAND.yellow });
  else OVER.akaun = false;
}
// section heading with a rule running to the right edge
function drawSectionHead(text, x, y, color) {
  setFont(26, HEAD); ctx.fillStyle = color;
  const t = upper(text); ctx.fillText(t, x, y + 28);
  const lx = x + ctx.measureText(t).width + 28;
  ctx.fillRect(lx, y + 17, W - M - lx, 2);
}

/* ---------- bullet lists ---------- */
// "Graduan Universiti Malaya\n- Master Pendidikan Islam" -> items, with "-" lines as sub-items
function parseList(text) {
  return String(text || "").split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => /^[-–•]\s*/.test(l) ? { sub: true, text: l.replace(/^[-–•]\s*/, "") } : { sub: false, text: l });
}
function layoutList(groups, s, w) {
  const out = []; let y = 0;
  groups.forEach((g, gi) => {
    if (gi) y += s * 0.85;
    const ts = Math.round(s * 1.08);
    setFont(ts, BODY, 700);
    for (const l of wrap(g.title, w, 0)) { out.push({ kind: "title", text: l, y, size: ts }); y += ts * 1.3; }
    y += s * 0.2;
    g.items.forEach((it) => {
      const fs = it.sub ? Math.round(s * 0.92) : s, ind = it.sub ? 54 : 26;
      setFont(fs, BODY, 400);
      wrap(it.text, w - ind, 0).forEach((l, i) => { out.push({ kind: it.sub ? "sub" : "item", text: l, y, size: fs, ind, first: i === 0 }); y += fs * 1.34; });
      y += s * 0.18;
    });
  });
  return { out, h: y };
}
// draw several columns of grouped lists at one shared size that fits every column
function drawColumns(key, cols, y, h, colors) {
  // 18px is the smallest list text that stays readable when the poster is viewed on a phone
  const MAX = 24, MIN = 18;
  let s = MAX, lays;
  for (; s >= MIN; s--) { lays = cols.map((c) => layoutList(c.groups, s, c.w)); if (lays.every((l) => l.h <= h)) break; }
  OVER[key] = s < MIN;
  if (s < MIN) { s = MIN; lays = cols.map((c) => layoutList(c.groups, s, c.w)); }
  cols.forEach((c, i) => {
    for (const r of lays[i].out) {
      if (r.y + r.size * 1.3 > h + 2) break;     // never spill out of the box
      const base = y + r.y + r.size * 0.95;
      if (r.kind === "title") { setFont(r.size, BODY, 700); ctx.fillStyle = colors.title; ctx.fillText(r.text, c.x, base); continue; }
      setFont(r.size, BODY, 400); ctx.fillStyle = r.kind === "sub" ? colors.sub : colors.item;
      if (r.first) {
        ctx.beginPath(); ctx.arc(c.x + r.ind - 15, base - r.size * 0.32, r.kind === "sub" ? 4 : 4.5, 0, Math.PI * 2);
        if (r.kind === "sub") { ctx.strokeStyle = colors.sub; ctx.lineWidth = 1.6; ctx.stroke(); } else { ctx.fillStyle = colors.item; ctx.fill(); }
      }
      ctx.fillStyle = r.kind === "sub" ? colors.sub : colors.item;
      ctx.fillText(r.text, c.x + r.ind, base);
    }
  });
}
