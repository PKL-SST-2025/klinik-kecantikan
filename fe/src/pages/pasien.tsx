//src/pages/pasien.tsx
import { createSignal, For, Show, onMount, Component, createMemo, createEffect } from 'solid-js';
import { Pasien, SkinAnalysis, TreatmentProgress, Appointment, TreatmentFromBackend, ProdukFromBackend } from '../types/database'; 
import { User, FileText, Stethoscope, Activity, Heart, Shield, Pill, Phone, Mail, Calendar, MapPin, IdCard, Users, AlertTriangle, MessageCircle, Clock, ArrowLeft, CheckCircle2, Edit, Trash2, Save, X } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '../api/api';
import { useNavigate, useSearchParams } from '@solidjs/router';

dayjs.extend(relativeTime);

const PasienDataPage: Component = () => {
    // Navigation setup
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // --- State ---
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<TreatmentFromBackend[]>([]);
    const [productList, setProductList] = createSignal<ProdukFromBackend[]>([]);
    const [selectedPasien, setSelectedPasien] = createSignal<Pasien | null>(null);

    // --- Form State ---
    const [analysisFormData, setAnalysisFormData] = createSignal<Partial<SkinAnalysis>>({
        appointment_id: '',
        hasil_visual: '',
        hasil_alat: '',
        rekomendasi_treatment: [],
        rekomendasi_produk: [],
        catatan_tambahan: '',
    });

    const [progressFormData, setProgressFormData] = createSignal<Partial<TreatmentProgress>>({
        appointment_id: '',
        catatan: '',
    });

    // Edit states
    const [editingAnalysis, setEditingAnalysis] = createSignal<string | null>(null);
    const [editingProgress, setEditingProgress] = createSignal<string | null>(null);
    const [editAnalysisData, setEditAnalysisData] = createSignal<Partial<SkinAnalysis>>({});
    const [editProgressData, setEditProgressData] = createSignal<Partial<TreatmentProgress>>({});

    const [loading, setLoading] = createSignal(false);
    const [activeTab, setActiveTab] = createSignal<'profile' | 'analysis' | 'progress'>('profile');
    const [showSuccessActions, setShowSuccessActions] = createSignal(false);

    // --- Data Loading ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [pasiensRes, appointmentsRes, treatmentsRes, productsRes] = await Promise.all([
                api.get('/pasiens'),
                api.get('/appointments'),
                api.get('/treatments'),
                api.get('/products'),
            ]);
            
            // Fetch additional data for patients (analyses and progress)
            const pasiensWithDetails = await Promise.all(
                pasiensRes.data.map(async (pasien: Pasien) => {
                    try {
                        const [analysesRes, progressRes] = await Promise.all([
                            api.get(`/skin-analyses?pasien_id=${pasien.id}`),
                            api.get(`/treatment-progress?pasien_id=${pasien.id}`)
                        ]);
                        
                        console.log(`Patient ${pasien.nama_lengkap} analyses:`, analysesRes.data);
                        console.log(`Patient ${pasien.nama_lengkap} progress:`, progressRes.data);
                        
                        return {
                            ...pasien,
                            skin_analyses: analysesRes.data || [],
                            treatment_progresses: progressRes.data || []
                        };
                    } catch (error) {
                        console.warn(`Failed to fetch details for patient ${pasien.id}:`, error);
                        return {
                            ...pasien,
                            skin_analyses: [],
                            treatment_progresses: []
                        };
                    }
                })
            );
            
            setPasienList(pasiensWithDetails);
            setAppointmentList(appointmentsRes.data);
            setTreatmentList(treatmentsRes.data);
            setProductList(productsRes.data);

            // Auto-select patient from URL parameter
            const patientId = searchParams.id;
            if (patientId) {
                const patient = pasiensWithDetails.find((p: Pasien) => p.id === patientId);
                if (patient) {
                    setSelectedPasien(patient);
                    setActiveTab('profile');
                }
            }
        } catch (error) {
            console.error("Gagal memuat data:", error);
            toast.error("Gagal memuat data dari server.");
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        fetchData();
    });

    // Watch for URL parameter changes
    createEffect(() => {
        const patientId = searchParams.id;
        if (patientId && pasienList().length > 0) {
            const patient = pasienList().find(p => p.id === patientId);
            if (patient && selectedPasien()?.id !== patient.id) {
                setSelectedPasien(patient);
                setActiveTab('profile');
            }
        }
    });

    const patientAppointments = createMemo(() => {
        if (!selectedPasien()) return [];
        return appointmentList().filter(app => app.pasien_id === selectedPasien()!.id);
    });

    // Check if patient has completed analysis and progress
    const hasCompletedData = createMemo(() => {
        const patient = selectedPasien();
        if (!patient) return false;
        
        const hasAnalysis = patient.skin_analyses && patient.skin_analyses.length > 0;
        const hasProgress = patient.treatment_progresses && patient.treatment_progresses.length > 0;
        
        return hasAnalysis && hasProgress;
    });

    // --- Handlers ---
    const handleSelectPasien = (pasien: Pasien) => {
        setSelectedPasien(pasien);
        setActiveTab('profile');
        setShowSuccessActions(false);
        // Reset forms and edit states
        setAnalysisFormData({
            appointment_id: '',
            hasil_visual: '',
            hasil_alat: '',
            rekomendasi_treatment_ids: [],
            rekomendasi_produk_ids: [],
            catatan_tambahan: '',
        });
        setProgressFormData({ appointment_id: '', catatan: '' });
        setEditingAnalysis(null);
        setEditingProgress(null);
        
        // Update URL without navigation
        window.history.replaceState({}, '', `/pasien?id=${pasien.id}`);
    };

    const handleAddSkinAnalysis = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        const { appointment_id, hasil_visual, hasil_alat } = analysisFormData();

        if (!appointment_id || !hasil_visual || !hasil_alat) {
            toast.error("Appointment, Hasil Visual, dan Hasil Alat wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            const newAnalysisData = {
                ...analysisFormData(),
                pasien_id: selectedPasien()?.id,
                tanggal_analisis: dayjs().toISOString(),
                rekomendasi_treatment: analysisFormData().rekomendasi_treatment || [],
                rekomendasi_produk: analysisFormData().rekomendasi_produk || [],
            };
            
            const res = await api.post('/skin-analyses', newAnalysisData);
            toast.success("Hasil Analisis Kulit berhasil ditambahkan!");
            
            // Reset form
            setAnalysisFormData({
                appointment_id: '',
                hasil_visual: '',
                hasil_alat: '',
                rekomendasi_treatment: [],
                rekomendasi_produk: [],
                catatan_tambahan: '',
            });
            
            // Show success actions if both analysis and progress are completed
            fetchData();
        } catch (error) {
            console.error("Gagal menambahkan analisis:", error);
            toast.error("Gagal menyimpan analisis. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTreatmentProgress = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        const { appointment_id, catatan } = progressFormData();

        if (!appointment_id || !catatan) {
            toast.error("Appointment dan Catatan Progress wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            const newProgressData = {
                ...progressFormData(),
                pasien_id: selectedPasien()?.id,
                tanggal_progress: dayjs().toISOString(),
            };
            const res = await api.post('/treatment-progress', newProgressData);
            toast.success("Progress Treatment berhasil ditambahkan!");
            
            // Reset form
            setProgressFormData({ appointment_id: '', catatan: '' });
            
            fetchData();
        } catch (error) {
            console.error("Gagal menambahkan progress:", error);
            toast.error("Gagal menyimpan progress. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Edit Analysis Functions
    const startEditAnalysis = (analysis: SkinAnalysis) => {
        console.log('Starting edit for analysis:', analysis);
        setEditingAnalysis(analysis.id);
        setEditAnalysisData({
            hasil_visual: analysis.hasil_visual,
            hasil_alat: analysis.hasil_alat,
            catatan_tambahan: analysis.catatan_tambahan,
        });
    };

    const cancelEditAnalysis = () => {
        setEditingAnalysis(null);
        setEditAnalysisData({});
    };

    const saveEditAnalysis = async (analysisId: string) => {
        setLoading(true);
        try {
            const response = await api.put(`/skin-analyses/${analysisId}`, editAnalysisData());
            console.log('Updated analysis response:', response.data);
            toast.success("Analisis berhasil diperbarui!");
            setEditingAnalysis(null);
            setEditAnalysisData({});
            
            // Refresh data
            await fetchData();
            
            // Update selected patient
            const updatedPatient = pasienList().find(p => p.id === selectedPasien()?.id);
            if (updatedPatient) {
                setSelectedPasien(updatedPatient);
            }
        } catch (error) {
            console.error("Gagal memperbarui analisis:", error);
            toast.error("Gagal memperbarui analisis.");
        } finally {
            setLoading(false);
        }
    };

    // Edit Progress Functions
    const startEditProgress = (progress: TreatmentProgress) => {
        console.log('Starting edit for progress:', progress);
        setEditingProgress(progress.id);
        setEditProgressData({
            catatan: progress.catatan,
        });
    };

    const cancelEditProgress = () => {
        setEditingProgress(null);
        setEditProgressData({});
    };

    const saveEditProgress = async (progressId: string) => {
        setLoading(true);
        try {
            const response = await api.put(`/treatment-progress/${progressId}`, editProgressData());
            console.log('Updated progress response:', response.data);
            toast.success("Progress berhasil diperbarui!");
            setEditingProgress(null);
            setEditProgressData({});
            
            // Refresh data
            await fetchData();
            
            // Update selected patient
            const updatedPatient = pasienList().find(p => p.id === selectedPasien()?.id);
            if (updatedPatient) {
                setSelectedPasien(updatedPatient);
            }
        } catch (error) {
            console.error("Gagal memperbarui progress:", error);
            toast.error("Gagal memperbarui progress.");
        } finally {
            setLoading(false);
        }
    };

    // Delete Functions
    const deleteAnalysis = async (analysisId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus analisis ini?")) return;
        
        setLoading(true);
        try {
            await api.delete(`/skin-analyses/${analysisId}`);
            toast.success("Analisis berhasil dihapus!");
            
            // Refresh data
            await fetchData();
            
            // Update selected patient
            const updatedPatient = pasienList().find(p => p.id === selectedPasien()?.id);
            if (updatedPatient) {
                setSelectedPasien(updatedPatient);
            }
        } catch (error) {
            console.error("Gagal menghapus analisis:", error);
            toast.error("Gagal menghapus analisis.");
        } finally {
            setLoading(false);
        }
    };

    const deleteProgress = async (progressId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus progress ini?")) return;
        
        setLoading(true);
        try {
            await api.delete(`/treatment-progress/${progressId}`);
            toast.success("Progress berhasil dihapus!");
            
            // Refresh data
            await fetchData();
            
            // Update selected patient
            const updatedPatient = pasienList().find(p => p.id === selectedPasien()?.id);
            if (updatedPatient) {
                setSelectedPasien(updatedPatient);
            }
        } catch (error) {
            console.error("Gagal menghapus progress:", error);
            toast.error("Gagal menghapus progress.");
        } finally {
            setLoading(false);
        }
    };

    const navigateBackToSchedule = () => {
        navigate('/jadwal');
    };

    const completeAppointmentAndReturn = async () => {
        // Find the most recent booked appointment for this patient
        const recentAppointment = patientAppointments()
            .filter(app => app.status === 'booked')
            .sort((a, b) => dayjs(b.tanggal).diff(dayjs(a.tanggal)))[0];
            
        if (!recentAppointment) {
            toast.error("Tidak ada appointment yang dapat ditandai sebagai selesai.");
            return;
        }

        try {
            await api.put(`/appointments/${recentAppointment.id}/status`, { status: 'completed' });
            toast.success("Appointment berhasil ditandai sebagai selesai!");
            
            // Navigate back to schedule
            setTimeout(() => {
                navigate('/jadwal');
            }, 1500);
        } catch (error) {
            console.error("Gagal menandai appointment sebagai selesai:", error);
            toast.error("Gagal menandai appointment sebagai selesai.");
        }
    };

    // Check if coming from jadwal page
    const isFromJadwal = () => searchParams.from === 'jadwal';

    // Check if patient should show as "Sudah Analisis"
    const patientAnalysisStatus = createMemo(() => {
        const patient = selectedPasien();
        if (!patient) return false;
        
        return hasCompletedData();
    });

    // --- Render ---
    return (
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">Manajemen Data Pasien</h1>
                        <p class="text-gray-600">Kelola data pasien, analisis kulit, dan progress treatment</p>
                    </div>
                    
                    {/* Back button if coming from jadwal */}
                    <Show when={isFromJadwal()}>
                        <button
                            onClick={navigateBackToSchedule}
                            class="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 transition-colors duration-200 shadow-sm"
                        >
                            <ArrowLeft size={18} />
                            Kembali ke Jadwal
                        </button>
                    </Show>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Patient List Sidebar */}
                <div class="lg:col-span-1 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-6">
                    <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Users size={20} class="text-purple-600" />
                        Daftar Pasien
                    </h2>
                    <div class="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                        <Show when={!loading()} fallback={<p class="text-center text-gray-500 py-4">Memuat...</p>}>
                            <For each={pasienList()}>
                                {(pasien) => {
                                    const hasData = (pasien.skin_analyses && pasien.skin_analyses.length > 0) && 
                                                   (pasien.treatment_progresses && pasien.treatment_progresses.length > 0);
                                    
                                    return (
                                        <div
                                            class={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                                selectedPasien()?.id === pasien.id 
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-[1.02]' 
                                                    : 'bg-gray-50 hover:bg-purple-100 hover:shadow-md'
                                            }`}
                                            onClick={() => handleSelectPasien(pasien)}
                                        >
                                            <div class="font-semibold">{pasien.nama_lengkap}</div>
                                            <div class="text-sm opacity-75">{pasien.no_telepon}</div>
                                            <div class="text-xs opacity-60 mt-1">
                                                {hasData ? '✓ Sudah Lengkap' : '○ Belum Lengkap'}
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </Show>
                    </div>
                </div>

                {/* Patient Details */}
                <div class="lg:col-span-3">
                    <Show 
                        when={selectedPasien()} 
                        fallback={
                            <div class="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-12 text-center">
                                <User size={48} class="text-gray-400 mx-auto mb-4" />
                                <h3 class="text-xl font-medium text-gray-700 mb-2">Pilih Pasien</h3>
                                <p class="text-gray-500">Klik pada nama pasien untuk melihat detail lengkap</p>
                            </div>
                        }
                    >
                        <div class="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                            {/* Patient Header */}
                            <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <h2 class="text-2xl font-bold mb-2">{selectedPasien()?.nama_lengkap}</h2>
                                        <div class="flex items-center gap-4 text-sm opacity-90">
                                            <span class="flex items-center gap-1">
                                                <Phone size={14} />
                                                {selectedPasien()?.no_telepon}
                                            </span>
                                            {selectedPasien()?.email && (
                                                <span class="flex items-center gap-1">
                                                    <Mail size={14} />
                                                    {selectedPasien()?.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            patientAnalysisStatus() 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-yellow-500 text-white'
                                        }`}>
                                            {patientAnalysisStatus() ? '✓ Data Lengkap' : '○ Data Belum Lengkap'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Complete Actions Bar - Show when has both analysis and progress */}
                            <Show when={hasCompletedData() && isFromJadwal()}>
                                <div class="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2 text-green-800">
                                            <CheckCircle2 size={20} class="text-green-600" />
                                            <span class="font-medium">Data pasien sudah lengkap! Siap untuk diselesaikan.</span>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <button
                                                onClick={completeAppointmentAndReturn}
                                                class="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-md font-medium"
                                            >
                                                <CheckCircle2 size={18} />
                                                Selesaikan Appointment
                                            </button>
                                            <button
                                                onClick={navigateBackToSchedule}
                                                class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md"
                                            >
                                                <Calendar size={16} />
                                                Kembali ke Jadwal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Show>

                            {/* Tab Navigation */}
                            <div class="border-b border-gray-200">
                                <nav class="flex">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        class={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                                            activeTab() === 'profile'
                                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <User size={16} class="inline mr-2" />
                                        Data Pribadi
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('analysis')}
                                        class={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                                            activeTab() === 'analysis'
                                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FileText size={16} class="inline mr-2" />
                                        Analisis Kulit
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('progress')}
                                        class={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                                            activeTab() === 'progress'
                                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Activity size={16} class="inline mr-2" />
                                        Progress Treatment
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div class="p-6">
                                {/* Profile Tab - Keep existing content */}
                                <Show when={activeTab() === 'profile'}>
                                    <div class="space-y-8">
                                        {/* Basic Information */}
                                        <div>
                                            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <User size={18} class="text-purple-600" />
                                                Informasi Dasar
                                            </h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div class="bg-gray-50 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                                                        <Calendar size={14} />
                                                        Tanggal Lahir
                                                    </label>
                                                    <p class="text-gray-900 font-medium">
                                                        {selectedPasien()?.tanggal_lahir 
                                                            ? dayjs(selectedPasien()?.tanggal_lahir).format('DD MMMM YYYY')
                                                            : '-'
                                                        }
                                                    </p>
                                                </div>
                                                <div class="bg-gray-50 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                                                    <p class="text-gray-900 font-medium">{selectedPasien()?.jenis_kelamin || '-'}</p>
                                                </div>
                                                <div class="bg-gray-50 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                                                        <IdCard size={14} />
                                                        No. Identitas
                                                    </label>
                                                    <p class="text-gray-900 font-medium">{selectedPasien()?.no_identitas || '-'}</p>
                                                </div>
                                                <div class="bg-gray-50 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                                                        <MapPin size={14} />
                                                        Alamat
                                                    </label>
                                                    <p class="text-gray-900 font-medium">{selectedPasien()?.alamat_lengkap || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medical Information */}
                                        <div>
                                            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Activity size={18} class="text-green-600" />
                                                Informasi Medis & Kulit
                                            </h3>
                                            <div class="grid grid-cols-1 gap-4">
                                                <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-red-700 flex items-center gap-2 mb-2">
                                                        <AlertTriangle size={14} />
                                                        Riwayat Alergi
                                                    </label>
                                                    <p class="text-gray-900">{selectedPasien()?.riwayat_alergi || 'Tidak ada riwayat alergi'}</p>
                                                </div>
                                                <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-blue-700 flex items-center gap-2 mb-2">
                                                        <Heart size={14} />
                                                        Kondisi Medis
                                                    </label>
                                                    <p class="text-gray-900">{selectedPasien()?.kondisi_medis || 'Tidak ada kondisi medis khusus'}</p>
                                                </div>
                                                <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-purple-700 flex items-center gap-2 mb-2">
                                                        <Pill size={14} />
                                                        Obat yang Dikonsumsi
                                                    </label>
                                                    <p class="text-gray-900">{selectedPasien()?.obat_konsumsi || 'Tidak ada obat yang dikonsumsi'}</p>
                                                </div>
                                                <div class="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-orange-700 flex items-center gap-2 mb-2">
                                                        <Clock size={14} />
                                                        Riwayat Treatment
                                                    </label>
                                                    <p class="text-gray-900">{selectedPasien()?.riwayat_treatment || 'Belum pernah melakukan treatment'}</p>
                                                </div>
                                                <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                                                    <label class="text-sm font-medium text-indigo-700 flex items-center gap-2 mb-2">
                                                        <MessageCircle size={14} />
                                                        Keluhan Utama
                                                    </label>
                                                    <p class="text-gray-900">{selectedPasien()?.keluhan_utama || 'Tidak ada keluhan khusus'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        {(selectedPasien()?.kontak_darurat_nama || selectedPasien()?.nomer_kontak_darurat) && (
                                            <div>
                                                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                    <Users size={18} class="text-orange-600" />
                                                    Kontak Darurat
                                                </h3>
                                                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label class="text-sm font-medium text-yellow-700 mb-1 block">Nama</label>
                                                            <p class="text-gray-900 font-medium">{selectedPasien()?.kontak_darurat_nama || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <label class="text-sm font-medium text-yellow-700 mb-1 block">Hubungan</label>
                                                            <p class="text-gray-900 font-medium">{selectedPasien()?.kontak_darurat_hubungan || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <label class="text-sm font-medium text-yellow-700 mb-1 block">No. Telepon</label>
                                                            <p class="text-gray-900 font-medium">{selectedPasien()?.nomer_kontak_darurat || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Show>

                                {/* Analysis Tab - Enhanced with Edit Feature */}
                                <Show when={activeTab() === 'analysis'}>
                                    <div class="space-y-6">
                                        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <FileText size={18} class="text-blue-600" />
                                            Riwayat Analisis Kulit
                                        </h3>
                                        
                                        <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
                                            <For each={selectedPasien()?.skin_analyses} fallback={
                                                <div class="text-center py-8 text-gray-500">
                                                    <FileText size={32} class="mx-auto mb-2 opacity-50" />
                                                    <p>Belum ada riwayat analisis kulit</p>
                                                </div>
                                            }>
                                                {(analysis) => (
                                                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                                                        <div class="flex justify-between items-start mb-3">
                                                            <h4 class="font-semibold text-gray-800">
                                                                Analisis {dayjs(analysis.tanggal_analisis).format('DD MMMM YYYY')}
                                                            </h4>
                                                            <div class="flex items-center gap-2">
                                                                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                    {dayjs(analysis.tanggal_analisis).fromNow()}
                                                                </span>
                                                                <Show when={editingAnalysis() !== analysis.id}>
                                                                    <button
                                                                        onClick={() => startEditAnalysis(analysis)}
                                                                        class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                                                                        title="Edit analisis"
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteAnalysis(analysis.id)}
                                                                        class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                                                                        title="Hapus analisis"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </Show>
                                                            </div>
                                                        </div>
                                                        
                                                        <Show 
                                                            when={editingAnalysis() === analysis.id} 
                                                            fallback={
                                                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                                    <div>
                                                                        <label class="font-medium text-gray-700 block mb-1">Hasil Visual:</label>
                                                                        <p class="text-gray-900 bg-white p-2 rounded">{analysis.hasil_visual}</p>
                                                                    </div>
                                                                    <div>
                                                                        <label class="font-medium text-gray-700 block mb-1">Hasil Alat:</label>
                                                                        <p class="text-gray-900 bg-white p-2 rounded">{analysis.hasil_alat}</p>
                                                                    </div>
                                                                    {analysis.catatan_tambahan && (
                                                                        <div class="md:col-span-2">
                                                                            <label class="font-medium text-gray-700 block mb-1">Catatan:</label>
                                                                            <p class="text-gray-900 bg-white p-2 rounded">{analysis.catatan_tambahan}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            }
                                                        >
                                                            <div class="space-y-3">
                                                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label class="font-medium text-gray-700 block mb-1">Hasil Visual:</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editAnalysisData().hasil_visual || ''}
                                                                            onInput={(e) => setEditAnalysisData(prev => ({...prev, hasil_visual: e.target.value}))}
                                                                            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label class="font-medium text-gray-700 block mb-1">Hasil Alat:</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editAnalysisData().hasil_alat || ''}
                                                                            onInput={(e) => setEditAnalysisData(prev => ({...prev, hasil_alat: e.target.value}))}
                                                                            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label class="font-medium text-gray-700 block mb-1">Catatan:</label>
                                                                    <textarea
                                                                        value={editAnalysisData().catatan_tambahan || ''}
                                                                        onInput={(e) => setEditAnalysisData(prev => ({...prev, catatan_tambahan: e.target.value}))}
                                                                        rows={3}
                                                                        class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                                    />
                                                                </div>
                                                                <div class="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={cancelEditAnalysis}
                                                                        class="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors duration-200"
                                                                    >
                                                                        <X size={14} />
                                                                        Batal
                                                                    </button>
                                                                    <button
                                                                        onClick={() => saveEditAnalysis(analysis.id)}
                                                                        disabled={loading()}
                                                                        class="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                                                                    >
                                                                        <Save size={14} />
                                                                        Simpan
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Show>
                                                    </div>
                                                )}
                                            </For>
                                        </div>

                                        {/* Add New Analysis Form */}
                                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
                                            <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <FileText size={16} class="text-green-600" />
                                                Tambah Analisis Baru
                                            </h4>
                                            <form onSubmit={handleAddSkinAnalysis} class="space-y-4">
                                                <select 
                                                    aria-label="Pilih Appointment Analisis" 
                                                    class="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                    onChange={(e) => setAnalysisFormData(p => ({...p, appointment_id: e.currentTarget.value}))}
                                                    value={analysisFormData().appointment_id}
                                                >
                                                    <option value="">Pilih Appointment untuk Analisis</option>
                                                    <For each={patientAppointments()}>
                                                        {app => (
                                                            <option value={app.id}>
                                                                Appointment {dayjs(app.tanggal).format('DD/MM/YYYY')} - {app.status}
                                                            </option>
                                                        )}
                                                    </For>
                                                </select>
                                                <input 
                                                    type="text" 
                                                    placeholder="Hasil pemeriksaan visual kulit..." 
                                                    class="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                    onInput={(e) => setAnalysisFormData(p => ({...p, hasil_visual: e.currentTarget.value}))} 
                                                    value={analysisFormData().hasil_visual ?? ""}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Hasil pemeriksaan dengan alat..." 
                                                    class="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                    onInput={(e) => setAnalysisFormData(p => ({...p, hasil_alat: e.currentTarget.value}))} 
                                                    value={analysisFormData().hasil_alat ?? ""}
                                                />
                                                <textarea 
                                                    placeholder="Catatan tambahan dan rekomendasi..." 
                                                    class="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none" 
                                                    rows={3}
                                                    onInput={(e) => setAnalysisFormData(p => ({...p, catatan_tambahan: e.currentTarget.value}))}
                                                    value={analysisFormData().catatan_tambahan ?? ""}
                                                ></textarea>
                                                <button 
                                                    type="submit" 
                                                    class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 flex items-center justify-center gap-2"
                                                    disabled={loading()}
                                                >
                                                    {loading() ? (
                                                        <>
                                                            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText size={16} />
                                                            Simpan Analisis
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </Show>

                                {/* Progress Tab - Enhanced with Edit Feature */}
                                <Show when={activeTab() === 'progress'}>
                                    <div class="space-y-6">
                                        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <Activity size={18} class="text-purple-600" />
                                            Riwayat Progress Treatment
                                        </h3>
                                        
                                        <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
                                            <For each={selectedPasien()?.treatment_progresses} fallback={
                                                <div class="text-center py-8 text-gray-500">
                                                    <Activity size={32} class="mx-auto mb-2 opacity-50" />
                                                    <p>Belum ada riwayat progress treatment</p>
                                                </div>
                                            }>
                                                {(progress) => (
                                                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg">
                                                        <div class="flex justify-between items-start mb-3">
                                                            <h4 class="font-semibold text-gray-800">
                                                                Progress {dayjs(progress.tanggal_progress).format('DD MMMM YYYY')}
                                                            </h4>
                                                            <div class="flex items-center gap-2">
                                                                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                                    {dayjs(progress.tanggal_progress).fromNow()}
                                                                </span>
                                                                <Show when={editingProgress() !== progress.id}>
                                                                    <button
                                                                        onClick={() => startEditProgress(progress)}
                                                                        class="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors duration-200"
                                                                        title="Edit progress"
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteProgress(progress.id)}
                                                                        class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                                                                        title="Hapus progress"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </Show>
                                                            </div>
                                                        </div>
                                                        
                                                        <Show 
                                                            when={editingProgress() === progress.id} 
                                                            fallback={
                                                                <p class="text-gray-900 bg-white p-3 rounded">{progress.catatan}</p>
                                                            }
                                                        >
                                                            <div class="space-y-3">
                                                                <textarea
                                                                    value={editProgressData().catatan || ''}
                                                                    onInput={(e) => setEditProgressData(prev => ({...prev, catatan: e.target.value}))}
                                                                    rows={4}
                                                                    class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                                                />
                                                                <div class="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={cancelEditProgress}
                                                                        class="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors duration-200"
                                                                    >
                                                                        <X size={14} />
                                                                        Batal
                                                                    </button>
                                                                    <button
                                                                        onClick={() => saveEditProgress(progress.id)}
                                                                        disabled={loading()}
                                                                        class="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors duration-200"
                                                                    >
                                                                        <Save size={14} />
                                                                        Simpan
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Show>
                                                    </div>
                                                )}
                                            </For>
                                        </div>

                                        {/* Add New Progress Form */}
                                        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-6 rounded-lg">
                                            <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Activity size={16} class="text-indigo-600" />
                                                Tambah Progress Baru
                                            </h4>
                                            <form onSubmit={handleAddTreatmentProgress} class="space-y-4">
                                                <select 
                                                    aria-label="Pilih Appointment Progress" 
                                                    class="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                    onChange={(e) => setProgressFormData(p => ({...p, appointment_id: e.currentTarget.value}))}
                                                    value={progressFormData().appointment_id}
                                                >
                                                    <option value="">Pilih Appointment untuk Progress</option>
                                                    <For each={patientAppointments()}>
                                                        {app => (
                                                            <option value={app.id}>
                                                                Appointment {dayjs(app.tanggal).format('DD/MM/YYYY')} - {app.status}
                                                            </option>
                                                        )}
                                                    </For>
                                                </select>
                                                <textarea 
                                                    placeholder="Catatan progress treatment, kondisi kulit pasien, respons terhadap treatment..." 
                                                    class="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none" 
                                                    rows={4}
                                                    onInput={(e) => setProgressFormData(p => ({...p, catatan: e.currentTarget.value}))}
                                                    value={progressFormData().catatan ?? ""}
                                                ></textarea>
                                                <button 
                                                    type="submit" 
                                                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors duration-200 flex items-center justify-center gap-2"
                                                    disabled={loading()}
                                                >
                                                    {loading() ? (
                                                        <>
                                                            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Activity size={16} />
                                                            Simpan Progress
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default PasienDataPage;
