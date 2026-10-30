// Kata-kata hikmah: one short quote, big and centred, with who said it.
// Keeps the original template's look: label top left, logo top right, a yellow rule,
// the quote in large yellow type, and a light band with the speaker at the bottom.
TEMPLATES.hikmah = {
  name: "Kata-kata hikmah",
  short: "Hikmah",
  title: (S) => S.nama || "kata-kata-hikmah",
  fields: [
    { type: "section", title: "Petikan" },
    { type: "text", id: "label", label: "Label", ph: "cth. Kata-kata hikmah" },
    { type: "textarea", id: "petikan", label: "Kata-kata", rows: 5, ph: "Tulis petikan di sini", help: "Lebih pendek, lebih besar tulisannya. Sebaik-baiknya bawah 25 patah perkataan." },
    { type: "section", title: "Penceramah", note: "Pilihan. Kosongkan jika tiada." },
    { type: "text", id: "nama", label: "Nama penuh dengan gelaran", opt: true, ph: "cth. Ustaz Ahmad bin Ali" },
    { type: "text", id: "kelayakan", label: "Kelayakan atau jawatan", opt: true, ph: "cth. Graduan Universiti al-Azhar, Mesir" },
    { type: "image", id: "photo", label: "Gambar penceramah", opt: true, sliders: true },
    { type: "section", title: "Gambar latar", tab: "Latar", note: "Pilihan. Gambar akan digelapkan dengan biru Murabbi Ummah supaya tulisan jelas." },
    { type: "image", id: "latar", label: "Gambar latar", opt: true, sliders: true, help: "Contoh: halaman al-Quran, tasbih, masjid. Elakkan gambar orang." },
  ].concat(HUBUNGI_FIELDS),
  sample: {
    label: "Kata-kata hikmah",
    petikan: "Jika waktu tenang kita susah untuk beristighfar bagaimana mungkin ketika marah untuk kita beristighfar.",
    nama: "Ustaz Nur Wan Kecik bin Wan Lebor", kelayakan: "Graduan Universiti al-Azhar, Mesir",
    sosial: ["facebook", "telegram", "instagram", "x", "tiktok"], akaun: "murabbiummah", telefon: "012-345 6789",
  },
  empty: { label: "Kata-kata hikmah", sosial: ["facebook", "instagram"] },

  draw(S, imgs) {
    ctx.fillStyle = BRAND.navy; ctx.fillRect(0, 0, W, H);
    // background: the uploaded photo under a navy wash, or a faint monogram
    if (imgs.latar) {
      drawCover(imgs.latar, 0, 0, W, H, +S.latarZoom || 1, +S.latarX || 0, S.latarY == null ? 0 : +S.latarY);
      ctx.fillStyle = "rgba(27,50,95,.86)"; ctx.fillRect(0, 0, W, H);
    } else if (imgs.muMark) {
      ctx.save(); ctx.globalAlpha = 0.05; ctx.drawImage(imgs.muMark, 640, 230, 520, 520 * imgs.muMark.height / imgs.muMark.width); ctx.restore();
    }

    // header: label left, Murabbi Ummah logo right, yellow rule
    fitText("label", S.label, { x: M, y: 92, w: 560, h: 46, family: HEAD, max: 34, min: 22, lh: 1.2, lines: 1, upper: true, color: BRAND.yellow });
    if (imgs.muLogo) drawContain(imgs.muLogo, W - M - 300, 70, 300, 76, "right");
    ctx.fillStyle = BRAND.yellow; ctx.fillRect(M, 186, W - 2 * M, 2);

    // the quote, as large as fits, centred in its space
    const hasSp = !!((S.nama || "").trim() || imgs.photo);
    const qTop = 232, qBottom = hasSp ? 1036 : 1228;
    const q = { x: M + 10, w: W - 2 * M - 20, h: qBottom - qTop, family: BODY, weight: 700, max: 112, min: 44, lh: 1.12, lines: 11, color: BRAND.yellow, align: "center", ascent: 0.76 };
    const qh = measureText(S.petikan, q);
    fitText("petikan", S.petikan, Object.assign({ y: qTop + Math.max(0, (q.h - qh) / 2) }, q));

    // speaker band
    if (hasSp) {
      const bY = 1090, bH = FOOTER_Y - bY;
      ctx.fillStyle = "#F6F5F1"; ctx.fillRect(0, bY, W, bH);
      let tx = M, tw = W - 2 * M, align = "center";
      if (imgs.photo) { drawPhotoBox(imgs.photo, S, "photo", 300, 1052, 190, 214); tx = 516; tw = W - M - tx; align = "left"; }
      const nm = { x: tx, w: tw, h: 70, family: HEAD, max: 26, min: 16, lh: 1.15, lines: 2, upper: true, color: BRAND.navy, align, ascent: 0.8 };
      const nh = measureText(S.nama, nm), ch = S.kelayakan ? 30 : 0;
      const ny = bY + (bH - (nh + ch)) / 2;
      const n = fitText("nama", S.nama, Object.assign({ y: ny }, nm));
      if (S.kelayakan) fitText("kelayakan", S.kelayakan, { x: tx, y: ny + n.h + 6, w: tw, h: 26, family: BODY, max: 19, min: 14, lh: 1.25, lines: 1, align, color: "rgba(27,50,95,.78)" });
      else OVER.kelayakan = false;
    } else { OVER.nama = false; OVER.kelayakan = false; }

    drawFooter(S);
  },
};
