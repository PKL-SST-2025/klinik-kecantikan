use crate::dtos::skin_analysis_dto::{CreateSkinAnalysisDto, UpdateSkinAnalysisDto};
use crate::models::skin_analysis::SkinAnalysis;
use crate::repositories::skin_analysis_repo;
use uuid::Uuid;

pub async fn handle_get_all_skin_analyses() -> Result<Vec<SkinAnalysis>, String> {
    skin_analysis_repo::get_all_skin_analyses().await
}

pub async fn handle_create_skin_analysis(analysis_data: CreateSkinAnalysisDto) -> Result<SkinAnalysis, String> {
    skin_analysis_repo::create_skin_analysis(&analysis_data).await
}

pub async fn handle_update_skin_analysis(id: Uuid, analysis_data: UpdateSkinAnalysisDto) -> Result<SkinAnalysis, String> {
    skin_analysis_repo::update_skin_analysis(id, &analysis_data).await
}

pub async fn handle_delete_skin_analysis(id: Uuid) -> Result<(), String> {
    skin_analysis_repo::delete_skin_analysis(id).await
}