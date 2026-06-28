import { readData } from "./spreadsheet.js";

export async function getDaftarUltah() {

    const data = await readData("UlangTahun");

    if (!data || data.length === 0) {
        return "🎂 Belum ada data ulang tahun.";
    }

    let hasil = "🎂 *DAFTAR ULANG TAHUN*\n\n";

    data.forEach((item, index) => {

        hasil +=
`${index + 1}. ${item.Nama}
📅 ${item.TanggalLahir}
👨‍👩‍👧 ${item.Hubungan}

`;

    });

    return hasil;

}