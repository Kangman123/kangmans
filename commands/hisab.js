function Frac(data){
    return data - Math.floor(data)
}
const rad = (degrees) => degrees * Math.PI / 180;
const deg = (radians) => radians * 180 / Math.PI;
const sin = (deg) => Math.sin(rad(deg));
const cos = (deg) => Math.cos(rad(deg));
const tan = (deg) => Math.tan(rad(deg));
const asin = (rad) => deg(Math.asin(rad));
const acos = (rad) => deg(Math.acos(rad));
const atan = (rad) => deg(Math.atan(rad));
const Int = (data) => Math.floor(data)
/**
 * Mengubah  desimal menjadi format Jam, Menit, Detik (HMS).
 * @param {number} decimal - Nilai desimal yang akan diubah.
 * @returns {string} String yang diformat sebagai HH:MM:SS.ss.
 */
function toHMS(decimal) {
  // Pastikan input adalah angka yang valid
  if (typeof decimal !== 'number' || isNaN(decimal)) {
    // Kembalikan pesan error atau string kosong sesuai kebutuhan proyek Anda
    return "Input tidak valid";
  }
  // Tentukan apakah nilai asli negatif
  const isNegative = decimal < 0;
  // Gunakan nilai absolut untuk semua perhitungan
  const absDecimal = Math.abs(decimal);
  // Hitung derajat (DD)
  let degrees = Math.floor(absDecimal);
  // Hitung sisa desimal untuk menit
  const minuteDecimal = (absDecimal - degrees) * 60; 
  // Hitung menit (MM)
  let minutes = Math.floor(minuteDecimal);
  // Hitung detik (SS.ss)
  let seconds = (minuteDecimal - minutes) * 60;
  // Menangani pembulatan detik yang bisa menyebabkan rollover
  // Jika detik mendekati 60 (misal 59.995 atau lebih), bulatkan ke menit berikutnya
  if (seconds >= 59.995) {
    seconds = 0;
    minutes += 1;
  }
  // Menangani rollover menit ke derajat
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  // Ambil tanda negatif jika ada
  const sign = isNegative ? '-' : '';

  // Format jam menit dan detik agar selalu memiliki dua digit (misal, 01, 05)
  const paddedHours = String(degrees).padStart(2,"0")
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = seconds.toFixed(2).padStart(5, '0'); // `padStart` menangani angka < 10
  // Gabungkan semua bagian menjadi format akhir
  return `${sign}${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}
/**
 * Mengubah koordinat desimal menjadi format Derajat, Menit, Detik (DMS).
 * @param {number} decimal - Nilai desimal yang akan diubah.
 * @returns {string} String yang diformat sebagai DD°MM'SS.ss".
 */
function toDMS(decimal) {
  // Pastikan input adalah angka yang valid
  if (typeof decimal !== 'number' || isNaN(decimal)) {
    // Kembalikan pesan error atau string kosong sesuai kebutuhan proyek Anda
    return "Input tidak valid";
  }
  // Tentukan apakah nilai asli negatif
  const isNegative = decimal < 0;
  // Gunakan nilai absolut untuk semua perhitungan
  const absDecimal = Math.abs(decimal);
  // Hitung derajat (DD)
  let degrees = Math.floor(absDecimal);
  // Hitung sisa desimal untuk menit
  const minuteDecimal = (absDecimal - degrees) * 60; 
  // Hitung menit (MM)
  let minutes = Math.floor(minuteDecimal);
  // Hitung detik (SS.ss)
  let seconds = (minuteDecimal - minutes) * 60;
  // Menangani pembulatan detik yang bisa menyebabkan rollover
  // Jika detik mendekati 60 (misal 59.995 atau lebih), bulatkan ke menit berikutnya
  if (seconds >= 59.995) {
    seconds = 0;
    minutes += 1;
  }
  // Menangani rollover menit ke derajat
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  // Ambil tanda negatif jika ada
  const sign = isNegative ? '-' : '';

  // Format menit dan detik agar selalu memiliki dua digit (misal, 01, 05)
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = seconds.toFixed(2).padStart(5, '0'); // `padStart` menangani angka < 10
  // Gabungkan semua bagian menjadi format akhir
  return `${sign}${degrees}°${paddedMinutes}'${paddedSeconds}"`;
}

