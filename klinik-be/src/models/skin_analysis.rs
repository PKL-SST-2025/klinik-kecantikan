use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub struct SkinAnalysis {
    pub id: Uuid,
    pub pasien_id: Uuid,
    pub appointment_id: Uuid,
    pub tanggal_analisis: String,
    pub hasil_visual: Option<String>,
    pub hasil_alat: Option<String>,
    pub rekomendasi_treatment: Value,
    pub rekomendasi_produk: Value,
    pub catatan_tambahan: Option<String>,
    pub created_at: DateTime<Utc>,
}