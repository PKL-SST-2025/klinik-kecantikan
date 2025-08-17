use crate::dtos::user_dto::{RegisterUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto};
use crate::models::user::User;
use crate::repositories::user_repo;

pub async fn handle_user_registration(user_data: RegisterUserDto) -> Result<(), String> {
    // 1. Validasi data
    if user_data.password.len() < 6 {
        return Err("Password harus minimal 6 karakter".to_string());
    }
    

    // 2. Panggil repository untuk menyimpan data
    user_repo::register_user(&user_data).await
}

pub async fn handle_forgot_password(forgot_data: ForgotPasswordDto) -> Result<(), String> {
    user_repo::send_password_reset_link(&forgot_data).await
}

pub async fn handle_password_reset(token: String, new_password: String) -> Result<(), String> {
    user_repo::reset_password(&token, &new_password).await
}

pub async fn handle_user_login(login_data: LoginUserDto) -> Result<String, String> {
    user_repo::login_user(&login_data).await
}