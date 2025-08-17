use actix_web::{web, HttpResponse};
use crate::dtos::skin_analysis_dto::{CreateSkinAnalysisDto, UpdateSkinAnalysisDto};
use crate::services::skin_analysis_service;
use uuid::Uuid;

pub async fn get_all_skin_analyses_handler() -> HttpResponse {
    match skin_analysis_service::handle_get_all_skin_analyses().await {
        Ok(analyses) => HttpResponse::Ok().json(analyses),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_skin_analysis_handler(analysis_data: web::Json<CreateSkinAnalysisDto>) -> HttpResponse {
    match skin_analysis_service::handle_create_skin_analysis(analysis_data.into_inner()).await {
        Ok(analysis) => HttpResponse::Created().json(analysis),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_skin_analysis_handler(
    path: web::Path<Uuid>,
    analysis_data: web::Json<UpdateSkinAnalysisDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match skin_analysis_service::handle_update_skin_analysis(id, analysis_data.into_inner()).await {
        Ok(analysis) => HttpResponse::Ok().json(analysis),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_skin_analysis_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match skin_analysis_service::handle_delete_skin_analysis(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}