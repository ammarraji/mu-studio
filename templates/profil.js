// Profil Murabbi: who the murabbi is, their background, and what they offer the community.
const TAWARAN_ICONS = [["quran", "Al-Quran"], ["buku", "Buku"], ["bahasa", "Bahasa"], ["kumpulan", "Kumpulan"], ["kaunseling", "Kaunseling"], ["ceramah", "Ceramah"]];

TEMPLATES.profil = {
  name: "Profil murabbi",
  short: "Profil",
  title: (S) => S.nama,
  fields: [
    { type: "section", title: "Murabbi" },
    { type: "text", id: "cawangan", label: "Cawangan", ph: "cth. Bangi" },
    { type: "text", id: "nama", label: "Nama penuh dengan gelaran", ph: "cth. Ustaz Ahmad bin Ali" },
    { type: "text", id: "kelayakan", label: "Kelayakan utama", opt: true, ph: "cth. Graduan Universiti al-Azhar, Mesir" },
    { type: "image", id: "photo", label: "Gambar murabbi", sliders: true, help: "Gambar menegak, muka jelas. PNG berlatar lutsinar pun boleh." },
    { type: "section", title: "Latar belakang", note: "Satu baris satu perkara. Mula dengan - untuk butiran di bawahnya." },
    { type: "textarea", id: "pendidikan", label: "Pendidikan", rows: 6, ph: "Graduan Universiti Malaya\n- Master Pendidikan Islam" },
    { type: "textarea", id: "kemahiran", label: "Kemahiran", rows: 4, ph: "Sirah\nTafsir al-Quran" },
    { type: "textarea", id: "jawatan", label: "Jawatan di komuniti", opt: true, rows: 3, ph: "Pengerusi Surau al-Munawwarah, Bangi" },
    { type: "section", title: "Tawaran pada komuniti", tab: "Tawaran", note: "Sehingga 3 kelas atau khidmat. Kosongkan jika tiada." },
    { type: "offer", id: "tawaran", count: 3, icons: TAWARAN_ICONS },
  ].concat(CONTACT_FIELDS),
  sample: {
    cawangan: "Bangi", nama: "Ustaz Nur Wan Kecik bin Wan Lebor", kelayakan: "Graduan Universiti al-Azhar, Mesir",
    pendidikan: "Graduan Universiti Malaya\n- Master Pendidikan Islam\nGraduan Universiti al-Azhar, Kaherah, Mesir\n- Ijazah Sarjana Muda, Syariah Islamiah\nMaahad Imtiyaz, Ipoh, Perak\n- Sijil Tinggi Agama Malaysia",
    kemahiran: "Sirah\nTafsir al-Quran\nMuamalat",
    jawatan: "Pengerusi Surau al-Munawwarah, Bangi",
    tawaran: [{ icon: "quran", text: "Kelas Mengaji Wanita" }, { icon: "bahasa", text: "Kelas Bahasa Arab" }, { icon: "buku", text: "" }],
    isma: true, sosial: ["facebook", "telegram", "instagram", "x", "tiktok"], akaun: "murabbiummah", telefon: "012-345 6789",
  },
  empty: { isma: true, sosial: ["facebook", "instagram"], tawaran: [{ icon: "quran", text: "" }, { icon: "bahasa", text: "" }, { icon: "buku", text: "" }] },

  draw(S, imgs) {
    ctx.fillStyle = BRAND.navy; ctx.fillRect(0, 0, W, H);
    drawHeader(S, imgs);

    // tag, with the branch name on its own line below it
    const pX = 600, pY = 186, pW = W - M - pX, pH = 440;
    drawTag("Profil murabbi", M, 186);
    const hasCaw = !!(S.cawangan || "").trim();
    if (hasCaw) fitText("cawangan", "Cawangan " + S.cawangan.trim(), { x: M, y: 254, w: pX - M - 40, h: 38, family: BODY, weight: 600, max: 30, min: 20, lh: 1.25, lines: 1, color: BRAND.yellow });
    else OVER.cawangan = false;

    // name and credential left, photo box right
    drawPhotoBox(imgs.photo, S, "photo", pX, pY, pW, pH);
    const top0 = hasCaw ? 322 : 268, credH = S.kelayakan ? 80 : 0;
    const name = { x: M, w: pX - M - 40, h: Math.min(4 * 46 * 1.16, pY + pH - top0 - credH), family: HEAD, max: 46, min: 24, lh: 1.16, lines: 4, upper: true, color: BRAND.white, ascent: 0.8 };
    const nameTop = top0 + Math.max(0, (pY + pH - top0 - (measureText(S.nama, name) + credH)) / 2 - 20);
    const n = fitText("nama", S.nama, Object.assign({ y: nameTop }, name));
    if (S.kelayakan) fitText("kelayakan", S.kelayakan, { x: M, y: nameTop + n.h + 16, w: pX - M - 40, h: 66, family: BODY, max: 24, min: 17, lh: 1.3, lines: 2, color: "rgba(255,255,255,.86)" });
    else OVER.kelayakan = false;

    // background: two columns of bullet lists
    const offers = (S.tawaran || []).filter((o) => (o.text || "").trim()).slice(0, 3);
    const listTop = 672, listBottom = offers.length ? 1060 : 1240;
    drawSectionHead("Latar belakang", M, listTop, BRAND.yellow);
    const g = (title, text) => ({ title, items: parseList(text) });
    const left = [g("Pendidikan", S.pendidikan)].filter((x) => x.items.length);
    const right = [g("Kemahiran", S.kemahiran), g("Jawatan di komuniti", S.jawatan)].filter((x) => x.items.length);
    drawColumns("latar", [{ x: M, w: 430, groups: left }, { x: 560, w: W - M - 560, groups: right }], listTop + 58, listBottom - listTop - 70,
      { title: BRAND.yellow, item: BRAND.white, sub: "rgba(255,255,255,.78)" });
    OVER.pendidikan = OVER.kemahiran = OVER.jawatan = OVER.latar;

    // what they offer: yellow band with up to three items
    if (offers.length) {
      const bY = 1072, bH = FOOTER_Y - bY;
      ctx.fillStyle = BRAND.yellow; ctx.fillRect(0, bY, W, bH);
      drawSectionHead("Tawaran pada komuniti", M, bY + 26, BRAND.navy);
      const colW = (W - 2 * M) / 3, iy = bY + 104;
      offers.forEach((o, i) => {
        const x = M + i * colW;
        ctx.fillStyle = BRAND.navy; ctx.beginPath(); ctx.arc(x + 34, iy + 34, 34, 0, Math.PI * 2); ctx.fill();
        strokeIcon(o.icon || "buku", x + 14, iy + 14, 40, BRAND.yellow, 2.2);
        fitText("tawaran" + i, o.text, { x: x + 84, y: iy + 2, w: colW - 100, h: 64, family: BODY, weight: 700, max: 24, min: 16, lh: 1.25, lines: 2, color: BRAND.navy });
      });
      OVER.tawaran = [0, 1, 2].some((i) => OVER["tawaran" + i]);
    } else OVER.tawaran = false;

    drawFooter(S);
  },
};
