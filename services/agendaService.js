import { readData } from "./spreadsheet.js";

export async function getAgendaHariIni() {

    const data = await readData("Agenda");

    if (!data || data.length === 0) {
        return "📅 Belum ada agenda.";
    }

    let hasil = "📅 *DAFTAR AGENDA*\n\n";

    data.forEach((item, i) => {

        hasil +=
`${i + 1}. ${item.Judul}
📅 ${item.Tanggal}
🕒 ${item.Jam}
📍 ${item.Lokasi}

`;

    });

    return hasil;

}