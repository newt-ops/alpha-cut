import { Project } from '../models/Project.js';
import { Rating } from '../models/Rating.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { bot, updateTelegramStatusCard } from './telegram.service.js';
import { sendVerificationEmail } from './email.service.js';
import { Resend } from 'resend';
import { config } from '../config/env.js';

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

// Helper to send Telegram message
const sendTelegramNotification = async (telegramChatId, messageText) => {
  if (!bot || !telegramChatId) return;
  try {
    await bot.telegram.sendMessage(telegramChatId, messageText, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('Telegram notification error:', err.message);
  }
};

// Helper to send Resend email notification
const sendTransactionalEmail = async ({ toEmail, subject, htmlContent }) => {
  if (!resend) {
    console.log(`[DEV MODE TRANSACTIONAL EMAIL] To: ${toEmail} | Subject: ${subject}`);
    return;
  }
  try {
    const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Alpha Cut <onboarding@resend.dev>';
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject,
      html: htmlContent,
    });
  } catch (err) {
    console.error('Transactional Email Error:', err.message);
  }
};

export const createProposal = async (adminId, data) => {
  const { clientEmail, editingStyle, contentLength, packageTier, currency, price, referenceBrief, briefAttachmentUrl, deadline, notes } = data;

  const client = await User.findOne({ email: clientEmail.toLowerCase() });
  if (!client) {
    throw new Error(`Client email ${clientEmail} is not registered in the system.`);
  }

  const project = await Project.create({
    clientId: client._id,
    createdByAdminId: adminId,
    status: 'proposal_sent',
    clientName: client.name,
    clientEmail: client.email,
    editingStyle,
    contentLength,
    packageTier,
    currency,
    price,
    referenceBrief: referenceBrief || '',
    briefAttachmentUrl: briefAttachmentUrl || null,
    deadline: new Date(deadline),
    notes: notes || '',
    proposalSentAt: new Date(),
  });

  // 1. In-App Notification for Client
  await Notification.create({
    userId: client._id,
    type: 'proposal_sent',
    message: `New video project proposal received: ${editingStyle} (${price} ${currency}).`,
    projectId: project._id,
  });

  // 2. Telegram Live Status Card for Client
  if (client.telegramChatId) {
    await updateTelegramStatusCard(project, client.telegramChatId);
  }

  // 3. Email Notification for Client
  const emailHtml = `
    <div style="font-family: sans-serif; padding: 24px; background: #FBEFE1; color: #451D13; border-radius: 16px;">
      <h2 style="font-family: serif; color: #451D13;">New Project Proposal Received</h2>
      <p>Hello ${client.name},</p>
      <p>Alpha Cut has prepared a new project proposal for you:</p>
      <ul>
        <li><strong>Style:</strong> ${editingStyle}</li>
        <li><strong>Package Tier:</strong> ${packageTier.toUpperCase()} (${contentLength.toUpperCase()})</li>
        <li><strong>Price:</strong> ${price} ${currency}</li>
        <li><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</li>
      </ul>
      <p>Please log into your client dashboard to accept or decline the proposal.</p>
    </div>
  `;
  await sendTransactionalEmail({
    toEmail: client.email,
    subject: `Alpha Cut — New Proposal: ${editingStyle}`,
    htmlContent: emailHtml,
  });

  return project;
};

export const acceptProposal = async (projectId, clientId) => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'proposal_sent') throw new Error(`Cannot accept proposal in status: ${project.status}`);

  project.status = 'in_progress';
  project.acceptedAt = new Date();
  await project.save();

  const client = await User.findById(clientId);
  if (client?.telegramChatId) {
    await updateTelegramStatusCard(project, client.telegramChatId);
  }

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'proposal_accepted',
      message: `Client ${project.clientName} accepted proposal for ${project.editingStyle}.`,
      projectId: project._id,
    });

    const tgMessage = `<b>PROPOSAL ACCEPTED BY CLIENT</b>\n\n` +
      `Client: <b>${project.clientName}</b>\n` +
      `Style: <b>${project.editingStyle}</b>\n` +
      `Price: <b>${project.price} ${project.currency}</b>\n\n` +
      `Project status is now IN PROGRESS.`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return project;
};

