use crate::dtos::user_dto::{RegisterUserDto, ForgotPasswordDto, LoginUserDto, UpdatePasswordDto};
use crate::models::user::User;
use reqwest::{Client, StatusCode};
use serde_json::{json, Value};
use std::env;
use uuid::Uuid;
pub async fn register_user(user_data: &RegisterUserDto) -> Result<(), String> {
    let client = reqwest::Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;

    // 1. DAFTAR USER DI SUPABASE AUTH
    let auth_body = json!({
        "email": user_data.email,
        "password": user_data.password
    });
    
    // UBAH BAGIAN INI
    let redirect_url = "http://localhost:3000/verify-code";

    let auth_res = client
        .post(format!("{}/auth/v1/signup?redirect_to={}", supabase_url, redirect_url)) // <--- Tambahkan ini
        .header("apikey", &supabase_key)
        .json(&auth_body)
        .send()
        .await
        .map_err(|e| format!("Failed to sign up user: {}", e))?;

    if auth_res.status() != StatusCode::OK {
        // ... (kode error handling lainnya tetap sama)
        let error_text = auth_res.text().await.unwrap_or_default();
        if error_text.contains("User already registered") {
            return Err("Email ini sudah terdaftar. Silakan login atau gunakan email lain.".to_string());
        }
        return Err(format!("Supabase Auth error: {}", error_text));
    }

    // ... (kode untuk menyimpan data ke database lainnya tetap sama)
    let auth_data: serde_json::Value = auth_res.json().await.map_err(|e| format!("Failed to parse auth response: {}", e))?;
    let user_id = auth_data["user"]["id"].as_str().ok_or("User ID not found")?.to_string(); // Supabase Auth v1 sekarang mengembalikan 'user.id' bukan 'id' langsung. Pastikan ini sesuai dengan versi Supabase-mu.
    
    // ... (kode untuk menyimpan data ke database lainnya tetap sama)
    let db_body = json!({
        "id": user_id,
        "name": user_data.name,
        "position": user_data.position,
        "email": user_data.email
    });
    
    let db_res = client
        .post(format!("{}/rest/v1/users", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&db_body)
        .send()
        .await
        .map_err(|e| format!("Failed to insert user into DB: {}", e))?;

    if db_res.status() != StatusCode::CREATED {
        let error_text = db_res.text().await.unwrap_or_default();
        return Err(format!("Supabase DB error: {}", error_text));
    }

    Ok(())
}

pub async fn send_password_reset_link(forgot_data: &ForgotPasswordDto) -> Result<(), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;

    let body = json!({
        "email": forgot_data.email
    });

    let res = client
        .post(format!("{}/auth/v1/recover", supabase_url))
        .header("apikey", &supabase_key)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send reset email request: {}", e))?;

    if res.status() == StatusCode::OK {
        Ok(())
    } else {
        let error_text = res.text().await.unwrap_or_default();
        Err(format!("Supabase error: {}", error_text))
    }
}

pub async fn forgot_password_request(forgot_data: &ForgotPasswordDto) -> Result<(), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;

    let body = json!({
        "email": forgot_data.email
    });
    
    // UBAH BAGIAN INI
    let redirect_url = "http://localhost:3000/reset-password";

    let res = client
        .post(format!("{}/auth/v1/recover?redirect_to={}", supabase_url, redirect_url)) // <--- Tambahkan ini
        .header("apikey", &supabase_key)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send reset email request: {}", e))?;

    if res.status() == StatusCode::OK {
        Ok(())
    } else {
        let error_text = res.text().await.unwrap_or_default();
        Err(format!("Supabase error: {}", error_text))
    }
}

pub async fn reset_password(token: &str, new_password: &str) -> Result<(), String> {
    let client = reqwest::Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;

    let body = json!({
        "password": new_password,
    });

    let res = client
        .put(format!("{}/auth/v1/user", supabase_url))
        .header("apikey", env::var("SUPABASE_KEY").unwrap())
        .header("Authorization", format!("Bearer {}", token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to update password: {}", e))?;

    if res.status().is_success() {
        Ok(())
    } else {
        Err(format!("Update password failed: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn login_user(login_data: &LoginUserDto) -> Result<String, String> {
    let client = reqwest::Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;

    let body = json!({
        "email": login_data.email,
        "password": login_data.password
    });

    let res = client
        .post(format!("{}/auth/v1/token?grant_type=password", supabase_url))
        .header("apikey", env::var("SUPABASE_KEY").unwrap())
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send login request: {}", e))?;

    if res.status().is_success() {
        let json_res: serde_json::Value = res.json().await.map_err(|e| format!("Failed to parse response: {}", e))?;
        let access_token = json_res["access_token"].as_str().ok_or("Access token not found")?.to_string();
        Ok(access_token)
    } else {
        Err(format!("Login failed: {}", res.text().await.unwrap_or_default()))
    }
}