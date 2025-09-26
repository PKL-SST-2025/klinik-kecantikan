interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

interface PatientData {
    nama_lengkap: string;
    no_telepon: string;
    email: string;
    tanggal_lahir: string;
}

interface AppointmentData {
    tanggal_appointment: string;
    waktu_appointment: string;
    selectedDokterId: string | null;
    selectedTreatmentIds: string[];
}

export const validatePatientData = (data: PatientData): ValidationResult => {
    const errors: string[] = [];

    if (!data.nama_lengkap.trim()) {
        errors.push('Nama lengkap harus diisi.');
    }

    if (!data.no_telepon.trim()) {
        errors.push('Nomor telepon harus diisi.');
    } else if (!/^\d+$/.test(data.no_telepon.trim())) {
        errors.push('Nomor telepon harus berupa angka.');
    }

    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.push('Format email tidak valid.');
    }

    if (!data.tanggal_lahir) {
        errors.push('Tanggal lahir harus diisi.');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
};

export const validateAppointmentData = (data: AppointmentData): ValidationResult => {
    const errors: string[] = [];

    if (!data.tanggal_appointment) {
        errors.push('Tanggal appointment harus diisi.');
    }

    if (!data.waktu_appointment) {
        errors.push('Waktu appointment harus diisi.');
    }

    if (!data.selectedDokterId) {
        errors.push('Dokter harus dipilih.');
    }

    if (data.selectedTreatmentIds.length === 0) {
        errors.push('Treatment harus dipilih.');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
};

export const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
};

export const cleanPhoneNumber = (phoneNumber: string): string => {
    return ('' + phoneNumber).replace(/\D/g, '');
};