const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors'); 
const path = require('path');
const XLSX = require('xlsx'); 
// const fs = require('fs'); // untuk membaca tanggal file upload

const app = express();
const port = 5000;

// Middleware CORS
app.use(cors()); 

// Middleware untuk parsing JSON
app.use(express.json());

// Setup Multer untuk menyimpan file yang diunggah
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// Koneksi ke Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'password', 
    database: 'btpd_form',
});

// Endpoint untuk mengambil data dari dim_upload_v1
app.get('/api/data', (req, res) => {
    const sql = 'SELECT * FROM dim_upload_v1'; // Ganti dengan query yang sesuai
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Endpoint untuk mengambil data dari fact_classification_description
app.get('/api/generate', (req, res) => {
    const sql = 'SELECT * FROM fact_classification_description'; // Ganti dengan query yang sesuai
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// // Fungsi untuk generate unique_key
// function generateUniqueKey(provinsi, uploadDate) {
//     return `${provinsi}_${uploadDate.getTime()}`;
// }

// Endpoint untuk mengunggah file
app.post('/upload', upload.array('files'), async (req, res) => {
    console.log('File yang diterima:', req.files); 
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('Tidak ada file yang diunggah.');
    }

    try {

        // Ambil timestamp upload
        const uploadDate = new Date();

        // Baca file Excel
        const filePath = path.join(__dirname, 'uploads', files[0].filename);
        const workbook = XLSX.readFile(filePath);
        const sheetName = 'REKAP'; 
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            return res.status(400).send(`Tab dengan nama "${sheetName}" tidak ditemukan.`);
        }

        // Konversi data dari sheet menjadi JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Proses setiap baris data secara asinkron
        for (const row of jsonData) {
            console.log('Data yang akan disimpan:', row);

        // Pastikan kolom 'PROVINSI' tidak kosong
        if (!row['PROVINSI']) {
            console.error(`Baris dengan data tidak valid:`, row);
            return res.status(400).json({ error: `Kolom 'PROVINSI' tidak boleh kosong pada baris berikut: ${JSON.stringify(row)}` });
        }

        const provinsi = row['PROVINSI'];
        //const uniqueKey = generateUniqueKey(provinsi, uploadDate); // Generate unique_key

        // SQL query dengan ON DUPLICATE KEY UPDATE
        const insertSql = `INSERT INTO dim_upload_v1
            (provinsi, volume_bus_masuk, volume_bus_keluar, jumlah_penumpang_naik, jumlah_penumpang_turun, jumlah_trayek, volume_mobil_barang_masuk, volume_mobil_barang_keluar, volume_muatan_dibongkar, volume_muatan_dimuat, jenis_muatan_yang_dibongkar_dimuat, lhr_kendaraan_angkutan_barang, jumlah_kendaraan_masuk_uppkb, jumlah_pelanggaran, jumlah_penindakan_pelanggaran, jumlah_komoditi_yang_sering_melanggar, jumlah_peralatan_pengujian_berkala_dikalibrasi, jumlah_kendaraan_diuji_berkala, jumlah_ba, jumlah_unit_pengujian_berkala, jumlah_perusahaan_karoseri, panjang_jalan_nasional, jumlah_rambu_terpasang, panjang_marka_terpasang, panjang_guard_rail_terpasang, jumlah_lampu_penerangan_jalan, jumlah_lokasi_analisis_dampak_lalin, volume_lalu_lintas, jumlah_kendaraan_angkutan_lintas_batas, jumlah_trayek_yang_dilayani, jumlah_kendaraan_angkutan_pariwisata, jumlah_kendaraan_angkutan_antar_jemput, jumlah_kendaraan_angkutan_taksi, jumlah_kendaraan_angkutan_barang, jumlah_berkas_penindakan_pelanggaran, jumlah_forum_llaj, jumlah_lokasi_rawan_kecelakaan, daftar_tarif_angkutan_penumpang, jumlah_kunjungan_kapal, jumlah_lintasan_yang_dilayani, jumlah_arus_penumpang, jumlah_arus_kendaraan, volume_barang_dibongkar_dimuat, jumlah_surat_persetujuan_berlayar, jumlah_surat_persetujuan_olah_gerak_kapal, jumlah_surat_persetujuan_perluasan, jumlah_surat_persetujuan_pengelasan, jumlah_surat_pengawasan_bahan_bakar, sumber_daya_manusia, pnbp, anggaran, nilai_bmn_aset, reward_penghargaan, upload_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            provinsi = VALUES(provinsi),
            volume_bus_masuk = VALUES(volume_bus_masuk),
            volume_bus_keluar = VALUES(volume_bus_keluar),
            jumlah_penumpang_naik = VALUES(jumlah_penumpang_naik),
            jumlah_penumpang_turun = VALUES(jumlah_penumpang_turun),
            jumlah_trayek = VALUES(jumlah_trayek),
            volume_mobil_barang_masuk = VALUES(volume_mobil_barang_masuk),
            volume_mobil_barang_keluar = VALUES(volume_mobil_barang_keluar),
            volume_muatan_dibongkar = VALUES(volume_muatan_dibongkar),
            volume_muatan_dimuat = VALUES(volume_muatan_dimuat),
            jenis_muatan_yang_dibongkar_dimuat = VALUES(jenis_muatan_yang_dibongkar_dimuat),
            lhr_kendaraan_angkutan_barang = VALUES(lhr_kendaraan_angkutan_barang),
            jumlah_kendaraan_masuk_uppkb = VALUES(jumlah_kendaraan_masuk_uppkb),
            jumlah_pelanggaran = VALUES(jumlah_pelanggaran),
            jumlah_penindakan_pelanggaran = VALUES(jumlah_penindakan_pelanggaran),
            jumlah_komoditi_yang_sering_melanggar = VALUES(jumlah_komoditi_yang_sering_melanggar),
            jumlah_peralatan_pengujian_berkala_dikalibrasi = VALUES(jumlah_peralatan_pengujian_berkala_dikalibrasi),
            jumlah_kendaraan_diuji_berkala = VALUES(jumlah_kendaraan_diuji_berkala),
            jumlah_ba = VALUES(jumlah_ba),
            jumlah_unit_pengujian_berkala = VALUES(jumlah_unit_pengujian_berkala),
            jumlah_perusahaan_karoseri = VALUES(jumlah_perusahaan_karoseri),
            panjang_jalan_nasional = VALUES(panjang_jalan_nasional),
            jumlah_rambu_terpasang = VALUES(jumlah_rambu_terpasang),
            panjang_marka_terpasang = VALUES(panjang_marka_terpasang),
            panjang_guard_rail_terpasang = VALUES(panjang_guard_rail_terpasang),
            jumlah_lampu_penerangan_jalan = VALUES(jumlah_lampu_penerangan_jalan),
            jumlah_lokasi_analisis_dampak_lalin = VALUES(jumlah_lokasi_analisis_dampak_lalin),
            volume_lalu_lintas = VALUES(volume_lalu_lintas),
            jumlah_kendaraan_angkutan_lintas_batas = VALUES(jumlah_kendaraan_angkutan_lintas_batas),
            jumlah_trayek_yang_dilayani = VALUES(jumlah_trayek_yang_dilayani),
            jumlah_kendaraan_angkutan_pariwisata = VALUES(jumlah_kendaraan_angkutan_pariwisata),
            jumlah_kendaraan_angkutan_antar_jemput = VALUES(jumlah_kendaraan_angkutan_antar_jemput),
            jumlah_kendaraan_angkutan_taksi = VALUES(jumlah_kendaraan_angkutan_taksi),
            jumlah_kendaraan_angkutan_barang = VALUES(jumlah_kendaraan_angkutan_barang),
            jumlah_berkas_penindakan_pelanggaran = VALUES(jumlah_berkas_penindakan_pelanggaran),
            jumlah_forum_llaj = VALUES(jumlah_forum_llaj),
            jumlah_lokasi_rawan_kecelakaan = VALUES(jumlah_lokasi_rawan_kecelakaan),
            daftar_tarif_angkutan_penumpang = VALUES(daftar_tarif_angkutan_penumpang),
            jumlah_kunjungan_kapal = VALUES(jumlah_kunjungan_kapal),
            jumlah_lintasan_yang_dilayani = VALUES(jumlah_lintasan_yang_dilayani),
            jumlah_arus_penumpang = VALUES(jumlah_arus_penumpang),
            jumlah_arus_kendaraan = VALUES(jumlah_arus_kendaraan),
            volume_barang_dibongkar_dimuat = VALUES(volume_barang_dibongkar_dimuat),
            jumlah_surat_persetujuan_berlayar = VALUES(jumlah_surat_persetujuan_berlayar),
            jumlah_surat_persetujuan_olah_gerak_kapal = VALUES(jumlah_surat_persetujuan_olah_gerak_kapal),
            jumlah_surat_persetujuan_perluasan = VALUES(jumlah_surat_persetujuan_perluasan),
            jumlah_surat_persetujuan_pengelasan = VALUES(jumlah_surat_persetujuan_pengelasan),
            jumlah_surat_pengawasan_bahan_bakar = VALUES(jumlah_surat_pengawasan_bahan_bakar),
            sumber_daya_manusia = VALUES(sumber_daya_manusia),
            pnbp = VALUES(pnbp),
            anggaran = VALUES(anggaran),
            nilai_bmn_aset = VALUES(nilai_bmn_aset),
            reward_penghargaan = VALUES(reward_penghargaan);`;

        // Nilai yang akan dimasukkan ke query
        const values = [
            row['PROVINSI'],
            row['Volume Bus Masuk'],
            row['Volume Bus Keluar'],
            row['Jumlah Penumpang Naik'],
            row['Jumlah Penumpang Turun'],
            row['Jumlah Trayek'],
            row['Volume mobil barang masuk'],
            row['Volume mobil barang keluar'],
            row['Volume muatan dibongkar'],
            row['Volume muatan dimuat'],
            row['Jenis Muatan yang dibongkar dan dimuat'],
            row['LHR Kendaraan angkutan barang'],
            row['Jumlah Kendaraan Masuk UPPKB'],
            row['Jumlah Pelanggaran'],
            row['Jumlah penindakan pelanggaran'],
            row['Jumlah komoditi yang sering melanggar'],
            row['Jumlah peralatan pengujian berkala yang dikalibrasi pada Unit Pengujian Berkala Dishub Kabupaten/ Kota'],
            row['Jumlah kendaraan yang diuji berkala uji per Unit Pengujian Berkala pada Dishub Kabupaten/ Kota'],
            row['Jumlah Berita Acara pemeriksaan fisik kendaraan bermotor (BA)'],
            row['Jumlah Unit Pengujian Berkala Dishub Kabupaten/ Kota yang terakreditasi'],
            row['Jumlah perusahaan karoseri yang memenuhi persyaratan sesuai ketentuan'],
            row['Panjang jalan nasional (km)'],
            row['Jumlah rambu terpasang (Unit)'],
            row['Panjang marka terpasang (m2)'],
            row['Panjang guard rail terpasang (m)'],
            row['Jumlah lampu penerangan jalan umum terpasang (Unit)'],
            row['Jumlah lokasi Analisis Dampak Lalu Lintas'],
            row['Volume lalu lintas pada ruas jalan nasional'],
            row['Jumlah kendaraan per perusahaan Angkutan Lintas Batas Negara / AKAP (Unit)'],
            row['Jumlah trayek yang dilayani (Trayek)'],
            row['Jumlah kendaraan perusahaan angkutan pariwisata'],
            row['Jumlah kendaraan perusahaan angkutan antar jemput antar provinsi'],
            row['Jumlah kendaraan perusahaan angkutan taksi antar provinsi'],
            row['Jumlah kendaraan angkutan barang'],
            row['Jumlah berkas penindakan pelanggaran peraturan perundang-undangan di bidang lalu lintas dan angkutan jalan'],
            row['Jumlah Forum LLAJ Kabupaten / Kota yang dibentuk'],
            row['Jumlah Lokasi Rawan Kecelakaan yang ditangani'],
            row['Daftar tarif angkutan penumpang trayek terminal penumpang Tipe A'],
            row['Jumlah kunjungan kapal'],
            row['Jumlah lintasan yang dilayani'],
            row['Jumlah arus penumpang'],
            row['Jumlah arus kendaraan AQ1'],
            row['Volume barang yang dibongkar dan dimuat (Ton)'],
            row['Jumlah Surat Persetujuan Berlayar yang diterbitkan'],
            row['Jumlah Surat Persetujuan Olah Gerak Kapal yang diterbitkan'],
            row['Jumlah Surat Persetujuan Perluasan Daerah Pelayaran yang diterbitkan'],
            row['Jumlah Surat Persetujuan Pengelasan yang diterbitkan'],
            row['Jumlah Surat Pengawasan Pengisian Bahan Bakar yang diterbitkan'],
            row['SUMBER DAYA MANUSIA'],
            row['PNBP (Rp)'],
            row['ANGGARAN (Rp)'],
            row['NILAI BMN/ ASET (Rp)'],
            row['REWARD / PENGHARGAAN YANG DIPEROLEH'],
            uploadDate
        ];

            // const checkSql = `SELECT * FROM dim_upload_v1 WHERE provinsi = ? AND unique_key = ?`;
            // const checkValues = [provinsi, uniqueKey];

            // try {
            //     const [rows] = await new Promise((resolve, reject) => {
            //         db.query(checkSql, checkValues, (err, results) => {
            //             if (err) {
            //                 console.error('Kesalahan saat memeriksa data provinsi:', err);
            //                 return reject(err);
            //             }
            //             if (!results) {
            //                 console.error('Query tidak mengembalikan hasil');
            //                 return reject(new Error('Query tidak mengembalikan hasil'));
            //             }
            //             console.log('Hasil query:', results); // Log hasil query
            //             resolve(results);
            //         });
            //     });

            //     if (rows.length > 0) {
            //         // Provinsi sudah ada, lakukan UPDATE
            //         const updateSql = `UPDATE dim_upload_v1 SET 
            //             volume_bus_masuk = ?, 
            //             volume_bus_keluar = ?, 
            //             jumlah_penumpang_naik = ?, 
            //             jumlah_penumpang_turun = ?, 
            //             jumlah_trayek = ?, 
            //             volume_mobil_barang_masuk = ?, 
            //             volume_mobil_barang_keluar = ?, 
            //             volume_muatan_dibongkar = ?, 
            //             volume_muatan_dimuat = ?, 
            //             jenis_muatan_yang_dibongkar_dimuat = ?, 
            //             lhr_kendaraan_angkutan_barang = ?, 
            //             jumlah_kendaraan_masuk_uppkb = ?, 
            //             jumlah_pelanggaran = ?, 
            //             jumlah_penindakan_pelanggaran = ?, 
            //             jumlah_komoditi_yang_sering_melanggar = ?, 
            //             jumlah_peralatan_pengujian_berkala_dikalibrasi = ?, 
            //             jumlah_kendaraan_diuji_berkala = ?, 
            //             jumlah_ba = ?, 
            //             jumlah_unit_pengujian_berkala = ?, 
            //             jumlah_perusahaan_karoseri = ?, 
            //             panjang_jalan_nasional = ?, 
            //             jumlah_rambu_terpasang = ?, 
            //             panjang_marka_terpasang = ?, 
            //             panjang_guard_rail_terpasang = ?, 
            //             jumlah_lampu_penerangan_jalan = ?, 
            //             jumlah_lokasi_analisis_dampak_lalin = ?, 
            //             volume_lalu_lintas = ?, 
            //             jumlah_kendaraan_angkutan_lintas_batas = ?, 
            //             jumlah_trayek_yang_dilayani = ?, 
            //             jumlah_kendaraan_angkutan_pariwisata = ?, 
            //             jumlah_kendaraan_angkutan_antar_jemput = ?, 
            //             jumlah_kendaraan_angkutan_taksi = ?, 
            //             jumlah_kendaraan_angkutan_barang = ?, 
            //             jumlah_berkas_penindakan_pelanggaran = ?, 
            //             jumlah_forum_llaj = ?, 
            //             jumlah_lokasi_rawan_kecelakaan = ?, 
            //             daftar_tarif_angkutan_penumpang = ?, 
            //             jumlah_kunjungan_kapal = ?, 
            //             jumlah_lintasan_yang_dilayani = ?, 
            //             jumlah_arus_penumpang = ?, 
            //             jumlah_arus_kendaraan = ?, 
            //             volume_barang_dibongkar_dimuat = ?, 
            //             jumlah_surat_persetujuan_berlayar = ?, 
            //             jumlah_surat_persetujuan_olah_gerak_kapal = ?, 
            //             jumlah_surat_persetujuan_perluasan = ?, 
            //             jumlah_surat_persetujuan_pengelasan = ?, 
            //             jumlah_surat_pengawasan_bahan_bakar = ?, 
            //             sumber_daya_manusia = ?, 
            //             pnbp = ?, 
            //             anggaran = ?, 
            //             nilai_bmn_aset = ?, 
            //             reward_penghargaan = ?,
            //             unique_key = ?
            //         WHERE provinsi = ? AND unique_key = ?`;


            //         const updateValues = [
            //             row['Volume Bus Masuk'],
            //             row['Volume Bus Keluar'],
            //             row['Jumlah Penumpang Naik'],
            //             row['Jumlah Penumpang Turun'],
            //             row['Jumlah Trayek'],
            //             row['Volume mobil barang masuk'],
            //             row['Volume mobil barang keluar'],
            //             row['Volume muatan dibongkar'],
            //             row['Volume muatan dimuat'],
            //             row['Jenis Muatan yang dibongkar dan dimuat'],
            //             row['LHR Kendaraan angkutan barang'],
            //             row['Jumlah Kendaraan Masuk UPPKB'],
            //             row['Jumlah Pelanggaran'],
            //             row['Jumlah penindakan pelanggaran'],
            //             row['Jumlah komoditi yang sering melanggar'],
            //             row['Jumlah peralatan pengujian berkala yang dikalibrasi pada Unit Pengujian Berkala Dishub Kabupaten/ Kota'],
            //             row['Jumlah kendaraan yang diuji berkala uji per Unit Pengujian Berkala pada Dishub Kabupaten/ Kota'],
            //             row['Jumlah Berita Acara pemeriksaan fisik kendaraan bermotor (BA)'],
            //             row['Jumlah Unit Pengujian Berkala Dishub Kabupaten/ Kota yang terakreditasi'],
            //             row['Jumlah perusahaan karoseri yang memenuhi persyaratan sesuai ketentuan'],
            //             row['Panjang jalan nasional (km)'],
            //             row['Jumlah rambu terpasang (Unit)'],
            //             row['Panjang marka terpasang (m2)'],
            //             row['Panjang guard rail terpasang (m)'],
            //             row['Jumlah lampu penerangan jalan umum terpasang (Unit)'],
            //             row['Jumlah lokasi Analisis Dampak Lalu Lintas'],
            //             row['Volume lalu lintas pada ruas jalan nasional'],
            //             row['Jumlah kendaraan per perusahaan Angkutan Lintas Batas Negara / AKAP (Unit)'],
            //             row['Jumlah trayek yang dilayani (Trayek)'],
            //             row['Jumlah kendaraan perusahaan angkutan pariwisata'],
            //             row['Jumlah kendaraan perusahaan angkutan antar jemput antar provinsi'],
            //             row['Jumlah kendaraan perusahaan angkutan taksi antar provinsi'],
            //             row['Jumlah kendaraan angkutan barang'],
            //             row['Jumlah berkas penindakan pelanggaran peraturan perundang-undangan di bidang lalu lintas dan angkutan jalan'],
            //             row['Jumlah Forum LLAJ Kabupaten / Kota yang dibentuk'],
            //             row['Jumlah Lokasi Rawan Kecelakaan yang ditangani'],
            //             row['Daftar tarif angkutan penumpang trayek terminal penumpang Tipe A'],
            //             row['Jumlah kunjungan kapal'],
            //             row['Jumlah lintasan yang dilayani'],
            //             row['Jumlah arus penumpang'],
            //             row['Jumlah arus kendaraan AQ1'],
            //             row['Volume barang yang dibongkar dan dimuat (Ton)'],
            //             row['Jumlah Surat Persetujuan Berlayar yang diterbitkan'],
            //             row['Jumlah Surat Persetujuan Olah Gerak Kapal yang diterbitkan'],
            //             row['Jumlah Surat Persetujuan Perluasan Daerah Pelayaran yang diterbitkan'],
            //             row['Jumlah Surat Persetujuan Pengelasan yang diterbitkan'],
            //             row['Jumlah Surat Pengawasan Pengisian Bahan Bakar yang diterbitkan'],
            //             row['SUMBER DAYA MANUSIA'],
            //             row['PNBP (Rp)'],
            //             row['ANGGARAN (Rp)'],
            //             row['NILAI BMN/ ASET (Rp)'],
            //             row['REWARD / PENGHARGAAN YANG DITERIMA'],
            //             provinsi
            //         ];

            //         await new Promise((resolve, reject) => {
            //             db.query(updateSql, updateValues, (err, result) => {
            //                 if (err) {
            //                     console.error('Kesalahan saat memperbarui data:', err);
            //                     return reject(err);
            //                 }
            //                 console.log('Data berhasil diperbarui untuk provinsi:', provinsi);
            //                 resolve(result);
            //             });
            //         });

            //     } else {
            //         // Provinsi tidak ada, lakukan INSERT
            //         const insertSql = `INSERT INTO dim_upload_v1
            //         (provinsi, volume_bus_masuk, volume_bus_keluar, jumlah_penumpang_naik, jumlah_penumpang_turun, jumlah_trayek, volume_mobil_barang_masuk, volume_mobil_barang_keluar, volume_muatan_dibongkar, volume_muatan_dimuat, jenis_muatan_yang_dibongkar_dimuat, lhr_kendaraan_angkutan_barang, jumlah_kendaraan_masuk_uppkb, jumlah_pelanggaran, jumlah_penindakan_pelanggaran, jumlah_komoditi_yang_sering_melanggar, jumlah_peralatan_pengujian_berkala_dikalibrasi, jumlah_kendaraan_diuji_berkala, jumlah_ba, jumlah_unit_pengujian_berkala, jumlah_perusahaan_karoseri, panjang_jalan_nasional, jumlah_rambu_terpasang, panjang_marka_terpasang, panjang_guard_rail_terpasang, jumlah_lampu_penerangan_jalan, jumlah_lokasi_analisis_dampak_lalin, volume_lalu_lintas, jumlah_kendaraan_angkutan_lintas_batas, jumlah_trayek_yang_dilayani, jumlah_kendaraan_angkutan_pariwisata, jumlah_kendaraan_angkutan_antar_jemput, jumlah_kendaraan_angkutan_taksi, jumlah_kendaraan_angkutan_barang, jumlah_berkas_penindakan_pelanggaran, jumlah_forum_llaj, jumlah_lokasi_rawan_kecelakaan, daftar_tarif_angkutan_penumpang, jumlah_kunjungan_kapal, jumlah_lintasan_yang_dilayani, jumlah_arus_penumpang, jumlah_arus_kendaraan, volume_barang_dibongkar_dimuat, jumlah_surat_persetujuan_berlayar, jumlah_surat_persetujuan_olah_gerak_kapal, jumlah_surat_persetujuan_perluasan, jumlah_surat_persetujuan_pengelasan, jumlah_surat_pengawasan_bahan_bakar, sumber_daya_manusia, pnbp, anggaran, nilai_bmn_aset, reward_penghargaan)
            //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            //         const insertValues = [
            //             row['PROVINSI'],
            //             row['Volume Bus Masuk'],
            //             row['Volume Bus Keluar'],
            //             row['Jumlah Penumpang Naik'],
            //             row['Jumlah Penumpang Turun'],
            //             row['Jumlah Trayek'],
            //             row['Volume mobil barang masuk'],
            //             row['Volume mobil barang keluar'],
            //             row['Volume muatan dibongkar'],
            //             row['Volume muatan dimuat'],
            //             row['Jenis Muatan yang dibongkar dan dimuat'],
            //             row['LHR Kendaraan angkutan barang'],
            //             row['Jumlah Kendaraan Masuk UPPKB'],
            //             row['Jumlah Pelanggaran'],
            //             row['Jumlah penindakan pelanggaran'],
            //             row['Jumlah komoditi yang sering melanggar'],
            //             row['Jumlah peralatan pengujian berkala yang dikalibrasi pada Unit Pengujian Berkala Dishub Kabupaten/ Kota'],
            //             row['Jumlah kendaraan yang diuji berkala uji per Unit Pengujian Berkala pada Dishub Kabupaten/ Kota'],
            //             row['Jumlah Berita Acara pemeriksaan fisik kendaraan bermotor (BA)'],
            //             row['Jumlah Unit Pengujian Berkala Dishub Kabupaten/ Kota yang terakreditasi'],
            //             row['Jumlah perusahaan karoseri yang memenuhi persyaratan sesuai ketentuan'],
            //             row['Panjang jalan nasional (km)'],
            //             row['Jumlah rambu terpasang (Unit)'],
            //             row['Panjang marka terpasang (m2)'],
            //             row['Panjang guard rail terpasang (m)'],
            //             row['Jumlah lampu penerangan jalan umum terpasang (Unit)'],
            //             row['Jumlah lokasi Analisis Dampak Lalu Lintas'],
            //             row['Volume lalu lintas pada ruas jalan nasional'],
            //             row['Jumlah kendaraan per perusahaan Angkutan Lintas Batas Negara / AKAP (Unit)'],
            //             row['Jumlah trayek yang dilayani (Trayek)'],
            //             row['Jumlah kendaraan perusahaan angkutan pariwisata'],
            //             row['Jumlah kendaraan perusahaan angkutan antar jemput antar provinsi'],
            //             row['Jumlah kendaraan perusahaan angkutan taksi antar provinsi'],
            //             row['Jumlah kendaraan angkutan barang'],
            //             row['Jumlah berkas penindakan pelanggaran peraturan perundang-undangan di bidang lalu lintas dan angkutan jalan'],
            //             row['Jumlah Forum LLAJ Kabupaten / Kota yang dibentuk'],
            //             row['Jumlah Lokasi Rawan Kecelakaan yang ditangani'],
            //             row['Daftar tarif angkutan penumpang trayek terminal penumpang Tipe A'],
            //             row['Jumlah kunjungan kapal'],
            //             row['Jumlah lintasan yang dilayani'],
            //             row['Jumlah arus penumpang'],
            //             row['Jumlah arus kendaraan AQ1'],
            //             row['Volume barang yang dibongkar dan dimuat (Ton)'],
            //             row['Jumlah Surat Persetujuan Berlayar yang diterbitkan'],
            //             row['Jumlah Surat Persetujuan Olah Gerak Kapal yang diterbitkan'],
            //             row['Jumlah Surat Persetujuan Perluasan Daerah Pelayaran yang diterbitkan'],
            //             row['Jumlah Surat Persetujuan Pengelasan yang diterbitkan'],
            //             row['Jumlah Surat Pengawasan Pengisian Bahan Bakar yang diterbitkan'],
            //             row['SUMBER DAYA MANUSIA'],
            //             row['PNBP (Rp)'],
            //             row['ANGGARAN (Rp)'],
            //             row['NILAI BMN/ ASET (Rp)'],
            //             row['REWARD / PENGHARGAAN YANG DITERIMA'],
            //         ];

        db.query(insertSql, values, (err, result) => {
            if (err) {
                console.error('Error saat menyimpan data:', err);
                return res.status(500).send('Terjadi kesalahan saat menyimpan data.');
            }
            console.log('Data berhasil disimpan:', result);
        });
    }

    // Mengirim respons sukses
        res.status(200).send('File berhasil diunggah dan data disimpan.');
    } catch (error) {
        console.error('Error saat memproses file:', error);
        res.status(500).send('Terjadi kesalahan saat memproses file.');
    }
});


    // Jalankan server
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });