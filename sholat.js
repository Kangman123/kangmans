// ======================
// KONVERSI
// ======================
function toRad(d) {
  return d * Math.PI / 180;
}

function toDeg(r) {
  return r * 180 / Math.PI;
}

// ======================
// FORMAT DMS
// ======================
function toDMS(decimal) {
  const sign = decimal < 0 ? "-" : "";
  decimal = Math.abs(decimal);

  const d = Math.floor(decimal);
  const mFloat = (decimal - d) * 60;
  const m = Math.floor(mFloat);
  const s = ((mFloat - m) * 60).toFixed(2);

  return `${sign}${d}° ${m}' ${s}"`;
}

// ======================
// FORMAT EOT
// ======================
function formatEoT(minutes) {
  const sign = minutes < 0 ? "-" : "";
  minutes = Math.abs(minutes);

  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);

  return `${sign}${m}m ${s}d`;
}

// ======================
// FORMAT JAM
// ======================
function formatJam(jam) {
  jam = (jam + 24) % 24;

  let j = Math.floor(jam);
  let m = Math.floor((jam - j) * 60);
  let s = Math.round((((jam - j) * 60) - m) * 60);

  if (s >= 60) {
    s = 0;
    m++;
  }

  if (m >= 60) {
    m = 0;
    j++;
  }

  return `${String(j).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ======================
// HARI & PASARAN
// ======================
function namaHariPasaran(date) {
  const hari = [
    "Ahad",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jum'at",
    "Sabtu"
  ];

  const pasaran = [
    "Legi",
    "Pahing",
    "Pon",
    "Wage",
    "Kliwon"
  ];

  const hariName = hari[date.getDay()];

  const jd =
    Math.floor(date.getTime() / 86400000) + 2440588;

  const pasaranName = pasaran[jd % 5];

  return `${hariName} ${pasaranName}`;
}

// ======================
// DATA MATAHARI
// ======================
function solarData(tanggal) {
  const d = (tanggal - new Date(tanggal.getFullYear(), 0, 0)) / 86400000;

  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;

  const L = q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(2 * toRad(g));
  const e = 23.439 - 0.00000036 * d;

  const decl = toDeg(
    Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L)))
  );

  const EoT =
    4 *
    (q -
      0.0057183 -
      L +
      2.466 * Math.sin(2 * toRad(L)) -
      0.053 * Math.sin(4 * toRad(L)));

  return { decl, EoT };
}

// ======================
// FUNGSI UTAMA
// ======================
function waktuSholatFalak(LT, BT, TT, TZ, namaLokasi="Lokasi Tidak Diketahui") {
  const today = new Date();
  const hariPasaran = namaHariPasaran(today);

const tanggal =
`${hariPasaran}, ${today.toLocaleDateString("id-ID")}`;

  const { decl, EoT } = solarData(today);

  const WIS_DZUHUR = 12;
  const WIB_DZUHUR =
    WIS_DZUHUR -
    (EoT / 60) +
    ((TZ * 15 - BT) / 15);

  const F =
    -Math.tan(toRad(LT)) *
    Math.tan(toRad(decl));

  const G =
    Math.cos(toRad(LT)) *
    Math.cos(toRad(decl));

  const dip = (1.76 / 60) * Math.sqrt(TT);
  const semiDiameter = 16 / 60;
  const h = -(semiDiameter + (34.5 / 60) + dip) - 0.0024;

  function sudutWaktu(sudut) {
    return (
      toDeg(
        Math.acos(
          (F + Math.sin(toRad(sudut))) / G
        )
      ) / 15
    );
  }

  const subuh = WIB_DZUHUR - sudutWaktu(-20);
  const terbit = WIB_DZUHUR - sudutWaktu(h);
  const dhuha = WIB_DZUHUR - sudutWaktu(4.5);

  const B = Math.abs(LT - decl);
  const H = toDeg(
    Math.atan(
      1 / (Math.tan(toRad(B)) + 1)
    )
  );

  const t = toDeg(
    Math.acos(
      (F + Math.sin(toRad(H))) / G
    )
  ) / 15;

  const ashar = WIB_DZUHUR + t;
  const maghrib = WIB_DZUHUR + sudutWaktu(h);
  const isya = WIB_DZUHUR + sudutWaktu(-18);
  const imsak = subuh - (10 / 60);

 return `
🕌 *JADWAL SHOLAT HARIAN*

📍 Lokasi
${namaLokasi}

📅 ${tanggal}
━━━━━━━━━━━━━━
☀️ *Data Hisab*
▫️ Deklinasi   : ${toDMS(decl)}
▫️ EoT         : ${formatEoT(EoT)}
━━━━━━━━━━━━━━
🌙 *Waktu Sholat*

🌘 Imsak     : ${formatJam(imsak)} WIB
🌅 Subuh     : ${formatJam(subuh)} WIB
🌄 Terbit    : ${formatJam(terbit)} WIB
🌤️ Dhuha     : ${formatJam(dhuha)} WIB
☀️ Dzuhur    : ${formatJam(WIB_DZUHUR)} WIB
🌇 Ashar     : ${formatJam(ashar)} WIB
🌆 Maghrib   : ${formatJam(maghrib)} WIB
🌃 Isya      : ${formatJam(isya)} WIB
━━━━━━━━━━━━━━
🌿*BE-NA-WAWI*🌿
`;
}

export { waktuSholatFalak };
