//src/main.rs
use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use dotenvy::dotenv;
use std::env;
use crate::handlers::product_handler;
use crate::handlers::skin_analysis_handler;
use crate::handlers::invoice_handler;
use crate::handlers::user_handler;
use crate::handlers::treatment_progress_handler;
use crate::handlers::treatment_handler;
use crate::handlers::dokter_handler;
use crate::handlers::pasien_handler;
use crate::handlers::appointment_handler;
use crate::middlewares::auth_middleware::AuthMiddleware;
mod handlers;
mod dtos;
mod models;
mod services;
mod repositories;
mod middlewares; 

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    
    println!("Server running at http://{}:{}", host, port);

HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(web::scope("/api")
                .route("/register", web::post().to(handlers::user_handler::register))
                .route("/forgot-password", web::post().to(handlers::user_handler::forgot_password))
                .route("/reset-password", web::post().to(user_handler::reset_password))
                .route("/login", web::post().to(user_handler::login))
                
                // Rute Produk
                .route("/products", web::get().to(product_handler::get_all_products_handler))
                .route("/products", web::post().to(product_handler::create_product_handler))
                .route("/products/{id}", web::patch().to(product_handler::update_product_handler))
                .route("/products/{id}", web::delete().to(product_handler::delete_product_handler))
                  // Rute Appointment
                .route("/appointments", web::get().to(handlers::appointment_handler::get_all_appointments_handler))
                .route("/appointments", web::post().to(handlers::appointment_handler::create_appointment_handler))
                .route("/appointments/{id}", web::patch().to(handlers::appointment_handler::update_appointment_handler))
                .route("/appointments/{id}", web::delete().to(handlers::appointment_handler::delete_appointment_handler))
                // Rute Treatment 
                .route("/treatments", web::get().to(treatment_handler::get_all_treatments_handler))
                .route("/treatments", web::post().to(treatment_handler::create_treatment_handler))
                .route("/treatments/{id}", web::patch().to(treatment_handler::update_treatment_handler))
                .route("/treatments/{id}", web::delete().to(treatment_handler::delete_treatment_handler))
                 // Rute Dokter 
                .route("/dokters", web::get().to(dokter_handler::get_all_dokters_handler))
                .route("/dokters", web::post().to(dokter_handler::create_dokter_handler))
                .route("/dokters/{id}", web::patch().to(dokter_handler::update_dokter_handler))
                .route("/dokters/{id}", web::delete().to(dokter_handler::delete_dokter_handler))
                 // Rute Pasien
                .route("/pasiens", web::get().to(pasien_handler::get_all_pasiens_handler))
                .route("/pasiens", web::post().to(pasien_handler::create_pasien_handler))
                .route("/pasiens/{id}", web::patch().to(pasien_handler::update_pasien_handler))
                .route("/pasiens/{id}", web::delete().to(pasien_handler::delete_pasien_handler))
                // Rute Treatment Progress
                .route("/treatment-progress", web::get().to(handlers::treatment_progress_handler::get_all_treatment_progress_handler))
                .route("/treatment-progress", web::post().to(handlers::treatment_progress_handler::create_treatment_progress_handler))
                .route("/treatment-progress/{id}", web::patch().to(handlers::treatment_progress_handler::update_treatment_progress_handler))
                .route("/treatment-progress/{id}", web::delete().to(handlers::treatment_progress_handler::delete_treatment_progress_handler))
                // Rute Skin Analysis
                .route("/skin-analyses", web::get().to(handlers::skin_analysis_handler::get_all_skin_analyses_handler))
                .route("/skin-analyses", web::post().to(handlers::skin_analysis_handler::create_skin_analysis_handler))
                .route("/skin-analyses/{id}", web::patch().to(handlers::skin_analysis_handler::update_skin_analysis_handler))
                .route("/skin-analyses/{id}", web::delete().to(handlers::skin_analysis_handler::delete_skin_analysis_handler))
                 // Rute Invoices
                .route("/invoices", web::get().to(handlers::invoice_handler::get_all_invoices_handler))
                .route("/invoices", web::post().to(handlers::invoice_handler::create_invoice_handler))
                .route("/invoices/{id}", web::patch().to(handlers::invoice_handler::update_invoice_handler))
                .route("/invoices/{id}", web::delete().to(handlers::invoice_handler::delete_invoice_handler))
                )
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}