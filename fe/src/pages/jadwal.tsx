// src/pages/jadwal.tsx
import { Component, createSignal, onMount, For, Show, createMemo } from 'solid-js';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import isBetween from 'dayjs/plugin/isBetween';
import { Calendar, User, Stethoscope, Tag, Clock, CheckCircle, XCircle, Filter, Search, Eye, DollarSign, RotateCcw, Edit } from 'lucide-solid';
import { useNavigate } from '@solidjs/router';
// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.locale('id');

// Import interfaces
import { Appointment, Pasien, Dokter, Treatment } from '../types/database';

const AppointmentSchedulePage: Component = () => {
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);

    const [filterDate, setFilterDate] = createSignal<string>('');
    const [filterDokterId, setFilterDokterId] = createSignal<number | 'all'>('all');
    const [filterStatus, setFilterStatus] = createSignal<string | 'all'>('all');
    const [searchTerm, setSearchTerm] = createSignal<string>('');

    const navigate = useNavigate();
    const navigateToPatientDetail = (appointment: Appointment) => {
        navigate(`/pasien?id=${appointment.pasienId}`);
    };
    // Modal state for status change
    const [showStatusModal, setShowStatusModal] = createSignal(false);
    const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);

    // --- OnMount: Load data from localStorage ---
    onMount(() => {
        const storedAppointment = localStorage.getItem('appointmentList');
        const storedPasien = localStorage.getItem('pasienList');
        const storedDokter = localStorage.getItem('dokterList');
        const storedTreatment = localStorage.getItem('treatmentList');

        if (storedAppointment) setAppointmentList(JSON.parse(storedAppointment));
        if (storedPasien) setPasienList(JSON.parse(storedPasien));
        if (storedDokter) setDokterList(JSON.parse(storedDokter));
        if (storedTreatment) setTreatmentList(JSON.parse(storedTreatment));
    });

    // --- Helper Functions ---
    const getPasienName = (id: number) => pasienList().find(p => p.id === id)?.namaLengkap || 'Pasien Tidak Ditemukan';
    const getDokterName = (id: number) => dokterList().find(d => d.id === id)?.nama || 'Dokter Tidak Ditemukan';
    const getTreatmentNames = (ids: number[]) => {
        return ids.map(id => treatmentList().find(t => t.id === id)?.nama || 'N/A').join(', ');
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'booked': return { color: 'blue', text: 'Booked', bgClass: 'bg-blue-100 text-blue-800' };
            case 'completed': return { color: 'green', text: 'Completed', bgClass: 'bg-green-100 text-green-800' };
            case 'cancelled': return { color: 'red', text: 'Cancelled', bgClass: 'bg-red-100 text-red-800' };
            case 'rescheduled': return { color: 'orange', text: 'Rescheduled', bgClass: 'bg-orange-100 text-orange-800' };
            case 'paid': return { color: 'purple', text: 'Paid', bgClass: 'bg-purple-100 text-purple-800' };
            default: return { color: 'gray', text: 'Unknown', bgClass: 'bg-gray-100 text-gray-800' };
        }
    };

    const getAppointmentDetails = (appointment: Appointment) => {
        const pasien = pasienList().find(p => p.id === appointment.pasienId);
        const dokter = dokterList().find(d => d.id === appointment.dokterId);
        const treatments = treatmentList().filter(t => appointment.treatmentIds.includes(t.id));
        return { pasien, dokter, treatments };
    };

    // --- Filtered Appointments ---
    const filteredAppointments = createMemo(() => {
        let filtered = appointmentList();

        // Filter by Date
        if (filterDate()) {
            filtered = filtered.filter(appt => appt.tanggal === filterDate());
        }

        // Filter by Dokter
        if (filterDokterId() !== 'all') {
            filtered = filtered.filter(appt => appt.dokterId === filterDokterId());
        }

        // Filter by Status
        if (filterStatus() !== 'all') {
            filtered = filtered.filter(appt => appt.status === filterStatus());
        }

        // Filter by Search Term
        if (searchTerm()) {
            const lowerCaseSearch = searchTerm().toLowerCase();
            filtered = filtered.filter(appt => {
                const pasienName = getPasienName(appt.pasienId).toLowerCase();
                const dokterName = getDokterName(appt.dokterId).toLowerCase();
                const treatmentNames = getTreatmentNames(appt.treatmentIds).toLowerCase();
                return pasienName.includes(lowerCaseSearch) ||
                       dokterName.includes(lowerCaseSearch) ||
                       treatmentNames.includes(lowerCaseSearch);
            });
        }

        // Sort by Date (earliest first)
        return filtered.sort((a, b) => {
            const dateA = dayjs(a.tanggal);
            const dateB = dayjs(b.tanggal);
            return dateA.diff(dateB);
        });
    });

    

    const updateAppointmentStatus = (
  id: number,
  newStatus: 'booked' | 'completed' | 'cancelled' | 'rescheduled' | 'paid'
) => {
  const updated = appointmentList().map(app =>
    app.id === id ? { ...app, status: newStatus } : app
  );
  setAppointmentList(updated);
  localStorage.setItem('appointmentList', JSON.stringify(updated));
  toast.success(`Status appointment berhasil diubah ke ${newStatus}.`);
};


    const openStatusModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowStatusModal(true);
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

            {/* Header Section */}
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Jadwal Appointment Klinik</h1>
                <p class="text-gray-600">Lihat dan kelola semua jadwal appointment pasien.</p>
            </div>

            {/* Filter and Search Section */}
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
                            onInput={(e) => setFilterDokterId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
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
                                            <h2 class="text-xl font-bold text-gray-800 mb-2">{pasien?.namaLengkap || 'Pasien tidak ditemukan'}</h2>
                                            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <div class="flex items-center gap-1">
                                                    <Calendar size={16} />
                                                    <span>{dayjs(appointment.tanggal).format('DD MMMM YYYY')}</span>
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
                                                        {treatment.nama}
                                                    </span>
                                                )}
                                            </For>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div class="pt-4 border-t flex items-center flex-wrap gap-3">
                                        <button
                                        onClick={() => navigateToPatientDetail(appointment)}
                                         class="flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200">
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

                                        {appointment.status === 'booked' && (
                                            <>
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
                                            </>
                                        )}

                                        {appointment.status === 'completed' && (
                                            <button class="flex items-center px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-colors duration-200">
                                                <DollarSign size={16} class="mr-2" /> 
                                                Proses ke Pembayaran
                                            </button>
                                        )}

                                        {appointment.status === 'cancelled' && (
                                            <button 
                                                onClick={() => updateAppointmentStatus(appointment.id, 'rescheduled')}
                                                class="flex items-center px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-colors duration-200"
                                            >
                                                <RotateCcw size={16} class="mr-2" /> 
                                                Reschedule
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }}
                    </For>
                </Show>
            </div>

            {/* Status Change Modal */}
            <Show when={showStatusModal()}>
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">Ubah Status Appointment</h3>
                            <p class="text-gray-600 mb-6">
                                Pilih status baru untuk appointment pasien: <br />
                                <span class="font-semibold">{selectedAppointment() ? getPasienName(selectedAppointment()!.pasienId) : ''}</span>
                            </p>
                            
                            <div class="space-y-3 mb-6">
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'booked')}
                                    class="w-full p-3 text-left rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-blue-800">Booked</span>
                                    <p class="text-sm text-blue-600">Appointment dikonfirmasi dan dijadwalkan</p>
                                </button>
                                
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'completed')}
                                    class="w-full p-3 text-left rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-green-800">Completed</span>
                                    <p class="text-sm text-green-600">Appointment telah selesai dilakukan</p>
                                </button>
                                
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'cancelled')}
                                    class="w-full p-3 text-left rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-red-800">Cancelled</span>
                                    <p class="text-sm text-red-600">Appointment dibatalkan</p>
                                </button>
                                
                                <button
                                    onClick={() => updateAppointmentStatus(selectedAppointment()!.id, 'rescheduled')}
                                    class="w-full p-3 text-left rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors duration-200"
                                >
                                    <span class="font-medium text-orange-800">Rescheduled</span>
                                    <p class="text-sm text-orange-600">Appointment dijadwalkan ulang</p>
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
        </div>
    );
};

export default AppointmentSchedulePage;