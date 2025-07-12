import { createSignal, createEffect, onMount, Component, createMemo } from 'solid-js';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/id'; 
import toast, { Toaster } from 'solid-toast'; 
import { Pasien, Dokter, Treatment, Appointment, DailySchedule } from '../types/database'; 

dayjs.extend(isSameOrBefore);
dayjs.locale('id'); 
// --- Icons (from lucide-solid) ---
import { User, Phone, Mail, Calendar, Clock, Stethoscope, Tag, Pill, MessageCircle, MapPin, IdCard, Activity, AlertTriangle, Users, Heart, MessageSquare, HeartHandshake, CheckCheck } from 'lucide-solid';

const BookingPage: Component = () => {
    // --- State Management ---
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);

    // Form states for Pasien
    const [isNewPatient, setIsNewPatient] = createSignal(true);
    const [selectedPasienId, setSelectedPasienId] = createSignal<number | null>(null);

    // Form states for Booking & Pasien Details
    const [formData, setFormData] = createSignal({
        // Pasien Data (for new patient)
        namaLengkap: '', noTelepon: '', email: '', tanggalLahir: '', jenisKelamin: 'Wanita' as 'Pria' | 'Wanita', noIdentitas: '', alamatLengkap: '',
        riwayatAlergi: '', kondisiMedis: '', obatKonsumsi: '', riwayatTreatment: '', keluhanUtama: '', kontakDaruratNama: '',
        kontakDaruratHubungan: '', NomerKontakDarurat: '', preferensiKomunikasi: [] as string[], setujuData: true,
        // Appointment Data
        tanggalAppointment: '',
        selectedTreatmentIds: [] as string[], // Keep as string[] for HTML select values
        selectedDokterId: null as number | null,
    });

    const [currentStep, setCurrentStep] = createSignal(1); // 1: Pasien Info, 2: Booking Details

    // --- OnMount: Load data from localStorage ---
    onMount(() => {
        console.log('BookingPage: onMount - Loading data from localStorage...');
        const storedPasien = localStorage.getItem('pasienList');
        const storedDokter = localStorage.getItem('dokterList');
        const storedTreatment = localStorage.getItem('treatmentList');
        const storedAppointment = localStorage.getItem('appointmentList');

        if (storedPasien) setPasienList(JSON.parse(storedPasien));
        if (storedDokter) setDokterList(JSON.parse(storedDokter));
        if (storedTreatment) setTreatmentList(JSON.parse(storedTreatment));
        if (storedAppointment) setAppointmentList(JSON.parse(storedAppointment));

        // Add "Analisis Kulit Awal" if not exists in treatmentList
        setTreatmentList(prev => {
            const analysisTreatmentExists = prev.some(t => t.nama === 'Analisis Kulit Awal & Konsultasi');
            if (!analysisTreatmentExists) {
                const newId = prev.length > 0 ? Math.max(...prev.map(t => t.id)) + 1 : 1; // Generate new ID, starting from 1 if empty
                return [...prev, { id: newId, nama: 'Analisis Kulit Awal & Konsultasi', estimasiWaktu: 30, harga: 0 }];
            }
            return prev;
        });
        console.log('BookingPage: Data loaded.');
    });

    // --- Effects: Save data to localStorage whenever signals change ---
    createEffect(() => {
        localStorage.setItem('pasienList', JSON.stringify(pasienList()));
    });

    createEffect(() => {
        localStorage.setItem('appointmentList', JSON.stringify(appointmentList()));
    });

    // --- Computed Values (createMemo) ---
    // Get the initial skin analysis treatment object
    const initialSkinAnalysisTreatment = createMemo(() => {
        return treatmentList().find(t => t.nama === 'Analisis Kulit Awal & Konsultasi');
    });

    // Total Duration of selected treatments
    const totalAppointmentDuration = createMemo(() => {
        let duration = 0;
        const selectedIdsAsNumbers = formData().selectedTreatmentIds.map(Number);
        const treatments = treatmentList();

        selectedIdsAsNumbers.forEach(id => {
            const treatment = treatments.find(t => t.id === id);
            if (treatment) {
                duration += treatment.estimasiWaktu;
            }
        });

        // Jika pasien baru atau pasien lama belum pernah analisis, pastikan durasi analisis awal ditambahkan jika belum dipilih
        const analysisTreatment = initialSkinAnalysisTreatment();
        const patientRequiresAnalysis = isNewPatient() ||
            (selectedPasienId() && !pasienList().find(p => p.id === selectedPasienId())?.hasInitialSkinAnalysis);
        if (patientRequiresAnalysis && analysisTreatment && !selectedIdsAsNumbers.includes(analysisTreatment.id)) {
            duration += analysisTreatment.estimasiWaktu;
        }
        return duration;
    });

    // --- Handlers ---
    const handlePasienTypeChange = (e: Event) => {
        setIsNewPatient((e.target as HTMLInputElement).value === 'new');
        setFormData(prev => ({
            ...prev,
            namaLengkap: '', noTelepon: '', email: '', tanggalLahir: '', jenisKelamin: 'Wanita', alamatLengkap: '',
            riwayatAlergi: '', kondisiMedis: '', obatKonsumsi: '', riwayatTreatment: '', keluhanUtama: '',
            noIdentitas: '', kontakDaruratNama: '', kontakDaruratHubungan: '', preferensiKomunikasi: [],
            setujuData: true,
        }));
        setSelectedPasienId(null);
    };

    const handleExistingPasienSelect = (e: Event) => {
        const id = parseInt((e.target as HTMLSelectElement).value);
        setSelectedPasienId(id);
        const pasien = pasienList().find(p => p.id === id);
        if (pasien) {
            setFormData(prev => {
                const updatedFormData = {
                    ...prev,
                    namaLengkap: pasien.namaLengkap,
                    noTelepon: pasien.noTelepon,
                    email: pasien.email,
                    tanggalLahir: pasien.tanggalLahir,
                    jenisKelamin: pasien.jenisKelamin,
                    alamatLengkap: pasien.alamatLengkap,
                    riwayatAlergi: pasien.riwayatAlergi,
                    kondisiMedis: pasien.kondisiMedis,
                    obatKonsumsi: pasien.obatKonsumsi,
                    riwayatTreatment: pasien.riwayatTreatment,
                    keluhanUtama: pasien.keluhanUtama,
                    noIdentitas: pasien.noIdentitas || '',
                    kontakDaruratNama: pasien.kontakDaruratNama || '',
                    kontakDaruratHubungan: pasien.kontakDaruratHubungan || '',
                    NomerKontakDarurat: pasien.NomerKontakDarurat || '',
                    preferensiKomunikasi: pasien.preferensiKomunikasi || [],
                    setujuData: pasien.setujuData,
                };
                // If existing patient has NOT had initial analysis, pre-select it
                if (!pasien.hasInitialSkinAnalysis && initialSkinAnalysisTreatment()) {
                    updatedFormData.selectedTreatmentIds = [String(initialSkinAnalysisTreatment()!.id)];
                } else {
                    updatedFormData.selectedTreatmentIds = []; // Clear other selections for existing patient initially
                }
                return updatedFormData;
            });

            // Automatically proceed to next step if patient selected
            setCurrentStep(2);
        } else {
            setCurrentStep(1); // Stay on step 1 if no valid patient is selected
        }
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: string, e: Event) => {
        const target = e.target as HTMLSelectElement;
        const selectedValues = Array.from(target.selectedOptions).map(option => option.value); // Keep as string for form
        setFormData(prev => ({ ...prev, [field]: selectedValues }));
    };

    const handleSubmitPasienInfo = (e: Event) => {
        e.preventDefault();
        // Basic validation for new patient
        if (isNewPatient() && (!formData().namaLengkap || !formData().noTelepon || !formData().tanggalLahir)) {
            toast.error('Nama, Nomor Telepon, dan Tanggal Lahir pasien baru wajib diisi.');
            return;
        }

        setCurrentStep(2); // Proceed to booking details
    };

    const handleSubmitBooking = (e: Event) => {
        e.preventDefault();
        // Final validation for booking details
        if (!formData().tanggalAppointment || !formData().selectedDokterId || totalAppointmentDuration() <= 0) {
            toast.error('Tanggal, Dokter, dan Treatment wajib dipilih.');
            return;
        }
        
        let currentPasienId: number;
        let requiresInitialAnalysis = false;
        
        if (isNewPatient()) {
            const newPasien: Pasien = {
                id: Date.now(), // Simple ID generation
                namaLengkap: formData().namaLengkap,
                noTelepon: formData().noTelepon,
                email: formData().email,
                tanggalLahir: formData().tanggalLahir,
                jenisKelamin: formData().jenisKelamin,
                alamatLengkap: formData().alamatLengkap,
                riwayatAlergi: formData().riwayatAlergi,
                kondisiMedis: formData().kondisiMedis,
                obatKonsumsi: formData().obatKonsumsi,
                riwayatTreatment:formData().riwayatTreatment,
                keluhanUtama: formData().keluhanUtama,
                noIdentitas: formData().noIdentitas,
                NomerKontakDarurat: formData().NomerKontakDarurat,
                kontakDaruratNama: formData().kontakDaruratNama,
                kontakDaruratHubungan: formData().kontakDaruratHubungan,
                preferensiKomunikasi: formData().preferensiKomunikasi,
                setujuData: formData().setujuData,
                hasInitialSkinAnalysis: false, // Will be set to true after analysis appointment
                skinAnalyses: [],
                treatmentProgresses: [],
            };

            setPasienList(prev => [...prev, newPasien]);
            currentPasienId = newPasien.id;
            requiresInitialAnalysis = true; // New patient always starts with analysis for tracking
            toast.success('Pasien baru berhasil didaftarkan!');
        } else {
            if (!selectedPasienId()) {
                toast.error('Silakan pilih pasien yang sudah ada.');
                return;
            }

            currentPasienId = selectedPasienId()!;
            const pasien = pasienList().find(p => p.id === currentPasienId);
            if (pasien && !pasien.hasInitialSkinAnalysis) {
                requiresInitialAnalysis = true; // Existing patient needs analysis
            }
        }

        // Prepare treatment IDs for the appointment - CONVERT TO NUMBER[]
        let treatmentsForAppointment = formData().selectedTreatmentIds.map(Number);
        const analysisTreatment = initialSkinAnalysisTreatment();

        if (requiresInitialAnalysis && analysisTreatment) {
            const analysisId = analysisTreatment.id;
            if (!treatmentsForAppointment.includes(analysisId)) {
                treatmentsForAppointment.unshift(analysisId); // Add at the beginning
            }
        }

        // Remove duplicates if any
        treatmentsForAppointment = Array.from(new Set(treatmentsForAppointment));
        
        const newAppointment: Appointment = {
            id: Date.now(),
            pasienId: currentPasienId,
            dokterId: formData().selectedDokterId!,
            treatmentIds: treatmentsForAppointment,
            tanggal: formData().tanggalAppointment,
            waktuMulai: '09:00', // Default time since we removed time selection
            waktuSelesai: dayjs(`${formData().tanggalAppointment} 09:00`).add(totalAppointmentDuration(), 'minute').format('HH:mm'),
            status: 'booked',
            isInitialSkinAnalysis: requiresInitialAnalysis && treatmentsForAppointment.includes(analysisTreatment?.id!), // True if analysis is part of THIS appointment
        };
        
        setAppointmentList(prev => [...prev, newAppointment]);
        toast.success('Appointment berhasil dibooking!');
        console.log('New Appointment:', newAppointment);

        // If the appointment includes the initial skin analysis, update the patient's record
        if (newAppointment.isInitialSkinAnalysis) {
            setPasienList(prev => prev.map(p =>
                p.id === currentPasienId ? { ...p, hasInitialSkinAnalysis: true } : p
            ));
        }

        // Reset form for next booking
        resetForm();
    };

    const resetForm = () => {
        setIsNewPatient(true);
        setSelectedPasienId(null);
        setFormData({
            namaLengkap: '', noTelepon: '', email: '', tanggalLahir: '', jenisKelamin: 'Wanita', noIdentitas: '', alamatLengkap: '',
            riwayatAlergi: '', kondisiMedis: '', obatKonsumsi: '', riwayatTreatment: '', keluhanUtama: '',
            kontakDaruratNama: '', kontakDaruratHubungan: '', NomerKontakDarurat: '', preferensiKomunikasi: [],setujuData: true,
            tanggalAppointment: '', selectedTreatmentIds: [], selectedDokterId: null,
        });
        setCurrentStep(1);
    };
    return (
        
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 font-sans">
            
            <Toaster position="top-right" />

            {/* Header Section */}
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Registrasi & Booking Appointment</h1>
                <p class="text-gray-600">Daftarkan pasien baru dan atur jadwal janji temu pertama mereka, termasuk analisis kulit awal.</p>
            </div>

            {/* Main Content Card */}
            <div class="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 md:p-12">
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

    {/* Existing Pasien Select */}
    {!isNewPatient() && (
        <div class="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
            <label class="block text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} class="text-blue-600" />
                Pilih Pasien Lama
            </label>
            <select
                value={selectedPasienId() || ''}
                onInput={handleExistingPasienSelect}
                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                required={!isNewPatient()}
            >
                <option value="" disabled>-- Pilih Pasien --</option>
                {pasienList().map(pasien => (
                    <option value={pasien.id}>
                        {pasien.namaLengkap} ({pasien.noTelepon})
                    </option>
                ))}
            </select>
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
                        value={formData().namaLengkap}
                        onInput={(e) => handleFormChange('namaLengkap', e.target.value)}
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
                        value={formData().noTelepon}
                        onInput={(e) => handleFormChange('noTelepon', e.target.value)}
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
                        value={formData().tanggalLahir}
                        onInput={(e) => handleFormChange('tanggalLahir', e.target.value)}
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
                        value={formData().jenisKelamin}
                        onInput={(e) => handleFormChange('jenisKelamin', e.target.value)}
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
                        value={formData().noIdentitas}
                        onInput={(e) => handleFormChange('noIdentitas', e.target.value)}
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
                    value={formData().alamatLengkap}
                    onInput={(e) => handleFormChange('alamatLengkap', e.target.value)}
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
                        value={formData().riwayatAlergi}
                        onInput={(e) => handleFormChange('riwayatAlergi', e.target.value)}
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
                        value={formData().kondisiMedis}
                        onInput={(e) => handleFormChange('kondisiMedis', e.target.value)}
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
                    value={formData().obatKonsumsi}
                    onInput={(e) => handleFormChange('obatKonsumsi', e.target.value)}
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
                    value={formData().riwayatTreatment}
                    onInput={(e) => handleFormChange('riwayatTreatment', e.target.value)}
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
                    value={formData().keluhanUtama}
                    onInput={(e) => handleFormChange('keluhanUtama', e.target.value)}
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
                        value={formData().kontakDaruratNama}
                        onInput={(e) => handleFormChange('kontakDaruratNama', e.target.value)}
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
                        value={formData().kontakDaruratHubungan}
                        onInput={(e) => handleFormChange('kontakDaruratHubungan', e.target.value)}
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
                    value={formData().NomerKontakDarurat}
                    onInput={(e) => handleFormChange('NomerKontakDarurat', e.target.value)}
                    class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-400"
                    placeholder="081234567890"
                />
            </div>
        </div>

        {/* Communication Preferences */}
        <div class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <MessageSquare size={20} class="text-purple-600" />
                Preferensi Komunikasi (Opsional)
            </h3>

            <div class="space-y-4">
                <label class="block text-sm font-semibold text-gray-700">
                    Bagaimana Anda ingin dihubungi?
                </label>
                <div class="flex flex-wrap gap-4">
                    {['WhatsApp', 'Email', 'Telepon'].map((method) => (
                        <label class="flex items-center p-3 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-all duration-200">
                            <input
                                type="checkbox"
                                value={method}
                                checked={formData().preferensiKomunikasi.includes(method)}
                                onInput={(e) => {
                                    const target = e.target;
                                    const current = formData().preferensiKomunikasi;
                                    if (target.checked) {
                                        handleFormChange('preferensiKomunikasi', [...current, method]);
                                    } else {
                                        handleFormChange('preferensiKomunikasi', current.filter(p => p !== method));
                                    }
                                }}
                                class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span class="ml-3 text-gray-700 font-medium">{method}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        {/* Agreement */}
        <div class="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <label class="flex items-start gap-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData().setujuData}
                    onInput={(e) => handleFormChange('setujuData', e.target.checked)}
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
            class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
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
              value={formData().tanggalAppointment}
              onInput={(e) => handleFormChange('tanggalAppointment', e.target.value)}
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
              onInput={(e) => handleFormChange('selectedDokterId', parseInt((e.target as HTMLSelectElement).value))}
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
                  selected={!!(formData().selectedTreatmentIds.includes(String(treatment.id)) ||
                    ((isNewPatient() || (selectedPasienId() && !pasienList().find(p => p.id === selectedPasienId())?.hasInitialSkinAnalysis)) && treatment.nama === 'Analisis Kulit Awal & Konsultasi'))}
                >
                  {treatment.nama} ({treatment.estimasiWaktu} menit) - {treatment.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
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
          class="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
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