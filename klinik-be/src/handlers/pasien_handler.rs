//src/handlers/pasien_handler.rs
use actix_web::{web, HttpResponse};
use crate::dtos::pasien_dto::{CreatePasienDto, UpdatePasienDto};
use crate::services::pasien_service;
use uuid::Uuid;

pub async fn get_all_pasiens_handler() -> HttpResponse {
    match pasien_service::handle_get_all_pasiens().await {
        Ok(pasiens) => HttpResponse::Ok().json(pasiens),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_pasien_handler(pasien_data: web::Json<CreatePasienDto>) -> HttpResponse {
    match pasien_service::handle_create_pasien(pasien_data.into_inner()).await {
        Ok(pasien) => HttpResponse::Created().json(pasien),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_pasien_handler(
    path: web::Path<Uuid>,
    pasien_data: web::Json<UpdatePasienDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match pasien_service::handle_update_pasien(id, pasien_data.into_inner()).await {
        Ok(pasien) => HttpResponse::Ok().json(pasien),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_pasien_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match pasien_service::handle_delete_pasien(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}