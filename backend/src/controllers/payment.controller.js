import { Project } from '../models/Project.js';
import { Contract } from '../models/Contract.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { config } from '../config/env.js';
import * as chapaService from '../services/chapa.service.js';
import { sendTelegramNotification } from '../services/telegram.service.js';

let isTestModeActive = config.enableChapaTestMode;

// Check Chapa Payment Status & Feature Flag
export const getChapaStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    enabled: isTestModeActive,
    mode: 'test',
  });
};

// Admin Toggle Chapa Test Mode On/Off
export const toggleChapaTestMode = async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled === 'boolean') {
    isTestModeActive = enabled;
  } else {
    isTestModeActive = !isTestModeActive;
  }

  res.status(200).json({
    success: true,
    enabled: isTestModeActive,
    message: `Chapa payment test mode has been ${isTestModeActive ? 'ENABLED' : 'DISABLED'}.`,
  });
};

// Client: Initialize Chapa Payment (for Project or Contract)
export const initializeChapaPayment = async (req, res, next) => {
  try {
    if (!isTestModeActive) {
      return res.status(403).json({ success: false, message: 'Chapa payment test mode is currently disabled.' });
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
    const callbackUrl = `${config.serverUrl}/api/payments/chapa/webhook`;

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
      isMock: result.isMock,
    });
  } catch (err) {
    next(err);
  }
};

// Client / Webhook: Verify Chapa Payment
export const verifyChapaPayment = async (req, res, next) => {
  try {
    const { txRef } = req.params;
    const { itemType, itemId } = req.query;

    const verification = await chapaService.verifyPayment(txRef);
    if (!verification.success) {
      return res.status(400).json({ success: false, message: 'Chapa payment verification failed.' });
    }

    // Mark paid status on Project or Contract
    if (itemType === 'contract' && itemId) {
      const contract = await Contract.findById(itemId);
      if (contract) {
        contract.paymentStatus = 'paid';
        contract.paidAt = new Date();
        await contract.save();
      }
    } else if (itemId) {
      const project = await Project.findById(itemId);
      if (project) {
        project.paid = true;
        project.paidAt = new Date();
        await project.save();
      }
    }

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: 'payment_received',
        message: `💳 [CHAPA TEST MODE] Payment verified for ${itemType || 'item'} #${itemId || txRef}.`,
      });

      const tgMessage = `💳 <b>CHAPA PAYMENT RECEIVED (TEST MODE)</b>\nRef: <code>${txRef}</code>\nItem: ${itemType || 'Project'} #${itemId || ''}`;
      await sendTelegramNotification(admin.telegramChatId, tgMessage);
    }

    res.status(200).json({
      success: true,
      status: 'paid',
      txRef,
      verification,
    });
  } catch (err) {
    next(err);
  }
};
