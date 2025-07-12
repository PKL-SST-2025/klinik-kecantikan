// src/types/index.ts (atau sesuaikan dengan lokasi types Anda)
// Pastikan semua interfaces yang sudah ada juga ada di sini

export interface Produk {
    id: number;
    nama: string;
    stok: number;
    harga: number;
}

export interface Treatment {
    id: number;
    nama: string;
    estimasiWaktu: number; // dalam menit
    harga: number;
}

export interface DailySchedule {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
}

export interface Dokter {
    id: number;
    nama: string;
    posisi: string;
    jadwal: DailySchedule[]; // <-- PERUBAHAN DI SINI
}


export interface SkinAnalysis {
    id: number;
    appointmentId: number; // Link to the specific appointment where this analysis was done
    tanggalAnalisis: string; // YYYY-MM-DD
    hasilVisual: string; // Deskripsi hasil penglihatan (contoh: "Kulit kusam, ada jerawat aktif di dahi")
    hasilAlat: string; // Deskripsi hasil alat (contoh: "Kelembaban 30%, elastisitas rendah")
    rekomendasiTreatment: number[]; // Array of recommended Treatment IDs
    rekomendasiProduk: number[]; // Array of recommended Produk IDs
    catatanTambahan: string;
}

export interface TreatmentProgress {
    id: number;
    appointmentId: number; // Link to the specific appointment where this progress was done
    tanggalProgress: string; // YYYY-MM-DD
    catatan: string; // Deskripsi treatment yang dilakukan dan hasilnya
}

export interface Pasien {
    id: number;
    namaLengkap: string;
    noTelepon: string;
    email: string;
    tanggalLahir: string; // 'YYYY-MM-DD'
    jenisKelamin: 'Pria' | 'Wanita';
    noIdentitas: string;
    alamatLengkap: string;
    riwayatAlergi: string; // Mengubah dari string[] ke string
    kondisiMedis: string; // Mengubah dari string[] ke string
    obatKonsumsi: string;
    riwayatTreatment: string;
    keluhanUtama: string;
    NomerKontakDarurat?: string;
    kontakDaruratNama?: string;
    kontakDaruratHubungan?: string;
    preferensiKomunikasi?: string[];
    setujuData: boolean;
    hasInitialSkinAnalysis: boolean; // Menandakan apakah sudah pernah analisis kulit awal
    // NEW: Tambahkan array untuk riwayat analisis dan progress
    skinAnalyses: SkinAnalysis[]; // Array of all skin analyses for this patient
    treatmentProgresses: TreatmentProgress[]; // Array of all treatment progresses for this patient
}

export interface Appointment {
    id: number;
    pasienId: number;
    dokterId: number;
    treatmentIds: number[];
    tanggal: string; // 'YYYY-MM-DD'
    status: 'booked' | 'completed' | 'cancelled' | 'rescheduled';
    isInitialSkinAnalysis: boolean; // Jika appointment ini adalah untuk analisis kulit awal
    // NEW: Link ke hasil analisis/progress jika sudah selesai
    skinAnalysisId?: number; // ID dari SkinAnalysis jika ini adalah appointment analisis kulit
    treatmentProgressId?: number; // ID dari TreatmentProgress jika ini adalah appointment treatment
}

export interface InvoiceItem {
    type: 'treatment' | 'product';
    itemId: number; // ID dari treatment atau produk
    name: string;
    quantity: number; // Selalu 1 untuk treatment, bisa >1 untuk produk
    pricePerUnit: number;
    subtotal: number;
}

export interface Invoice {
    id: number;
    appointmentId?: number; // Opsional, jika transaksi ini terkait dengan appointment
    pasienId: number;
    tanggal: string; // YYYY-MM-DD
    waktu: string; // HH:MM
    items: InvoiceItem[];
    totalAmount: number;
    amountPaid: number;
    change: number; // Kembalian
    paymentMethod: string; // 'Cash', 'Credit Card', 'Debit Card', 'Transfer', etc.
    status: 'pending' | 'paid' | 'cancelled';
    kasirName: string; // Nama kasir yang memproses transaksi
}