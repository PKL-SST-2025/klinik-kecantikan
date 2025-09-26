//src/repositories/pasien_repo.rs
use crate::dtos::pasien_dto::{CreatePasienDto, UpdatePasienDto};
use crate::models::pasien::Pasien;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "pasiens";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_pasiens() -> Result<Vec<Pasien>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch pasiens: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<Pasien>>()
            .await
            .map_err(|e| format!("Failed to parse pasiens: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.status()))
    }
}

pub async fn create_pasien(pasien_data: &CreatePasienDto) -> Result<Pasien, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&pasien_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create pasien: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut pasiens: Vec<Pasien> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created pasien: {}", e))?;
        pasiens.pop().ok_or_else(|| "Failed to get created pasien".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_pasien(id: Uuid, pasien_data: &UpdatePasienDto) -> Result<Pasien, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&pasien_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update pasien: {}", e))?;

    if res.status().is_success() {
        let mut pasiens: Vec<Pasien> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated pasien: {}", e))?;
        pasiens.pop().ok_or_else(|| "Failed to get updated pasien".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_pasien(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete pasien: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}