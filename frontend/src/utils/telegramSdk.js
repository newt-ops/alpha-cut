/**
 * Helper wrappers for Telegram WebApp SDK
 */

export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp || null;
};

export const initTelegramApp = () => {
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

export const triggerHaptic = (style = 'light') => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred(style);
    } catch (e) {}
  }
};

export const triggerHapticNotification = (type = 'success') => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.notificationOccurred(type);
    } catch (e) {}
  }
};

export const triggerHapticSelection = () => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.selectionChanged();
    } catch (e) {}
  }
};

export const showTelegramMainButton = ({ text, color = '#D9B27C', textColor = '#000000', onClick }) => {
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

export const hideTelegramMainButton = () => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    try {
      tg.MainButton.hide();
    } catch (e) {}
  }
};

export const showTelegramBackButton = (onClick) => {
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

export const hideTelegramBackButton = () => {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    try {
      tg.BackButton.hide();
    } catch (e) {}
  }
};

export const showTelegramConfirm = (message) => {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg?.showConfirm) {
      tg.showConfirm(message, (confirmed) => resolve(confirmed));
    } else {
      resolve(window.confirm(message));
    }
  });
};

export const showTelegramAlert = (message) => {
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
