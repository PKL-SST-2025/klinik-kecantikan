use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Deserialize, Serialize)]
pub struct Dokter {
    pub id: Uuid,
    pub nama: String,
    pub posisi: String,
    pub jadwal: serde_json::Value,
    pub created_at: DateTime<Utc>,
}