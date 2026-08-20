import { Project, IProject } from '../models/Project.js';
import { Contract, IContract } from '../models/Contract.js';
import { Deliverable, IDeliverable } from '../models/Deliverable.js';
import { Rating, IRating } from '../models/Rating.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import {
  bot,
  updateTelegramStatusCard,
  updateContractTelegramStatusCard,
  sendProposalNotificationTelegram,
  sendDeliveryNotificationTelegram,
  sendRevisionNotificationTelegram,
} from './telegram.service.js';
import { Resend } from 'resend';
import { config } from '../config/env.js';
import { Types } from 'mongoose';

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

// Helper to send Telegram message
const sendTelegramNotification = async (telegramChatId: string | null | undefined, messageText: string): Promise<void> => {
  if (!bot || !telegramChatId) return;
  try {
    await bot.telegram.sendMessage(telegramChatId, messageText, { parse_mode: 'HTML' });
  } catch (err: any) {
    console.error('Telegram notification error:', err.message);
  }
};

// Helper to send Resend email notification
const sendTransactionalEmail = async ({ toEmail, subject, htmlContent }: { toEmail: string; subject: string; htmlContent: string }): Promise<void> => {
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
  } catch (err: any) {
    console.error('Transactional Email Error:', err.message);
  }
};

// --- ONE-OFF PROJECT LIFECYCLE ---

export const createProposal = async (adminId: string | Types.ObjectId, data: any): Promise<IProject> => {
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

  // 2. Telegram Deep-Linked Proposal Card for Client
  if (client.telegramChatId) {
    await sendProposalNotificationTelegram(project, client.telegramChatId);
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

export const acceptProposal = async (projectId: string | Types.ObjectId, clientId: string | Types.ObjectId): Promise<IProject> => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'proposal_sent') throw new Error(`Cannot accept proposal in status: ${project.status}`);

  project.status = 'in_progress';
  project.acceptedAt = new Date();
  await project.save();

  const client = await User.findById(clientId);
  if (client?.telegramChatId) {
    const confirmationText = `✅ <b>Proposal Accepted!</b>\n\nProject for <b>${project.editingStyle}</b> (${project.price} ${project.currency}) is officially in progress. Deadline: ${new Date(project.deadline).toLocaleDateString()}`;
    await sendTelegramNotification(client.telegramChatId, confirmationText);
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

    const tgMessage = `✅ <b>${project.clientName}</b> accepted the proposal for <i>${project.editingStyle}</i> — ${project.packageTier?.toUpperCase()}, ${project.price} ${project.currency}. Work can start.`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return project;
};

export const declineProposal = async (projectId: string | Types.ObjectId, clientId: string | Types.ObjectId): Promise<IProject> => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'proposal_sent') throw new Error(`Cannot decline proposal in status: ${project.status}`);

  project.status = 'declined';
  project.declinedAt = new Date();
  await project.save();

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'proposal_declined',
      message: `Client ${project.clientName} declined proposal for ${project.editingStyle}.`,
      projectId: project._id,
    });

    const tgMessage = `❌ <b>${project.clientName}</b> declined the proposal for <i>${project.editingStyle}</i>.`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return project;
};

export const markDelivered = async (projectId: string | Types.ObjectId, adminId?: string | Types.ObjectId): Promise<IProject> => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found.');
  if (project.status !== 'in_progress' && project.status !== 'revision_requested' && project.status !== 'delivered') {
    throw new Error(`Cannot mark delivered for project in status: ${project.status}`);
  }

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
      await sendDeliveryNotificationTelegram(project, client.telegramChatId);
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

export const approveDelivery = async (projectId: string | Types.ObjectId, clientId: string | Types.ObjectId): Promise<IProject> => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'delivered') throw new Error(`Cannot approve delivery in status: ${project.status}`);

  project.status = 'completed';
  project.completedAt = new Date();
  await project.save();

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'delivery_approved',
      message: `Client ${project.clientName} approved delivery for ${project.editingStyle}. Rating unlocked!`,
      projectId: project._id,
    });

    const tgMessage = `🎉 <b>${project.clientName}</b> approved the delivery for <i>${project.editingStyle}</i>. Project complete!`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return project;
};

