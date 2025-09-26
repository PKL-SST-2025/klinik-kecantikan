use crate::dtos::invoice_dto::{CreateInvoiceDto, UpdateInvoiceDto};
use crate::models::invoice::Invoice;
use crate::repositories::invoice_repo;
use uuid::Uuid;

pub async fn handle_get_all_invoices() -> Result<Vec<Invoice>, String> {
    invoice_repo::get_all_invoices().await
}

pub async fn handle_create_invoice(invoice_data: CreateInvoiceDto) -> Result<Invoice, String> {
    invoice_repo::create_invoice(&invoice_data).await
}

pub async fn handle_update_invoice(id: Uuid, invoice_data: UpdateInvoiceDto) -> Result<Invoice, String> {
    invoice_repo::update_invoice(id, &invoice_data).await
}

pub async fn handle_delete_invoice(id: Uuid) -> Result<(), String> {
    invoice_repo::delete_invoice(id).await
}