use crate::dtos::treatment_dto::{CreateTreatmentDto, UpdateTreatmentDto};
use crate::models::treatment::Treatment;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "treatment";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_treatments() -> Result<Vec<Treatment>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch treatments: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<Treatment>>()
            .await
            .map_err(|e| format!("Failed to parse treatments: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.status()))
    }
}

pub async fn create_treatment(treatment_data: &CreateTreatmentDto) -> Result<Treatment, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&treatment_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create treatment: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut treatments: Vec<Treatment> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created treatment: {}", e))?;
        treatments.pop().ok_or_else(|| "Failed to get created treatment".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_treatment(id: Uuid, treatment_data: &UpdateTreatmentDto) -> Result<Treatment, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&treatment_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update treatment: {}", e))?;

    if res.status().is_success() {
        let mut treatments: Vec<Treatment> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated treatment: {}", e))?;
        treatments.pop().ok_or_else(|| "Failed to get updated treatment".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_treatment(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete treatment: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}