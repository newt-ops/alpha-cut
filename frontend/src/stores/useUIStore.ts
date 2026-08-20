import { create } from 'zustand';
import { Currency } from '../types';

interface UIState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isAdminSidebarCollapsed: boolean;
  toggleAdminSidebar: () => void;
  setAdminSidebarCollapsed: (collapsed: boolean) => void;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currency: 'ETB',
  setCurrency: (currency) => set({ currency }),
  isAdminSidebarCollapsed: false,
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
  setAdminSidebarCollapsed: (collapsed) => set({ isAdminSidebarCollapsed: collapsed }),
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
