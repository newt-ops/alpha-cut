export const MINI_APP_URL = 'https://t.me/alpha_cut_bot/app';

export const getTelegramWebApp = (): any => {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
};

export const initTelegramApp = (): any => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      console.warn('Failed to initialize Telegram WebApp SDK:', e);
    }
  }
  return tg;
};

export const getInitData = (): string => {
  const tg = getTelegramWebApp();
  return tg?.initData || '';
};

export const getTelegramUser = (): any => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

export const closeMiniApp = (): void => {
  const tg = getTelegramWebApp();
  if (tg?.close) {
    try {
      tg.close();
    } catch (e) {}
  }
};

export const openTelegramLink = (url: string): void => {
  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink) {
    try {
      tg.openTelegramLink(url);
      return;
    } catch (e) {}
  }
  if (tg?.openLink) {
    try {
      tg.openLink(url);
      return;
    } catch (e) {}
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred(style);
    } catch (e) {}
  }
};

export const triggerHapticNotification = (type: 'error' | 'success' | 'warning' = 'success'): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.notificationOccurred(type);
    } catch (e) {}
  }
};

export const triggerHapticSelection = (): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.selectionChanged();
    } catch (e) {}
  }
};

export interface MainButtonParams {
  text: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
}

export const showTelegramMainButton = ({ text, color = '#D9B27C', textColor = '#000000', onClick }: MainButtonParams): void => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    try {
      tg.MainButton.setText(text);
      tg.MainButton.setParams({ color, text_color: textColor });
      tg.MainButton.show();
      if (onClick) {
        tg.MainButton.offClick(onClick);
        tg.MainButton.onClick(onClick);
      }
    } catch (e) {}
  }
};

export const hideTelegramMainButton = (): void => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    try {
      tg.MainButton.hide();
    } catch (e) {}
  }
};

export const showTelegramBackButton = (onClick?: () => void): void => {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    try {
      tg.BackButton.show();
      if (onClick) {
        tg.BackButton.offClick(onClick);
        tg.BackButton.onClick(onClick);
      }
    } catch (e) {}
  }
};

export const hideTelegramBackButton = (): void => {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    try {
      tg.BackButton.hide();
    } catch (e) {}
  }
};

export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg?.showConfirm) {
      tg.showConfirm(message, (confirmed: boolean) => resolve(confirmed));
    } else {
      resolve(window.confirm(message));
    }
  });
};

export const showTelegramAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg?.showAlert) {
      tg.showAlert(message, () => resolve());
    } else {
      window.alert(message);
      resolve();
    }
  });
};
