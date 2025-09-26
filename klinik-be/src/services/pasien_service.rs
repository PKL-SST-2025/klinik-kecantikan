//src/services/pasien_service.rs
use crate::dtos::pasien_dto::{CreatePasienDto, UpdatePasienDto};
use crate::models::pasien::Pasien;
use crate::repositories::pasien_repo;
use uuid::Uuid;

pub async fn handle_get_all_pasiens() -> Result<Vec<Pasien>, String> {
    pasien_repo::get_all_pasiens().await
}

pub async fn handle_create_pasien(pasien_data: CreatePasienDto) -> Result<Pasien, String> {
    pasien_repo::create_pasien(&pasien_data).await
}

pub async fn handle_update_pasien(id: Uuid, pasien_data: UpdatePasienDto) -> Result<Pasien, String> {
    pasien_repo::update_pasien(id, &pasien_data).await
}

pub async fn handle_delete_pasien(id: Uuid) -> Result<(), String> {
    pasien_repo::delete_pasien(id).await
}