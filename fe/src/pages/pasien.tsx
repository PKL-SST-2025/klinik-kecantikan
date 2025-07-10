import { Component, createSignal, onMount, For, Show, createEffect, createMemo } from 'solid-js';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import { User, Phone, Mail, Calendar, Edit, Eye, XCircle, CheckCircle, Stethoscope, ClipboardList, FlaskConical, CircleAlert, Tag, Box, Camera, History } from 'lucide-solid';

// Import interfaces (pastikan path-nya benar sesuai struktur project Anda)
import { Pasien, Dokter, Treatment, Appointment, SkinAnalysis, TreatmentProgress, Produk } from '../types/database'; // Sesuaikan path ini jika Anda punya folder types

const PasienDataPage: Component = () => {
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [productList, setProductList] = createSignal<Produk[]>([]); // Untuk rekomendasi produk
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);

    const [showDetailModal, setShowDetailModal] = createSignal(false);
    const [selectedPasien, setSelectedPasien] = createSignal<Pasien | null>(null);
    const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null); // Untuk konteks treatment yang sedang berjalan

    const [skinAnalysisFormData, setSkinAnalysisFormData] = createSignal<Partial<SkinAnalysis>>({
        hasilVisual: '',
        hasilAlat: '',
        rekomendasiTreatment: [],
        rekomendasiProduk: [],
        catatanTambahan: '',
    });

    const [treatmentProgressFormData, setTreatmentProgressFormData] = createSignal<Partial<TreatmentProgress>>({
        catatan: '',
        fotoSebelum: '',
        fotoSesudah: '',
    });

    // --- OnMount: Load data from localStorage ---
    onMount(() => {
        const storedPasien = localStorage.getItem('pasienList');
        const storedDokter = localStorage.getItem('dokterList');
        const storedTreatment = localStorage.getItem('treatmentList');
        const storedProduct = localStorage.getItem('produkList'); // Load produk list
        const storedAppointment = localStorage.getItem('appointmentList');

        if (storedPasien) setPasienList(JSON.parse(storedPasien));
        if (storedDokter) setDokterList(JSON.parse(storedDokter));
        if (storedTreatment) setTreatmentList(JSON.parse(storedTreatment));
        if (storedProduct) setProductList(JSON.parse(storedProduct));
        if (storedAppointment) setAppointmentList(JSON.parse(storedAppointment));
    });

    // --- Effects: Save data to localStorage whenever signals change ---
    createEffect(() => {
        localStorage.setItem('pasienList', JSON.stringify(pasienList()));
    });
    createEffect(() => {
        localStorage.setItem('appointmentList', JSON.stringify(appointmentList()));
    });

    // --- Helper Functions for Data Display ---
    const getTreatmentName = (id: number) => treatmentList().find(t => t.id === id)?.nama || 'N/A';
    const getDokterName = (id: number) => dokterList().find(d => d.id === id)?.nama || 'N/A';
    const getProductName = (id: number) => productList().find(p => p.id === id)?.nama || 'N/A';

    // --- Handlers for Pasien Detail Modal ---
    const handleViewDetail = (pasien: Pasien) => {
        setSelectedPasien(pasien);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPasien(null);
        setSelectedAppointment(null); // Reset selected appointment
        // Reset forms when closing
        setSkinAnalysisFormData({});
        setTreatmentProgressFormData({});
    };

    // --- Handlers for Appointment Actions (for Doctor/Resepsionis) ---

    // Ketika dokter/resepsionis ingin memulai treatment / analisis
    const handleStartTreatment = (pasien: Pasien, appointment: Appointment) => {
        setSelectedPasien(pasien);
        setSelectedAppointment(appointment);
        // Pre-fill forms if existing analysis/progress exists
        if (appointment.isInitialSkinAnalysis && appointment.skinAnalysisId) {
            const existingAnalysis = pasien.skinAnalyses.find(sa => sa.id === appointment.skinAnalysisId);
            if (existingAnalysis) {
                setSkinAnalysisFormData(existingAnalysis);
            }
        } else if (!appointment.isInitialSkinAnalysis && appointment.treatmentProgressId) {
            const existingProgress = pasien.treatmentProgresses.find(tp => tp.id === appointment.treatmentProgressId);
            if (existingProgress) {
                setTreatmentProgressFormData(existingProgress);
            }
        }
        setShowDetailModal(true); // Open modal to show forms
        toast(`Membuka detail untuk appointment pada ${appointment.tanggal} ${appointment.waktuMulai}`);
    };


    const handleCancelAppointment = (appointmentId: number) => {
        toast.promise(
            new Promise<string>((resolve, reject) => {
                setTimeout(() => { // Simulate API call
                    setAppointmentList(prev => prev.map(appt =>
                        appt.id === appointmentId ? { ...appt, status: 'cancelled' } : appt
                    ));
                    resolve('Appointment berhasil dibatalkan!');
                }, 500);
            }),
            {
                loading: 'Membatalkan appointment...',
                success: (message: string) => message,
                error: 'Gagal membatalkan appointment.',
            }
        );
    };

    const handleCompleteAppointment = () => {
        const appt = selectedAppointment();
        const pasien = selectedPasien();

        if (!appt || !pasien) {
            toast.error('Tidak ada appointment atau pasien yang terpilih.');
            return;
        }

        // Logic for saving Skin Analysis
        if (appt.isInitialSkinAnalysis) {
            if (!skinAnalysisFormData().hasilVisual || !skinAnalysisFormData().hasilAlat) {
                toast.error('Hasil Visual dan Hasil Alat Skin Analysis wajib diisi.');
                return;
            }

            const newAnalysis: SkinAnalysis = {
                id: Date.now(),
                appointmentId: appt.id,
                tanggalAnalisis: dayjs().format('YYYY-MM-DD'),
                hasilVisual: skinAnalysisFormData().hasilVisual || '',
                hasilAlat: skinAnalysisFormData().hasilAlat || '',
                rekomendasiTreatment: skinAnalysisFormData().rekomendasiTreatment || [],
                rekomendasiProduk: skinAnalysisFormData().rekomendasiProduk || [],
                catatanTambahan: skinAnalysisFormData().catatanTambahan || '',
            };

            setPasienList(prev => prev.map(p =>
                p.id === pasien.id
                    ? {
                        ...p,
                        skinAnalyses: [...p.skinAnalyses, newAnalysis],
                        hasInitialSkinAnalysis: true, // Mark patient as having initial analysis
                    }
                    : p
            ));

            setAppointmentList(prev => prev.map(a =>
                a.id === appt.id
                    ? { ...a, status: 'completed', skinAnalysisId: newAnalysis.id }
                    : a
            ));
            toast.success('Analisis Kulit berhasil disimpan dan Appointment selesai!');

        } else { // Logic for saving Treatment Progress
            if (!treatmentProgressFormData().catatan) {
                toast.error('Catatan Treatment Progress wajib diisi.');
                return;
            }

            const newProgress: TreatmentProgress = {
                id: Date.now(),
                appointmentId: appt.id,
                tanggalProgress: dayjs().format('YYYY-MM-DD'),
                catatan: treatmentProgressFormData().catatan || '',
                fotoSebelum: treatmentProgressFormData().fotoSebelum,
                fotoSesudah: treatmentProgressFormData().fotoSesudah,
            };

            setPasienList(prev => prev.map(p =>
                p.id === pasien.id
                    ? { ...p, treatmentProgresses: [...p.treatmentProgresses, newProgress] }
                    : p
            ));

            setAppointmentList(prev => prev.map(a =>
                a.id === appt.id
                    ? { ...a, status: 'completed', treatmentProgressId: newProgress.id }
                    : a
            ));
            toast.success('Treatment Progress berhasil disimpan dan Appointment selesai!');
        }

        handleCloseDetailModal(); // Close modal after completion
    };

    const handleSkinAnalysisFormChange = (field: string, value: any) => {
        setSkinAnalysisFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTreatmentProgressFormChange = (field: string, value: any) => {
        setTreatmentProgressFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: string, e: Event, formType: 'skinAnalysis' | 'treatmentProgress') => {
        const target = e.target as HTMLSelectElement;
        const selectedValues = Array.from(target.selectedOptions).map(option => parseInt(option.value));

        if (formType === 'skinAnalysis') {
            setSkinAnalysisFormData(prev => ({ ...prev, [field]: selectedValues }));
        } else if (formType === 'treatmentProgress') {
            // Not used for treatmentProgress currently, but for future proofing
        }
    };

    // Filter appointments for the selected patient
    const pasienAppointments = createMemo(() => {
        if (!selectedPasien()) return [];
        return appointmentList().filter(appt => appt.pasienId === selectedPasien()!.id)
            .sort((a, b) => dayjs(`${a.tanggal} ${a.waktuMulai}`).diff(dayjs(`${b.tanggal} ${b.waktuMulai}`)));
    });

    const upcomingAppointments = createMemo(() => {
        return appointmentList().filter(appt =>
            appt.pasienId === selectedPasien()?.id &&
            dayjs(`${appt.tanggal} ${appt.waktuMulai}`).isAfter(dayjs()) &&
            appt.status === 'booked'
        ).sort((a, b) => dayjs(`${a.tanggal} ${a.waktuMulai}`).diff(dayjs(`${b.tanggal} ${b.waktuMulai}`)));
    });

    const completedAppointments = createMemo(() => {
        return appointmentList().filter(appt =>
            appt.pasienId === selectedPasien()?.id &&
            appt.status === 'completed'
        ).sort((a, b) => dayjs(`${a.tanggal} ${a.waktuMulai}`).diff(dayjs(`${b.tanggal} ${b.waktuMulai}`), 'minute', true) * -1); // Sort descending by date
    });

    return (
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 font-sans">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Data Pasien</h1>
                <p class="text-gray-600">Lihat detail pasien, riwayat appointment, dan catat hasil analisis kulit atau progress treatment.</p>
            </div>

            {/* Pasien List Table */}
            <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <ClipboardList size={24} /> Daftar Pasien
                </h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead class="bg-purple-100 text-purple-800">
                            <tr>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Nama Pasien</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">No. Telepon</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Email</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Jenis Kelamin</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Usia</th>
                                <th class="py-3 px-4 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show when={pasienList().length > 0} fallback={
                                <tr><td colSpan={6} class="text-center py-4 text-gray-500">Belum ada data pasien.</td></tr>
                            }>
                                <For each={pasienList()}>
                                    {(pasien) => (
                                        <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                            <td class="py-3 px-4 text-gray-800">{pasien.namaLengkap}</td>
                                            <td class="py-3 px-4 text-gray-800">{pasien.noTelepon}</td>
                                            <td class="py-3 px-4 text-gray-800">{pasien.email || '-'}</td>
                                            <td class="py-3 px-4 text-gray-800">{pasien.jenisKelamin}</td>
                                            <td class="py-3 px-4 text-gray-800">{dayjs().diff(pasien.tanggalLahir, 'year')} tahun</td>
                                            <td class="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetail(pasien)}
                                                    class="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md transition-all duration-200 flex items-center justify-center mx-auto"
                                                    title="Lihat Detail Pasien"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </For>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pasien Detail Modal */}
            <Show when={showDetailModal()}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div class="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-95 animate-fade-in-up">
                        <div class="p-6 md:p-8 border-b border-gray-200 flex justify-between items-center">
                            <h2 class="text-2xl font-bold text-gray-900">Detail Pasien: {selectedPasien()?.namaLengkap}</h2>
                            <button onClick={handleCloseDetailModal} class="text-gray-500 hover:text-gray-700">
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div class="p-6 md:p-8 space-y-6">
                            {/* Pasien Basic Info */}
                            <div class="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-200">
                                <h3 class="text-xl font-semibold text-indigo-800 mb-4 flex items-center gap-2"><User size={20} /> Informasi Dasar</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                                    <p><strong>No. Telp:</strong> {selectedPasien()?.noTelepon}</p>
                                    <p><strong>Email:</strong> {selectedPasien()?.email || '-'}</p>
                                    <p><strong>Tgl Lahir:</strong> {dayjs(selectedPasien()?.tanggalLahir).format('DD MMMM YYYY')}</p>
                                    <p><strong>Usia:</strong> {dayjs().diff(selectedPasien()?.tanggalLahir, 'year')} tahun</p>
                                    <p><strong>Jenis Kelamin:</strong> {selectedPasien()?.jenisKelamin}</p>
                                    <p class="md:col-span-2"><strong>Alamat:</strong> {selectedPasien()?.alamatLengkap || '-'}</p>
                                    <p class="md:col-span-2 text-sm font-semibold" classList={{'text-green-700': selectedPasien()?.hasInitialSkinAnalysis, 'text-red-700': !selectedPasien()?.hasInitialSkinAnalysis}}>
                                        {selectedPasien()?.hasInitialSkinAnalysis ? '✅ Sudah Analisis Kulit Awal' : '⚠️ Belum Analisis Kulit Awal'}
                                    </p>
                                </div>
                            </div>

                            {/* Medical History */}
                            <div class="bg-rose-50 p-4 rounded-lg shadow-sm border border-rose-200">
                                <h3 class="text-xl font-semibold text-rose-800 mb-4 flex items-center gap-2"><ClipboardList size={20} /> Riwayat Medis & Kulit</h3>
                                <div class="space-y-2 text-gray-700">
                                    <p><strong>Riwayat Alergi:</strong> {selectedPasien()?.riwayatAlergi || '-'}</p>
                                    <p><strong>Kondisi Medis:</strong> {selectedPasien()?.kondisiMedis || '-'}</p>
                                    <p><strong>Obat/Suplemen Konsumsi:</strong> {selectedPasien()?.obatKonsumsi || '-'}</p>
                                    <p><strong>Riwayat Treatment Sebelumnya:</strong> {selectedPasien()?.riwayatTreatment || '-'}</p>
                                    <p><strong>Keluhan Utama:</strong> {selectedPasien()?.keluhanUtama || '-'}</p>
                                </div>
                            </div>

                            {/* Upcoming Appointments (Doctor's view) */}
                            <div class="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
                                <h3 class="text-xl font-semibold text-yellow-800 mb-4 flex items-center gap-2"><Calendar size={20} /> Upcoming Appointments</h3>
                                <Show when={upcomingAppointments().length > 0} fallback={<p class="text-gray-600">Tidak ada jadwal appointment yang akan datang.</p>}>
                                    <For each={upcomingAppointments()}>
                                        {(appt) => (
                                            <div class="bg-white p-3 mb-2 rounded-lg border border-yellow-200 flex justify-between items-center shadow-sm">
                                                <div>
                                                    <p class="font-semibold text-gray-800">{dayjs(appt.tanggal).format('DD MMMM YYYY')} Pukul {appt.waktuMulai}</p>
                                                    <p class="text-sm text-gray-600">Dengan dr. {getDokterName(appt.dokterId)}</p>
                                                    <p class="text-sm text-gray-600">Treatment: {appt.treatmentIds.map(getTreatmentName).join(', ')}</p>
                                                    <p class="text-sm text-gray-600">Status: <span class="font-medium text-blue-600">{appt.status.toUpperCase()}</span></p>
                                                </div>
                                                <div class="flex gap-2">
                                                    <button
                                                        onClick={() => handleStartTreatment(selectedPasien()!, appt)}
                                                        class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-200 flex items-center gap-1 text-sm"
                                                        title="Mulai Sesi ini"
                                                    >
                                                        <CheckCircle size={16} /> Mulai Sesi
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(appt.id)}
                                                        class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors duration-200 flex items-center gap-1 text-sm"
                                                        title="Batalkan Appointment"
                                                    >
                                                        <XCircle size={16} /> Batal
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </Show>
                            </div>

                            {/* Forms for Skin Analysis / Treatment Progress (Conditional) */}
                            <Show when={selectedAppointment()}>
                                <div class="bg-gray-100 p-6 rounded-lg shadow-md border border-gray-200">
                                    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Show when={selectedAppointment()?.isInitialSkinAnalysis} fallback={<>
                                            <Stethoscope size={20} /> Catat Progress Treatment
                                        </>}>
                                            <FlaskConical size={20} /> Hasil Analisis Kulit Awal
                                        </Show>
                                    </h3>

                                    {/* Skin Analysis Form */}
                                    <Show when={selectedAppointment()?.isInitialSkinAnalysis}>
                                        <form onSubmit={(e) => { e.preventDefault(); handleCompleteAppointment(); }} class="space-y-4">
                                            <div>
                                                <label for="hasil-visual" class="block text-sm font-medium text-gray-700 mb-1">Hasil Visual <span class="text-red-500">*</span></label>
                                                <textarea
                                                    id="hasil-visual"
                                                    value={skinAnalysisFormData().hasilVisual || ''}
                                                    onInput={(e) => handleSkinAnalysisFormChange('hasilVisual', e.target.value)}
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="3"
                                                    required
                                                    placeholder="Contoh: Kulit cenderung kering, ada breakout di area T-zone, kemerahan di pipi."
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label for="hasil-alat" class="block text-sm font-medium text-gray-700 mb-1">Hasil Alat <span class="text-red-500">*</span></label>
                                                <textarea
                                                    id="hasil-alat"
                                                    value={skinAnalysisFormData().hasilAlat || ''}
                                                    onInput={(e) => handleSkinAnalysisFormChange('hasilAlat', e.target.value)}
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="3"
                                                    required
                                                    placeholder="Contoh: Kelembaban 30%, produksi sebum 70%, elastisitas 60%, UV damage 45%."
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label for="rekomendasi-treatment" class="block text-sm font-medium text-gray-700 mb-1">Rekomendasi Treatment</label>
                                                <select
                                                    multiple
                                                    id="rekomendasi-treatment"
                                                    value={skinAnalysisFormData().rekomendasiTreatment?.map(String) || []} // convert number[] to string[] for select
                                                    onInput={(e) => handleMultiSelectChange('rekomendasiTreatment', e, 'skinAnalysis')}
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                                                >
                                                    <For each={treatmentList()}>
                                                        {(treatment) => (
                                                            <option value={treatment.id}>{treatment.nama}</option>
                                                        )}
                                                    </For>
                                                </select>
                                                <p class="text-xs text-gray-500 mt-1">Tekan `Ctrl` (Windows/Linux) atau `Cmd` (macOS) dan klik untuk memilih lebih dari satu.</p>
                                            </div>
                                            <div>
                                                <label for="rekomendasi-produk" class="block text-sm font-medium text-gray-700 mb-1">Rekomendasi Produk</label>
                                                <select
                                                    multiple
                                                    id="rekomendasi-produk"
                                                    value={skinAnalysisFormData().rekomendasiProduk?.map(String) || []} // convert number[] to string[] for select
                                                    onInput={(e) => handleMultiSelectChange('rekomendasiProduk', e, 'skinAnalysis')}
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                                                >
                                                    <For each={productList()}>
                                                        {(product) => (
                                                            <option value={product.id}>{product.nama}</option>
                                                        )}
                                                    </For>
                                                </select>
                                                <p class="text-xs text-gray-500 mt-1">Tekan `Ctrl` (Windows/Linux) atau `Cmd` (macOS) dan klik untuk memilih lebih dari satu.</p>
                                            </div>
                                            <div>
                                                <label for="catatan-tambahan-sa" class="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                                                <textarea
                                                    id="catatan-tambahan-sa"
                                                    value={skinAnalysisFormData().catatanTambahan || ''}
                                                    onInput={(e) => handleSkinAnalysisFormChange('catatanTambahan', e.target.value)}
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="2"
                                                    placeholder="Tambahkan catatan khusus terkait analisis kulit."
                                                ></textarea>
                                            </div>
                                            <button
                                                type="submit"
                                                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                                            >
                                                <CheckCircle size={20} /> Selesaikan Analisis & Appointment
                                            </button>
                                        </form>
                                    </Show>

                                    {/* Treatment Progress Form */}
                                    <Show when={!selectedAppointment()?.isInitialSkinAnalysis}>
                                        <form onSubmit={(e) => { e.preventDefault(); handleCompleteAppointment(); }} class="space-y-4">
                                            <div>
                                                <label for="catatan-progress" class="block text-sm font-medium text-gray-700 mb-1">Catatan Treatment <span class="text-red-500">*</span></label>
                                                <textarea
                                                    id="catatan-progress"
                                                    value={treatmentProgressFormData().catatan || ''}
                                                    onInput={(e) => handleTreatmentProgressFormChange('catatan', e.target.value)}
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="4"
                                                    required
                                                    placeholder="Deskripsikan treatment yang dilakukan, produk yang digunakan, dan reaksi pasien. Contoh: Facial Hydrating. Kulit lebih lembab, jerawat kempes. Pasien merasa nyaman."
                                                ></textarea>
                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="foto-sebelum" class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Camera size={16} /> Foto Sebelum (Base64/URL)</label>
                                                    <input
                                                        type="text" // Or type="file" with file reader logic
                                                        id="foto-sebelum"
                                                        value={treatmentProgressFormData().fotoSebelum || ''}
                                                        onInput={(e) => handleTreatmentProgressFormChange('fotoSebelum', e.target.value)}
                                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="URL gambar atau Base64"
                                                    />
                                                </div>
                                                <div>
                                                    <label for="foto-sesudah" class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Camera size={16} /> Foto Sesudah (Base64/URL)</label>
                                                    <input
                                                        type="text" // Or type="file" with file reader logic
                                                        id="foto-sesudah"
                                                        value={treatmentProgressFormData().fotoSesudah || ''}
                                                        onInput={(e) => handleTreatmentProgressFormChange('fotoSesudah', e.target.value)}
                                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="URL gambar atau Base64"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                                            >
                                                <CheckCircle size={20} /> Selesaikan Treatment & Appointment
                                            </button>
                                        </form>
                                    </Show>
                                </div>
                            </Show>

                            {/* Completed Appointments & Medical Record History */}
                            <div class="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                                <h3 class="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2"><History size={20} /> Riwayat Treatment & Rekam Medis</h3>
                                <Show when={completedAppointments().length > 0} fallback={<p class="text-gray-600">Belum ada riwayat treatment atau analisis kulit yang selesai.</p>}>
                                    <For each={completedAppointments()}>
                                        {(appt) => {
                                            const analysis = selectedPasien()?.skinAnalyses.find(sa => sa.id === appt.skinAnalysisId);
                                            const progress = selectedPasien()?.treatmentProgresses.find(tp => tp.id === appt.treatmentProgressId);
                                            return (
                                                <div class="bg-white p-3 mb-3 rounded-lg border border-blue-200 shadow-sm">
                                                    <p class="font-bold text-gray-900 mb-1">
                                                        {dayjs(appt.tanggal).format('DD MMMM YYYY')} Pukul {appt.waktuMulai} ({appt.status.toUpperCase()})
                                                    </p>
                                                    <p class="text-sm text-gray-700">Dokter: {getDokterName(appt.dokterId)}</p>
                                                    <p class="text-sm text-gray-700 mb-2">Treatment: {appt.treatmentIds.map(getTreatmentName).join(', ')}</p>

                                                    <Show when={analysis}>
                                                        <div class="bg-blue-50 p-2 rounded-md mb-2 text-sm border border-blue-100">
                                                            <p class="font-semibold text-blue-700 mb-1">Hasil Analisis Kulit (Initial)</p>
                                                            <p><strong>Visual:</strong> {analysis!.hasilVisual}</p>
                                                            <p><strong>Alat:</strong> {analysis!.hasilAlat}</p>
                                                            <p><strong>Rekomendasi Treatment:</strong> {analysis!.rekomendasiTreatment.map(getTreatmentName).join(', ') || '-'}</p>
                                                            <p><strong>Rekomendasi Produk:</strong> {analysis!.rekomendasiProduk.map(getProductName).join(', ') || '-'}</p>
                                                            <p><strong>Catatan:</strong> {analysis!.catatanTambahan || '-'}</p>
                                                        </div>
                                                    </Show>

                                                    <Show when={progress}>
                                                        <div class="bg-green-50 p-2 rounded-md mb-2 text-sm border border-green-100">
                                                            <p class="font-semibold text-green-700 mb-1">Catatan Progress Treatment</p>
                                                            <p>{progress!.catatan}</p>
                                                            <Show when={progress!.fotoSebelum}>
                                                                <p class="text-xs mt-1">Foto Sebelum: <a href={progress!.fotoSebelum} target="_blank" class="text-blue-600 hover:underline">Lihat</a></p>
                                                            </Show>
                                                            <Show when={progress!.fotoSesudah}>
                                                                <p class="text-xs">Foto Sesudah: <a href={progress!.fotoSesudah} target="_blank" class="text-blue-600 hover:underline">Lihat</a></p>
                                                            </Show>
                                                        </div>
                                                    </Show>
                                                </div>
                                            );
                                        }}
                                    </For>
                                </Show>
                            </div>
                        </div>

                        <div class="p-6 md:p-8 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleCloseDetailModal}
                                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
};

export default PasienDataPage;