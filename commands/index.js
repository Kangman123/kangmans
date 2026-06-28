import menu from "./menu.js";
import test from "./test.js";
import daftar from "./daftar.js";
import anggota from "./anggota.js";
import hubungan from "./hubungan.js";
import agenda from "./agenda.js";
import ultah from "./ultah.js";

import { awalBulan, getHijri, toDMS } from './hisab.js';
import { HisabKiblat } from './kiblat.js';
import { waktuSholatFalak } from './sholat.js';
import { hitungSelamatan } from './selamatan.js';

const commands = {
    menu,
    test,
    daftar,
    anggota,
    hubungan,
    agenda,
    ultah,
};

export async function handleCommand(sock, msg, pesanMasuk, user) {

    if (!pesanMasuk.startsWith("!")) return;

    const remoteJid = msg.key.remoteJid;

    const args = pesanMasuk.trim().split(/\s+/);

    const namaCommand =
        args[0].substring(1).toLowerCase();

    if (commands[namaCommand]) {

        return await commands[namaCommand]({
            sock,
            msg,
            remoteJid,
            args,
            user
        });

    }
}
await sock.sendMessage(remoteJid, {
    text: `❌ Perintah *${namaCommand}* tidak dikenal.\nKetik *!menu* untuk melihat daftar perintah.`
});