use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateProductDto {
    pub name: String,
    pub description: String,
    pub price: f64,
    pub stock: i32,
}

// DTO untuk update, semua field opsional
#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateProductDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub stock: Option<i32>,
}