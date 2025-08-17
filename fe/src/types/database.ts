// src/interfaces.ts (atau di mana pun Anda mendefinisikan tipe data)

export interface Produk {
    id: string; // Diubah dari number ke string (UUID)
    nama: string;
    stok: number;
    harga: number;
}

export interface Treatment {
    id: string; // Diubah dari number ke string (UUID)
    nama: string;
    estimasi_waktu: number; // Diubah sesuai snake_case backend
    harga: number;
}

export interface DailySchedule {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string; // contoh: "09:00"
  endTime: string; // contoh: "17:00"
}

export interface Dokter {
    id: string; // Backend menggunakan UUID, jadi string
    nama: string;
    posisi: string;
    jadwal: DailySchedule[]; // Frontend menganggap ini array of objects
}

export interface SkinAnalysis {
    id: string; // Diubah dari number ke string (UUID)
    pasien_id: string; // Diubah dari number ke string (UUID)
    appointment_id: string; // Diubah dari number ke string (UUID)
    tanggal_analisis: string; // 'YYYY-MM-DD'
    hasil_visual: string | null;
    hasil_alat: string | null;
    rekomendasi_treatment: string[]; // Diubah dari number[] ke string[]
    rekomendasi_produk: string[]; // Diubah dari number[] ke string[]
    catatan_tambahan: string | null;
}

export interface TreatmentProgress {
    id: string; // Diubah dari number ke string (UUID)
    pasien_id: string; // Diubah dari number ke string (UUID)
    appointment_id: string; // Diubah dari number ke string (UUID)
    tanggal_progress: string; // YYYY-MM-DD
    catatan: string | null;
}

export interface Pasien {
    id: string; // Diubah dari number ke string (UUID)
    nama_lengkap: string; // Diubah sesuai snake_case backend
    no_telepon: string; // Diubah sesuai snake_case backend
    email: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: string | null; // Dibuat generik, karena bisa jadi 'Pria' atau 'Wanita'
    no_identitas: string | null;
    alamat_lengkap: string | null;
    riwayat_alergi: string | null;
    kondisi_medis: string | null;
    obat_konsumsi: string | null;
    riwayat_treatment: string | null;
    keluhan_utama: string | null;
    nomer_kontak_darurat: string | null; // Diubah sesuai snake_case backend
    kontak_darurat_nama: string | null; // Diubah sesuai snake_case backend
    kontak_darurat_hubungan: string | null; // Diubah sesuai snake_case backend
    preferensi_komunikasi: string[] | null;
    setuju_data: boolean | null;
    has_initial_skin_analysis: boolean | null; 
     skin_analyses?: SkinAnalysis[]; // Add this line
  treatment_progresses?: TreatmentProgress[]; // Add this line
  appointments?: Appointment[]; // You might need this too
}

export interface Appointment {
    id: string; // Diubah dari number ke string (UUID)
    pasien_id: string; // Diubah dari number ke string (UUID)
    dokter_id: string; // Diubah dari number ke string (UUID)
    treatment_ids: string[]; // Diubah dari number[] ke string[]
    tanggal: string; // 'YYYY-MM-DD'
    waktu: string; // HH:MM
    status: 'booked' | 'completed' | 'cancelled' | 'rescheduled' | 'paid';
    is_initial_skin_analysis: boolean | null; // Diubah sesuai snake_case backend
    skin_analysis_id: string | null; // Diubah dari number ke string (UUID)
    treatment_progress_id: string | null; // Diubah dari number ke string (UUID)
}

export interface InvoiceItem {
    // Ini representasi yang bagus untuk frontend, tapi data di backend adalah JSONB generik
    type: 'treatment' | 'product';
    item_id: string; // Diubah dari number ke string (UUID)
    name: string;
    quantity: number;
    price_per_unit: number; // Diubah sesuai snake_case
    subtotal: number;
}

export interface Invoice {
    id: string; // Diubah dari number ke string (UUID)
    appointment_id: string | null; // Diubah dari number ke string (UUID)
    pasien_id: string; // Diubah dari number ke string (UUID)
    tanggal: string; // YYYY-MM-DD
    waktu: string; // HH:MM
    items: InvoiceItem[];
    total_amount: number; // Diubah sesuai snake_case
    amount_paid: number; // Diubah sesuai snake_case
    change_amount: number | null; // Diubah sesuai snake_case
    payment_method: string | null; // Diubah sesuai snake_case
    status: 'pending' | 'paid' | 'cancelled';
    kasir_name: string | null; // Diubah sesuai snake_case
}