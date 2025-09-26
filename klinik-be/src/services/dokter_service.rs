use crate::dtos::dokter_dto::{CreateDokterDto, UpdateDokterDto};
use crate::models::dokter::Dokter;
use crate::repositories::dokter_repo;
use uuid::Uuid;

pub async fn handle_get_all_dokters() -> Result<Vec<Dokter>, String> {
    dokter_repo::get_all_dokters().await
}

pub async fn handle_create_dokter(dokter_data: CreateDokterDto) -> Result<Dokter, String> {
    dokter_repo::create_dokter(&dokter_data).await
}

pub async fn handle_update_dokter(id: Uuid, dokter_data: UpdateDokterDto) -> Result<Dokter, String> {
    dokter_repo::update_dokter(id, &dokter_data).await
}

pub async fn handle_delete_dokter(id: Uuid) -> Result<(), String> {
    dokter_repo::delete_dokter(id).await
}