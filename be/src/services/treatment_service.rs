use crate::dtos::treatment_dto::{CreateTreatmentDto, UpdateTreatmentDto};
use crate::models::treatment::Treatment;
use crate::repositories::treatment_repo;
use uuid::Uuid;

pub async fn handle_get_all_treatments() -> Result<Vec<Treatment>, String> {
    treatment_repo::get_all_treatments().await
}

pub async fn handle_create_treatment(treatment_data: CreateTreatmentDto) -> Result<Treatment, String> {
    treatment_repo::create_treatment(&treatment_data).await
}

pub async fn handle_update_treatment(id: Uuid, treatment_data: UpdateTreatmentDto) -> Result<Treatment, String> {
    treatment_repo::update_treatment(id, &treatment_data).await
}

pub async fn handle_delete_treatment(id: Uuid) -> Result<(), String> {
    treatment_repo::delete_treatment(id).await
}