function hitungIjtima(blnH,thnH,tz){
    const HY = thnH+(blnH*29.53)/354.3671
    const K = Math.round((HY-1410)*12)
    const T = K/1200
    const JD = (2447740.652+29.53058868*K+0.0001178*T*T)
    const M = Frac((207.9587074+29.10535608*K+-0.0000333*Math.pow(T,2))/360)*360;
    const M1 = Frac((111.1791307+385.81691806*K+0.0107306*Math.pow(T,2))/360)*360;
    const F = Frac((164.2162296+390.67050646*K+-0.0016528*Math.pow(T,2))/360)*360;
    const T1 =(0.1734-0.000393*T)*sin(M)
    const T2 = 0.0021*sin(2*M)
    const T3    =   -0.4068*sin(M1)
    const T4    =   0.0161*sin(2*M1)
    const T5    =   -0.0004*sin(3*M1)
    const T6    =   0.0104*sin(2*F)
    const T7    =   -0.0051*sin(M+M1)
    const T8    =   -0.0074*sin(M-M1)
    const T9    =   0.0004*sin(2*F+M)
    const T10   =   -0.0004*sin(2*F-M)
    const T11   =   -0.0006*sin(2*F+M1)
    const T12   =   0.0010*sin(2*F-M1)
    const T13   =   0.0005*sin(M+2*M1)
    const MT = T1+T2+T3+T4+T5+T6+T7+T8+T9+T10+T11+T12+T13;
    const JDIjtima = JD+0.5+MT;
    const WI = Frac(JDIjtima)*24;
    let WIWD = WI+tz;
    let Z   =   Int(JDIjtima);
    if (WIWD>24){
        WIWD -= 24;
        Z += 1;
    }
    const AA = Int((Z - 1867216.25) / 36524.25)
    const A =   Z + 1 + AA - Int(AA / 4)
    const B =   A+1524
    const C =   Int((B-122.1)/365.25)
    const D =   Int(365.25*C)
    const E =   Int((B-D)/30.6001)
    const TGL   =   Int(B-D-Int(30.6001*E))
    const BLN   =   E<14?E-1:E-13;
    const THN   =   BLN>2?C-4716:C-4715;
    const PA    =   Z+2
    const Hari  =   PA-Int(PA/7)*7
    const Pasaran   =   PA-Int(PA/5)*5
    const hasil = {tglIjtima: `${TGL}-${BLN}-${THN}`,
        TGL,BLN,THN,JDIjtima,
        WI, WIWD, Hari, Pasaran,
        jamIjtima:toHMS(WIWD),
        detail_perhitungan:{
            HY,K,T,JD,M,M1,MT,JDIjtima
        }
    }
    return hasil;

}
function hitungGhurub(tglM,blnM,thnM,LT,BT,TT,Tz){
    const B =   2 - Int(thnM/100) + Int(Int(thnM/100)/4)
    if (blnM<3) {
        blnM += 12;
        thnM-=1;
    }
    const JD = Int(365.25 * (thnM + 4716)) + Int(30.6001 * (blnM + 1)) + tglM + ((18-Tz) / 24) + B - 1524.5;
    const T =   (JD-2451545)/36525;
    const S =   Frac((280.46645+36000.76983*T)/360)*360;
    const m =   Frac((357.52910+35999.05030*T)/360)*360;
    const N =   Frac((125.04-1934.136*T)/360)*360
    const K1    =   (17.264/3600)*sin(N)+(0.206/3600)*sin(2*N)
    const K2    =   (-1.264/3600)*sin(2*S)
    const R1    =   (9.23/3600)*cos(N)-(0.090/3600)*cos(2*N)
    const R2    =   (0.548/3600)*cos(2*S)
    const Q1    =   23.43929111+R1+R2-(46.8150/3600)*T
    const E =   (6898.06/3600)*sin(m)+(72.095/3600)*sin(2*m)+(0.966/3600)*sin(3*m)
    const S1    =   S+E+K1+K2-20.47/3600
    const δ =   asin(sin(S1)*sin(Q1))
    let PT  = atan(tan(S1)*cos(Q1))
    if (S1>90&&S1<270){
        PT+=180;
    } else if (S1>270&&S1<360){
        PT+=360;
    }
    const e =   (-1.915*sin(m)+(-0.02)*sin(2*m)+2.466*sin(2*S1)+-0.053*sin(4*S1))/15
    const sd    =   0.267/(1-0.017*cos(m))
    const Dip   =   (1.76/60)*Math.sqrt(TT)
    const h =   -(sd+34.5/60+Dip)
    const t =   acos(-tan(LT)*tan(δ)+sin(h)/cos(LT)/cos(δ));
    const LMT   =   t/15+(12-e)
    const GhurubWD  =   LMT+Tz-BT/15;
    const hasil = {GhurubWD,JD, T,S,m,N,K1,K2,δ,e,LMT,sd,PT};
    return hasil;
}
function hitungHilal(jam, tglM,blnM,thnM,LT,BT,TT,Tz){
    const B =   2 - Int(thnM/100) + Int(Int(thnM/100)/4)
    if (blnM<3) {
        blnM += 12;
        thnM-=1;
    }
    const JD = Int(365.25 * (thnM + 4716)) + Int(30.6001 * (blnM + 1)) + tglM + ((jam-Tz) / 24) + B - 1524.5;
    const T =   (JD-2451545)/36525;
    const S =   Frac((280.46645+36000.76983*T)/360)*360;
    const m =   Frac((357.52910+35999.05030*T)/360)*360;
    const N =   Frac((125.04-1934.136*T)/360)*360
    const K1    =   (17.264/3600)*sin(N)+(0.206/3600)*sin(2*N)
    const K2    =   (-1.264/3600)*sin(2*S)
    const R1    =   (9.23/3600)*cos(N)-(0.090/3600)*cos(2*N)
    const R2    =   (0.548/3600)*cos(2*S)
    const Q1    =   23.43929111+R1+R2-(46.8150/3600)*T
    const E =   (6898.06/3600)*sin(m)+(72.095/3600)*sin(2*m)+(0.966/3600)*sin(3*m)
    const S1    =   S+E+K1+K2-20.47/3600
    const δ =   asin(sin(S1)*sin(Q1))
    let PT  = atan(tan(S1)*cos(Q1))
    if (S1>90&&S1<270){
        PT+=180;
    } else if (S1>270&&S1<360){
        PT+=360;
    }
    const e =   (-1.915*sin(m)+(-0.02)*sin(2*m)+2.466*sin(2*S1)+-0.053*sin(4*S1))/15
    const sd    =   0.267/(1-0.017*cos(m))
    const Dip   =   (1.76/60)*Math.sqrt(TT)
    const h =   -(sd+34.5/60+Dip)
    const t =   acos(-tan(LT)*tan(δ)+sin(h)/cos(LT)/cos(δ));
    const LMT   =   t/15+(12-e)
    const GhurubWD  =   LMT+Tz-BT/15;
    let Az  =   atan(-sin(LT)/tan(t)+cos(LT)*tan(δ)/sin(t))
    Az  =   Az+270
    const RAU   =   1.00014-0.01671*cos(m)-0.00014*cos(2*m)
    const RKM = 1.00902782*149597870
    //Perhitungan Bulan
    const M =   Frac((218.31617+481267.88088*T)/360)*360
    const A =   Frac((134.96292+477198.86753*T)/360)*360
    const F =   Frac((93.27283+483202.01873*T)/360)*360
    const D =   Frac((297.85027+445267.11135*T)/360)*360
    const T1    =   (22640/3600)*sin(A)
    const T2    =   (-4586/3600)*sin(A-2*D)
    const T3    =   (2370/3600)*sin(2*D)
    const T4    =   (769/3600)*sin(2*A)
    const T5    =   (-668/3600)*sin(m)
    const T6    =   (-412/3600)*sin(2*F)
    const T7    =   (-212/3600)*sin(2*A-2*D)
    const T8    =   (-206/3600)*sin(A+m-2*D)
    const T9    =   (192/3600)*sin(A+2*D)
    const T10   =   (-165/3600)*sin(m-2*D)
    const T11   =   (148/3600)*sin(A-m)
    const T12   =   (-125/3600)*sin(D)
    const T13   =   (-110/3600)*sin(A+m)
    const T14   =   (-55/3600)*sin(2*F-2*D)
    const C =   T1+T2+T3+T4+T5+T6+T7+T8+T9+T10+T11+T12+T13+T14;
    const Mo    =   (M+C+K1+K2-20.47/3600)
    const A1    =   A+T2+T3+T5
    const L1    =   (18461/3600)*sin(F)+(1010/3600)*sin(A+F)+(1000/3600)*sin(A-F)-(624/3600)*sin(F-2*D)-(199/3600)*sin(A-F-2*D)-(167/3600)*sin(A+F-2*D);
    const x =   atan(sin(Mo)*tan(Q1))
    const y =   (L1+x)
    const dekc =    asin(sin(Mo)*sin(Q1)*sin(y)/sin(x))
    let  PTc =  acos(cos(Mo)*cos(L1)/cos(dekc))
    if (Mo>180) {
        PTc = 360 - PTc;
    }
    const tc    =   (PT-PTc)+t
    const hc =  asin(sin(LT)*sin(dekc)+cos(LT)*cos(dekc)*cos(tc))
    const p =   (384401*(1-0.05492))/(1+0.0549*cos(A1+T1))
    const p1    =   p/384401
    const HP    =   0.9507/p1
    const sdc   =   (0.5181/p1)/2
    const P =   HP*cos(hc)
    const Ref   =   0.0167/tan(hc+7.31/(hc+4.4))
    const hc1   =   hc-P+sdc+Ref+Dip
    let  Azc    =   atan(-sin(LT)/tan(tc)+cos(LT)*tan(dekc)/sin(tc))
    console.log(Azc)
    Azc =   Azc+270
    const z =   Azc-Az
    let selisih = PTc - PT
    if (selisih < 0) selisih += 360
    if (selisih > 1800) selisih =360 - selisih
    const Dc    =   selisih/15
    const AL    =   acos(cos(Math.abs(hc1-h))*cos(Math.abs(Azc-Az)))
    const CW    =   (1-cos(AL))*sdc*60
    const EL    =   acos(cos(Mo-S1)*cos(L1))
    const FIa   =   acos(-cos(EL))
    const FI    =   (1+cos(FIa))/2
    const Ms    =   GhurubWD+Dc
    const hasil ={JD, GhurubWD,h,Az,hc,hc1,Azc,EL,Ms,Dc,Ms,CW,FI}
    return hasil

}
function awalBulan(blnH,thnH,LT,BT,TT,Tz,namaLokasi){
    // KONVERSI: blnH adalah bulan yang DICARI awal bulannya
    // Maka ijtima' dihitung untuk bulan SEBELUMNYA
    let bulanIjtima = blnH - 1;
    let tahunIjtima = thnH;
    if (bulanIjtima < 1) {
        bulanIjtima = 12;
        tahunIjtima = thnH - 1;
    }
    
    const namaHari = ["Sabtu","Ahad","Senin","Selasa","Rabu","Kamis","Jum'at","Sabtu"]
    const namaPasaran = ["Wage","Kliwon","Legi","Pahing","Pon","Wage"]
    const namaBulanM = ["Desember","Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
    const namaBulanH = ["Muharram","Shafar","Rabi'ul Awal","Rabi'ul Akhir","Jumadil Awal","Jumadil Akhir","Rajab","Sya'ban","Ramadhan","Syawal","Dzulqo'dah","Dzulhijjah"]
    
    // Ijtima' bulan SEBELUMNYA
    const ijtimak = hitungIjtima(bulanIjtima, tahunIjtima, Tz)
    const {TGL,BLN,THN} = ijtimak
    let tglRukyat = TGL
    let blnRukyat = BLN
    let thnRukyat = THN
    const ghurubIjtima = hitungGhurub(TGL,BLN,THN,LT,BT,TT,Tz)
    if (ijtimak.WIWD >ghurubIjtima.GhurubWD) {
        tglRukyat += 1
    }
    const jumlahHari = new Date(thnRukyat,blnRukyat, 0).getDate()
    if (tglRukyat >jumlahHari) {
        tglRukyat =1
        blnRukyat +=1
        if (blnRukyat > 12) {
            blnRukyat = 1
            thnRukyat += 1
        }
    }
    const ghurub = hitungGhurub(tglRukyat,blnRukyat,thnRukyat,LT,BT,TT,Tz)
    const hilal = hitungHilal(ghurub.GhurubWD,tglRukyat,blnRukyat,thnRukyat,LT,BT,TT,Tz)
    const umurHilal = (hilal.JD - (ijtimak.JDIjtima-0.5))*24
    
    const hasil = 
    `HISAB AWAL BULAN HIJRIYAH

Markaz ${namaLokasi}

Lintang         = ${toDMS(LT)} ${(LT < 0 ? "(S)" : "(N)")}
Bujur           = ${toDMS(BT)} ${(BT < 0 ? "(B)" : "(T)")}
Time Zone       = ${Tz}
Tinggi tempat   = ${TT} mdpl

Ijtima' Akhir ${namaBulanH[bulanIjtima-1]} ${tahunIjtima} H.
Bertepatan pada:
Hari            = ${namaHari[ijtimak.Hari]} ${namaPasaran[ijtimak.Pasaran]}
Tanggal         = ${TGL} ${namaBulanM[BLN]} ${THN} M
Jam             = ${toHMS(ijtimak.WIWD)} WIB

Irtifa' Geo     = ${toDMS(hilal.hc)}
Irtifa' Topo    = ${toDMS(hilal.hc1)}
Elongasi        = ${toDMS(hilal.EL)}
Ghurub Hilal    = ${toHMS(hilal.Ms)} WIB
Ghurub Matahari = ${toHMS(hilal.GhurubWD)} WIB
Azimut Hilal    = ${toDMS(hilal.Azc)}
Azimut Matahari = ${toDMS(hilal.Az)}
Beda Azimut     = ${toDMS(Math.abs(hilal.Azc - hilal.Az))}
Keadaan Hilal   = ${hilal.Azc > hilal.Az ? "Miring ke Utara" : "Miring ke Selatan"}
Cahaya Hilal    = ${(hilal.FI*100).toFixed(2)} %
Lama Hilal      = ${toHMS(hilal.Dc)}
Umur Bulan      = ${toHMS(umurHilal)}
`
let keputusan = ""
let tambahanHari = 1

if (hilal.hc1 >= 3 && hilal.EL >= 6.4) {
    keputusan = "Memenuhi kriteria MABIMS"
    tambahanHari = 1
} else {
    keputusan = "Tidak memenuhi (istikmal)"
    tambahanHari = 2
}

let jenisPenetapan = "Pengumuman Awal Bulan"

// Ramadhan (9), Syawal (10), Dzulhijjah (12)
if (blnH === 9 || blnH === 10 || blnH === 12) {
    jenisPenetapan = "ITSBAT & IKHBAR"
}

const hasilAkhir = 
`
Prediksi awal Bulan ${namaBulanH[blnH-1]} ${thnH} H 
Jatuh pada ${namaHari[(ijtimak.Hari + tambahanHari) % 7]} ${namaPasaran[(ijtimak.Pasaran + tambahanHari) % 5]}, ${TGL + tambahanHari} ${namaBulanM[BLN]} ${THN} M

Penetapan awal bulan menunggu "${jenisPenetapan}" Pemerintah & NU

🌿*BE-NA-WAWI*🌿
`
return`
\`\`\`
${hasil} ${hasilAkhir}
\`\`\`
`
}
function getHijri(teks){
    while (teks.charAt(teks.length-1)===" " || teks.charAt(teks.length-1)==="h" ){teks = teks.slice(0,-1)}
    while (teks.charAt(0)===" "){teks = teks.slice(1)}
    let tambahan, tgl, bln, thn
    let splitTeks = teks.split(" ") 
    if (splitTeks[splitTeks.length-1].includes("+")){
        tambahan = parseInt(splitTeks.pop())
    } else {tambahan = 0}
    if (splitTeks.length>2 && !isNaN(parseInt(splitTeks[0]))){
        tgl = parseInt(splitTeks.shift())
    } else {tgl = 0}
    if (!isNaN(parseInt(splitTeks[splitTeks.length-1]))){
        thn = parseInt(splitTeks.pop())
    } else {thn = undefined}
    let firstTeks = splitTeks.toString()
    if (isNaN(parseInt(firstTeks))){
        bln = firstTeks.toLowerCase().replace(",","-");
        if (bln.includes("muh")){bln=1}
        else if (bln.includes("shaf") ||bln.includes("shof")||bln.includes("saf")||bln.includes("sof")) {bln=2}
        else if (bln.includes("rab") || bln.includes("rob")){
            if (bln.includes("aw")||bln.includes("-ul")){bln=3}
            else if (bln.includes("ak")||bln.includes("ah")||bln.includes("san")||bln.includes("tsan")){bln=4}
        }
        else if (bln.includes("jum")){
            if (bln.includes("aw")||bln.includes("-ul")){bln=5}
            else if (bln.includes("ak")||bln.includes("ah")||bln.includes("san")||bln.includes("tsan")){bln=6}
        }
        else if (bln.includes("raj")||bln.includes("roj")){bln=7}
        else if (bln.includes("sya'")||bln.includes("syak")||bln.includes("sa'")||bln.includes("sak")){bln=8}
        else if (bln.includes("ram")||bln.includes("rom")){bln=9}
        else if (bln.includes("syaw")||bln.includes("saw")){bln=10}
        else if (bln.includes("ulq")||bln.includes("ulk")){bln=11}
        else if (bln.includes("hij")){bln=12}
        else {bln = undefined}
    } else {bln = parseInt(firstTeks)}
    if (teks===""){
        const now = new Date()
        // PERINGATAN: Ganti dengan fungsi konversi Masehi ke Hijriyah yang sebenarnya
        bln = now.getMonth() + 1; // placeholder
        thn = now.getFullYear(); // placeholder
    }
    return {tgl, bln, thn, tambahan}     
}   
    
export { awalBulan, getHijri,toDMS }
