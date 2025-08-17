use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateSkinAnalysisDto {
    pub pasien_id: Uuid,
    pub appointment_id: Uuid,
    pub tanggal_analisis: String, // Consider using chrono::NaiveDate
    pub hasil_visual: Option<String>,
    pub hasil_alat: Option<String>,
    pub rekomendasi_treatment: Value, // JSON array of strings
    pub rekomendasi_produk: Value, // JSON array of strings
    pub catatan_tambahan: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateSkinAnalysisDto {
    pub pasien_id: Option<Uuid>,
    pub appointment_id: Option<Uuid>,
    pub tanggal_analisis: Option<String>,
    pub hasil_visual: Option<String>,
    pub hasil_alat: Option<String>,
    pub rekomendasi_treatment: Option<Value>,
    pub rekomendasi_produk: Option<Value>,
    pub catatan_tambahan: Option<String>,
}