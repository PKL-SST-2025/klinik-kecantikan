use crate::dtos::dokter_dto::{CreateDokterDto, UpdateDokterDto};
use crate::models::dokter::Dokter;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "dokters";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_dokters() -> Result<Vec<Dokter>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch dokters: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<Dokter>>()
            .await
            .map_err(|e| format!("Failed to parse dokters: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.status()))
    }
}

pub async fn create_dokter(dokter_data: &CreateDokterDto) -> Result<Dokter, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&dokter_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create dokter: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut dokters: Vec<Dokter> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created dokter: {}", e))?;
        dokters.pop().ok_or_else(|| "Failed to get created dokter".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_dokter(id: Uuid, dokter_data: &UpdateDokterDto) -> Result<Dokter, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&dokter_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update dokter: {}", e))?;

    if res.status().is_success() {
        let mut dokters: Vec<Dokter> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated dokter: {}", e))?;
        dokters.pop().ok_or_else(|| "Failed to get updated dokter".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_dokter(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete dokter: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}