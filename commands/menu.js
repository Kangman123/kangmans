export default async function ({
    sock,
    remoteJid,
    user
}) {

    const dataUser =
        user[remoteJid];

    await sock.sendMessage(remoteJid, {
        text: `👋 *Be-Na-Wawi*

📍 Lokasi :
${dataUser.namaLokasi}

================

!test

!hisab

!kiblat

!sholat

!selamatan

================`
    });

}