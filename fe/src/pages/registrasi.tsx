// src/pages/registrasi.tsx
import { createSignal, createEffect, onMount, Component, createMemo } from 'solid-js';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/id';
import toast, { Toaster } from 'solid-toast';
import { Pasien, Dokter, TreatmentFromBackend, Appointment } from '../types/database';
import api from '../api/api';

dayjs.extend(isSameOrBefore);
dayjs.locale('id');

// --- Icons (from lucide-solid) ---
import { User, Phone, Mail, Calendar, Clock, Stethoscope, Tag, Pill, MessageCircle, MapPin, IdCard, Activity, AlertTriangle, Users, Heart, MessageSquare, HeartHandshake, CheckCheck, Search } from 'lucide-solid';

const BookingPage: Component = () => {

    // --- State Management ---
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<TreatmentFromBackend[]>([]);
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);

    // Form states for Pasien
    const [isNewPatient, setIsNewPatient] = createSignal(true);
    const [selectedPasienId, setSelectedPasienId] = createSignal<string | null>(null);
    
    // Search states for existing patient
    const [searchQuery, setSearchQuery] = createSignal('');
    const [showSearchResults, setShowSearchResults] = createSignal(false);

    // Form states for Booking & Pasien Details
    const [formData, setFormData] = createSignal({
        // Pasien Data
        nama_lengkap: '', no_telepon: '', email: '', tanggal_lahir: '', jenis_kelamin: 'Wanita' as 'Pria' | 'Wanita', no_identitas: '', alamat_lengkap: '',
        riwayat_alergi: '', kondisi_medis: '', obat_konsumsi: '', riwayat_treatment: '', keluhan_utama: '', kontak_darurat_nama: '',
        kontak_darurat_hubungan: '', nomer_kontak_darurat: '', preferensi_komunikasi: [] as string[], setuju_data: true,
        // Appointment Data
        tanggal_appointment: '',
        selectedTreatmentIds: [] as string[],
        selectedDokterId: null as string | null,
    });

    const [currentStep, setCurrentStep] = createSignal(1);

    // --- OnMount: Load data from backend API ---
    onMount(async () => {
        console.log('BookingPage: onMount - Loading data from backend API...');
        try {
            const [pasienRes, dokterRes, treatmentRes, appointmentRes] = await Promise.all([
                api.get('/pasiens'),
                api.get('/dokters'),
                api.get('/treatments'),
                api.get('/appointments'),
            ]);
            setPasienList(pasienRes.data);
            setDokterList(dokterRes.data);
            setTreatmentList(treatmentRes.data);
            setAppointmentList(appointmentRes.data);
            console.log('All data loaded successfully.');
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Gagal memuat data dari server.');
        }
    });

    // --- Computed Values (createMemo) ---
    const initialSkinAnalysisTreatment = createMemo(() => {
        return treatmentList().find(t => t.name === 'Analisis Kulit Awal & Konsultasi');
    });

    const filteredPasienList = createMemo(() => {
        if (!searchQuery()) return [];
        
        const query = searchQuery().toLowerCase();
        return pasienList().filter(pasien => 
            pasien.nama_lengkap.toLowerCase().includes(query) ||
            pasien.no_telepon.includes(query) ||
            (pasien.email && pasien.email.toLowerCase().includes(query))
        ).slice(0, 10); // Limit to 10 results for performance
    });

    const totalAppointmentDuration = createMemo(() => {
        let duration = 0;
        const selectedIds = formData().selectedTreatmentIds;
        const treatments = treatmentList();

        selectedIds.forEach(id => {
            const treatment = treatments.find(t => t.id === id);
            if (treatment) {
                duration += treatment.estimated_time;
            }
        });

        const analysisTreatment = initialSkinAnalysisTreatment();
        const patientRequiresAnalysis = isNewPatient() ||
            (selectedPasienId() && !pasienList().find(p => p.id === selectedPasienId())?.has_initial_skin_analysis);
        if (patientRequiresAnalysis && analysisTreatment && !selectedIds.includes(analysisTreatment.id)) {
            duration += analysisTreatment.estimated_time;
        }
        return duration;
    });

    // --- Handlers ---
    const handlePasienTypeChange = (e: Event) => {
        setIsNewPatient((e.target as HTMLInputElement).value === 'new');
        setFormData(prev => ({
            ...prev,
            nama_lengkap: '', no_telepon: '', email: '', tanggal_lahir: '', jenis_kelamin: 'Wanita', alamat_lengkap: '',
            riwayat_alergi: '', kondisi_medis: '', obat_konsumsi: '', riwayat_treatment: '', keluhan_utama: '',
            no_identitas: '', kontak_darurat_nama: '', kontak_darurat_hubungan: '', nomer_kontak_darurat: '', preferensi_komunikasi: [],
            setuju_data: true,
        }));
        setSelectedPasienId(null);
        setSearchQuery('');
        setShowSearchResults(false);
    };

    const handleSearchChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        setSearchQuery(value);
        setShowSearchResults(value.length > 0);
        setSelectedPasienId(null);
    };

    const handlePasienSelect = (pasien: Pasien) => {
        setSelectedPasienId(pasien.id ?? null);
        setSearchQuery(pasien.nama_lengkap);
        setShowSearchResults(false);

        setFormData(prev => {
            const updatedFormData = {
                ...prev,
                nama_lengkap: pasien.nama_lengkap,
                no_telepon: pasien.no_telepon,
                email: pasien.email || '',
                tanggal_lahir: pasien.tanggal_lahir || '',
                jenis_kelamin: (pasien.jenis_kelamin === 'Wanita' || pasien.jenis_kelamin === 'Pria' ? pasien.jenis_kelamin : 'Wanita') as 'Wanita' | 'Pria',
                alamat_lengkap: pasien.alamat_lengkap || '',
                riwayat_alergi: pasien.riwayat_alergi || '',
                kondisi_medis: pasien.kondisi_medis || '',
                obat_konsumsi: pasien.obat_konsumsi || '',
                riwayat_treatment: pasien.riwayat_treatment || '',
                keluhan_utama: pasien.keluhan_utama || '',
                no_identitas: pasien.no_identitas || '',
                kontak_darurat_nama: pasien.kontak_darurat_nama || '',
                kontak_darurat_hubungan: pasien.kontak_darurat_hubungan || '',
                nomer_kontak_darurat: pasien.nomer_kontak_darurat || '',
                preferensi_komunikasi: pasien.preferensi_komunikasi || [],
                setuju_data: pasien.setuju_data === null ? true : pasien.setuju_data,
            };

            if (!pasien.has_initial_skin_analysis && initialSkinAnalysisTreatment()) {
                updatedFormData.selectedTreatmentIds = [initialSkinAnalysisTreatment()!.id];
            } else {
                updatedFormData.selectedTreatmentIds = [];
            }
            return updatedFormData;
        });
        setCurrentStep(2);
    };

    const handleFormChange = (key: keyof ReturnType<typeof formData>, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleMultiSelectChange = (field: string, e: Event) => {
        const target = e.target as HTMLSelectElement;
        const selectedValues = Array.from(target.selectedOptions).map(option => option.value);
        setFormData(prev => ({ ...prev, [field]: selectedValues }));
    };

    const handleSubmitPasienInfo = (e: Event) => {
        e.preventDefault();
        if (isNewPatient() && (!formData().nama_lengkap || !formData().no_telepon || !formData().tanggal_lahir)) {
            toast.error('Nama, Nomor Telepon, dan Tanggal Lahir pasien baru wajib diisi.');
            return;
        }
        if (!isNewPatient() && !selectedPasienId()) {
            toast.error('Silakan pilih pasien yang sudah ada.');
            return;
        }
        setCurrentStep(2);
    };

    const handleSubmitBooking = async (e: Event) => {
        e.preventDefault();

        if (!formData().tanggal_appointment || !formData().selectedDokterId || totalAppointmentDuration() <= 0) {
            toast.error('Tanggal, Dokter, dan Treatment wajib dipilih.');
            return;
        }

        let currentPasienId: string;
        let requiresInitialAnalysis = false;

        // STEP 1: Handle Pasien Creation or Selection
        if (isNewPatient()) {
            const newPasienData = {
    nama_lengkap: formData().nama_lengkap,
    no_telepon: formData().no_telepon,
    email: formData().email || null,
    tanggal_lahir: formData().tanggal_lahir || null,
    jenis_kelamin: formData().jenis_kelamin || null,
    alamat_lengkap: formData().alamat_lengkap || null,
    riwayat_alergi: formData().riwayat_alergi || null,
    kondisi_medis: formData().kondisi_medis || null,
    obat_konsumsi: formData().obat_konsumsi || null,
    riwayat_treatment: formData().riwayat_treatment || null,
    keluhan_utama: formData().keluhan_utama || null,
    no_identitas: formData().no_identitas || null,
    kontak_darurat_nama: formData().kontak_darurat_nama || null,
    kontak_darurat_hubungan: formData().kontak_darurat_hubungan || null,
    nomer_kontak_darurat: formData().nomer_kontak_darurat || null,
    preferensi_komunikasi: [],
    setuju_data: !!formData().setuju_data, // pastikan boolean
    has_initial_skin_analysis: false,
};

            try {
                const res = await api.post('/pasiens', newPasienData);
                const createdPasien = res.data;
                currentPasienId = createdPasien.id;
                setPasienList(prev => [...prev, createdPasien]);
                requiresInitialAnalysis = true;
                toast.success('Pasien baru berhasil didaftarkan!');
            } catch (error) {
                console.error('Failed to create pasien:', error);
                toast.error('Gagal mendaftarkan pasien. Silakan coba lagi.');
                return;
            }
        } else {
            if (!selectedPasienId()) {
                toast.error('Silakan pilih pasien yang sudah ada.');
                return;
            }
            currentPasienId = selectedPasienId()!;
            const pasien = pasienList().find(p => p.id === currentPasienId);
            if (pasien && !pasien.has_initial_skin_analysis) {
                requiresInitialAnalysis = true;
            }
        }

        // STEP 2: Handle Appointment Creation
        let treatmentsForAppointment = formData().selectedTreatmentIds;
        const analysisTreatment = initialSkinAnalysisTreatment();

        if (requiresInitialAnalysis && analysisTreatment) {
            if (!treatmentsForAppointment.includes(analysisTreatment.id)) {
                treatmentsForAppointment = [analysisTreatment.id, ...treatmentsForAppointment];
            }
        }

        treatmentsForAppointment = Array.from(new Set(treatmentsForAppointment));

       const newAppointmentData = {
    pasien_id: currentPasienId, // UUID dari pasien yang sudah terdaftar
    dokter_id: formData().selectedDokterId!, // UUID dari dokter yang dipilih
    treatment_ids: treatmentsForAppointment, // array of UUID string dari treatment yang dipilih
    tanggal: formData().tanggal_appointment, // format YYYY-MM-DD
    waktu: "10:00:00", // format HH:MM:SS
    status: "booked",
    is_initial_skin_analysis: requiresInitialAnalysis && treatmentsForAppointment.includes(analysisTreatment?.id!),
    skin_analysis_id: null,
    treatment_progress_id: null,
};
console.log('Payload appointment:', newAppointmentData);

        try {
            const res = await api.post('/appointments', newAppointmentData);
            const createdAppointment = res.data;
            setAppointmentList(prev => [...prev, createdAppointment]);
            toast.success('Appointment berhasil dibooking!');
            console.log('New Appointment:', createdAppointment);

            // STEP 3: Update Pasien if needed
            if (requiresInitialAnalysis) {
                const updatePasienDto = { has_initial_skin_analysis: true };
                await api.patch(`/pasiens/${currentPasienId}`, updatePasienDto);
                
                const pasienRes = await api.get('/pasiens');
                setPasienList(pasienRes.data);
                console.log('Pasien updated with has_initial_skin_analysis: true');
            }

        } catch (error) {
            console.error('Failed to create appointment:', error);
            toast.error('Gagal membuat appointment. Silakan coba lagi.');
        }

        resetForm();
    };

    const resetForm = () => {
        setIsNewPatient(true);
        setSelectedPasienId(null);
        setSearchQuery('');
        setShowSearchResults(false);
        setFormData({
            nama_lengkap: '', no_telepon: '', email: '', tanggal_lahir: '', jenis_kelamin: 'Wanita', no_identitas: '', alamat_lengkap: '',
            riwayat_alergi: '', kondisi_medis: '', obat_konsumsi: '', riwayat_treatment: '', keluhan_utama: '',
            kontak_darurat_nama: '', kontak_darurat_hubungan: '', nomer_kontak_darurat: '', preferensi_komunikasi: [], setuju_data: true,
            tanggal_appointment: '', selectedTreatmentIds: [], selectedDokterId: null,
        });
        setCurrentStep(1);
    };

    // Close search results when clicking outside
    const handleClickOutside = () => {
        setShowSearchResults(false);
    };

   return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 font-sans" onClick={handleClickOutside}>
        
        <Toaster position="top-right" />

        {/* Header Section */}
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Registrasi & Booking Appointment</h1>
            <p class="text-gray-600">Daftarkan pasien baru dan atur jadwal janji temu pertama mereka, termasuk analisis kulit awal.</p>
        </div>

        {/* Main Content Card */}
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 md:p-12" onClick={(e) => e.stopPropagation()}>
            {/* Step Indicators */}
            <div class="flex items-center justify-center mb-12">
                <div class="flex items-center w-full max-w-md">
                    <div class="flex flex-col items-center">
                        <div class={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${currentStep() >= 1
? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-110'
: 'bg-gray-400'
}`}>
                            1
                        </div>
                        <span class="text-sm mt-3 text-gray-700 font-medium">Info Pasien</span>
                    </div>
                    <div class={`flex-1 h-0.5 mx-8 transition-all duration-300 ${currentStep() >= 2
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                        : 'bg-gray-300'
                    }`}></div>
                    <div class="flex flex-col items-center">
                        <div class={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${currentStep() >= 2
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-110'
                            : 'bg-gray-400'
                        }`}>
                            2
                        </div>
                        <span class="text-sm mt-3 text-gray-700 font-medium">Detail Booking</span>
                    </div>
                </div>
            </div>

            {/* --- Step 1: Pasien Information --- */}
            <form
                onSubmit={handleSubmitPasienInfo}
                class={currentStep() === 1 ? 'block' : 'hidden'}
            >
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                            <span class="text-white font-bold">1</span>
                        </div>
                        Informasi Pasien
                    </h2>
                    <p class="text-gray-600">Lengkapi data pasien dengan teliti untuk memastikan pelayanan yang optimal</p>
                </div>

                {/* Pasien Type Selection */}
                <div class="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <label class="block text-base font-semibold text-gray-800 mb-4">Jenis Pasien</label>
                    <div class="flex gap-6">
                        <label class="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-all duration-200 flex-1">
                            <input
                                type="radio"
                                name="patientType"
                                value="new"
                                checked={isNewPatient()}
                                onInput={handlePasienTypeChange}
                                class="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <div class="ml-4">
                                <span class="text-gray-900 font-medium">Pasien Baru</span>
                                <p class="text-sm text-gray-600">Kunjungan pertama ke klinik</p>
                            </div>
                        </label>
                        <label class="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-all duration-200 flex-1">
                            <input
                                type="radio"
                                name="patientType"
                                value="existing"
                                checked={!isNewPatient()}
                                onInput={handlePasienTypeChange}
                                class="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <div class="ml-4">
                                <span class="text-gray-900 font-medium">Pasien Lama</span>
                                <p class="text-sm text-gray-600">Sudah terdaftar sebelumnya</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Existing Pasien Search */}
                {!isNewPatient() && (
                    <div class="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                        <label class="block text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Search size={20} class="text-blue-600" />
                            Cari Pasien Lama
                        </label>
                        <div class="relative">
                            <div class="relative">
                                <Search size={20} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery()}
                                    onInput={handleSearchChange}
                                    onClick={(e) => e.stopPropagation()}
                                    class="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                                    placeholder="Ketik nama, nomor telepon, atau email pasien..."
                                    required={!isNewPatient()}
                                />
                            </div>
                            
                            {/* Search Results Dropdown */}
                            {showSearchResults() && filteredPasienList().length > 0 && (
                                <div class="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {filteredPasienList().map(pasien => (
                                        <div 
                                            class="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            onClick={() => handlePasienSelect(pasien)}
                                        >
                                            <div class="font-medium text-gray-900">{pasien.nama_lengkap}</div>
                                            <div class="text-sm text-gray-600 flex items-center gap-4">
                                                <span class="flex items-center gap-1">
                                                    <Phone size={14} />
                                                    {pasien.no_telepon}
                                                </span>
                                                {pasien.email && (
                                                    <span class="flex items-center gap-1">
                                                        <Mail size={14} />
                                                        {pasien.email}
                                                    </span>
                                                )}
                                            </div>
                                            {!pasien.has_initial_skin_analysis && (
                                                <div class="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    Belum melakukan analisis kulit awal
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* No Results Message */}
                            {showSearchResults() && searchQuery().length > 0 && filteredPasienList().length === 0 && (
                                <div class="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg p-4 text-center text-gray-500">
                                    Tidak ada pasien yang ditemukan
                                </div>
                            )}
                        </div>
                        
                        {/* Selected Patient Info */}
                        {selectedPasienId() && (
                            <div class="mt-4 p-4 bg-white rounded-xl border border-blue-200">
                                <p class="text-sm font-medium text-gray-700 mb-2">Pasien Terpilih:</p>
                                <div class="text-base font-semibold text-blue-800">
                                    {formData().nama_lengkap} - {formData().no_telepon}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* New Patient Details */}
                <div class={isNewPatient() ? 'block' : 'hidden'}>
                    {/* Basic Information */}
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <User size={20} class="text-purple-600" />
                            Data Pribadi
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Lengkap */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User size={16} class="text-gray-500" />
                                    Nama Lengkap <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    value={formData().nama_lengkap}
                                    onInput={(e) => handleFormChange('nama_lengkap', e.target.value)}
                                    required={isNewPatient()}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            {/* Nomor Telepon */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone size={16} class="text-gray-500" />
                                    Nomor Telepon <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData().no_telepon}
                                    onInput={(e) => handleFormChange('no_telepon', e.target.value)}
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    required={isNewPatient()}
                                    placeholder="081234567890"
                                />
                            </div>

                            {/* Email */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail size={16} class="text-gray-500" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData().email}
                                    onInput={(e) => handleFormChange('email', e.target.value)}
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    placeholder="contoh@email.com"
                                />
                            </div>

                            {/* Tanggal Lahir */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} class="text-gray-500" />
                                    Tanggal Lahir <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData().tanggal_lahir}
                                    onInput={(e) => handleFormChange('tanggal_lahir', e.target.value)} 
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    required={isNewPatient()}
                                />
                            </div>

                            {/* Jenis Kelamin */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700">
                                    Jenis Kelamin <span class="text-red-500">*</span>
                                </label>
                                <select
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    value={formData().jenis_kelamin}
                                    onInput={(e) => handleFormChange('jenis_kelamin', e.target.value)}
                                    required={isNewPatient()}
                                >
                                    <option value="Wanita">Wanita</option>
                                    <option value="Pria">Pria</option>
                                </select>
                            </div>

                            {/* No Identitas */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <IdCard size={16} class="text-gray-500" />
                                    Nomor Identitas (KTP/SIM/Paspor)
                                </label>
                                <input
                                    type="text"
                                    value={formData().no_identitas}
                                    onInput={(e) => handleFormChange('no_identitas', e.target.value)} 
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    placeholder="3201234567890001"
                                />
                            </div>
                        </div>

                        {/* Alamat Lengkap */}
                        <div class="mt-6 space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin size={16} class="text-gray-500" />
                                Alamat Lengkap
                            </label>
                            <textarea
                                value={formData().alamat_lengkap}
                                onInput={(e) => handleFormChange('alamat_lengkap', e.target.value)} 
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 resize-none"
                                rows={3}
                                placeholder="Masukkan alamat lengkap"
                            ></textarea>
                        </div>
                    </div>

                    {/* Medical & Skin Info */}
                    <div class="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
                        <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Activity size={20} class="text-green-600" />
                            Informasi Medis & Kulit
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Riwayat Alergi */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <AlertTriangle size={16} class="text-red-500" />
                                    Riwayat Alergi
                                </label>
                                <textarea
                                    value={formData().riwayat_alergi}
                                    onInput={(e) => handleFormChange('riwayat_alergi', e.target.value)} 
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 resize-none"
                                    rows={3}
                                    placeholder="Contoh: Alergi antibiotik jenis Amoxicillin, alergi pewarna rambut"
                                ></textarea>
                            </div>

                            {/* Kondisi Medis */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Activity size={16} class="text-blue-500" />
                                    Kondisi Medis yang Sedang Diderita
                                </label>
                                <textarea
                                    value={formData().kondisi_medis}
                                    onInput={(e) => handleFormChange('kondisi_medis', e.target.value)} 
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 resize-none"
                                    rows={3}
                                    placeholder="Contoh: Sedang hamil 5 bulan, memiliki riwayat diabetes tipe 2"
                                ></textarea>
                            </div>
                        </div>

                        {/* Obat Konsumsi */}
                        <div class="mt-6 space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Pill size={16} class="text-purple-500" />
                                Obat-obatan/Suplemen yang Sedang Dikonsumsi
                            </label>
                            <textarea
                                value={formData().obat_konsumsi}
                                onInput={(e) => handleFormChange('obat_konsumsi', e.target.value)} 
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 resize-none"
                                rows={2}
                                placeholder="Contoh: Vitamin C, Paracetamol, dll"
                            ></textarea>
                        </div>

                        {/* Riwayat Treatment */}
                        <div class="mt-6 space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Clock size={16} class="text-orange-500" />
                                Riwayat Treatment Kecantikan Sebelumnya
                            </label>
                            <textarea
                                value={formData().riwayat_treatment}
                                onInput={(e) => handleFormChange('riwayat_treatment', e.target.value)} 
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 resize-none"
                                rows={2}
                                placeholder="Contoh: Facial reguler, chemical peeling, dll"
                            ></textarea>
                        </div>

                        {/* Keluhan Utama */}
                        <div class="mt-6 space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MessageCircle size={16} class="text-indigo-500" />
                                Keluhan Utama / Tujuan Kunjungan
                            </label>
                            <textarea
                                value={formData().keluhan_utama}
                                onInput={(e) => handleFormChange('keluhan_utama', e.target.value)}
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 resize-none"
                                rows={3}
                                placeholder="Jelaskan keluhan atau tujuan kunjungan Anda"
                            ></textarea>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div class="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                        <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Users size={20} class="text-orange-600" />
                            Kontak Darurat (Opsional)
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Kontak Darurat */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User size={16} class="text-gray-500" />
                                    Nama Kontak Darurat
                                </label>
                                <input
                                    type="text"
                                    value={formData().kontak_darurat_nama}
                                    onInput={(e) => handleFormChange('kontak_darurat_nama', e.target.value)} 
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    placeholder="Nama lengkap kontak darurat"
                                />
                            </div>

                            {/* Hubungan */}
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Heart size={16} class="text-gray-500" />
                                    Hubungan
                                </label>
                                <input
                                    type="text"
                                    value={formData().kontak_darurat_hubungan}
                                    onInput={(e) => handleFormChange('kontak_darurat_hubungan', e.target.value)} 
                                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                    placeholder="Contoh: Ibu, Suami, Saudara"
                                />
                            </div>
                        </div>

                        {/* Nomor Kontak Darurat */}
                        <div class="mt-6 space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Phone size={16} class="text-gray-500" />
                                Nomor Kontak Darurat
                            </label>
                            <input
                                type="tel"
                                value={formData().nomer_kontak_darurat}
                                onInput={(e) => handleFormChange('nomer_kontak_darurat', e.target.value)} 
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                placeholder="081234567890"
                            />
                        </div>
                    </div>
                    
                    {/* Agreement */}
                    <div class="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                        <label class="flex items-start gap-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData().setuju_data}
                                onInput={(e) => handleFormChange('setuju_data', e.target.checked)} 
                                class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                                required
                            />
                            <div class="flex-1">
                                <span class="text-gray-900 font-medium">
                                    Saya menyetujui data saya disimpan dan digunakan untuk keperluan layanan klinik.
                                    <span class="text-red-500">*</span>
                                </span>
                                <p class="text-sm text-gray-600 mt-1">
                                    Data Anda akan dijaga kerahasiaannya dan hanya digunakan untuk memberikan pelayanan medis terbaik.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
<div class="flex justify-end pt-6 border-t border-gray-200">
    <button
        type="submit"
        class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Lanjut ke Booking
        <CheckCheck size={20} />
    </button>
</div>
            </form>

            {/* --- Step 2: Booking Details --- */}
            <form onSubmit={handleSubmitBooking} class={currentStep() === 2 ? 'block' : 'hidden'}>
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                            <span class="text-white font-bold">2</span>
                        </div>
                        Detail Janji Temu
                    </h2>
                    <p class="text-gray-600">Pilih tanggal, waktu, dokter, dan treatment untuk janji temu.</p>
                </div>

                {/* Appointment Details */}
                <div class="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 mb-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar size={20} class="text-teal-600" />
                        Detail Janji Temu
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tanggal Appointment */}
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar size={16} class="text-gray-500" />
                                Tanggal Appointment <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData().tanggal_appointment}
                                onInput={(e) => handleFormChange('tanggal_appointment', e.target.value)}
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                required
                                min={dayjs().format('YYYY-MM-DD')}
                            />
                        </div>

                        {/* Pilih Dokter */}
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Stethoscope size={16} class="text-gray-500" />
                                Pilih Dokter <span class="text-red-500">*</span>
                            </label>
                            <select
                                value={formData().selectedDokterId || ''}
                                onInput={(e) => handleFormChange('selectedDokterId', (e.target as HTMLSelectElement).value)} 
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                                required
                            >
                                <option value="" disabled>-- Pilih Dokter --</option>
                                {dokterList().map(dokter => (
                                    <option value={dokter.id}>{dokter.nama}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pilih Treatment */}
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Pill size={16} class="text-gray-500" />
                                Pilih Treatment <span class="text-red-500">*</span>
                            </label>
                            <select
                                multiple
                                value={formData().selectedTreatmentIds}
                                onInput={(e) => handleMultiSelectChange('selectedTreatmentIds', e)}
                                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400 h-32"
                                required
                            >
                                {treatmentList().map(treatment => (
                                    <option
                                        value={treatment.id}
                                        selected={!!(formData().selectedTreatmentIds.includes(treatment.id) ||
                                            ((isNewPatient() || (selectedPasienId() && !pasienList().find(p => p.id === selectedPasienId())?.has_initial_skin_analysis)) && treatment.name === 'Analisis Kulit Awal & Konsultasi'))}
                                    >
                                        {treatment.name} ({treatment.estimated_time} menit) - {treatment.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                    </option>
                                ))}
                            </select>
                            {/* Display total duration */}
                            <p class="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                <Clock size={14} class="text-gray-500" />
                                Estimasi Durasi Total: <span class="font-semibold text-purple-700">{totalAppointmentDuration()} menit</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons for Step 2 */}
                <div class="flex justify-between pt-8 border-t border-gray-200 mt-10">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        class="px-8 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl shadow-md hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                        Kembali
                    </button>
                    <button
    type="submit"
    class="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
>
    Konfirmasi Booking
    <CheckCheck size={20} />
</button>
                </div>
            </form>
        </div>
    </div>
);
};

export default BookingPage;