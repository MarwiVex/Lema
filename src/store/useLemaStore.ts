import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ConfirmAction {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void | Promise<void>;
}

interface LemaState {
  activeFolderId: string | null;
  activeTab: 'folders' | 'graph';
  folderSearch: string;
  confirmAction: ConfirmAction | null;
  showLatexModal: boolean;
  isMobileSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';

  // Actions
  setActiveFolderId: (id: string | null) => void;
  setActiveTab: (tab: 'folders' | 'graph') => void;
  setFolderSearch: (search: string) => void;
  setConfirmAction: (action: ConfirmAction | null) => void;
  setShowLatexModal: (show: boolean) => void;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setResolvedTheme: (resolved: 'light' | 'dark') => void;
}

export const useLemaStore = create<LemaState>((set) => ({
  activeFolderId: null,
  activeTab: 'folders',
  folderSearch: '',
  confirmAction: null,
  showLatexModal: false,
  isMobileSidebarOpen: false,
  isCommandPaletteOpen: false,
  theme: 'dark',
  resolvedTheme: 'dark',

  setActiveFolderId: (id) => set({ activeFolderId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFolderSearch: (search) => set({ folderSearch: search }),
  setConfirmAction: (action) => set({ confirmAction: action }),
  setShowLatexModal: (show) => set({ showLatexModal: show }),
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
}));
