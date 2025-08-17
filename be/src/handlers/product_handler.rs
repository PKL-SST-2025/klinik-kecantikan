// src/handlers/product_handler.rs

use actix_web::{web, HttpResponse};
use crate::dtos::product_dto::{CreateProductDto, UpdateProductDto};
use crate::services::product_service;
use uuid::Uuid;

// GET: Handler to get all products
pub async fn get_all_products_handler() -> HttpResponse {
    match product_service::handle_get_all_products().await {
        Ok(products) => HttpResponse::Ok().json(products),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

// POST: Handler to create a new product
pub async fn create_product_handler(product_data: web::Json<CreateProductDto>) -> HttpResponse {
    match product_service::handle_create_product(product_data.into_inner()).await {
        Ok(product) => HttpResponse::Created().json(product),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

// PATCH: Handler to update an existing product by ID
pub async fn update_product_handler(
    path: web::Path<Uuid>,
    product_data: web::Json<UpdateProductDto>,
) -> HttpResponse {
    let id = path.into_inner();
    match product_service::handle_update_product(id, product_data.into_inner()).await {
        Ok(product) => HttpResponse::Ok().json(product),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}

// DELETE: Handler to delete a product by ID
pub async fn delete_product_handler(path: web::Path<Uuid>) -> HttpResponse {
    let id = path.into_inner();
    match product_service::handle_delete_product(id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::BadRequest().body(e),
    }
}