import { readData } from "../services/spreadsheet.js";

export default async function ({
    sock,
    remoteJid
}) {

    try {

        const data =
            await readData();

        await sock.sendMessage(remoteJid, {
            text:
`✅ Spreadsheet terhubung

Jumlah Baris :
${data.length}`
        });

    } catch (err) {

        await sock.sendMessage(remoteJid, {
            text:
`❌ ${err.message}`
        });

    }

}