export const declineProposal = async (projectId, clientId) => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'proposal_sent') throw new Error(`Cannot decline proposal in status: ${project.status}`);

  project.status = 'declined';
  project.declinedAt = new Date();
  await project.save();

  const client = await User.findById(clientId);
  if (client?.telegramChatId) {
    await updateTelegramStatusCard(project, client.telegramChatId);
  }

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'proposal_declined',
      message: `Client ${project.clientName} declined proposal for ${project.editingStyle}.`,
      projectId: project._id,
    });

    const tgMessage = `<b>PROPOSAL DECLINED BY CLIENT</b>\n\n` +
      `Client: <b>${project.clientName}</b>\n` +
      `Style: <b>${project.editingStyle}</b>`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return project;
};

export const markDelivered = async (projectId, adminId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found.');
  if (project.status !== 'in_progress') throw new Error(`Cannot mark delivered for project in status: ${project.status}`);

  project.status = 'delivered';
  project.deliveredAt = new Date();
  await project.save();

  // Notify Client
  const client = await User.findById(project.clientId);
  if (client) {
    await Notification.create({
      userId: client._id,
      type: 'work_delivered',
      message: `Your project ${project.editingStyle} has been marked as delivered!`,
      projectId: project._id,
    });

    if (client.telegramChatId) {
      await updateTelegramStatusCard(project, client.telegramChatId);
    }

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 24px; background: #FBEFE1; color: #451D13; border-radius: 16px;">
        <h2 style="font-family: serif; color: #451D13;">Project Status: Delivered</h2>
        <p>Hello ${client.name},</p>
        <p>Alpha Cut has completed and delivered your video edit for <strong>${project.editingStyle}</strong>.</p>
        <p>Please log into your dashboard to approve delivery and share your review.</p>
      </div>
    `;
    await sendTransactionalEmail({
      toEmail: client.email,
      subject: `Alpha Cut — Project Delivered: ${project.editingStyle}`,
      htmlContent: emailHtml,
    });
  }

  return project;
};

export const approveDelivery = async (projectId, clientId) => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'delivered') throw new Error(`Cannot approve delivery in status: ${project.status}`);

  project.status = 'completed';
  project.completedAt = new Date();
  await project.save();

  const client = await User.findById(clientId);
  if (client?.telegramChatId) {
    await updateTelegramStatusCard(project, client.telegramChatId);
  }

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'delivery_approved',
      message: `Client ${project.clientName} approved delivery for ${project.editingStyle}. Rating unlocked!`,
      projectId: project._id,
    });

    const tgMessage = `<b>DELIVERY APPROVED BY CLIENT</b>\n\n` +
      `Client: <b>${project.clientName}</b>\n` +
      `Style: <b>${project.editingStyle}</b>\n\n` +
      `Project is COMPLETED. Revenue is booked into agency totals.`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return project;
};

export const submitRating = async (projectId, clientId, stars, review) => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'completed') throw new Error('Rating is only allowed for completed projects.');
  if (project.rated) throw new Error('Project has already been rated.');

  const client = await User.findById(clientId);

  const rating = await Rating.create({
    projectId: project._id,
    clientId: project.clientId,
    clientName: client?.name || project.clientName || 'Verified Client',
    clientTitle: 'Verified Client',
    clientAvatarUrl: client?.avatarUrl || null,
    stars,
    review,
    editingStyle: project.editingStyle,
    packageTier: project.packageTier,
  });

  project.rated = true;
  await project.save();

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'rating_submitted',
      message: `New ${stars}-star rating submitted by ${client.name} for ${project.editingStyle}.`,
      projectId: project._id,
    });

    const tgMessage = `<b>NEW RATING SUBMITTED</b>\n\n` +
      `Rating: <b>${stars} / 5 Stars</b>\n` +
      `Client: <b>${client.name}</b>\n` +
      `Style: <b>${project.editingStyle}</b>\n` +
      `Review: "${review}"`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return rating;
};
