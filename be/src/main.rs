// src/main.rs

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use actix_cors::Cors;

// --- Data Models ---

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Product {
    id: String,
    name: String,
    stock: u32,
    price: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Service {
    id: String,
    name: String,
    estimated_hours: f64,
    price: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
}

// --- In-memory Store ---
// Menggunakan Arc<Mutex<HashMap>> untuk shared state yang aman di antara thread
type DbProducts = Arc<Mutex<HashMap<String, Product>>>;
type DbServices = Arc<Mutex<HashMap<String, Service>>>;

// --- Handlers for Products ---

// GET /products
async fn get_all_products(db: web::Data<DbProducts>) -> impl Responder {
    let products = db.lock().unwrap().values().cloned().collect::<Vec<Product>>();
    HttpResponse::Ok().json(products)
}

// GET /products/{id}
async fn get_product_by_id(
    db: web::Data<DbProducts>,
    path: web::Path<String>,
) -> impl Responder {
    let id = path.into_inner();
    let db_locked = db.lock().unwrap();
    if let Some(product) = db_locked.get(&id) {
        HttpResponse::Ok().json(product)
    } else {
        HttpResponse::NotFound().body("Product not found")
    }
}

// POST /products
async fn create_product(
    db: web::Data<DbProducts>,
    product: web::Json<Product>,
) -> impl Responder {
    let mut db_locked = db.lock().unwrap();
    let mut new_product = product.into_inner();
    // Generate a new ID if not provided or if it's empty
    if new_product.id.is_empty() {
        new_product.id = format!("P{}", Uuid::new_v4().to_string().split('-').next().unwrap_or(""));
    }
    if db_locked.contains_key(&new_product.id) {
        return HttpResponse::Conflict().body("Product with this ID already exists");
    }
    db_locked.insert(new_product.id.clone(), new_product.clone());
    HttpResponse::Created().json(new_product)
}

// PUT /products/{id}
async fn update_product(
    db: web::Data<DbProducts>,
    path: web::Path<String>,
    product: web::Json<Product>,
) -> impl Responder {
    let id = path.into_inner();
    let mut db_locked = db.lock().unwrap();
    if let Some(existing_product) = db_locked.get_mut(&id) {
        // Update fields individually, or replace the whole struct
        existing_product.name = product.name.clone();
        existing_product.stock = product.stock;
        existing_product.price = product.price;
        existing_product.description = product.description.clone();
        HttpResponse::Ok().json(existing_product.clone())
    } else {
        HttpResponse::NotFound().body("Product not found")
    }
}

// DELETE /products/{id}
async fn delete_product(
    db: web::Data<DbProducts>,
    path: web::Path<String>,
) -> impl Responder {
    let id = path.into_inner();
    let mut db_locked = db.lock().unwrap();
    if db_locked.remove(&id).is_some() {
        HttpResponse::NoContent().finish()
    } else {
        HttpResponse::NotFound().body("Product not found")
    }
}

// --- Handlers for Services ---

// GET /services
async fn get_all_services(db: web::Data<DbServices>) -> impl Responder {
    let services = db.lock().unwrap().values().cloned().collect::<Vec<Service>>();
    HttpResponse::Ok().json(services)
}

// GET /services/{id}
async fn get_service_by_id(
    db: web::Data<DbServices>,
    path: web::Path<String>,
) -> impl Responder {
    let id = path.into_inner();
    let db_locked = db.lock().unwrap();
    if let Some(service) = db_locked.get(&id) {
        HttpResponse::Ok().json(service)
    } else {
        HttpResponse::NotFound().body("Service not found")
    }
}

// POST /services
async fn create_service(
    db: web::Data<DbServices>,
    service: web::Json<Service>,
) -> impl Responder {
    let mut db_locked = db.lock().unwrap();
    let mut new_service = service.into_inner();
    // Generate a new ID if not provided or if it's empty
    if new_service.id.is_empty() {
        new_service.id = format!("L{}", Uuid::new_v4().to_string().split('-').next().unwrap_or(""));
    }
    if db_locked.contains_key(&new_service.id) {
        return HttpResponse::Conflict().body("Service with this ID already exists");
    }
    db_locked.insert(new_service.id.clone(), new_service.clone());
    HttpResponse::Created().json(new_service)
}

// PUT /services/{id}
async fn update_service(
    db: web::Data<DbServices>,
    path: web::Path<String>,
    service: web::Json<Service>,
) -> impl Responder {
    let id = path.into_inner();
    let mut db_locked = db.lock().unwrap();
    if let Some(existing_service) = db_locked.get_mut(&id) {
        // Update fields individually, or replace the whole struct
        existing_service.name = service.name.clone();
        existing_service.estimated_hours = service.estimated_hours;
        existing_service.price = service.price;
        existing_service.description = service.description.clone();
        HttpResponse::Ok().json(existing_service.clone())
    } else {
        HttpResponse::NotFound().body("Service not found")
    }
}

// DELETE /services/{id}
async fn delete_service(
    db: web::Data<DbServices>,
    path: web::Path<String>,
) -> impl Responder {
    let id = path.into_inner();
    let mut db_locked = db.lock().unwrap();
    if db_locked.remove(&id).is_some() {
        HttpResponse::NoContent().finish()
    } else {
        HttpResponse::NotFound().body("Service not found")
    }
}

// --- Main Function ---

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Inisialisasi data dummy untuk produk
    let initial_products: HashMap<String, Product> = HashMap::from([
        ("P001".to_string(), Product {
            id: "P001".to_string(),
            name: "Facial Wash Brightening".to_string(),
            stock: 150,
            price: 75000.0,
            description: Some("Pembersih wajah untuk mencerahkan kulit.".to_string()),
        }),
        ("P002".to_string(), Product {
            id: "P002".to_string(),
            name: "Sunscreen SPF 30".to_string(),
            stock: 200,
            price: 80000.0,
            description: Some("Tabir surya untuk perlindungan harian.".to_string()),
        }),
    ]);

    // Inisialisasi data dummy untuk layanan
    let initial_services: HashMap<String, Service> = HashMap::from([
        ("L001".to_string(), Service {
            id: "L001".to_string(),
            name: "Acne Treatment".to_string(),
            estimated_hours: 1.5,
            price: 250000.0,
            description: Some("Perawatan lengkap untuk kulit berjerawat.".to_string()),
        }),
        ("L002".to_string(), Service {
            id: "L002".to_string(),
            name: "Basic Facial".to_string(),
            estimated_hours: 1.0,
            price: 150000.0,
            description: Some("Facial dasar untuk membersihkan wajah.".to_string()),
        }),
    ]);

    let db_products = Arc::new(Mutex::new(initial_products));
    let db_services = Arc::new(Mutex::new(initial_services));

    println!("Starting server at http://127.0.0.1:8000");

    HttpServer::new(move || {
        // Konfigurasi CORS
        let cors = Cors::permissive(); // Izinkan semua origin untuk pengembangan

        App::new()
            .wrap(cors) // Terapkan CORS middleware
            .app_data(web::Data::new(db_products.clone())) // Tambahkan state produk
            .app_data(web::Data::new(db_services.clone())) // Tambahkan state layanan
            .service(web::scope("/products") // Rute untuk produk
                .route("", web::get().to(get_all_products))
                .route("", web::post().to(create_product))
                .route("/{id}", web::get().to(get_product_by_id))
                .route("/{id}", web::put().to(update_product))
                .route("/{id}", web::delete().to(delete_product))
            )
            .service(web::scope("/services") // Rute untuk layanan
                .route("", web::get().to(get_all_services))
                .route("", web::post().to(create_service))
                .route("/{id}", web::get().to(get_service_by_id))
                .route("/{id}", web::put().to(update_service))
                .route("/{id}", web::delete().to(delete_service))
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}