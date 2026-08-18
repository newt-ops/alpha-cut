import { config } from '../config/env.js';

const CHAPA_API_URL = 'https://api.chapa.co/v1';

export const initializePayment = async ({
  amount,
  currency = 'ETB',
  email,
  firstName = 'Client',
  lastName = 'Partner',
  txRef,
  title = 'Alpha Cut Editing Payment',
  description = 'Video Editing Proposal Payment',
  returnUrl,
  callbackUrl,
}) => {
  const secretKey = config.chapaSecretKey;

  if (!secretKey) {
    throw new Error('Chapa secret key is not configured. Please set CHAPA_SECRET_KEY in server environment.');
  }

  const response = await fetch(`${CHAPA_API_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: currency.toUpperCase(),
      email: email || 'client@alphacut.com',
      first_name: firstName || 'Client',
      last_name: lastName || 'Partner',
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title,
        description,
      },
    }),
  });

  const data = await response.json();

  if (data.status === 'success' && data.data?.checkout_url) {
    return {
      success: true,
      checkoutUrl: data.data.checkout_url,
      txRef,
    };
  } else {
    throw new Error(data.message || 'Chapa transaction initialization failed.');
  }
};

export const verifyPayment = async (txRef) => {
  const secretKey = config.chapaSecretKey;

  if (!secretKey) {
    throw new Error('Chapa secret key is not configured.');
  }

  const response = await fetch(`${CHAPA_API_URL}/transaction/verify/${txRef}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
    },
  });

  const data = await response.json();

  if (data.status === 'success') {
    return {
      success: true,
      status: 'paid',
      txRef,
      chapaData: data.data,
    };
  }

  return {
    success: false,
    message: data.message || 'Payment verification failed at Chapa API.',
  };
};