export const requestRevision = async (projectId: string | Types.ObjectId, clientId: string | Types.ObjectId, revisionNotes: string): Promise<IProject> => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'delivered') throw new Error(`Revisions can only be requested for delivered projects.`);
  if (!revisionNotes || !revisionNotes.trim()) throw new Error('Please provide specific revision notes.');

  project.status = 'revision_requested';
  project.revisionNotes = revisionNotes.trim();
  project.revisionCount = (project.revisionCount || 0) + 1;
  project.revisionRequestedAt = new Date();
  await project.save();

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'revision_requested',
      message: `Client ${project.clientName} requested revision for ${project.editingStyle}: "${revisionNotes.substring(0, 100)}..."`,
      projectId: project._id,
    });

    const tgMessage = `🔄 <b>Revision Requested</b>\nClient: <b>${project.clientName}</b>\nProject: <i>${project.editingStyle}</i>\nNotes: "${revisionNotes}"`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  await sendRevisionNotificationTelegram(project);

  return project;
};

export const submitRating = async (projectId: string | Types.ObjectId, clientId: string | Types.ObjectId, stars: number, review: string): Promise<IRating> => {
  const project = await Project.findOne({ _id: projectId, clientId });
  if (!project) throw new Error('Project not found or access denied.');
  if (project.status !== 'completed' && project.status !== 'delivered') {
    throw new Error('Rating is only allowed for delivered or completed projects.');
  }
  if (project.rated) throw new Error('Project has already been rated.');

  if (project.status === 'delivered') {
    project.status = 'completed';
    project.completedAt = new Date();
  }
  project.rated = true;
  await project.save();

  const client = await User.findById(clientId);

  const rating = await Rating.create({
    subjectType: 'project',
    subjectId: project._id,
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

  // Notify Admins
  const starEmojis = '⭐️'.repeat(stars);
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'rating_submitted',
      message: `New ${stars}-star rating submitted by ${client?.name || 'Client'} for ${project.editingStyle}.`,
      projectId: project._id,
    });

    const tgMessage = `${starEmojis} <b>${client?.name || 'Client'}</b> rated the project ${stars}/5: "${review}"`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return rating;
};

// --- RETAINER CONTRACT LIFECYCLE ENGINE ---

const getPlannedVideosFromFrequency = (frequency: string, durationMonths = 1): number => {
  let perMonth = 8;
  switch (frequency) {
    case 'weekly-1': perMonth = 4; break;
    case 'weekly-2': perMonth = 8; break;
    case 'weekly-3-4': perMonth = 14; break;
    case 'daily-1': perMonth = 30; break;
    case 'daily-2': perMonth = 60; break;
    default: perMonth = 8;
  }
  return perMonth * (durationMonths || 1);
};

export const createContractProposal = async (adminId: string | Types.ObjectId, data: any): Promise<IContract> => {
  const { clientEmail, packageTier, contentLength, frequency, currency, monthlyPrice, startDate, durationMonths, notes } = data;

  const client = await User.findOne({ email: clientEmail.toLowerCase() });
  if (!client) {
    throw new Error(`Client email ${clientEmail} is not registered in the system.`);
  }

  const totalVideosPlanned = getPlannedVideosFromFrequency(frequency, durationMonths);

  const contract = await Contract.create({
    clientId: client._id,
    createdByAdminId: adminId,
    status: 'proposed',
    packageTier,
    contentLength: contentLength || 'short',
    frequency: frequency || 'weekly-2',
    currency: currency || 'ETB',
    monthlyPrice: Number(monthlyPrice),
    startDate: new Date(startDate || Date.now()),
    durationMonths: Number(durationMonths) || 1,
    totalVideosPlanned,
    clientName: client.name,
    clientEmail: client.email,
    notes: notes || '',
    proposedAt: new Date(),
  });

  // Notify Client
  await Notification.create({
    userId: client._id,
    type: 'proposal_sent',
    message: `New Retainer Contract proposed: ${packageTier.toUpperCase()} (${frequency}) at ${monthlyPrice} ${currency}/mo.`,
  });

  if (client.telegramChatId) {
    await updateContractTelegramStatusCard(contract, client.telegramChatId, 0);
  }

  const emailHtml = `
    <div style="font-family: sans-serif; padding: 24px; background: #FBEFE1; color: #451D13; border-radius: 16px;">
      <h2 style="font-family: serif; color: #451D13;">New Retainer Contract Proposal Received</h2>
      <p>Hello ${client.name},</p>
      <p>Alpha Cut has issued a new retainer contract proposal for your account:</p>
      <ul>
        <li><strong>Package Tier:</strong> ${packageTier.toUpperCase()}</li>
        <li><strong>Frequency:</strong> ${frequency} (${totalVideosPlanned} total planned videos)</li>
        <li><strong>Monthly Price:</strong> ${monthlyPrice} ${currency}</li>
        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
      </ul>
      <p>Log into your client dashboard to review and accept the retainer contract terms.</p>
    </div>
  `;
  await sendTransactionalEmail({
    toEmail: client.email,
    subject: `Alpha Cut — Retainer Contract Proposal (${packageTier.toUpperCase()})`,
    htmlContent: emailHtml,
  });

  return contract;
};

