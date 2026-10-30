// Jadual ceramah: one speaker's programmes for a month, as a table.
const JADUAL_COLS = [["tarikh", "Tarikh"], ["masa", "Masa"], ["tempat", "Tempat"], ["program", "Program"]];
const blankRow = () => ({ tarikh: "", masa: "", tempat: "", program: "" });

TEMPLATES.jadual = {
  name: "Jadual ceramah",
  short: "Jadual",
  title: (S) => (S.jenis || "jadual") + " " + (S.nama || ""),
  fields: [
    { type: "section", title: "Jadual" },
    { type: "choice", id: "jenis", label: "Tajuk", options: ["Jadual ceramah", "Jadual kuliah", "Jadual kelas"] },
    { type: "text", id: "bulan", label: "Bulan", opt: true, ph: "cth. Februari 2026", help: "Kosongkan untuk ikut tarikh baris pertama." },
    { type: "section", title: "Penceramah" },
    { type: "text", id: "nama", label: "Nama penuh dengan gelaran", ph: "cth. Ustaz Ahmad bin Ali" },
    { type: "text", id: "kelayakan", label: "Kelayakan atau jawatan", opt: true, ph: "cth. Graduan Universiti al-Azhar, Mesir" },
    { type: "image", id: "photo", label: "Gambar penceramah", sliders: true, help: "Gambar menegak, muka jelas. PNG berlatar lutsinar pun boleh." },
    { type: "section", title: "Senarai program", tab: "Senarai", note: "Sehingga 8 baris. Hari dikira sendiri dari tarikh." },
    { type: "table", id: "jadual", max: 8, cols: JADUAL_COLS, blank: blankRow },
  ].concat(CONTACT_FIELDS),
  sample: {
    jenis: "Jadual ceramah", bulan: "",
    nama: "Ustaz Nur Wan Kecik bin Wan Lebor", kelayakan: "Graduan Universiti al-Azhar, Mesir",
    jadual: [
      { tarikh: "2026-02-02", masa: "8.00 pagi", tempat: "Surau al-Munawwarah, Bangi", program: "Kelas Mengaji Muslimat" },
      { tarikh: "2026-02-05", masa: "10.00 pagi", tempat: "Surau al-Munawwarah, Bangi", program: "Kuliah Dhuha" },
      { tarikh: "2026-02-09", masa: "8.00 pagi", tempat: "Surau al-Munawwarah, Bangi", program: "Kelas Mengaji Muslimat" },
      { tarikh: "2026-02-12", masa: "10.00 pagi", tempat: "Surau al-Munawwarah, Bangi", program: "Kuliah Dhuha" },
      { tarikh: "2026-02-16", masa: "8.00 pagi", tempat: "Surau al-Munawwarah, Bangi", program: "Kelas Mengaji Muslimat" },
    ],
    isma: true, sosial: ["facebook", "telegram", "instagram", "x", "tiktok"], akaun: "murabbiummah", telefon: "012-345 6789",
  },
  empty: { jenis: "Jadual ceramah", isma: true, sosial: ["facebook", "instagram"], jadual: [blankRow(), blankRow(), blankRow()] },

  draw(S, imgs) {
    ctx.fillStyle = BRAND.navy; ctx.fillRect(0, 0, W, H);
    if (imgs.muMark) { ctx.save(); ctx.globalAlpha = 0.06; ctx.drawImage(imgs.muMark, -130, 300, 340, 340 * imgs.muMark.height / imgs.muMark.width); ctx.restore(); }
    drawHeader(S, imgs);
    drawTag(S.jenis, M, 186);

    // speaker: name left, photo box right
    const pX = 660, pY = 186, pW = W - M - pX, pH = 370;
    drawPhotoBox(imgs.photo, S, "photo", pX, pY, pW, pH);
    const top0 = 270, credH = S.kelayakan ? 74 : 0;
    const name = { x: M, w: pX - M - 40, h: Math.min(3 * 42 * 1.16, pY + pH - top0 - credH), family: HEAD, max: 42, min: 22, lh: 1.16, lines: 3, upper: true, color: BRAND.white, ascent: 0.8 };
    const nameTop = top0 + Math.max(0, (pY + pH - top0 - (measureText(S.nama, name) + credH)) / 2 - 16);
    const n = fitText("nama", S.nama, Object.assign({ y: nameTop }, name));
    if (S.kelayakan) fitText("kelayakan", S.kelayakan, { x: M, y: nameTop + n.h + 14, w: pX - M - 40, h: 62, family: BODY, max: 24, min: 17, lh: 1.3, lines: 2, color: "rgba(255,255,255,.86)" });
    else OVER.kelayakan = false;

    // month heading: typed, or taken from the first dated row
    const rows = (S.jadual || []).filter((r) => r.tarikh || (r.masa || "").trim() || (r.tempat || "").trim() || (r.program || "").trim());
    const first = rows.find((r) => r.tarikh);
    const bulan = (S.bulan || "").trim() || (first ? bulanTahun(first.tarikh) : "");
    const hY = 606;
    if (bulan) drawSectionHead(bulan, M, hY, BRAND.yellow);
    OVER.bulan = false;

    // table: small column labels, then rows with every other row lightly banded
    const cols = [["tarikh", 0, 200], ["masa", 205, 140], ["tempat", 355, 300], ["program", 665, 255]];
    const tTop = hY + 66;
    setFont(15, BODY, 700); ctx.fillStyle = "rgba(233,167,66,.9)";
    if (hasLS) ctx.letterSpacing = "2px";
    cols.forEach(([k, cx], i) => ctx.fillText(upper(JADUAL_COLS[i][1]), M + 20 + cx, tTop + 14));
    if (hasLS) ctx.letterSpacing = "0px";
    const rowsTop = tTop + 30, avail = FOOTER_Y - 34 - rowsTop;
    const rowH = Math.min(72, avail / Math.max(rows.length, 1));
    // one text size for the whole table: the largest at which every cell fits
    // (date and time on one line, place and programme on up to two)
    const LH = 1.2, maxLines = { tarikh: 1, masa: 1, tempat: 2, program: 2 };
    const cellText = (r, k) => (k === "tarikh" ? tarikhPendek(r.tarikh) : r[k] || "");
    const fits = (s) => rows.every((r) => cols.every(([k, , cw]) => {
      setFont(s, BODY, k === "tarikh" ? 600 : 400);
      const lines = wrap(cellText(r, k), cw - 14, 0);
      return lines.length <= maxLines[k] && lines.length * s * LH <= rowH - 10 && lines.every((l) => textW(l, 0) <= cw - 14);
    }));
    let fs = 24;
    while (fs > 16 && !fits(fs)) fs--;
    OVER.jadual = !fits(fs);
    rows.forEach((r, i) => {
      const y = rowsTop + i * rowH;
      if (i % 2 === 0) { ctx.fillStyle = "rgba(255,255,255,.09)"; rr(M, y + 3, W - 2 * M, rowH - 6, [12, 12, 12, 12]); ctx.fill(); }
      cols.forEach(([k, cx, cw]) => {
        setFont(fs, BODY, k === "tarikh" ? 600 : 400); ctx.fillStyle = BRAND.white;
        const lines = wrap(cellText(r, k), cw - 14, 0).slice(0, maxLines[k]);
        let ly = y + (rowH - lines.length * fs * LH) / 2;
        for (const l of lines) { ctx.fillText(l, M + 20 + cx, ly + fs * (LH - 1) / 2 + fs * 0.78); ly += fs * LH; }
      });
    });
    if (!rows.length) {
      setFont(22, BODY, 500); ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.textAlign = "center";
      ctx.fillText("Senarai program akan dipaparkan di sini", W / 2, rowsTop + 80); ctx.textAlign = "left";
    }

    drawFooter(S);
  },
};
