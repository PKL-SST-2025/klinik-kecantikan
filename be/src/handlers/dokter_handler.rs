use actix_web::{web, HttpResponse};
use crate::dtos::dokter_dto::{CreateDokterDto, UpdateDokterDto};
use crate::services::dokter_service;
use uuid::Uuid;

pub async fn get_all_dokters_handler() -> HttpResponse {
    match dokter_service::handle_get_all_dokters().await {
        Ok(dokters) => HttpResponse::Ok().json(dokters),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_dokter_handler(dokter_data: web::Json<CreateDokterDto>) -> HttpResponse {
    match dokter_service::handle_create_dokter(dokter_data.into_inner()).await {
        Ok(dokter) => HttpResponse::Created().json(dokter),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_dokter_handler(
    path: web::Path<Uuid>,
    dokter_data: web::Json<UpdateDokterDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match dokter_service::handle_update_dokter(id, dokter_data.into_inner()).await {
        Ok(dokter) => HttpResponse::Ok().json(dokter),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_dokter_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match dokter_service::handle_delete_dokter(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}