export const acceptContract = async (contractId: string | Types.ObjectId, clientId: string | Types.ObjectId): Promise<IContract> => {
  const contract = await Contract.findOne({ _id: contractId, clientId });
  if (!contract) throw new Error('Contract not found or access denied.');
  if (contract.status !== 'proposed') throw new Error(`Cannot accept contract in status: ${contract.status}`);

  contract.status = 'active';
  contract.acceptedAt = new Date();
  await contract.save();

  const client = await User.findById(clientId);
  if (client?.telegramChatId) {
    await updateContractTelegramStatusCard(contract, client.telegramChatId, 0);
  }

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'proposal_accepted',
      message: `Client ${contract.clientName} accepted retainer contract (${contract.packageTier.toUpperCase()}, ${contract.monthlyPrice} ${contract.currency}/mo).`,
    });

    const tgMessage = `✅ <b>${contract.clientName}</b> accepted the retainer contract (${contract.packageTier.toUpperCase()}, ${contract.frequency}, ${contract.monthlyPrice} ${contract.currency}/mo). Deliverables tracking active.`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return contract;
};

export const declineContract = async (contractId: string | Types.ObjectId, clientId: string | Types.ObjectId): Promise<IContract> => {
  const contract = await Contract.findOne({ _id: contractId, clientId });
  if (!contract) throw new Error('Contract not found or access denied.');
  if (contract.status !== 'proposed') throw new Error(`Cannot decline contract in status: ${contract.status}`);

  contract.status = 'declined';
  contract.declinedAt = new Date();
  await contract.save();

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'proposal_declined',
      message: `Client ${contract.clientName} declined retainer contract proposal.`,
    });

    const tgMessage = `❌ <b>${contract.clientName}</b> declined the retainer contract proposal.`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return contract;
};

export const addDeliverable = async (contractId: string | Types.ObjectId, adminId: string | Types.ObjectId, data: any): Promise<IDeliverable> => {
  const { title, deliverableUrl, notes } = data;
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error('Contract not found.');
  if (contract.status !== 'active') throw new Error(`Cannot add deliverables to contract in status: ${contract.status}`);

  const existingCount = await Deliverable.countDocuments({ contractId });
  const sequenceNumber = existingCount + 1;

  const deliverable = await Deliverable.create({
    contractId,
    sequenceNumber,
    title: title || `Deliverable #${sequenceNumber}`,
    deliverableUrl,
    notes: notes || '',
    status: 'delivered',
    deliveredAt: new Date(),
  });

  const client = await User.findById(contract.clientId);
  if (client) {
    await Notification.create({
      userId: client._id,
      type: 'work_delivered',
      message: `New video deliverable #${sequenceNumber} uploaded under your retainer contract!`,
    });

    if (client.telegramChatId) {
      await updateContractTelegramStatusCard(contract, client.telegramChatId, sequenceNumber);
    }

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 24px; background: #FBEFE1; color: #451D13; border-radius: 16px;">
        <h2 style="font-family: serif; color: #451D13;">New Retainer Video Deliverable Available</h2>
        <p>Hello ${client.name},</p>
        <p>Alpha Cut has uploaded Deliverable #${sequenceNumber} for your active retainer contract.</p>
        <p>Log into your client workspace to review and approve the render.</p>
      </div>
    `;
    await sendTransactionalEmail({
      toEmail: client.email,
      subject: `Alpha Cut — Deliverable #${sequenceNumber} Ready for Review`,
      htmlContent: emailHtml,
    });
  }

  return deliverable;
};

