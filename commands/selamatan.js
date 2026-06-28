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

  const hariName =
    hari[date.getDay()];

  const jd =
    Math.floor(date.getTime() / 86400000)
    + 2440588;

  const pasaranName =
    pasaran[(jd + 1) % 5];

  return `${hariName} ${pasaranName}`;
}

// ======================
// FORMAT TANGGAL
// ======================

function formatTanggal(date) {

  return date.toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}

// ======================
// FORMAT HARI PASARAN
// ======================

function formatHariPasaranTanggal(date) {

  return `${namaHariPasaran(date)}, ${formatTanggal(date)}`;

}

// ======================
// HITUNG SELAMATAN TAHLIL
// ======================

function hitungSelamatan(tanggalMeninggal) {

  const dataSelamatan = [

    {
      nama: "3 Harian",
      hari: 3
    },
    {
      nama: "7 Harian",
      hari: 7
    },
    {
      nama: "40 Harian",
      hari: 40
    },
    {
      nama: "100 Harian",
      hari: 100
    },
    {
      nama: "Pendhak 1",
      hari: 354
    },
    {
      nama: "Pendhak 2",
      hari: 708
    },
    {
      nama: "1000 Harian",
      hari: 1000
    }
  ];

  let hasil =
`\`\`\`
📿 HITUNG ACARA SELAMATAN TAHLIL
Tanggal Wafat :
${formatHariPasaranTanggal(tanggalMeninggal)}

`;

  for (const item of dataSelamatan) {

    const tgl =
      new Date(tanggalMeninggal);

    tgl.setDate(
      tgl.getDate() + item.hari
    );

    hasil +=
`📌${item.nama}
${formatHariPasaranTanggal(tgl)}

`;
  }

  hasil += "🌿*BE-NA-WAWI*🌿`";

  return hasil;
}

export { hitungSelamatan };