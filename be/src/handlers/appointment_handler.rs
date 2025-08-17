use actix_web::{web, HttpResponse};
use crate::dtos::appointment_dto::{CreateAppointmentDto, UpdateAppointmentDto};
use crate::services::appointment_service;
use uuid::Uuid;

pub async fn get_all_appointments_handler() -> HttpResponse {
    match appointment_service::handle_get_all_appointments().await {
        Ok(appointments) => HttpResponse::Ok().json(appointments),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_appointment_handler(appointment_data: web::Json<CreateAppointmentDto>) -> HttpResponse {
    match appointment_service::handle_create_appointment(appointment_data.into_inner()).await {
        Ok(appointment) => HttpResponse::Created().json(appointment),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_appointment_handler(
    path: web::Path<Uuid>,
    appointment_data: web::Json<UpdateAppointmentDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match appointment_service::handle_update_appointment(id, appointment_data.into_inner()).await {
        Ok(appointment) => HttpResponse::Ok().json(appointment),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_appointment_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match appointment_service::handle_delete_appointment(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}