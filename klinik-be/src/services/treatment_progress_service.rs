use crate::dtos::treatment_progress_dto::{CreateTreatmentProgressDto, UpdateTreatmentProgressDto};
use crate::models::treatment_progress::TreatmentProgress;
use crate::repositories::treatment_progress_repo;
use uuid::Uuid;

pub async fn handle_get_all_treatment_progress() -> Result<Vec<TreatmentProgress>, String> {
    treatment_progress_repo::get_all_treatment_progress().await
}

pub async fn handle_create_treatment_progress(treatment_progress_data: CreateTreatmentProgressDto) -> Result<TreatmentProgress, String> {
    treatment_progress_repo::create_treatment_progress(&treatment_progress_data).await
}

pub async fn handle_update_treatment_progress(id: Uuid, treatment_progress_data: UpdateTreatmentProgressDto) -> Result<TreatmentProgress, String> {
    treatment_progress_repo::update_treatment_progress(id, &treatment_progress_data).await
}

pub async fn handle_delete_treatment_progress(id: Uuid) -> Result<(), String> {
    treatment_progress_repo::delete_treatment_progress(id).await
}