// src/handlers/protected_handler.rs
use actix_web::{web, HttpResponse};
use crate::middlewares::auth_middleware::AuthenticatedUser;

// Handler baru yang dilindungi
pub async fn get_dashboard(auth_user: web::ReqData<AuthenticatedUser>) -> HttpResponse {
    println!("User ID: {}", auth_user.id);
    println!("User Position: {}", auth_user.position);

    HttpResponse::Ok().body(format!("Selamat datang di dashboard, {}!", auth_user.position))
}

pub async fn get_dokter_data(auth_user: web::ReqData<AuthenticatedUser>) -> HttpResponse {
    // Tambahkan logika otorisasi di sini
    if auth_user.position != "dokter" {
        return HttpResponse::Forbidden().body("Akses ditolak. Anda bukan dokter.");
    }

    // Logika untuk mengambil data dokter dari database
    HttpResponse::Ok().body("Data dokter berhasil diambil.")
}