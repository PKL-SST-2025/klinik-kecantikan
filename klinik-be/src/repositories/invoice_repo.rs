use crate::dtos::invoice_dto::{CreateInvoiceDto, UpdateInvoiceDto};
use crate::models::invoice::Invoice;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "invoices";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_invoices() -> Result<Vec<Invoice>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch invoices: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<Invoice>>()
            .await
            .map_err(|e| format!("Failed to parse invoices: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn create_invoice(invoice_data: &CreateInvoiceDto) -> Result<Invoice, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&invoice_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create invoice: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut invoices: Vec<Invoice> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created invoice: {}", e))?;
        invoices.pop().ok_or_else(|| "Failed to get created invoice".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_invoice(id: Uuid, invoice_data: &UpdateInvoiceDto) -> Result<Invoice, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&invoice_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update invoice: {}", e))?;

    if res.status().is_success() {
        let mut invoices: Vec<Invoice> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated invoice: {}", e))?;
        invoices.pop().ok_or_else(|| "Failed to get updated invoice".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_invoice(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete invoice: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}