import React, { useEffect, useState } from "react";
import axios from "axios";
import { utils, writeFile } from 'xlsx'; // Import library xlsx
import { useTranslation } from 'react-i18next'; // Import hook untuk i18next
import { useNavigate } from "react-router-dom"; // Import navigate untuk router ke page tertentu
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Impor FontAwesomeIcon
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Impor ikon panah kiri
import './TableDisplay.css'; 

function TableDisplay() {
    const { t } = useTranslation(); // Gunakan hook useTranslation untuk multi-bahasa
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Untuk menampilkan loading
    const navigate = useNavigate(); // Inisialisasi navigate

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/data");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false); // Mengubah status loading setelah data diambil
            }
        };

        fetchData();
    }, []);

    // Fungsi untuk mengunduh tabel sebagai file Excel
    const downloadExcel = () => {
        const worksheet = utils.json_to_sheet(data); // Mengonversi data ke worksheet
        const workbook = utils.book_new(); // Membuat workbook baru
        utils.book_append_sheet(workbook, worksheet, "REKAP"); // Menambahkan worksheet ke workbook

        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
        const year = currentDate.getFullYear();

        const formattedDate = `${day}${month}${year}`;
        const fileName = `Tabel Data_${formattedDate}.xlsx`;
        writeFile(workbook, fileName);
    };

    // Fungsi untuk navigasi ke GenerateDisplay
    const handleGenerateClick = () => {
        navigate('/generate-display');
    };

    // Fungsi untuk navigasi ke FileUpload
    const handleBackToUploadClick = () => {
        navigate('/');
    };

    return (
        <div className="table-container">
            <h2>{t("table_data_upload")}</h2>
            <div className="button-container">
                <button onClick={handleBackToUploadClick} className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} /> {/* Menambahkan ikon */}
                    {t("back_to_upload_from_table")}
                </button>
            </div>
            <table className="styled-table">
                <thead>
                    <tr>
                            <th>PROVINSI</th>
                            <th>Volume Bus Masuk</th>
                            <th>Volume Bus Keluar</th>
                            <th>Jumlah Penumpang Naik</th>
                            <th>Jumlah Penumpang Turun</th>
                            <th>Jumlah Trayek</th>
                            <th>Volume Mobil Barang Masuk</th>
                            <th>Volume Mobil Barang Keluar</th>
                            <th>Volume Muatan Dibongkar</th>
                            <th>Volume Muatan Dimuat</th>
                            <th>Jenis Muatan yang Dibongkar dan Dimuat</th>
                            <th>LHR Kendaraan Angkutan Barang</th>
                            <th>Jumlah Kendaraan Masuk UPPKB</th>
                            <th>Jumlah Pelanggaran</th>
                            <th>Jumlah Penindakan Pelanggaran</th>
                            <th>Jumlah Komoditi yang Sering Melanggar</th>
                            <th>Jumlah Peralatan Pengujian Berkala yang Dikalibrasi</th>
                            <th>Jumlah Kendaraan yang Diuji Berkala</th>
                            <th>Jumlah BA</th>
                            <th>Jumlah Unit Pengujian Berkala</th>
                            <th>Jumlah Perusahaan Karoseri</th>
                            <th>Panjang Jalan Nasional (km)</th>
                            <th>Jumlah Rambu Terpasang (Unit)</th>
                            <th>Panjang Marka Terpasang (m2)</th>
                            <th>Panjang Guard Rail Terpasang (m)</th>
                            <th>Jumlah Lampu Penerangan Jalan Umum Terpasang (Unit)</th>
                            <th>Jumlah Lokasi Analisis Dampak Lalu Lintas</th>
                            <th>Volume Lalu Lintas pada Ruas Jalan Nasional</th>
                            <th>Jumlah Kendaraan per Perusahaan Angkutan Lintas Batas Negara / AKAP (Unit)</th>
                            <th>Jumlah Trayek yang Dilayani (Trayek)</th>
                            <th>Jumlah Kendaraan Perusahaan Angkutan Pariwisata</th>
                            <th>Jumlah Kendaraan Perusahaan Angkutan Antar Jemput Antar Provinsi</th>
                            <th>Jumlah Kendaraan Perusahaan Angkutan Taksi Antar Provinsi</th>
                            <th>Jumlah Kendaraan Angkutan Barang</th>
                            <th>Jumlah Berkas Penindakan Pelanggaran Peraturan Perundang-undangan</th>
                            <th>Jumlah Forum LLAJ Kabupaten / Kota yang Dibentuk</th>
                            <th>Jumlah Lokasi Rawan Kecelakaan yang Ditangani</th>
                            <th>Daftar Tarif Angkutan Penumpang Trayek Terminal Penumpang Tipe A</th>
                            <th>Jumlah Kunjungan Kapal</th>
                            <th>Jumlah Lintasan yang Dilayani</th>
                            <th>Jumlah Arus Penumpang</th>
                            <th>Jumlah Arus Kendaraan AQ1</th>
                            <th>Volume Barang yang Dibongkar dan Dimuat (Ton)</th>
                            <th>Jumlah Surat Persetujuan Berlayar yang Diterbitkan</th>
                            <th>Jumlah Surat Persetujuan Olah Gerak Kapal yang Diterbitkan</th>
                            <th>Jumlah Surat Persetujuan Perluasan Daerah Pelayaran yang Diterbitkan</th>
                            <th>Jumlah Surat Persetujuan Pengelasan yang Diterbitkan</th>
                            <th>Jumlah Surat Pengawasan Pengisian Bahan Bakar yang Diterbitkan</th>
                            <th>SUMBER DAYA MANUSIA</th>
                            <th>PNBP (Rp)</th>
                            <th>ANGGARAN (Rp)</th>
                            <th>NILAI BMN/ ASET (Rp)</th>
                            <th>REWARD / PENGHARGAAN YANG DIPEROLEH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.provinsi}</td>
                                <td>{item.volume_bus_masuk}</td>
                                <td>{item.volume_bus_keluar}</td>
                                <td>{item.jumlah_penumpang_naik}</td>
                                <td>{item.jumlah_penumpang_turun}</td>
                                <td>{item.jumlah_trayek}</td>
                                <td>{item.volume_mobil_barang_masuk}</td>
                                <td>{item.volume_mobil_barang_keluar}</td>
                                <td>{item.volume_muatan_dibongkar}</td>
                                <td>{item.volume_muatan_dimuat}</td>
                                <td>{item.jenis_muatan_yang_dibongkar_dimuat}</td>
                                <td>{item.lhr_kendaraan_angkutan_barang}</td>
                                <td>{item.jumlah_kendaraan_masuk_uppkb}</td>
                                <td>{item.jumlah_pelanggaran}</td>
                                <td>{item.jumlah_penindakan_pelanggaran}</td>
                                <td>{item.jumlah_komoditi_yang_sering_melanggar}</td>
                                <td>{item.jumlah_peralatan_pengujian_berkala_dikalibrasi}</td>
                                <td>{item.jumlah_kendaraan_diuji_berkala}</td>
                                <td>{item.jumlah_ba}</td>
                                <td>{item.jumlah_unit_pengujian_berkala}</td>
                                <td>{item.jumlah_perusahaan_karoseri}</td>
                                <td>{item.panjang_jalan_nasional}</td>
                                <td>{item.jumlah_rambu_terpasang}</td>
                                <td>{item.panjang_marka_terpasang}</td>
                                <td>{item.panjang_guard_rail_terpasang}</td>
                                <td>{item.jumlah_lampu_penerangan_jalan}</td>
                                <td>{item.jumlah_lokasi_analisis_dampak_lalin}</td>
                                <td>{item.volume_lalu_lintas}</td>
                                <td>{item.jumlah_kendaraan_angkutan_lintas_batas}</td>
                                <td>{item.jumlah_trayek_yang_dilayani}</td>
                                <td>{item.jumlah_kendaraan_angkutan_pariwisata}</td>
                                <td>{item.jumlah_kendaraan_angkutan_antar_jemput}</td>
                                <td>{item.jumlah_kendaraan_angkutan_taksi}</td>
                                <td>{item.jumlah_kendaraan_angkutan_barang}</td>
                                <td>{item.jumlah_berkas_penindakan_pelanggaran}</td>
                                <td>{item.jumlah_forum_llaj}</td>
                                <td>{item.jumlah_lokasi_rawan_kecelakaan}</td>
                                <td>{item.daftar_tarif_angkutan_penumpang}</td>
                                <td>{item.jumlah_kunjungan_kapal}</td>
                                <td>{item.jumlah_lintasan_Yang_dilayani}</td>
                                <td>{item.jumlah_arus_penumpang}</td>
                                <td>{item.jumlah_arus_kendaraan}</td>
                                <td>{item.volume_barang_dibongkar_dimuat}</td>
                                <td>{item.jumlah_surat_persetujuan_berlayar}</td>
                                <td>{item.jumlah_surat_persetujuan_olah_gerak_kapal}</td>
                                <td>{item.jumlah_surat_persetujuan_perluasan}</td>
                                <td>{item.jumlah_surat_persetujuan_pengelasan}</td>
                                <td>{item.jumlah_surat_pengawasan_bahan_bakar}</td>
                                <td>{item.sumber_daya_manusia}</td>
                                <td>{item.pnbp}</td>
                                <td>{item.anggaran}</td>
                                <td>{item.nilai_bmn_aset}</td>
                                <td>{item.reward_penghargaan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            <div className="button-container">
                <button onClick={downloadExcel} className="download-button">{t("download_to_excel_button")}</button>
                <button onClick={handleGenerateClick} className="generate-button">{t("generate_button")}</button>
            </div>
            {/* <div className="footer">
                © 2024 SIMAJA. All rights reserved.
            </div> */}
        </div>
    );
}

export default TableDisplay;