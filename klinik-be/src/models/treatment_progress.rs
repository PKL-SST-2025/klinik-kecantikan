use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Deserialize, Serialize)]
pub struct TreatmentProgress {
    pub id: Uuid,
    pub pasien_id: Uuid,
    pub appointment_id: Uuid,
    pub tanggal_progress: String,
    pub catatan: Option<String>,
    pub created_at: DateTime<Utc>,
}