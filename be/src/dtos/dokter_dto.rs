use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateDokterDto {
    pub nama: String,
    pub posisi: String,
    pub jadwal: serde_json::Value, // Menggunakan Value untuk menangani JSONB
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateDokterDto {
    pub nama: Option<String>,
    pub posisi: Option<String>,
    pub jadwal: Option<serde_json::Value>,
}