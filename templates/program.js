// Poster program: ceramah, kuliah, kelas, tuisyen.
TEMPLATES.program = {
  name: "Poster program",
  short: "Program",
  title: (S) => S.tajuk,
  fields: [
    { type: "section", title: "Program" },
    { type: "choice", id: "jenis", label: "Jenis program", options: ["Kuliah", "Ceramah", "Kelas", "Tuisyen", "Forum"] },
    { type: "text", id: "tajuk", label: "Tajuk", ph: "cth. Al-Quran & Ramadan" },
    { type: "text", id: "siri", label: "Siri atau subtajuk", opt: true, ph: "cth. Siri 1: Rasulullah dan Sahabat bersama Al-Quran" },
    { type: "section", title: "Penceramah" },
    { type: "text", id: "nama", label: "Nama penuh dengan gelaran", ph: "cth. Ustaz Ahmad bin Ali" },
    { type: "text", id: "kelayakan", label: "Kelayakan atau jawatan", opt: true, ph: "cth. Graduan Universiti al-Azhar, Mesir" },
    { type: "image", id: "photo", label: "Gambar penceramah", sliders: true, help: "Gambar menegak, muka jelas. PNG berlatar lutsinar pun boleh." },
    { type: "section", title: "Tarikh dan tempat" },
    { type: "date", id: "tarikh", label: "Tarikh" },
    { type: "text", id: "masa", label: "Masa", ph: "cth. 7.45 malam (selepas Maghrib)" },
    { type: "text", id: "tempat", label: "Tempat", ph: "cth. Masjid al-Hasanah, Bangi" },
  ].concat(CONTACT_FIELDS),
  sample: {
    jenis: "Kuliah", tajuk: "Al-Quran & Ramadan", siri: "Siri 1: Rasulullah dan Sahabat bersama Al-Quran",
    nama: "Ustaz Nur Wan Kecik bin Wan Lebor", kelayakan: "Graduan Universiti al-Azhar, Mesir",
    tarikh: "2026-02-28", masa: "7.45 malam (selepas Maghrib)", tempat: "Masjid al-Hasanah, Bangi",
    isma: true, sosial: ["facebook", "telegram", "instagram", "x", "tiktok"], akaun: "murabbiummah", telefon: "012-345 6789",
  },
  empty: { jenis: "Kuliah", isma: true, sosial: ["facebook", "instagram"] },

  draw(S, imgs) {
    ctx.fillStyle = BRAND.navy; ctx.fillRect(0, 0, W, H);
    if (imgs.muMark) { ctx.save(); ctx.globalAlpha = 0.06; ctx.drawImage(imgs.muMark, -130, 540, 380, 380 * imgs.muMark.height / imgs.muMark.width); ctx.restore(); }
    drawHeader(S, imgs);
    drawTag(S.jenis, M, 196);

    // title and series line
    const hasSiri = !!(S.siri || "").trim();
    const t = fitText("tajuk", S.tajuk, { x: M, y: 278, w: W - 2 * M, h: hasSiri ? 196 : 262, family: HEAD, max: 86, min: 40, lh: 1.1, lines: 3, upper: true, color: BRAND.white, ascent: 0.8 });
    if (hasSiri) fitText("siri", S.siri, { x: M, y: 278 + t.h + 18, w: W - 2 * M, h: 80, family: BODY, weight: 600, max: 30, min: 20, lh: 1.3, lines: 2, color: BRAND.yellow });
    else OVER.siri = false;

    // speaker: photo box right, name block left, centred on the box
    const pX = 590, pY = 600, pW = W - M - pX, pH = 456;
    drawPhotoBox(imgs.photo, S, "photo", pX, pY, pW, pH);
    const name = { x: M, w: pX - M - 40, h: 4 * 40 * 1.18, family: HEAD, max: 40, min: 22, lh: 1.18, lines: 4, upper: true, color: BRAND.white, ascent: 0.8 };
    const top = pY + (pH - (44 + measureText(S.nama, name) + (S.kelayakan ? 70 : 0))) / 2;
    setFont(20, BODY, 700); ctx.fillStyle = BRAND.yellow;
    if (hasLS) ctx.letterSpacing = "4px"; ctx.fillText("BERSAMA", M, top + 20); if (hasLS) ctx.letterSpacing = "0px";
    const n = fitText("nama", S.nama, Object.assign({ y: top + 44 }, name));
    if (S.kelayakan) fitText("kelayakan", S.kelayakan, { x: M, y: top + 44 + n.h + 14, w: pX - M - 40, h: 64, family: BODY, max: 24, min: 17, lh: 1.3, lines: 2, color: "rgba(255,255,255,.86)" });
    else OVER.kelayakan = false;

    // details band
    const bY = 1080, bH = FOOTER_Y - bY;
    ctx.fillStyle = BRAND.yellow; ctx.fillRect(0, bY, W, bH);
    const rows = [["tarikh", tarikhPoster(S.tarikh)], ["masa", S.masa], ["tempat", S.tempat]].filter(([, v]) => (v || "").trim());
    const rowH = 54, startY = bY + (bH - rows.length * rowH) / 2;
    rows.forEach(([k, v], i) => {
      const ry = startY + i * rowH;
      strokeIcon(k, M, ry + 9, 36, BRAND.navy);
      fitText(k, v, { x: M + 58, y: ry + 4, w: W - 2 * M - 58, h: 46, family: BODY, weight: 700, max: 34, min: 22, lh: 1.25, lines: 1, color: BRAND.navy });
    });
    for (const k of ["tarikh", "masa", "tempat"]) if (!rows.some(([r]) => r === k)) OVER[k] = false;

    drawFooter(S);
  },
};
