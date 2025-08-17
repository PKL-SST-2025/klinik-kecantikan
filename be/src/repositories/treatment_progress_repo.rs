use crate::dtos::treatment_progress_dto::{CreateTreatmentProgressDto, UpdateTreatmentProgressDto};
use crate::models::treatment_progress::TreatmentProgress;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "treatment_progress";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_treatment_progress() -> Result<Vec<TreatmentProgress>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch treatment progress: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<TreatmentProgress>>()
            .await
            .map_err(|e| format!("Failed to parse treatment progress: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn create_treatment_progress(treatment_progress_data: &CreateTreatmentProgressDto) -> Result<TreatmentProgress, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&treatment_progress_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create treatment progress: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut progress: Vec<TreatmentProgress> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created treatment progress: {}", e))?;
        progress.pop().ok_or_else(|| "Failed to get created treatment progress".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_treatment_progress(id: Uuid, treatment_progress_data: &UpdateTreatmentProgressDto) -> Result<TreatmentProgress, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&treatment_progress_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update treatment progress: {}", e))?;

    if res.status().is_success() {
        let mut progress: Vec<TreatmentProgress> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated treatment progress: {}", e))?;
        progress.pop().ok_or_else(|| "Failed to get updated treatment progress".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_treatment_progress(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete treatment progress: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}