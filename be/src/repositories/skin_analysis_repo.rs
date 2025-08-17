use crate::dtos::skin_analysis_dto::{CreateSkinAnalysisDto, UpdateSkinAnalysisDto};
use crate::models::skin_analysis::SkinAnalysis;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "skin_analyses";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_skin_analyses() -> Result<Vec<SkinAnalysis>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch skin analyses: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<SkinAnalysis>>()
            .await
            .map_err(|e| format!("Failed to parse skin analyses: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn create_skin_analysis(analysis_data: &CreateSkinAnalysisDto) -> Result<SkinAnalysis, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&analysis_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create skin analysis: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut analyses: Vec<SkinAnalysis> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created skin analysis: {}", e))?;
        analyses.pop().ok_or_else(|| "Failed to get created skin analysis".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_skin_analysis(id: Uuid, analysis_data: &UpdateSkinAnalysisDto) -> Result<SkinAnalysis, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&analysis_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update skin analysis: {}", e))?;

    if res.status().is_success() {
        let mut analyses: Vec<SkinAnalysis> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated skin analysis: {}", e))?;
        analyses.pop().ok_or_else(|| "Failed to get updated skin analysis".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_skin_analysis(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete skin analysis: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}