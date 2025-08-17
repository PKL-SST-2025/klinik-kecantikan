use crate::dtos::appointment_dto::{CreateAppointmentDto, UpdateAppointmentDto};
use crate::models::appointment::Appointment;
use reqwest::{Client, StatusCode};
use std::env;
use uuid::Uuid;

const TABLE_NAME: &str = "appointments";

async fn get_supabase_client_and_keys() -> Result<(Client, String, String), String> {
    let client = Client::new();
    let supabase_url = env::var("SUPABASE_URL").map_err(|_| "SUPABASE_URL not set".to_string())?;
    let supabase_key = env::var("SUPABASE_KEY").map_err(|_| "SUPABASE_KEY not set".to_string())?;
    Ok((client, supabase_url, supabase_key))
}

pub async fn get_all_appointments() -> Result<Vec<Appointment>, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .get(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch appointments: {}", e))?;

    if res.status().is_success() {
        res.json::<Vec<Appointment>>()
            .await
            .map_err(|e| format!("Failed to parse appointments: {}", e))
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn create_appointment(appointment_data: &CreateAppointmentDto) -> Result<Appointment, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .post(format!("{}/rest/v1/{}", supabase_url, TABLE_NAME))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&appointment_data)
        .send()
        .await
        .map_err(|e| format!("Failed to create appointment: {}", e))?;

    if res.status() == StatusCode::CREATED {
        let mut appointments: Vec<Appointment> = res.json()
            .await
            .map_err(|e| format!("Failed to parse created appointment: {}", e))?;
        appointments.pop().ok_or_else(|| "Failed to get created appointment".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn update_appointment(id: Uuid, appointment_data: &UpdateAppointmentDto) -> Result<Appointment, String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .patch(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&appointment_data)
        .send()
        .await
        .map_err(|e| format!("Failed to update appointment: {}", e))?;

    if res.status().is_success() {
        let mut appointments: Vec<Appointment> = res.json()
            .await
            .map_err(|e| format!("Failed to parse updated appointment: {}", e))?;
        appointments.pop().ok_or_else(|| "Failed to get updated appointment".to_string())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}

pub async fn delete_appointment(id: Uuid) -> Result<(), String> {
    let (client, supabase_url, supabase_key) = get_supabase_client_and_keys().await?;
    let res = client
        .delete(format!("{}/rest/v1/{}?id=eq.{}", supabase_url, TABLE_NAME, id))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", &supabase_key))
        .send()
        .await
        .map_err(|e| format!("Failed to delete appointment: {}", e))?;

    if res.status() == StatusCode::NO_CONTENT {
        Ok(())
    } else {
        Err(format!("Supabase error: {}", res.text().await.unwrap_or_default()))
    }
}