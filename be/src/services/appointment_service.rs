use crate::dtos::appointment_dto::{CreateAppointmentDto, UpdateAppointmentDto};
use crate::models::appointment::Appointment;
use crate::repositories::appointment_repo;
use uuid::Uuid;

pub async fn handle_get_all_appointments() -> Result<Vec<Appointment>, String> {
    appointment_repo::get_all_appointments().await
}

pub async fn handle_create_appointment(appointment_data: CreateAppointmentDto) -> Result<Appointment, String> {
    appointment_repo::create_appointment(&appointment_data).await
}

pub async fn handle_update_appointment(id: Uuid, appointment_data: UpdateAppointmentDto) -> Result<Appointment, String> {
    appointment_repo::update_appointment(id, &appointment_data).await
}

pub async fn handle_delete_appointment(id: Uuid) -> Result<(), String> {
    appointment_repo::delete_appointment(id).await
}