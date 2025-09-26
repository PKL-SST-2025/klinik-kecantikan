use actix_web::{web, HttpResponse};
use crate::dtos::treatment_progress_dto::{CreateTreatmentProgressDto, UpdateTreatmentProgressDto};
use crate::services::treatment_progress_service;
use uuid::Uuid;

pub async fn get_all_treatment_progress_handler() -> HttpResponse {
    match treatment_progress_service::handle_get_all_treatment_progress().await {
        Ok(progress) => HttpResponse::Ok().json(progress),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_treatment_progress_handler(progress_data: web::Json<CreateTreatmentProgressDto>) -> HttpResponse {
    match treatment_progress_service::handle_create_treatment_progress(progress_data.into_inner()).await {
        Ok(progress) => HttpResponse::Created().json(progress),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_treatment_progress_handler(
    path: web::Path<Uuid>,
    progress_data: web::Json<UpdateTreatmentProgressDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match treatment_progress_service::handle_update_treatment_progress(id, progress_data.into_inner()).await {
        Ok(progress) => HttpResponse::Ok().json(progress),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_treatment_progress_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match treatment_progress_service::handle_delete_treatment_progress(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}