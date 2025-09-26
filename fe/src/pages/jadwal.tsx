// src/pages/jadwal.tsx
import { Component, createSignal, onMount, For, Show, createMemo } from 'solid-js';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import isBetween from 'dayjs/plugin/isBetween';
import { Calendar, User, Stethoscope, Tag, Clock, CheckCircle, XCircle, Filter, Search, Eye, DollarSign, RotateCcw, Edit } from 'lucide-solid';
import { useNavigate } from '@solidjs/router';
import api from '../api/api';

dayjs.extend(isBetween);
dayjs.locale('id');

// Import interfaces
import { Appointment, Pasien, Dokter, TreatmentFromBackend } from '../types/database';

const AppointmentSchedulePage: Component = () => {
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<TreatmentFromBackend[]>([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    const [filterDate, setFilterDate] = createSignal<string>('');
    const [filterDokterId, setFilterDokterId] = createSignal<string | 'all'>('all');
    const [filterStatus, setFilterStatus] = createSignal<string | 'all'>('all');
    const [searchTerm, setSearchTerm] = createSignal<string>('');

    const navigate = useNavigate();
    
    // Enhanced navigation function that passes patient ID as URL parameter
    const navigateToPatientDetail = (appointment: Appointment) => {
        navigate(`/pasien?id=${appointment.pasien_id}&from=jadwal`);
    };
    
    const [showStatusModal, setShowStatusModal] = createSignal(false);
    const [showRescheduleModal, setShowRescheduleModal] = createSignal(false);
    const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);
    
    // Reschedule form data
    const [rescheduleDate, setRescheduleDate] = createSignal<string>('');
    const [rescheduleTime, setRescheduleTime] = createSignal<string>('');
    const [rescheduleDokterId, setRescheduleDokterId] = createSignal<string>('');
    const [rescheduleNotes, setRescheduleNotes] = createSignal<string>('');

    // --- Fetch Data from Backend ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                appointmentsRes,
                pasiensRes,
                doktersRes,
                treatmentsRes
            ] = await Promise.all([
                api.get('/appointments'),
                api.get('/pasiens'),
                api.get('/dokters'),
                api.get('/treatments')
            ]);

            setAppointmentList(appointmentsRes.data);
            setPasienList(pasiensRes.data);
            setDokterList(doktersRes.data);
            setTreatmentList(treatmentsRes.data);

        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Gagal memuat data. Mohon coba lagi nanti.');
            toast.error('Gagal memuat data dari server.');
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        fetchData();
    });

    // --- Helper Functions ---
    const getPasienName = (id: string) => pasienList().find(p => p.id === id)?.nama_lengkap || 'Pasien Tidak Ditemukan';
    const getDokterName = (id: string) => dokterList().find(d => d.id === id)?.nama || 'Dokter Tidak Ditemukan';
    const getTreatmentNames = (ids: string[]) => {
        return ids.map(id => treatmentList().find(t => t.id === id)?.name || 'N/A').join(', ');
    };
    
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'booked': return { color: 'blue', text: 'Dijadwalkan', bgClass: 'bg-blue-100 text-blue-800' };
            case 'completed': return { color: 'green', text: 'Selesai', bgClass: 'bg-green-100 text-green-800' };
            case 'cancelled': return { color: 'red', text: 'Dibatalkan', bgClass: 'bg-red-100 text-red-800' };
            case 'rescheduled': return { color: 'orange', text: 'Dijadwalkan Ulang', bgClass: 'bg-orange-100 text-orange-800' };
            case 'paid': return { color: 'purple', text: 'Sudah Dibayar', bgClass: 'bg-purple-100 text-purple-800' };
            default: return { color: 'gray', text: 'Unknown', bgClass: 'bg-gray-100 text-gray-800' };
        }
    };
    
    const getAppointmentDetails = (appointment: Appointment) => {
        const pasien = pasienList().find(p => p.id === appointment.pasien_id);
        const dokter = dokterList().find(d => d.id === appointment.dokter_id);
        const treatments = treatmentList().filter(t => appointment.treatment_ids.includes(t.id));
        return { pasien, dokter, treatments };
    };

    const filteredAppointments = createMemo(() => {
        let filtered = appointmentList();

        // Filter by Date
        if (filterDate()) {
            filtered = filtered.filter(appt => dayjs(appt.tanggal).format('YYYY-MM-DD') === filterDate());
        }

        // Filter by Dokter
        if (filterDokterId() !== 'all') {
            filtered = filtered.filter(appt => appt.dokter_id === filterDokterId());
        }

        // Filter by Status
        if (filterStatus() !== 'all') {
            filtered = filtered.filter(appt => appt.status === filterStatus());
        }

        // Filter by Search Term
        if (searchTerm()) {
            const lowerCaseSearch = searchTerm().toLowerCase();
            filtered = filtered.filter(appt => {
                const pasienName = getPasienName(appt.pasien_id).toLowerCase();
                const dokterName = getDokterName(appt.dokter_id).toLowerCase();
                const treatmentNames = getTreatmentNames(appt.treatment_ids).toLowerCase();
                return pasienName.includes(lowerCaseSearch) ||
                       dokterName.includes(lowerCaseSearch) ||
                       treatmentNames.includes(lowerCaseSearch);
            });
        }

        return filtered.sort((a, b) => {
            const dateA = dayjs(a.tanggal);
            const dateB = dayjs(b.tanggal);
            return dateA.diff(dateB);
        });
    });

    const updateAppointmentStatus = async (
        id: string,
        newStatus: 'booked' | 'completed' | 'cancelled' | 'rescheduled' | 'paid'
    ) => {
        try {
            const response = await api.put(`/appointments/${id}/status`, { status: newStatus });
            setAppointmentList((prev) => prev.map(app => app.id === id ? response.data : app));
            setShowStatusModal(false);
            toast.success(`Status appointment berhasil diubah ke ${getStatusConfig(newStatus).text}.`);
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Gagal mengubah status. Mohon coba lagi.');
        }
    };

    const processToPayment = async (appointment: Appointment) => {
        try {
            // Update status to paid
            await updateAppointmentStatus(appointment.id, 'paid');
            
            // Navigate to payment page with appointment data
            navigate(`/payment?appointment_id=${appointment.id}`);
            
            toast.success('Appointment berhasil diproses ke pembayaran dan data tetap tersimpan.');
        } catch (err) {
            console.error('Failed to process payment:', err);
            toast.error('Gagal memproses pembayaran. Mohon coba lagi.');
        }
    };

    const openStatusModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowStatusModal(true);
    };

    const openRescheduleModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowRescheduleModal(true);
        
        // Pre-fill current appointment data
        setRescheduleDate(dayjs(appointment.tanggal).format('YYYY-MM-DD'));
        setRescheduleTime(appointment.waktu || '');
        setRescheduleDokterId(appointment.dokter_id);
        setRescheduleNotes('');
    };

    const submitReschedule = async () => {
        if (!selectedAppointment()) return;
        
        if (!rescheduleDate() || !rescheduleTime() || !rescheduleDokterId()) {
            toast.error('Mohon lengkapi semua field yang wajib diisi.');
            return;
        }

        try {
            const rescheduleData = {
                tanggal: rescheduleDate(),
                waktu: rescheduleTime(),
                dokter_id: rescheduleDokterId(),
                status: 'rescheduled',
                notes: rescheduleNotes() || 'Appointment dijadwalkan ulang'
            };

            const response = await api.put(`/appointments/${selectedAppointment()!.id}`, rescheduleData);
            
            setAppointmentList((prev) => prev.map(app => 
                app.id === selectedAppointment()!.id ? response.data : app
            ));
            
            setShowRescheduleModal(false);
            resetRescheduleForm();
            toast.success('Appointment berhasil dijadwalkan ulang.');
            
        } catch (err) {
            console.error('Failed to reschedule appointment:', err);
            toast.error('Gagal menjadwalkan ulang appointment. Mohon coba lagi.');
        }
    };

    const resetRescheduleForm = () => {
        setRescheduleDate('');
        setRescheduleTime('');
        setRescheduleDokterId('');
        setRescheduleNotes('');
    };

    const resetFilters = () => {
        setFilterDate('');
        setFilterDokterId('all');
        setFilterStatus('all');
        setSearchTerm('');
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 font-sans">
            <Toaster position="top-right" />
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Jadwal Appointment Klinik</h1>
                <p class="text-gray-600">Lihat dan kelola semua jadwal appointment pasien.</p>
            </div>
            
            {/* Filters Section */}
            <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
                <div class="flex flex-col md:flex-row gap-4 items-end">
                    <div class="flex-1 w-full">
                        <label for="search-term" class="block text-sm font-medium text-gray-700 mb-1">Cari Pasien/Dokter/Treatment</label>
                        <div class="relative">
                            <input
                                type="text"
                                id="search-term"
                                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Cari..."
                                value={searchTerm()}
                                onInput={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <div class="w-full md:w-auto">
                        <label for="filter-date" class="block text-sm font-medium text-gray-700 mb-1">Filter Tanggal</label>
                        <input
                            type="date"
                            id="filter-date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={filterDate()}
                            onInput={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div class="w-full md:w-auto">
                        <label for="filter-dokter" class="block text-sm font-medium text-gray-700 mb-1">Filter Dokter</label>
                        <select
                            id="filter-dokter"
                            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={filterDokterId()}
                            onInput={(e) => setFilterDokterId(e.target.value)}
                        >
                            <option value="all">Semua Dokter</option>
                            <For each={dokterList()}>
                                {(dokter) => <option value={dokter.id}>{dokter.nama}</option>}
                            </For>
                        </select>
                    </div>
                    <div class="w-full md:w-auto">
                        <label for="filter-status" class="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                        <select
                            value={filterStatus()}
                            onInput={(e) => setFilterStatus(e.currentTarget.value)}
                            class="px-3 py-2 border rounded-lg"
                        >
                            <option value="all">Semua Status</option>
                            <option value="booked">Dijadwalkan</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                            <option value="rescheduled">Diubah Jadwal</option>
                            <option value="paid">Sudah Dibayar</option>
                        </select>
                    </div>
                    <button
                        onClick={resetFilters}
                        class="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
                    >
                        <Filter size={18} /> Reset Filter
                    </button>
                </div>
            </div>

            {/* Appointment Cards */}
            <Show when={!loading() && !error()} fallback={
                <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-8 text-center">
                    <Show when={loading()} fallback={<p class="text-red-500 text-lg">{error()}</p>}>
                        <p class="text-gray-500 text-lg">Memuat data...</p>
                    </Show>
                </div>
            }>
                <div class="space-y-6">
                    <Show when={filteredAppointments().length > 0} fallback={
                        <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-8 text-center">
                            <p class="text-gray-500 text-lg">Tidak ada appointment yang sesuai dengan filter yang dipilih.</p>
                        </div>
                    }>
                        <For each={filteredAppointments()}>
                            {(appointment) => {
                                const { pasien, dokter, treatments } = getAppointmentDetails(appointment);
                                const statusConfig = getStatusConfig(appointment.status);
                                return (
                                    <div class={`bg-white/80 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 border-l-4 border-l-${statusConfig.color}-500`}>
                                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                            <div class="flex-1">
                                                <h2 class="text-xl font-bold text-gray-800 mb-2">{pasien?.nama_lengkap || 'Pasien tidak ditemukan'}</h2>
                                                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <div class="flex items-center gap-1">
                                                        <Calendar size={16} />
                                                        <span>{dayjs(appointment.tanggal).format('DD MMMM YYYY')}</span>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <Clock size={16} />
                                                        <span>{appointment.waktu || 'Waktu tidak ditentukan'}</span>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <User size={16} />
                                                        <span>dr. {dokter?.nama || 'Dokter tidak ditemukan'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mt-2 md:mt-0">
                                                <span class={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgClass}`}>
                                                    {statusConfig.text}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-4 pt-4 border-t">
                                            <h3 class="font-semibold flex items-center mb-2">
                                                <Stethoscope size={18} class="mr-2" />
                                                Treatments
                                            </h3>
                                            <div class="flex flex-wrap gap-2">
                                                <For each={treatments} fallback={<span class="text-gray-500">Tidak ada treatment.</span>}>
                                                    {(treatment) => (
                                                        <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                                            {treatment.name}
                                                        </span>
                                                    )}
                                                </For>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div class="pt-4 border-t flex items-center flex-wrap gap-3">
                                            <button
                                                onClick={() => navigateToPatientDetail(appointment)}
                                                class="flex items-center px-4 py-2 text-sm bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg">
                                                <Eye size={16} class="mr-2" />
                                                Lihat Detail Pasien
                                            </button>
                                            
                                            <button
                                                onClick={() => openStatusModal(appointment)}
                                                class="flex items-center px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-colors duration-200"
                                            >
                                                <Edit size={16} class="mr-2" />
                                                Ubah Status
                                            </button>

                                            {/* Status-specific actions */}
                                            <Show when={appointment.status === 'booked'}>
                                                <button
                                                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                                    class="flex items-center px-4 py-2 text-sm bg-green-500 text-white hover:bg-green-600 rounded-xl transition-colors duration-200"
                                                >
                                                    <CheckCircle size={16} class="mr-2" />
                                                    Tandai Selesai
                                                </button>
                                                <button
                                                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                                    class="flex items-center px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors duration-200"
                                                >
                                                    <XCircle size={16} class="mr-2" />
                                                    Batalkan
                                                </button>
                                                <button
                                                    onClick={() => openRescheduleModal(appointment)}
                                                    class="flex items-center px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-colors duration-200"
                                                >
                                                    <RotateCcw size={16} class="mr-2" />
                                                    Reschedule
                                                </button>
                                            </Show>

                                            <Show when={appointment.status === 'completed'}>
                                                <button 
                                                    onClick={() => processToPayment(appointment)}
                                                    class="flex items-center px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-colors duration-200"
                                                >
                                                    <DollarSign size={16} class="mr-2" />
                                                    Proses ke Pembayaran
                                                </button>
                                            </Show>

                                            <Show when={appointment.status === 'cancelled' || appointment.status === 'rescheduled'}>
                                                <button
                                                    onClick={() => openRescheduleModal(appointment)}
                                                    class="flex items-center px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-colors duration-200"
                                                >
                                                    <RotateCcw size={16} class="mr-2" />
                                                    Reschedule Ulang
                                                </button>
                                            </Show>

                                            <Show when={appointment.status === 'paid'}>
                                                <span class="flex items-center px-4 py-2 text-sm bg-green-100 text-green-800 rounded-xl">
                                                    <CheckCircle size={16} class="mr-2" />
                                                    Appointment Selesai & Terbayar
                                                </span>
                                            </Show>
                                        </div>
                                    </div>
                                );
                            }}
                        </For>
                    </Show>
                </div>
            </Show>

            {/* Status Change Modal */}
            <Show when={showStatusModal()}>
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">Ubah Status Appointment</h3>
                            <p class="text-gray-600 mb-6">
                                Pilih status baru untuk appointment pasien: <br />
                                <span class="font-semibold">{selectedAppointment() ? getPasienName(selectedAppointment()!.pasien_id) : ''}</span>
                            </p>
                            <div class="space-y-3 mb-6">
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'booked')}
                                    class="w-full p-3 text-left rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-blue-800">Dijadwalkan</span>
                                    <p class="text-sm text-blue-600">Appointment dikonfirmasi dan dijadwalkan</p>
                                </button>
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'completed')}
                                    class="w-full p-3 text-left rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-green-800">Selesai</span>
                                    <p class="text-sm text-green-600">Appointment telah selesai dilakukan</p>
                                </button>
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'cancelled')}
                                    class="w-full p-3 text-left rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-red-800">Dibatalkan</span>
                                    <p class="text-sm text-red-600">Appointment dibatalkan</p>
                                </button>
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'paid')}
                                    class="w-full p-3 text-left rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-purple-800">Sudah Dibayar</span>
                                    <p class="text-sm text-purple-600">Appointment selesai dan sudah dibayar</p>
                                </button>
                            </div>
                            <div class="flex gap-3">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors duration-200"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>

            {/* Reschedule Modal */}
            <Show when={showRescheduleModal()}>
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">Reschedule Appointment</h3>
                            <p class="text-gray-600 mb-6">
                                Atur ulang jadwal untuk appointment pasien: <br />
                                <span class="font-semibold">{selectedAppointment() ? getPasienName(selectedAppointment()!.pasien_id) : ''}</span>
                            </p>
                            
                            <div class="space-y-4 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Baru *</label>
                                    <input
                                        type="date"
                                        value={rescheduleDate()}
                                        onInput={(e) => setRescheduleDate(e.target.value)}
                                        min={dayjs().format('YYYY-MM-DD')}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Waktu Baru *</label>
                                    <input
                                        type="time"
                                        value={rescheduleTime()}
                                        onInput={(e) => setRescheduleTime(e.target.value)}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Dokter *</label>
                                    <select
                                        value={rescheduleDokterId()}
                                        onInput={(e) => setRescheduleDokterId(e.target.value)}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Pilih Dokter</option>
                                        <For each={dokterList()}>
                                            {(dokter) => <option value={dokter.id}>{dokter.nama}</option>}
                                        </For>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                                    <textarea
                                        value={rescheduleNotes()}
                                        onInput={(e) => setRescheduleNotes(e.target.value)}
                                        placeholder="Alasan reschedule atau catatan tambahan..."
                                        rows="3"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    />
                                </div>
                            </div>
                            
                            <div class="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRescheduleModal(false);
                                        resetRescheduleForm();
                                    }}
                                    class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors duration-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={submitReschedule}
                                    class="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors duration-200"
                                >
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
};

export default AppointmentSchedulePage;