import { createSignal } from "solid-js";
import { Pasien, Appointment, Invoice, Treatment, Produk, Dokter } from "../types/database";

// Inisialisasi dari localStorage
const initialFromLocalStorage = <T>(key: string): T[] => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

export const [produkList, setProdukList] = createSignal<Produk[]>(initialFromLocalStorage<Produk>("produkList"));
export const [treatmentList, setTreatmentList] = createSignal<Treatment[]>(initialFromLocalStorage<Treatment>("treatmentList"));
export const [invoiceList, setInvoiceList] = createSignal<Invoice[]>(initialFromLocalStorage<Invoice>("invoiceList"));
export const [appointmentList, setAppointmentList] = createSignal<Appointment[]>(initialFromLocalStorage<Appointment>("appointmentList"));
export const [pasienList, setPasienList] = createSignal<Pasien[]>(initialFromLocalStorage<Pasien>("pasienList"));
export const [dokterList, setDokterList] = createSignal<Dokter[]>(initialFromLocalStorage<Dokter>("dokterList"));
export const [activeInvoice, setActiveInvoice] = createSignal<Invoice | null>(null);