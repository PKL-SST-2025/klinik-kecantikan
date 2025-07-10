import { Component, createSignal, createMemo, onMount, createEffect, Show, For } from 'solid-js';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs'; // Pastikan dayjs terinstal: npm install dayjs
import isBetween from 'dayjs/plugin/isBetween'; // Plugin untuk cek rentang waktu
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Plugin untuk isSameOrBefore
import 'dayjs/locale/id'; // Opsional: untuk format tanggal/waktu Indonesia
import { Pasien, Dokter, Treatment, Appointment } from '../types/database'; // Pastikan tipe-tipe ini sesuai dengan yang ada di database.ts

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.locale('id'); // Set locale ke Indonesia


// --- Icons (from lucide-solid) ---
import { User, Phone, Mail, Calendar, Clock, Stethoscope, Handshake, Info, Tag, FlaskConical, CircleAlert, Pill, History, Palette, MessageCircle, MapPin, IdCard, UserRoundCog, HeartHandshake, Lightbulb, CheckCheck } from 'lucide-solid';

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
        namaLengkap: '',
        noTelepon: '',
        email: '',
        tanggalLahir: '',
        jenisKelamin: 'Wanita' as 'Pria' | 'Wanita',
        noIdentitas: '',
        alamatLengkap: '',
        riwayatAlergi: '',
        kondisiMedis: '',
        obatKonsumsi: '',
        riwayatTreatment: '',
        keluhanUtama: '',
        kontakDaruratNama: '',
        kontakDaruratHubungan: '',
        NomerKontakDarurat: '',
        preferensiKomunikasi: [] as string[],
        setujuData: true,

        // Appointment Data
        tanggalAppointment: '',
        selectedTreatmentIds: [] as string[],
        selectedDokterId: null as number | null,
        selectedWaktuMulai: '', // 'HH:MM'
    });

    const [availableTimeSlots, setAvailableTimeSlots] = createSignal<string[]>([]);
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
                const newId = Math.max(0, ...prev.map(t => t.id)) + 1; // Generate new ID
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

        // Jika pasien baru, pastikan durasi analisis awal ditambahkan jika belum dipilih
        const analysisTreatment = initialSkinAnalysisTreatment();
        if (isNewPatient() && analysisTreatment && !selectedIdsAsNumbers.includes(analysisTreatment.id)) {
            duration += analysisTreatment.estimasiWaktu;
        }
        return duration;
    });

    // Filter Dokter by Specialization
    const availableDokterForTreatments = createMemo(() => {
        const selectedTreatmentsAsNumbers = formData().selectedTreatmentIds.map(Number);
        if (selectedTreatmentsAsNumbers.length === 0 && !isNewPatient()) return []; // No treatments selected for existing patient

        const allDokter = dokterList();

        // If new patient, assume initial skin analysis. Any doctor specialized in it.
        // --- MENJADI ---
        if (isNewPatient()) {
            const analysisTreatment = initialSkinAnalysisTreatment();
            if (analysisTreatment) {
                const analysisId = analysisTreatment.id;
                return allDokter.filter(d => d.spesialisasi.includes(analysisId));
            }
            return []; // Kembalikan array kosong jika analisis tidak ada
        }

        // For existing patients or subsequent treatments
        return allDokter.filter(dokter => {
            return selectedTreatmentsAsNumbers.every(treatmentId => dokter.spesialisasi.includes(treatmentId));
        });
    });

    // --- Helper Functions ---

    // Function to parse doctor's schedule string (e.g., "Senin,Rabu (09:00-17:00); Jumat (10:00-16:00)")
    const parseDoctorSchedule = (schedule: string, targetDay: string) => {
        const rules = schedule.split(';');
        for (const rule of rules) {
            const trimmedRule = rule.trim();
            const [daysPart, timePart] = trimmedRule.split(' (');
            if (daysPart && timePart) {
                const days = daysPart.split(',').map(d => d.trim());
                const [startTimeStr, endTimeStr] = timePart.replace(')', '').split('-');

                if (days.includes(targetDay)) {
                    return { startTime: startTimeStr, endTime: endTimeStr };
                }
            }
        }
        return null; // Doctor not available on this day or invalid schedule format
    };

    // Generate and validate available time slots
    const generateAvailableTimeSlots = (
        dokterId: number | null,
        tanggalAppointment: string, // YYYY-MM-DD
        durationInMinutes: number,
        allAppointments: Appointment[],
        allDokter: Dokter[]
    ): string[] => {
        if (!dokterId || !tanggalAppointment || durationInMinutes <= 0) {
            return [];
        }

        const selectedDokter = allDokter.find(d => d.id === dokterId);
        if (!selectedDokter) return [];

        const targetDayName = dayjs(tanggalAppointment).format('dddd'); // e.g., "Senin", "Selasa"
        const schedule = parseDoctorSchedule(selectedDokter.jadwal, targetDayName);

        if (!schedule) {
            console.log(`Dokter ${selectedDokter.nama} tidak ada jadwal pada ${targetDayName}.`);
            return [];
        }

        const slots: string[] = [];
        const slotInterval = 30; // Generate slots every 30 minutes

        let currentTime = dayjs(`${tanggalAppointment} ${schedule.startTime}`);
        const workEnd = dayjs(`${tanggalAppointment} ${schedule.endTime}`);

        while (currentTime.add(durationInMinutes, 'minute').isSameOrBefore(workEnd)) {
            const potentialAppointmentStart = currentTime;
            const potentialAppointmentEnd = currentTime.add(durationInMinutes, 'minute');

            const hasConflict = allAppointments.some(appt => {
                if (appt.dokterId === dokterId && appt.tanggal === tanggalAppointment) {
                    const existingStart = dayjs(`${appt.tanggal} ${appt.waktuMulai}`);
                    const existingEnd = dayjs(`${appt.tanggal} ${appt.waktuSelesai}`);

                    // Check for overlap: [start1, end1] and [start2, end2] overlap if start1 < end2 AND start2 < end1
                    return (
                        potentialAppointmentStart.isBefore(existingEnd) &&
                        existingStart.isBefore(potentialAppointmentEnd)
                    );
                }
                return false;
            });

            if (!hasConflict) {
                slots.push(potentialAppointmentStart.format('HH:mm'));
            }
            currentTime = currentTime.add(slotInterval, 'minute');
        }
        return slots;
    };

    // --- Handlers ---

    // Update available time slots whenever relevant data changes
    createEffect(() => {
        const tanggal = formData().tanggalAppointment;
        const dokterId = formData().selectedDokterId;
        const duration = totalAppointmentDuration();
        const appointments = appointmentList();
        const dokters = dokterList();

        if (tanggal && dokterId && duration > 0) {
            const slots = generateAvailableTimeSlots(dokterId, tanggal, duration, appointments, dokters);
            setAvailableTimeSlots(slots);
        } else {
            setAvailableTimeSlots([]);
        }
    });

    const handlePasienTypeChange = (e: Event) => {
        setIsNewPatient((e.target as HTMLInputElement).value === 'new');
        // Reset patient-related form data when switching type
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
            // Pre-fill some data if needed, or just use selectedPasienId
            setFormData(prev => ({
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
                preferensiKomunikasi: pasien.preferensiKomunikasi || [],
                setujuData: pasien.setujuData,
                selectedTreatmentIds: pasien.hasInitialSkinAnalysis
                    ? []
                    : (initialSkinAnalysisTreatment() ? [String(initialSkinAnalysisTreatment()!.id)] : []), // If no analysis done, pre-select it
            }));

            // Automatically proceed to next step if patient selected
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: string, e: Event) => {
        const target = e.target as HTMLSelectElement;
        const selectedValues = Array.from(target.selectedOptions).map(option => {
            return field === 'selectedTreatmentIds' ? parseInt(option.value) : option.value;
        });
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
        if (!formData().tanggalAppointment || !formData().selectedWaktuMulai || !formData().selectedDokterId || totalAppointmentDuration() <= 0) {
            toast.error('Tanggal, Waktu, Dokter, dan Treatment wajib dipilih.');
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
                riwayatTreatment: formData().riwayatTreatment,
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
            requiresInitialAnalysis = true; // New patient always starts with analysis
            toast.success('Pasien baru berhasil didaftarkan!');
        } else {
            if (!selectedPasienId()) {
                toast.error('Silakan pilih pasien yang sudah ada.');
                return;
            }
            currentPasienId = selectedPasienId()!;
            const pasien = pasienList().find(p => p.id === currentPasienId);
            if (pasien && !pasien.hasInitialSkinAnalysis) {
                requiresInitialAnalysis = true;
            }
        }

        const appointmentStartTime = dayjs(`${formData().tanggalAppointment} ${formData().selectedWaktuMulai}`);
        const appointmentEndTime = appointmentStartTime.add(totalAppointmentDuration(), 'minute');

        // Prepare treatment IDs for the appointment - CONVERT BACK TO NUMBER FOR APPOINTMENT OBJECT
        let treatmentsForAppointment = formData().selectedTreatmentIds.map(Number); // <-- Konversi ke number[]
        if (requiresInitialAnalysis && initialSkinAnalysisTreatment()) {
            const analysisId = initialSkinAnalysisTreatment()!.id;
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
            waktuMulai: formData().selectedWaktuMulai,
            waktuSelesai: appointmentEndTime.format('HH:mm'),
            status: 'booked',
            isInitialSkinAnalysis: requiresInitialAnalysis,
        };

        setAppointmentList(prev => [...prev, newAppointment]);
        toast.success('Appointment berhasil dibooking!');
        console.log('New Appointment:', newAppointment);

        // Reset form for next booking
        resetForm();
    };

    const resetForm = () => {
        setIsNewPatient(true);
        setSelectedPasienId(null);
        setFormData({
            namaLengkap: '', noTelepon: '', email: '', tanggalLahir: '', jenisKelamin: 'Wanita', noIdentitas: '', alamatLengkap: '',
            riwayatAlergi: '', kondisiMedis: '', obatKonsumsi: '', riwayatTreatment: '', keluhanUtama: '',
            kontakDaruratNama: '', kontakDaruratHubungan: '', NomerKontakDarurat: '', preferensiKomunikasi: [],
            setujuData: true,
            tanggalAppointment: '', selectedTreatmentIds: [], selectedDokterId: null, selectedWaktuMulai: '',
        });
        setAvailableTimeSlots([]);
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
            <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
                {/* Step Indicators */}
                <div class="flex items-center justify-center mb-8">
                    <div class="flex flex-col items-center">
                        <div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep() >= 1 ? 'bg-purple-600' : 'bg-gray-400'}`}>1</div>
                        <span class="text-sm mt-2 text-gray-700">Info Pasien</span>
                    </div>
                    <div class="flex-grow border-t-2 border-dashed mx-4 mt-[-20px]" classList={{ 'border-purple-300': currentStep() >= 2, 'border-gray-300': currentStep() < 2 }}></div>
                    <div class="flex flex-col items-center">
                        <div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep() >= 2 ? 'bg-purple-600' : 'bg-gray-400'}`}>2</div>
                        <span class="text-sm mt-2 text-gray-700">Detail Booking</span>
                    </div>
                </div>

                {/* --- Step 1: Pasien Information --- */}
                <form onSubmit={handleSubmitPasienInfo} classList={{ 'block': currentStep() === 1, 'hidden': currentStep() !== 1 }}>
                    <h2 class="text-2xl font-semibold text-gray-900 mb-6">Langkah 1: Informasi Pasien</h2>

                    {/* Pasien Type Selection */}
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Pasien</label>
                        <div class="flex gap-4">
                            <label class="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="pasienType"
                                    value="new"
                                    checked={isNewPatient()}
                                    onInput={handlePasienTypeChange}
                                    class="form-radio text-purple-600"
                                />
                                <span class="ml-2 text-gray-800">Pasien Baru</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="pasienType"
                                    value="existing"
                                    checked={!isNewPatient()}
                                    onInput={handlePasienTypeChange}
                                    class="form-radio text-purple-600"
                                />
                                <span class="ml-2 text-gray-800">Pasien Lama</span>
                            </label>
                        </div>
                    </div>

                    {/* Existing Pasien Select */}
                    {!isNewPatient() && (
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} /> Pilih Pasien Lama
                            </label>
                            <select
                                value={selectedPasienId() || ''}
                                onInput={handleExistingPasienSelect}
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                required={!isNewPatient()}
                            >
                                <option value="" disabled>-- Pilih Pasien --</option>
                                {pasienList().map(pasien => (
                                    <option value={pasien.id}>{pasien.namaLengkap} ({pasien.noTelepon})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* New Patient Details (conditional rendering) */}
                    <div classList={{ 'block': isNewPatient(), 'hidden': !isNewPatient() }}>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Nama Lengkap */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User size={16} /> Nama Lengkap <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData().namaLengkap}
                                    onInput={(e) => handleFormChange('namaLengkap', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    required={isNewPatient()}
                                />
                            </div>
                            {/* Nomor Telepon */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Phone size={16} /> Nomor Telepon <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData().noTelepon}
                                    onInput={(e) => handleFormChange('noTelepon', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    required={isNewPatient()}
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={formData().email}
                                    onInput={(e) => handleFormChange('email', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            {/* Tanggal Lahir */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16} /> Tanggal Lahir <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData().tanggalLahir}
                                    onInput={(e) => handleFormChange('tanggalLahir', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    required={isNewPatient()}
                                />
                            </div>

                            {/* No identitas */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <IdCard size={16} /> Nomor Identitas (KTP/SIM)
                                </label>
                                <input
                                    type="text"
                                    value={formData().noIdentitas}
                                    onInput={(e) => handleFormChange('noIdentitas', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Jenis Kelamin */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <UserRoundCog size={16} /> Jenis Kelamin
                                </label>
                                <select
                                    value={formData().jenisKelamin}
                                    onInput={(e) => handleFormChange('jenisKelamin', e.target.value as 'Pria' | 'Wanita')}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="Wanita">Wanita</option>
                                    <option value="Pria">Pria</option>
                                </select>
                            </div>
                        </div>

                        {/* Alamat Lengkap */}
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> Alamat Lengkap
                            </label>
                            <textarea
                                value={formData().alamatLengkap}
                                onInput={(e) => handleFormChange('alamatLengkap', e.target.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                rows="2"
                            ></textarea>
                        </div>

                        {/* Medical & Skin Info */}
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Informasi Medis & Kulit (Awal)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="riwayat-alergi-textarea" class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CircleAlert size={16} /> Riwayat Alergi
                                </label>
                                <textarea
                                    id="riwayat-alergi-textarea"
                                    value={formData().riwayatAlergi}
                                    onInput={(e) => handleFormChange('riwayatAlergi', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    rows="3" // Anda bisa sesuaikan jumlah baris
                                    placeholder="Contoh: Alergi antibiotik jenis Amoxicillin, alergi pewarna rambut."
                                ></textarea>
                            </div>
                            <div>
                                <label for="kondisi-medis-textarea" class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FlaskConical size={16} /> Kondisi Medis yang Sedang Diderita
                                </label>
                                <textarea
                                    id="kondisi-medis-textarea"
                                    value={formData().kondisiMedis}
                                    onInput={(e) => handleFormChange('kondisiMedis', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    rows="3" // Anda bisa sesuaikan jumlah baris
                                    placeholder="Contoh: Sedang hamil 5 bulan, memiliki riwayat diabetes tipe 2, eksim di tangan."
                                ></textarea>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Pill size={16} /> Obat-obatan/Suplemen yang Sedang Dikonsumsi
                            </label>
                            <textarea
                                value={formData().obatKonsumsi}
                                onInput={(e) => handleFormChange('obatKonsumsi', e.target.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                rows="2"
                            ></textarea>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <History size={16} /> Riwayat Treatment Kecantikan Sebelumnya
                            </label>
                            <textarea
                                value={formData().riwayatTreatment}
                                onInput={(e) => handleFormChange('riwayatTreatment', e.target.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                rows="2"
                            ></textarea>
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MessageCircle size={16} /> Keluhan Utama / Tujuan Kunjungan
                            </label>
                            <textarea
                                value={formData().keluhanUtama}
                                onInput={(e) => handleFormChange('keluhanUtama', e.target.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                rows="3"
                            ></textarea>
                        </div>

                        {/* Other Optional Info */}
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Informasi Tambahan</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <HeartHandshake size={16} /> Nomer Kontak Darurat
                                </label>
                                <input
                                    type="text"
                                    value={formData().NomerKontakDarurat}
                                    onInput={(e) => handleFormChange('NomerKontakDarurat', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <HeartHandshake size={16} /> Kontak Darurat Nama
                                </label>
                                <input
                                    type="text"
                                    value={formData().kontakDaruratNama}
                                    onInput={(e) => handleFormChange('kontakDaruratNama', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Handshake size={16} /> Kontak Darurat Hubungan
                                </label>
                                <input
                                    type="text"
                                    value={formData().kontakDaruratHubungan}
                                    onInput={(e) => handleFormChange('kontakDaruratHubungan', e.target.value)}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div class="flex items-start mb-4">
                            <input
                                type="checkbox"
                                checked={formData().setujuData}
                                onInput={(e) => handleFormChange('setujuData', e.target.checked)}
                                class="form-checkbox h-5 w-5 text-purple-600 rounded mt-1"
                                required
                            />
                            <label class="ml-2 block text-sm text-gray-900">
                                Saya menyetujui data saya disimpan dan digunakan untuk keperluan layanan klinik. <span class="text-red-500">*</span>
                            </label>
                        </div></div>


                    <div class="flex justify-end">
                        <button
                            type="submit"
                            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            Lanjut ke Booking <CheckCheck size={18} />
                        </button>
                    </div>
                </form>
            </div>
            {/* --- Step 2: Booking Details --- */}
            <form onSubmit={handleSubmitBooking} classList={{ 'block': currentStep() === 2, 'hidden': currentStep() !== 2 }}>
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">Langkah 2: Detail Booking</h2>

                {/* Display Pasien Info Summary (if existing patient selected) */}
                {!isNewPatient() && selectedPasienId() && (
                    <div class="bg-purple-50 border-l-4 border-purple-500 text-purple-800 p-4 mb-6 rounded-md shadow-sm">
                        <h3 class="font-bold mb-2">Pasien Terpilih: {pasienList().find(p => p.id === selectedPasienId())?.namaLengkap}</h3>
                        <p class="text-sm">Telp: {pasienList().find(p => p.id === selectedPasienId())?.noTelepon}</p>
                        <p class="text-sm">Keluhan Awal: {pasienList().find(p => p.id === selectedPasienId())?.keluhanUtama || '-'}</p>
                        <p class="text-sm font-semibold mt-2" classList={{ 'text-red-600': !pasienList().find(p => p.id === selectedPasienId())?.hasInitialSkinAnalysis }}>
                            {pasienList().find(p => p.id === selectedPasienId())?.hasInitialSkinAnalysis
                                ? '✅ Sudah Analisis Kulit Awal'
                                : '⚠️ Perlu Analisis Kulit Awal'
                            }
                        </p>
                    </div>
                )}


                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Tanggal Appointment */}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar size={16} /> Tanggal Appointment <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData().tanggalAppointment}
                            onInput={(e) => handleFormChange('tanggalAppointment', e.target.value)}
                            min={dayjs().format('YYYY-MM-DD')} // Tanggal tidak bisa mundur
                            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    {/* Estimasi Durasi Total Treatment */}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Clock size={16} /> Estimasi Durasi Booking
                        </label>
                        <input
                            type="text"
                            value={`${totalAppointmentDuration()} menit`}
                            class="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                            readOnly
                            disabled
                        />
                    </div>
                </div>

                {/* Pilih Treatment */}
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Tag size={16} /> Pilih Treatment yang Diinginkan <span class="text-red-500">*</span>
                    </label>
                    <select
                        multiple
                        value={formData().selectedTreatmentIds} // <-- Ini akan menerima string[]
                        onInput={(e) => handleMultiSelectChange('selectedTreatmentIds', e)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 h-32"
                        required={!isNewPatient()}
                    >
                        <Show when={isNewPatient() && initialSkinAnalysisTreatment()}>
                            <option value={String(initialSkinAnalysisTreatment()?.id)} selected disabled={true}> {/* <-- Konversi ID ke string */}
                                {initialSkinAnalysisTreatment()?.nama} (Wajib)
                            </option>
                        </Show>
                        <For each={treatmentList().filter(t => t.nama !== 'Analisis Kulit Awal & Konsultasi')}>
                            {(treatment) => (
                                <option value={String(treatment.id)}> {/* <-- Konversi ID ke string */}
                                    {treatment.nama} ({treatment.estimasiWaktu} menit)
                                </option>
                            )}
                        </For>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                        {isNewPatient()
                            ? 'Untuk pasien baru, "Analisis Kulit Awal & Konsultasi" otomatis termasuk.'
                            : 'Tekan `Ctrl` (Windows/Linux) atau `Cmd` (macOS) dan klik untuk memilih lebih dari satu treatment.'
                        }
                    </p>
                </div>

                {/* Pilih Dokter */}
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Stethoscope size={16} /> Pilih Dokter/Terapis <span class="text-red-500">*</span>
                    </label>
                    <select
                        value={formData().selectedDokterId || ''}
                        onInput={(e) => handleFormChange('selectedDokterId', parseInt(e.target.value) || null)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                    >
                        <option value="" disabled>-- Pilih Dokter --</option>
                        <For each={availableDokterForTreatments()}>
                            {(dokter) => (
                                <option value={dokter.id}>{dokter.nama} ({dokter.posisi})</option>
                            )}
                        </For>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                        Dokter yang muncul sudah difilter berdasarkan spesialisasi dan ketersediaan treatment.
                    </p>
                </div>

                {/* Pilih Waktu Mulai */}
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock size={16} /> Pilih Waktu Mulai <span class="text-red-500">*</span>
                    </label>
                    <select
                        value={formData().selectedWaktuMulai}
                        onInput={(e) => handleFormChange('selectedWaktuMulai', e.target.value)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                        disabled={!formData().tanggalAppointment || !formData().selectedDokterId || totalAppointmentDuration() === 0}
                    >
                        <option value="" disabled>-- Pilih Waktu --</option>
                        <Show when={availableTimeSlots().length > 0} fallback={<option disabled>Tidak ada slot tersedia untuk pilihan ini</option>}>
                            <For each={availableTimeSlots()}>
                                {(slot) => (
                                    <option value={slot}>{slot}</option>
                                )}
                            </For>
                        </Show>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                        Slot waktu yang tersedia disesuaikan dengan jadwal dokter dan durasi treatment.
                    </p>
                </div>

                <div class="flex gap-3 pt-4 justify-end">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        class="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                    >
                        Kembali
                    </button>
                    <button
                        type="submit"
                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        Konfirmasi Booking
                    </button>
                </div>
            </form>
        </div>

    );
};

export default BookingPage;