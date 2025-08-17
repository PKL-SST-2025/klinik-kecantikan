use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateInvoiceDto {
    pub pasien_id: Uuid,
    pub tanggal: String,
    pub waktu: String,
    pub items: Value, // JSON array of items
    pub total_amount: f64,
    pub amount_paid: f64,
    pub change_amount: Option<f64>,
    pub payment_method: Option<String>,
    pub status: Option<String>,
    pub kasir_name: Option<String>,
    pub appointment_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateInvoiceDto {
    pub pasien_id: Option<Uuid>,
    pub tanggal: Option<String>,
    pub waktu: Option<String>,
    pub items: Option<Value>,
    pub total_amount: Option<f64>,
    pub amount_paid: Option<f64>,
    pub change_amount: Option<f64>,
    pub payment_method: Option<String>,
    pub status: Option<String>,
    pub kasir_name: Option<String>,
    pub appointment_id: Option<Uuid>,
}