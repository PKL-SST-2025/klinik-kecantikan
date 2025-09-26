use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct Treatment {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub estimated_time: i32,
}