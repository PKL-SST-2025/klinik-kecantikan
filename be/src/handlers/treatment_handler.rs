use actix_web::{web, HttpResponse};
use crate::dtos::treatment_dto::{CreateTreatmentDto, UpdateTreatmentDto};
use crate::services::treatment_service;
use uuid::Uuid;

pub async fn get_all_treatments_handler() -> HttpResponse {
    match treatment_service::handle_get_all_treatments().await {
        Ok(treatments) => HttpResponse::Ok().json(treatments),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_treatment_handler(treatment_data: web::Json<CreateTreatmentDto>) -> HttpResponse {
    match treatment_service::handle_create_treatment(treatment_data.into_inner()).await {
        Ok(treatment) => HttpResponse::Created().json(treatment),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_treatment_handler(
    path: web::Path<Uuid>,
    treatment_data: web::Json<UpdateTreatmentDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match treatment_service::handle_update_treatment(id, treatment_data.into_inner()).await {
        Ok(treatment) => HttpResponse::Ok().json(treatment),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_treatment_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match treatment_service::handle_delete_treatment(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}