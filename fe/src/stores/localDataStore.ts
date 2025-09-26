// src/stores/localDataStore.ts
import { createSignal } from "solid-js";
import { Pasien, Appointment, Invoice, TreatmentFromBackend, ProdukFromBackend, Dokter } from "../types/database";

// Inisialisasi dari localStorage
const initialFromLocalStorage = <T>(key: string): T[] => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
};

const updateLocalStorage = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const [produkList, setProdukList] = createSignal<ProdukFromBackend[]>(initialFromLocalStorage<ProdukFromBackend>("produkList"));
export const [treatmentList, setTreatmentList] = createSignal<TreatmentFromBackend[]>(initialFromLocalStorage<TreatmentFromBackend>("treatmentList"));
export const [invoiceList, setInvoiceList] = createSignal<Invoice[]>(initialFromLocalStorage<Invoice>("invoiceList"));
export const [appointmentList, setAppointmentList] = createSignal<Appointment[]>(initialFromLocalStorage<Appointment>("appointmentList"));
export const [pasienList, setPasienList] = createSignal<Pasien[]>(initialFromLocalStorage<Pasien>("pasienList"));
export const [dokterList, setDokterList] = createSignal<Dokter[]>(initialFromLocalStorage<Dokter>("dokterList"));
export const [activeInvoice, setActiveInvoice] = createSignal<Invoice | null>(null);

// Override set functions to update localStorage
const setProdukListWithStorage = (data: ProdukFromBackend[]) => {
    setProdukList(data);
    updateLocalStorage("produkList", data);
};

const setTreatmentListWithStorage = (data: TreatmentFromBackend[]) => {
    setTreatmentList(data);
    updateLocalStorage("treatmentList", data);
};

const setInvoiceListWithStorage = (data: Invoice[]) => {
    setInvoiceList(data);
    updateLocalStorage("invoiceList", data);
};

const setAppointmentListWithStorage = (data: Appointment[]) => {
    setAppointmentList(data);
    updateLocalStorage("appointmentList", data);
};

const setPasienListWithStorage = (data: Pasien[]) => {
    setPasienList(data);
    updateLocalStorage("pasienList", data);
};

const setDokterListWithStorage = (data: Dokter[]) => {
    setDokterList(data);
    updateLocalStorage("dokterList", data);
};

export const useBackendData = () => {
    return {
        produkList,
        setProdukList: setProdukListWithStorage,
        treatmentList,
        setTreatmentList: setTreatmentListWithStorage,
        invoiceList,
        setInvoiceList: setInvoiceListWithStorage,
        appointmentList,
        setAppointmentList: setAppointmentListWithStorage,
        pasienList,
        setPasienList: setPasienListWithStorage,
        dokterList,
        setDokterList: setDokterListWithStorage,
        activeInvoice,
        setActiveInvoice
    };
};