import { create } from 'zustand';
import { UserReport } from '../types/admin';

interface AdminStore {
  submitReport: (report: UserReport) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  submitReport: (report) => {
    console.log('Submitting report (AdminStore):', report);
    // In a real application, this would send the report to a backend/Supabase
  },
}));
