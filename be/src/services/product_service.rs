use crate::dtos::product_dto::{CreateProductDto, UpdateProductDto};
use crate::models::product::Product;
use crate::repositories::product_repo;
use uuid::Uuid;
pub async fn handle_get_all_products() -> Result<Vec<Product>, String> {
    product_repo::get_all_products().await
}

// Fungsi untuk menangani "CREATE" produk
pub async fn handle_create_product(product_data: CreateProductDto) -> Result<Product, String> {
    // Di sini Anda bisa menambahkan logika bisnis tambahan sebelum memanggil repository
    product_repo::create_product(&product_data).await
}
// Fungsi untuk handle update produk
pub async fn handle_update_product(id: Uuid, product_data: UpdateProductDto) -> Result<Product, String> {
    product_repo::update_product(id, &product_data).await
}

// Fungsi untuk handle delete produk
pub async fn handle_delete_product(id: Uuid) -> Result<(), String> {
    product_repo::delete_product(id).await
}