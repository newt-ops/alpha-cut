import crypto from 'crypto';
import { Project } from '../models/Project.js';
import { Contract } from '../models/Contract.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Payment } from '../models/Payment.js';
import { config } from '../config/env.js';
import * as chapaService from '../services/chapa.service.js';
import { sendTelegramNotification } from '../services/telegram.service.js';
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
    let title = 'Alpha Cut Video Handoff';

    if (itemType === 'contract') {
      const contract = await Contract.findOne({ _id: itemId, clientId: req.user._id });
      if (!contract) return res.status(404).json({ success: false, message: 'Retainer contract not found.' });
      amount = contract.monthlyPrice;
      currency = contract.currency || 'ETB';
      title = `${contract.packageTier?.toUpperCase()} Retainer Payment (${contract.frequency})`;
    } else {
      const project = await Project.findOne({ _id: itemId, clientId: req.user._id });
      if (!project) return res.status(404).json({ success: false, message: 'Project proposal not found.' });
      amount = project.price;
      currency = project.currency || 'ETB';
      title = `${project.editingStyle} Video Proposal Payment`;
    }

    const txRef = `AC-PAY-${itemType}-${itemId}-${Date.now()}`;
    const returnUrl = `${config.clientUrl}/dashboard?payment=success&tx_ref=${txRef}&itemType=${itemType}&itemId=${itemId}`;
    const callbackUrl = `${config.serverUrl}/api/payments/webhook`;

    // Create Payment Record (Pending)
    await Payment.create({
      subjectType: itemType === 'contract' ? 'contract' : 'project',
      subjectId: itemId,
      clientId: req.user._id,
      amount,
      currency,
      txRef,
      status: 'pending',
    });

    const nameParts = (req.user.name || 'Client Partner').split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'Partner';

    const result = await chapaService.initializePayment({
      amount,
      currency,
      email: req.user.email,
      firstName,
      lastName,
      txRef,
      title,
      description: `Payment for ${title}`,
      returnUrl,
      callbackUrl,
    });

    res.status(200).json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      txRef: result.txRef,
    });
  } catch (err) {
    next(err);
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
      itemType = parts[2];
      itemId = parts[3];
    }
  }

  // Idempotency Check #1: If payment is already marked success, do nothing further!
  if (payment && payment.status === 'success') {
    return { itemType, itemId, alreadyConfirmed: true };
  }

  // Update Payment Record to success
  if (payment) {
    payment.status = 'success';
    payment.verifiedAt = new Date();
    payment.chapaReference = chapaPayload.reference || chapaPayload.chapa_reference || chapaPayload.tx_ref || null;
    await payment.save();
  }

  // Idempotency Check #2 & Proposal/Contract Lifecycle Activation
  if (itemType === 'contract' && itemId) {
    const contract = await Contract.findById(itemId);
    if (contract) {
      contract.paymentStatus = 'paid';
      contract.paidAt = new Date();
      await contract.save();

      if (contract.status === 'proposed') {
        try {
          await acceptContract(contract._id, contract.clientId);
        } catch (err) {
          console.warn('Contract already activated or transition skipped:', err.message);
        }
      }
    }
  } else if (itemId) {
    const project = await Project.findById(itemId);
    if (project) {
      project.paid = true;
      project.paidAt = new Date();
      await project.save();

      if (project.status === 'proposal_sent') {
        try {
          await acceptProposal(project._id, project.clientId);
        } catch (err) {
          console.warn('Proposal already accepted or transition skipped:', err.message);
        }
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
