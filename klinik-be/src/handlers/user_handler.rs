// src/handlers/user_handler.rs

use actix_web::{web, HttpResponse, HttpRequest};
use crate::dtos::user_dto::{RegisterUserDto, ForgotPasswordDto, LoginUserDto, ResetPasswordDto};
use crate::services::user_service;

pub async fn register(user_data: web::Json<RegisterUserDto>) -> HttpResponse {
    match user_service::handle_user_registration(user_data.into_inner()).await {
        Ok(_) => HttpResponse::Created().body("User registered successfully"),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn forgot_password(forgot_data: web::Json<ForgotPasswordDto>) -> HttpResponse {
    match user_service::handle_forgot_password(forgot_data.into_inner()).await {
        Ok(_) => HttpResponse::Ok().body("Password reset email sent successfully. Please check your inbox."),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

// Handler ini akan menerima token dari frontend dan password baru
pub async fn reset_password(
    req: HttpRequest, // <-- Menerima HttpRequest
    password_data: web::Json<ResetPasswordDto>,
) -> HttpResponse {
    // 1. Ambil header "Authorization" secara manual
    let auth_header = match req.headers().get("Authorization") {
        Some(header_value) => header_value.to_str().unwrap_or(""),
        None => return HttpResponse::Unauthorized().body("Authorization header is missing"),
    };

    // 2. Ekstrak token dari header "Bearer ..."
    let token = auth_header.replace("Bearer ", "");
    if token.is_empty() {
        return HttpResponse::Unauthorized().body("Invalid Authorization header format");
    }
    
    // 3. Panggil service dengan token dan password baru
    match user_service::handle_password_reset(token, password_data.into_inner().password).await {
        Ok(_) => HttpResponse::Ok().body("Password updated successfully."),
        Err(e) => HttpResponse::Unauthorized().body(e),
    }
}

// Tambahkan handler login berikut
pub async fn login(login_data: web::Json<LoginUserDto>) -> HttpResponse {
    match user_service::handle_user_login(login_data.into_inner()).await {
        Ok(token) => HttpResponse::Ok().body(token),
        Err(e) => HttpResponse::Unauthorized().body(e),
    }
}