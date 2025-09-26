use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    http::StatusCode,
    web, Error, HttpResponse,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::{
    env,
    future::{ready, Ready},
    pin::Pin,
    task::{Context, Poll},
};
use actix_http::{body::{BoxBody, MessageBody, EitherBody}, HttpMessage};

// Claims is the payload of the JWT
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

// Struct to store authenticated user data
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: String,
    pub position: String,
}

// This struct is the "factory" that creates the middleware instance.
pub struct AuthMiddleware;

impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<EitherBody<B, BoxBody>>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddlewareService { service }))
    }
}

// This struct is the "service" that will be called for each request.
pub struct AuthMiddlewareService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<EitherBody<B, BoxBody>>;
    type Error = Error;
    type Future = Pin<Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, mut req: ServiceRequest) -> Self::Future {
        let token_result = req.headers().get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .map(|s| s.to_string());

        if let Some(token) = token_result {
            let secret_key = env::var("SUPABASE_JWT_SECRET").expect("SUPABASE_JWT_SECRET not set");
            let decoding_key = DecodingKey::from_secret(secret_key.as_ref());
            let validation = Validation::new(jsonwebtoken::Algorithm::HS256);

            match decode::<Claims>(&token, &decoding_key, &validation) {
                Ok(token_data) => {
                    // Placeholder: fetch `position` from the database using `token_data.claims.sub`
                    let user_position = "resepsionis".to_string(); 
                    
                    let auth_user = AuthenticatedUser {
                        id: token_data.claims.sub,
                        position: user_position,
                    };
                    
                    req.extensions_mut().insert(auth_user);
                    
                    let fut = self.service.call(req);
                    Box::pin(async move {
                        let res = fut.await?;
                        Ok(res.map_into_left_body())
                    })
                }
                Err(e) => {
                    println!("JWT Validation Error: {:?}", e);
                    Box::pin(async move {
                        let response = HttpResponse::Unauthorized().finish();
                        Ok(ServiceResponse::new(req.request().clone(), response.map_into_right_body()))
                    })
                }
            }
        } else {
            Box::pin(async move {
                let response = HttpResponse::Unauthorized().finish();
                Ok(ServiceResponse::new(req.request().clone(), response.map_into_right_body()))
            })
        }
    }
}