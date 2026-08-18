import crypto from 'crypto';
import { Project } from '../models/Project.js';
import { Contract } from '../models/Contract.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Payment } from '../models/Payment.js';
import { config } from '../config/env.js';
import * as chapaService from '../services/chapa.service.js';
import { sendTelegramNotification, sendPaymentReceiptNotificationTelegram } from '../services/telegram.service.js';
import { acceptProposal, acceptContract } from '../services/lifecycle.service.js';

let isTestModeActive = config.chapaEnabled;

// Public Feature Flags Endpoint
export const getFeatureFlags = async (req, res) => {
  res.status(200).json({
    success: true,
    chapaEnabled: isTestModeActive,
  });
};

// Check Chapa Payment Status & Feature Flag
export const getChapaStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    enabled: isTestModeActive,
    hasSecretKey: !!config.chapaSecretKey,
    mode: 'test',
  });
};

// Admin Toggle Chapa Test Mode On/Off & Set Key
export const toggleChapaTestMode = async (req, res) => {
  const { enabled, secretKey } = req.body;
  if (typeof enabled === 'boolean') {
    isTestModeActive = enabled;
  } else {
    isTestModeActive = !isTestModeActive;
  }

  if (secretKey && secretKey.trim().length > 0) {
    config.chapaSecretKey = secretKey.trim();
  }

  res.status(200).json({
    success: true,
    enabled: isTestModeActive,
    chapaEnabled: isTestModeActive,
    hasSecretKey: !!config.chapaSecretKey,
    message: `Chapa payment feature has been ${isTestModeActive ? 'ENABLED' : 'DISABLED'}.`,
  });
};

// Client: Initialize Chapa Payment (Server-derived amount & currency from Project/Contract document)
export const initializeChapaPayment = async (req, res, next) => {
  try {
    if (!isTestModeActive) {
      return res.status(403).json({ success: false, message: 'Chapa payments are currently disabled.' });
    }

    const { itemType, itemId } = req.body;
    let amount = 0;
    let currency = 'ETB';

    let project = null;
    let contract = null;

    if (itemType === 'contract') {
      if (req.user.role === 'admin') {
        contract = await Contract.findById(itemId);
      } else {
        contract = await Contract.findOne({ _id: itemId, clientId: req.user._id });
      }
      if (!contract) return res.status(404).json({ success: false, message: 'Retainer contract not found.' });
      amount = Number(contract.monthlyPrice) || 0;
      currency = contract.currency || 'ETB';
    } else {
      if (req.user.role === 'admin') {
        project = await Project.findById(itemId);
      } else {
        project = await Project.findOne({ _id: itemId, clientId: req.user._id });
      }
      if (!project) return res.status(404).json({ success: false, message: 'Project proposal not found.' });
      amount = Number(project.price) || 0;
      currency = project.currency || 'ETB';
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Agreed price must be greater than 0 to initialize Chapa payment.' });
    }

    // Strict Chapa API limits: tx_ref max 50 chars, title max 16 chars, description max 50 chars (alphanumeric, spaces, hyphens, dots only)
    const shortType = itemType === 'contract' ? 'cont' : 'proj';
    const shortTime = Date.now().toString().slice(-6);
    const txRef = `AC-PAY-${shortType}-${itemId}-${shortTime}`; // 39 characters max
    const title = 'Alpha Cut'; // 9 characters max (Chapa limit is 16)
    const description = 'Video Handoff Payment'; // 21 characters max (alphanumeric & spaces only)

    const returnUrl = `${config.clientUrl}/dashboard?payment=success&tx_ref=${txRef}&itemType=${itemType}&itemId=${itemId}`;
    const callbackUrl = `${config.serverUrl}/api/payments/webhook`;

    // Create Payment Record (Pending)
    const targetClientId = project?.clientId || contract?.clientId || req.user._id;
    await Payment.create({
      subjectType: itemType === 'contract' ? 'contract' : 'project',
      subjectId: itemId,
      clientId: targetClientId,
      amount,
      currency,
      txRef,
      status: 'pending',
    });

    const payerName = req.user.name || project?.clientName || contract?.clientName || 'Client Partner';
    const payerEmail = req.user.email || project?.clientEmail || contract?.clientEmail || 'client@alphacut.com';

    const nameParts = payerName.split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'Partner';

    const result = await chapaService.initializePayment({
      amount,
      currency,
      email: payerEmail,
      firstName,
      lastName,
      txRef,
      title,
      description,
      returnUrl,
      callbackUrl,
    });

    res.status(200).json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      txRef: result.txRef,
    });
  } catch (err) {
    console.error('initializeChapaPayment controller error:', err.message);
    res.status(400).json({ success: false, message: err.message || 'Payment initialization failed.' });
  }
};

