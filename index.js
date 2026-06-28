import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} from '@whiskeysockets/baileys';

import pino from 'pino';
import QRCode from "qrcode";
import tzwhere from "tzwhere";
import axios from "axios";

import { awalBulan, getHijri, toDMS } from "./commands/hisab.js";
import { HisabKiblat } from './commands/kiblat.js';
import { waktuSholatFalak } from './commands/sholat.js';
import { hitungSelamatan } from './commands/selamatan.js';

tzwhere.init();
let user = {};

async function connectToWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`Versi WhatsApp: ${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.windows('Chrome'),
    });
    
if (!state.creds.registered) {

    const phoneNumber = '6285178369984';

    setTimeout(async () => {
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('\nPAIRING CODE :', code, '\n');
        } catch (err) {
            console.log('Gagal membuat Pairing Code:', err);
        }
    }, 3000);

}
// DEBUG GROUP EVENT
sock.ev.on('group-participants.update', async (update) => {
    console.log("EVENT GROUP TERDETEKSI:", update);
});

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n🔐 SCAN QR CODE:\n');
            const qrText = await QRCode.toString(qr, { type: 'terminal', small: true });
            console.log(qrText);
            await QRCode.toFile('qrcode.png', qr);
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Reconnect...', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(() => connectToWhatsApp(), 5000);
            }
        } 
        else if (connection === 'open') {
            console.log('✅ Bot terhubung!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("messages.upsert", async (m) => {
console.log("=== EVENT MASUK ===");
console.log(JSON.stringify(m, null, 2));
    const msg = m.messages?.[0];
    if (!msg?.message) return;

    const remoteJid = msg.key?.remoteJid;
if (!remoteJid) return;

if (msg.key.fromMe) return;

    if (!user[remoteJid]) {
        user[remoteJid] = {
            namaLokasi: "Belum diatur",
            LT: -7.5,
            BT: 112.7,
            TT: 0,
            Tz: 7,
            TzName: "WIB",
        };
    }

    let dataUser = user[remoteJid];

    const pesanMasuk =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

    console.log("Pesan:", pesanMasuk);
    console.log("Pesan Masuk Dari:", remoteJid, pesanMasuk);
    const isGroup = remoteJid.endsWith("@g.us");

console.log("isGroup:", isGroup);
console.log("participant:", msg.key.participant);
        // ======================
        // LOKASI
        // ======================
           console.log("Pesan Masuk Dari",remoteJid,pesanMasuk)
    if (msg.message?.locationMessage || msg.message?.liveLocationMessage) {
        console.log('terdapat pesan lokasi',msg.message)
        let lokasi = msg.message?.locationMessage?.name || msg.message?.liveLocationMessage?.caption || "Lokasi Tanpa Nama"
        let latitude = msg.message?.locationMessage?.degreesLatitude || msg.message?.liveLocationMessage?.degreesLatitude
        let longitude = msg.message?.locationMessage?.degreesLongitude || msg.message?.liveLocationMessage?.degreesLongitude
        //mengambil tinggi tempat dari Open-Meteo API.
        await axios.get(`https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`)
            .then(async response=>{
            let TT = response.data.elevation[0];
            let LT = latitude;
            let BT = longitude;
            let Tz = tzwhere.tzOffsetAt(LT,BT)/3600000;
            let TzName = tzwhere.tzNameAt(LT,BT);
            user[remoteJid] = {
                namaLokasi: lokasi,
                LT,BT,TT,Tz,TzName                
            }
            console.log(`lokasi = ${lokasi}\nLT = ${LT}\nBT = ${BT}\nTT = ${TT}`)
            await sock.sendMessage(remoteJid,{text:'Lokasi diseting untuk : ' + lokasi + '\nLT = '+ toDMS(LT) +'\nBT = '+ toDMS(BT)+'\nTT = '+TT+' MDPL\nZona Waktu = GMT+'+Tz+' ('+TzName+')'});
            }).catch(error => {
                console.log(error);
            });
    }
            else if (pesanMasuk.toLowerCase().startsWith('!hisab')) {

            const { bln, thn } = getHijri(pesanMasuk);

            if (!bln || !thn) {
                return sock.sendMessage(remoteJid, {
                    text: "❌ Format salah!\nContoh:\nhisab syawal 1447"
                });
            }

            const hasilHisab = await awalBulan(
                bln,
                thn,
                dataUser.LT,
                dataUser.BT,
                dataUser.TT,
                dataUser.Tz,
                dataUser.namaLokasi
            );

            await sock.sendMessage(remoteJid, { text: hasilHisab });
        }

else if (pesanMasuk.toLowerCase().startsWith("!kiblat")) {

    if (!dataUser.LT || !dataUser.BT) {
        return sock.sendMessage(remoteJid, {
            text: "❌ Kirim lokasi dulu 📍"
        });
    }

    const hasil = HisabKiblat(
        dataUser.namaLokasi,
        dataUser.LT,
        dataUser.BT,
        dataUser.Tz
    );

    await sock.sendMessage(remoteJid, { text: hasil });
}
else if (pesanMasuk.toLowerCase().startsWith("!sholat")) {

    if (!dataUser.LT || !dataUser.BT) {
        return sock.sendMessage(remoteJid, {
            text: "❌ Kirim lokasi dulu 📍"
        });
    }

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
}
else if (
    pesanMasuk.toLowerCase().startsWith("!selamatan")
) {

    try {

        const match =
            pesanMasuk.match(
                /selamatan\s+(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i
            );

        if (!match) {

            await sock.sendMessage(remoteJid, {
                text: `❌ Format salah

Contoh:
selamatan 20-07-2025

atau

selamatan 20/07/2025`
            });

            return;
        }

        const tanggal = parseInt(match[1]);
        const bulan = parseInt(match[2]);
        const tahun = parseInt(match[3]);

        const tanggalMeninggal =
            new Date(tahun, bulan - 1, tanggal);

        if (isNaN(tanggalMeninggal.getTime())) {

            return sock.sendMessage(remoteJid, {
                text: "❌ Tanggal tidak valid"
            });

        }

        const hasil =
            hitungSelamatan(tanggalMeninggal);

        await sock.sendMessage(remoteJid, {
            text: String(hasil)
        });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(remoteJid, {
            text: "❌ Terjadi kesalahan"
        });

    }

}

        else {
            await sock.sendMessage(remoteJid, {
                text: `🗻; *WA Bot Be-Na-Wawi*

📍 Lokasi: ${dataUser.namaLokasi}

📌 Perintah: share lokasi dahulu, 
    baru ketik !hisab atau !kiblat
    atau yang lain
- Kirim lokasi 📍
- hisab awal bulan, tahun H.
- kiblat
- Sholat Harian
- selamatan
`
            });
        }
    });
}

connectToWhatsApp();
