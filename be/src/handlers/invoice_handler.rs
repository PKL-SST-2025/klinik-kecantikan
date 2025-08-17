use actix_web::{web, HttpResponse};
use crate::dtos::invoice_dto::{CreateInvoiceDto, UpdateInvoiceDto};
use crate::services::invoice_service;
use uuid::Uuid;

pub async fn get_all_invoices_handler() -> HttpResponse {
    match invoice_service::handle_get_all_invoices().await {
        Ok(invoices) => HttpResponse::Ok().json(invoices),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn create_invoice_handler(invoice_data: web::Json<CreateInvoiceDto>) -> HttpResponse {
    match invoice_service::handle_create_invoice(invoice_data.into_inner()).await {
        Ok(invoice) => HttpResponse::Created().json(invoice),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn update_invoice_handler(
    path: web::Path<Uuid>,
    invoice_data: web::Json<UpdateInvoiceDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match invoice_service::handle_update_invoice(id, invoice_data.into_inner()).await {
        Ok(invoice) => HttpResponse::Ok().json(invoice),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

pub async fn delete_invoice_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match invoice_service::handle_delete_invoice(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}