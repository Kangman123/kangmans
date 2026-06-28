function toRad(d) {
  return d * Math.PI / 180;
}

function toDeg(r) {
  return r * 180 / Math.PI;
}

function Modulus(n, m) {
  let hasil = n % m;
  return hasil < 0 ? hasil + m : hasil;
}

// ======================
// FORMAT DMS
// ======================
function DMS(x) {
  const sign = x < 0 ? "-" : "";
  const abs = Math.abs(x);

  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = (((abs - d) * 60 - m) * 60).toFixed(2);

  return `${sign}${d}° ${m}' ${s}"`;
}

// ======================
// FORMAT JAM
// ======================
function toHMS(jam) {
  jam = (jam + 24) % 24;

  let h = Math.floor(jam);
  let m = Math.floor((jam - h) * 60);
  let s = (((jam - h) * 60 - m) * 60).toFixed(2);

  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(5,"0")}`;
}

// ======================
// SOLAR DATA (LEBIH STABIL)
// ======================
function solarData(date) {
  const d = (date - new Date(date.getFullYear(), 0, 0)) / 86400000;

  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;

  const L = q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(2 * toRad(g));

  const e = 23.439 - 0.00000036 * d;

  const decl = toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L))));

  const EoT =
    4 * (q - 0.0057183 - L + 2.466 * Math.sin(2 * toRad(L)) - 0.053 * Math.sin(4 * toRad(L)));

  return { decl, EoT };
}

// ======================
// AZIMUT KIBLAT (SATU SAJA)
// ======================
function AzimutKiblat(LT, BT) {
  const LK = 21 + 25 / 60 + 21.17 / 3600;
  const BK = 39 + 49 / 60 + 34.56 / 3600;

  const SB = BK - BT;

  let AK = Math.atan2(
    Math.sin(toRad(SB)),
    Math.cos(toRad(LT)) * Math.tan(toRad(LK)) -
    Math.sin(toRad(LT)) * Math.cos(toRad(SB))
  );

  return Modulus(toDeg(AK), 360);
}

// ======================
// HISAB KIBLAT FULL
// ======================
function HisabKiblat(namaLokasi, LT, BT, TZ) {

  const now = new Date();
  const { decl, EoT } = solarData(now);

  const az = AzimutKiblat(LT, BT);
  const AQz = Modulus(az + 180, 360);

  // ======================
  // RASHDUL KIBLAT
  // ======================
  const B = 90 - LT;

  const P = toDeg(Math.atan(
    1 / (Math.cos(toRad(B)) * Math.tan(toRad(az)))
  ));

  const Ca = toDeg(Math.acos(
    Math.tan(toRad(decl)) *
    Math.tan(toRad(B)) *
    Math.cos(toRad(P))
  ));

  // pagi
  const WIS1 = -(P - Ca) / 15 + 12;
  const WIB1 = WIS1 - (EoT / 60) + ((TZ * 15 - BT) / 15);

  // sore
  const WIS2 = -(P + Ca) / 15 + 12;
  const WIB2 = WIS2 - (EoT / 60) + ((TZ * 15 - BT) / 15);

  // ======================
  // OUTPUT
  // ======================
  return `
🕋 *HISAB ARAH KIBLAT*

📍 Lokasi
${namaLokasi}
${DMS(LT)} / ${DMS(BT)}
━━━━━━━━━━━━━━
🧭 Arah Kiblat
Azimut       : ${DMS(az)}
Kebalikan    : ${DMS(AQz)}
━━━━━━━━━━━━━━
☀️ Rashdul Kiblat
Tanggal      : ${now.toLocaleDateString("id-ID")}
Deklinasi    : ${DMS(decl)}
EoT          : ${(EoT/60).toFixed(2)} jam
🌅 Waktu
Pagi         : ${toHMS(WIB1)} WIB
Imkan 1      : ${toHMS(WIS1)} WIS
Sore         : ${toHMS(WIB2)} WIB
Imkan 2      : ${toHMS(WIS2)} WIS
━━━━━━━━━━━━━━
🌿*BE-NA-WAWI*🌿
`;
}

export { HisabKiblat };
