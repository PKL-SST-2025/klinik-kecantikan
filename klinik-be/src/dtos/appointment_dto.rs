use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateAppointmentDto {
    pub pasien_id: Uuid,
    pub dokter_id: Uuid,
    pub treatment_ids: Value, // will be a JSON array of UUIDs
    pub tanggal: String, // You might want to use chrono::NaiveDate here for better type safety
    pub waktu: String, // You might want to use chrono::NaiveTime here
    pub status: Option<String>,
    pub is_initial_skin_analysis: Option<bool>,
    pub skin_analysis_id: Option<Uuid>,
    pub treatment_progress_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateAppointmentDto {
    pub pasien_id: Option<Uuid>,
    pub dokter_id: Option<Uuid>,
    pub treatment_ids: Option<Value>,
    pub tanggal: Option<String>,
    pub waktu: Option<String>,
    pub status: Option<String>,
    pub is_initial_skin_analysis: Option<bool>,
    pub skin_analysis_id: Option<Uuid>,
    pub treatment_progress_id: Option<Uuid>,
}