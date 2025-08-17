//src/dtos/pasien_dto.rs
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreatePasienDto {
    pub nama_lengkap: String,
    pub no_telepon: String,
    pub email: Option<String>,
    pub tanggal_lahir: Option<String>,
    pub jenis_kelamin: Option<String>,
    pub alamat_lengkap: Option<String>,
    pub riwayat_alergi: Option<String>,
    pub kondisi_medis: Option<String>,
    pub obat_konsumsi: Option<String>,
    pub riwayat_treatment: Option<String>,
    pub keluhan_utama: Option<String>,
    pub no_identitas: Option<String>,
    pub kontak_darurat_nama: Option<String>,
    pub kontak_darurat_hubungan: Option<String>,
    pub nomer_kontak_darurat: Option<String>,
    pub preferensi_komunikasi: Value,
    pub setuju_data: Option<bool>,
    pub has_initial_skin_analysis: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdatePasienDto {
    pub nama_lengkap: Option<String>,
    pub no_telepon: Option<String>,
    pub email: Option<String>,
    pub tanggal_lahir: Option<String>,
    pub jenis_kelamin: Option<String>,
    pub alamat_lengkap: Option<String>,
    pub riwayat_alergi: Option<String>,
    pub kondisi_medis: Option<String>,
    pub obat_konsumsi: Option<String>,
    pub riwayat_treatment: Option<String>,
    pub keluhan_utama: Option<String>,
    pub no_identitas: Option<String>,
    pub kontak_darurat_nama: Option<String>,
    pub kontak_darurat_hubungan: Option<String>,
    pub nomer_kontak_darurat: Option<String>,
    pub preferensi_komunikasi: Option<Value>,
    pub setuju_data: Option<bool>,
    pub has_initial_skin_analysis: Option<bool>,
}