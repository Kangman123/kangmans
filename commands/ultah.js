import { getDaftarUltah } from "../services/ultahService.js";

export default async function ({
    sock,
    remoteJid
}) {

    try {

        const hasil = await getDaftarUltah();

        await sock.sendMessage(remoteJid, {
            text: hasil
        });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(remoteJid, {
            text: "❌ Gagal membaca data ulang tahun."
        });

    }

}