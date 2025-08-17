use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct RegisterUserDto {
    pub name: String,
    pub position: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginUserDto {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ForgotPasswordDto {
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResetPasswordDto {
    pub password: String
}

#[derive(Deserialize)]
pub struct UpdatePasswordDto {
    pub access_token: String,
    pub password: String,
}