// Shared Idempotent Payment Confirmation Function
export const confirmProjectPayment = async (txRef, chapaPayload = {}) => {
  let payment = await Payment.findOne({ txRef });
  let itemType = payment?.subjectType;
  let itemId = payment?.subjectId;

  if (!itemType || !itemId) {
    const parts = txRef.split('-');
    if (parts.length >= 4 && parts[0] === 'AC' && parts[1] === 'PAY') {
      itemType = parts[2] === 'cont' ? 'contract' : 'project';
      itemId = parts[3];
    }
  }

  // Idempotency Check #1: If payment is already marked success, ensure status transition and return
  if (payment && payment.status === 'success') {
    if (itemType === 'contract' && itemId) {
      const contract = await Contract.findById(itemId);
      if (contract && contract.status === 'proposed') {
        contract.status = 'active';
        contract.acceptedAt = new Date();
        contract.paymentStatus = 'paid';
        contract.paidAt = new Date();
        await contract.save();
      }
    } else if (itemId) {
      const project = await Project.findById(itemId);
      if (project && project.status === 'proposal_sent') {
        project.status = 'in_progress';
        project.acceptedAt = new Date();
        project.paid = true;
        project.paidAt = new Date();
        await project.save();
      }
    }
    return { itemType, itemId, alreadyConfirmed: true };
  }

  // Update Payment Record to success
  if (payment) {
    payment.status = 'success';
    payment.verifiedAt = new Date();
    payment.chapaReference = chapaPayload.reference || chapaPayload.chapa_reference || chapaPayload.tx_ref || null;
    await payment.save();

    // Trigger Telegram Payment Receipt Notification
    try {
      const clientUser = await User.findById(payment.clientId);
      await sendPaymentReceiptNotificationTelegram({
        clientChatId: clientUser?.telegramChatId,
        clientName: clientUser?.name || 'Client Partner',
        amount: payment.amount,
        currency: payment.currency,
        txRef: payment.txRef,
        title: itemType === 'contract' ? 'Retainer Contract Payment' : 'Project Proposal Payment',
      });
    } catch (err) {
      console.error('Failed to send payment receipt notification:', err.message);
    }
  }

  // Process subject acceptance & status transition
  if (itemType === 'contract' && itemId) {
    const contract = await Contract.findById(itemId);
    if (contract) {
      contract.paymentStatus = 'paid';
      contract.paidAt = new Date();
      if (contract.status === 'proposed') {
        contract.status = 'active';
        contract.acceptedAt = new Date();
      }
      await contract.save();

      try {
        await acceptContract(contract._id, contract.clientId);
      } catch (err) {
        console.warn('Contract notification error:', err.message);
      }
    }
  } else if (itemId) {
    const project = await Project.findById(itemId);
    if (project) {
      project.paid = true;
      project.paidAt = new Date();
      if (project.status === 'proposal_sent') {
        project.status = 'in_progress';
        project.acceptedAt = new Date();
      }
      await project.save();

      try {
        await acceptProposal(project._id, project.clientId);
      } catch (err) {
        console.warn('Proposal notification error:', err.message);
      }
    }
  }

  // Send Admin Notifications
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'payment_received',
      message: `💳 Payment confirmed via Chapa for ${itemType || 'item'} #${itemId || txRef}.`,
    });

    const tgMessage = `💳 <b>CHAPA PAYMENT CONFIRMED</b>\nRef: <code>${txRef}</code>\nSubject: ${itemType || 'Project'} #${itemId || ''}`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return { itemType, itemId, alreadyConfirmed: false };
};

// Client Server-Side Direct Verification Endpoint (Calls Chapa API & confirms payment)
export const verifyChapaPayment = async (req, res, next) => {
  try {
    const { txRef } = req.params;

    const verification = await chapaService.verifyPayment(txRef);
    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message || 'Chapa payment verification failed.' });
    }

    const { itemType, itemId, alreadyConfirmed } = await confirmProjectPayment(txRef, verification.chapaData);

    res.status(200).json({
      success: true,
      status: 'paid',
      txRef,
      itemType,
      itemId,
      alreadyConfirmed,
      verification,
    });
  } catch (err) {
    next(err);
  }
};

// Public Chapa Webhook Handler (Verified with HMAC-SHA256 timing-safe comparison)
export const handleChapaWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['chapa-signature'] || req.headers['x-chapa-signature'];
    const webhookSecret = config.chapaWebhookSecret;

    // Verify HMAC-SHA256 Signature using timingSafeEqual
    if (webhookSecret && signature) {
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        console.warn('Chapa Webhook: Invalid Signature');
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const txRef = req.body?.tx_ref || req.body?.trx_ref;
    if (!txRef) {
      return res.status(400).json({ success: false, message: 'Missing transaction reference' });
    }

    await confirmProjectPayment(txRef, req.body);
    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    next(err);
  }
};
