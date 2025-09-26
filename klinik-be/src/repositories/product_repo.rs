use crate::dtos::product_dto::{CreateProductDto, UpdateProductDto};
use crate::models::product::Product;
use reqwest::{Client, StatusCode};
use serde_json::json;
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "produk";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

// Fungsi untuk MENGAMBIL SEMUA produk (GET)
pub async fn get_all_products() -> Result<Vec<Product>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;

    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch products: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<Product>>()
            .await
            .map_err(|e| format!("Failed to parse products: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.status()))
    }
}

// Fungsi untuk MEMBUAT produk baru (POST)
pub async fn create_product(product_data: &CreateProductDto) -> Result<Product, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;

    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&product_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create product: {}", e))?;

    if res.status() == StatusCode::CREATED {
        // --- UBAH DI SINI ---
        let mut products: Vec<Product> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created product: {}", e))?;
        products.pop().ok_or_else(|| "Failed to get created product".to_string())
        // --- END OF CHANGE ---
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}


// Fungsi untuk MENGUPDATE produk berdasarkan ID
pub async fn update_product(id: Uuid, product_data: &UpdateProductDto) -> Result<Product, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;

    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&product_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update product: {}", e))?;

    if res.status().is_success() {
        let mut products: Vec<Product> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated product: {}", e))?;
        
        products.pop().ok_or_else(|| "Failed to get updated product".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

// Fungsi untuk MENGHAPUS produk berdasarkan ID
pub async fn delete_product(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;

    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete product: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}