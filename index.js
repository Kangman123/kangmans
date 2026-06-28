import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} from "@whiskeysockets/baileys";

import pino from "pino";
import QRCode from "qrcode";
import tzwhere from "tzwhere";
import axios from "axios";

import {
    awalBulan,
    getHijri,
    toDMS
} from "./commands/hisab.js";

import { HisabKiblat } from "./commands/kiblat.js";
import { waktuSholatFalak } from "./commands/sholat.js";
import { hitungSelamatan } from "./commands/selamatan.js";

tzwhere.init();

const user = {};

async function connectToWhatsApp() {

    const { version } =
        await fetchLatestBaileysVersion();

    console.log(
        "Versi WhatsApp:",
        version.join(".")
    );

    const {
        state,
        saveCreds
    } =
    await useMultiFileAuthState(
        "auth_info_baileys"
    );

    const sock = makeWASocket({

        version,

        auth: state,

        logger:
            pino({
                level: "silent"
            }),

        browser:
            Browsers.windows("Chrome")

    });
// =========================
// Pairing Code
// =========================

if (!state.creds.registered) {

    const phoneNumber = "6285178369984"; // Ganti dengan nomor Anda jika berubah

    setTimeout(async () => {

        try {

            const code =
                await sock.requestPairingCode(phoneNumber);

            console.log("\n==============================");
            console.log("PAIRING CODE :", code);
            console.log("==============================\n");

        } catch (err) {

            console.log("Gagal membuat Pairing Code");
            console.log(err);

        }

    }, 3000);

}

// =========================
// Group Event
// =========================

sock.ev.on("group-participants.update", async (update) => {

    console.log("EVENT GROUP :", update);

});

// =========================
// Connection Update
// =========================

sock.ev.on("connection.update", async (update) => {

    const {
        connection,
        lastDisconnect,
        qr
    } = update;

    if (qr) {

        console.log("\nSilakan scan QR berikut:\n");

        const qrText =
            await QRCode.toString(qr, {
                type: "terminal",
                small: true
            });

        console.log(qrText);

        await QRCode.toFile(
            "qrcode.png",
            qr
        );

    }

    if (connection === "open") {

        console.log("✅ Bot terhubung!");

    }

    if (connection === "close") {

        const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut;

        console.log("Koneksi terputus");

        console.log("Reconnect :", shouldReconnect);

        if (shouldReconnect) {

            setTimeout(() => {

                connectToWhatsApp();

            }, 5000);

        } else {

            console.log("Bot logout.");

        }

    }

});

// =========================
// Simpan Credentials
// =========================

sock.ev.on(
    "creds.update",
    saveCreds
);
// =========================
// EVENT PESAN MASUK
// =========================

sock.ev.on("messages.upsert", async ({ messages, type }) => {

    console.log("🔥 EVENT messages.upsert DIPANGGIL");
    console.log(JSON.stringify(messages, null, 2));
    try {

        if (type !== "notify") return;

        const msg = messages[0];

        if (!msg) return;

        if (!msg.message) return;

        if (msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;

        const isGroup =
            remoteJid.endsWith("@g.us");

        const pesanMasuk =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

        console.log("=================================");
        console.log("PESAN MASUK");
        console.log("Dari :", remoteJid);
        console.log("Group :", isGroup);
        console.log("Isi :", pesanMasuk);
        console.log("=================================");

        // ======================
        // DATA USER
        // ======================

        if (!user[remoteJid]) {

            user[remoteJid] = {

                namaLokasi: "Belum diatur",

                LT: -7.5,

                BT: 112.7,

                TT: 0,

                Tz: 7,

                TzName: "WIB"

            };

        }

        const dataUser =
            user[remoteJid];
        // ======================
        // SHARE LOKASI
        // ======================

        if (
            msg.message?.locationMessage ||
            msg.message?.liveLocationMessage
        ) {

            console.log("Lokasi diterima.");

            const lokasi =
                msg.message?.locationMessage?.name ||
                msg.message?.liveLocationMessage?.caption ||
                "Lokasi Tanpa Nama";

            const latitude =
                msg.message?.locationMessage?.degreesLatitude ||
                msg.message?.liveLocationMessage?.degreesLatitude;

            const longitude =
                msg.message?.locationMessage?.degreesLongitude ||
                msg.message?.liveLocationMessage?.degreesLongitude;

            try {

                const response =
                    await axios.get(
                        `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`
                    );

                const TT =
                    response.data.elevation[0];

                const LT = latitude;
                const BT = longitude;

                const Tz =
                    tzwhere.tzOffsetAt(LT, BT) / 3600000;

                const TzName =
                    tzwhere.tzNameAt(LT, BT);

                user[remoteJid] = {

                    namaLokasi: lokasi,

                    LT,

                    BT,

                    TT,

                    Tz,

                    TzName

                };

                console.log(user[remoteJid]);

                await sock.sendMessage(remoteJid, {

                    text:
`✅ Lokasi berhasil disimpan

📍 ${lokasi}

Lintang : ${toDMS(LT)}

Bujur : ${toDMS(BT)}

Tinggi : ${TT} mdpl

Zona Waktu :
GMT+${Tz} (${TzName})`

                });

            } catch (err) {

                console.log(err);

                await sock.sendMessage(remoteJid, {

                    text:
                        "❌ Gagal membaca informasi lokasi."

                });

            }

            return;

        }

        // ======================
        // COMMAND
        // ======================
        const cmd =
            pesanMasuk.trim().toLowerCase();

        // ======================
        // MENU
        // ======================

        if (
            cmd === "!menu" ||
            cmd === "menu"
        ) {

            await sock.sendMessage(remoteJid, {
                text:
`🗻 *WA Bot Be-Na-Wawi*

📍 Lokasi :
${dataUser.namaLokasi}

======================

📌 MENU

📍 Kirim Lokasi

!hisab nama_bulan tahun_hijriah

Contoh:
!hisab syawal 1448

!kiblat

!sholat

!selamatan 20-07-2025

======================`
            });

            return;

        }

        // ======================
        // HISAB
        // ======================

        if (
            cmd.startsWith("!hisab")
        ) {

            const {
                bln,
                thn
            } =
            getHijri(cmd);

            if (!bln || !thn) {

                await sock.sendMessage(
                    remoteJid,
                    {
                        text:
`❌ Format salah

Contoh:

!hisab syawal 1448`
                    }
                );

                return;

            }

            const hasil =
                await awalBulan(

                    bln,

                    thn,

                    dataUser.LT,

                    dataUser.BT,

                    dataUser.TT,

                    dataUser.Tz,

                    dataUser.namaLokasi

                );

            await sock.sendMessage(
                remoteJid,
                {
                    text: hasil
                }
            );

            return;

        }

        // ======================
        // KIBLAT
        // ======================

        if (
            cmd.startsWith("!kiblat")
        ) {

            const hasil =
                HisabKiblat(

                    dataUser.namaLokasi,

                    dataUser.LT,

                    dataUser.BT,

                    dataUser.Tz

                );

            await sock.sendMessage(
                remoteJid,
                {
                    text: hasil
                }
            );

            return;

        }
        // ======================
        // SHOLAT
        // ======================

        if (cmd.startsWith("!sholat")) {

            const hasil = waktuSholatFalak(

                dataUser.LT,
                dataUser.BT,
                dataUser.TT,
                dataUser.Tz,
                dataUser.namaLokasi

            );

            await sock.sendMessage(remoteJid, {
                text: hasil
            });

            return;

        }

        // ======================
        // SELAMATAN
        // ======================

        if (cmd.startsWith("!selamatan")) {

            const match =
                pesanMasuk.match(
                    /!selamatan\s+(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i
                );

            if (!match) {

                await sock.sendMessage(remoteJid, {
                    text:
`❌ Format salah

Contoh:

!selamatan 20-07-2025`
                });

                return;

            }

            const tanggal =
                Number(match[1]);

            const bulan =
                Number(match[2]);

            const tahun =
                Number(match[3]);

            const hasil =
                hitungSelamatan(
                    new Date(
                        tahun,
                        bulan - 1,
                        tanggal
                    )
                );

            await sock.sendMessage(remoteJid, {
                text: String(hasil)
            });

            return;

        }

        // ======================
        // COMMAND TIDAK DIKENAL
        // ======================

        await sock.sendMessage(remoteJid, {

            text:
`Perintah tidak dikenali.

Ketik

!menu

untuk melihat daftar menu.`

        });

    } catch (err) {

        console.log("=================================");
        console.log("ERROR MESSAGES");
        console.log(err);
        console.log("=================================");

    }

});

}
connectToWhatsApp();