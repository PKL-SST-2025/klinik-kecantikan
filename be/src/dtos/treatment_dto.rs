use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateTreatmentDto {
    pub name: String,
    pub description: String,
    pub price: f64,
    pub estimated_time: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateTreatmentDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub estimated_time: Option<i32>,
}