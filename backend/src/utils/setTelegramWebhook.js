import { config, validateEnv } from '../config/env.js';

validateEnv();

const setWebhook = async () => {
  const baseUrl = process.argv[2] || config.serverUrl;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'secret';

  if (!config.telegramBotToken) {
    console.error('Error: TELEGRAM_BOT_TOKEN is not configured.');
    process.exit(1);
  }

  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook/${webhookSecret}`;
  const telegramApiUrl = `https://api.telegram.org/bot${config.telegramBotToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  try {
    console.log(`Setting Telegram Webhook to: ${webhookUrl}...`);
    const res = await fetch(telegramApiUrl);
    const data = await res.json();

    if (data.ok) {
      console.log('Telegram Webhook set successfully!');
      console.log('Response:', data.description);
    } else {
      console.error('Failed to set Telegram Webhook:', data.description);
    }
  } catch (err) {
    console.error('Telegram Webhook Error:', err.message);
  }
};

setWebhook();
