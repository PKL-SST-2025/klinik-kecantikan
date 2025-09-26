use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub struct Appointment {
    pub id: Uuid,
    pub pasien_id: Uuid,
    pub dokter_id: Uuid,
    pub treatment_ids: Value,
    pub tanggal: String,
    pub waktu: String,
    pub status: String,
    pub is_initial_skin_analysis: bool,
    pub skin_analysis_id: Option<Uuid>,
    pub treatment_progress_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}