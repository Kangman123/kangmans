import { getAgendaHariIni } from "../services/agendaService.js";

export default async function ({
    sock,
    remoteJid
}) {

    try {

        const hasil = await getAgendaHariIni();

        await sock.sendMessage(remoteJid, {
            text: hasil
        });

    } catch (err) {

        console.error(err);

        await sock.sendMessage(remoteJid, {
            text: "❌ Gagal membaca data agenda."
        });

    }

}