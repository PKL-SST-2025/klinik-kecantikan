use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateTreatmentProgressDto {
    pub pasien_id: Uuid,
    pub appointment_id: Uuid,
    pub tanggal_progress: String, // You might want to use chrono::NaiveDate
    pub catatan: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateTreatmentProgressDto {
    pub pasien_id: Option<Uuid>,
    pub appointment_id: Option<Uuid>,
    pub tanggal_progress: Option<String>,
    pub catatan: Option<String>,
}