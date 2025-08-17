use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub struct Invoice {
    pub id: Uuid,
    pub pasien_id: Uuid,
    pub tanggal: String,
    pub waktu: String,
    pub items: Value,
    pub total_amount: f64,
    pub amount_paid: f64,
    pub change_amount: Option<f64>,
    pub payment_method: Option<String>,
    pub status: String,
    pub kasir_name: Option<String>,
    pub appointment_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}