export const approveDeliverable = async (contractId: string | Types.ObjectId, deliverableId: string | Types.ObjectId, clientId: string | Types.ObjectId): Promise<IDeliverable> => {
  const contract = await Contract.findOne({ _id: contractId, clientId });
  if (!contract) throw new Error('Contract not found or access denied.');

  const deliverable = await Deliverable.findOne({ _id: deliverableId, contractId });
  if (!deliverable) throw new Error('Deliverable not found.');

  deliverable.status = 'approved';
  deliverable.approvedAt = new Date();
  await deliverable.save();

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'delivery_approved',
      message: `Client ${contract.clientName} approved deliverable #${deliverable.sequenceNumber} under contract.`,
    });
  }

  return deliverable;
};

export const completeContract = async (contractId: string | Types.ObjectId, adminId?: string | Types.ObjectId): Promise<IContract> => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error('Contract not found.');
  if (contract.status !== 'active') throw new Error(`Cannot complete contract in status: ${contract.status}`);

  contract.status = 'completed';
  contract.completedAt = new Date();
  await contract.save();

  const delCount = await Deliverable.countDocuments({ contractId: contract._id });

  const client = await User.findById(contract.clientId);
  if (client) {
    await Notification.create({
      userId: client._id,
      type: 'delivery_approved',
      message: `Your retainer contract term is officially COMPLETED! Rating unlocked.`,
    });

    if (client.telegramChatId) {
      await updateContractTelegramStatusCard(contract, client.telegramChatId, delCount);
    }
  }

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    const tgMessage = `📦 Contract with <b>${contract.clientName}</b> completed — ${delCount} videos delivered over ${contract.durationMonths} month(s).`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return contract;
};

export const submitContractRating = async (contractId: string | Types.ObjectId, clientId: string | Types.ObjectId, stars: number, review: string): Promise<IRating> => {
  const contract = await Contract.findOne({ _id: contractId, clientId });
  if (!contract) throw new Error('Contract not found or access denied.');
  if (contract.status !== 'completed') throw new Error('Rating is only allowed for completed retainer contracts.');
  if (contract.rated) throw new Error('Contract has already been rated.');

  const client = await User.findById(clientId);

  const rating = await Rating.create({
    subjectType: 'contract',
    subjectId: contract._id,
    contractId: contract._id,
    clientId: contract.clientId,
    clientName: client?.name || contract.clientName || 'Verified Client',
    clientTitle: 'Retainer Client Partner',
    clientAvatarUrl: client?.avatarUrl || null,
    stars,
    review,
    editingStyle: `${contract.packageTier.toUpperCase()} Retainer (${contract.frequency})`,
    packageTier: contract.packageTier,
  });

  contract.rated = true;
  await contract.save();

  const starEmojis = '⭐️'.repeat(stars);
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      userId: admin._id,
      type: 'rating_submitted',
      message: `New ${stars}-star retainer rating submitted by ${client?.name || 'Client'}.`,
    });

    const tgMessage = `${starEmojis} <b>${client?.name || 'Client'}</b> rated the retainer contract ${stars}/5: "${review}"`;
    await sendTelegramNotification(admin.telegramChatId, tgMessage);
  }

  return rating;
};

export const deleteDeliverable = async (contractId: string | Types.ObjectId, deliverableId: string | Types.ObjectId, adminId?: string | Types.ObjectId): Promise<{ success: boolean; deliverableId: string | Types.ObjectId }> => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error('Contract not found.');

  const deliverable = await Deliverable.findOneAndDelete({ _id: deliverableId, contractId });
  if (!deliverable) throw new Error('Deliverable not found.');

  return { success: true, deliverableId };
};

export const cancelContract = async (contractId: string | Types.ObjectId, adminId?: string | Types.ObjectId): Promise<IContract> => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error('Contract not found.');

  contract.status = 'cancelled';
  contract.cancelledAt = new Date();
  await contract.save();

  return contract;
};
