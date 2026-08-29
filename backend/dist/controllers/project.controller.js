import { Project } from '../models/Project.js';
import * as lifecycleService from '../services/lifecycle.service.js';
export const getClientProjects = async (req, res, next) => {
    try {
        const userEmail = req.user.email ? req.user.email.toLowerCase() : '';
        const query = {
            $or: [
                { clientId: req.user._id },
                ...(userEmail ? [{ clientEmail: userEmail }] : []),
            ],
        };
        const projects = await Project.find(query).select('-adminNotes -notes').sort({ createdAt: -1 });
        res.status(200).json({ success: true, projects });
    }
    catch (err) {
        next(err);
    }
};
export const acceptProposal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await lifecycleService.acceptProposal(id, req.user._id);
        res.status(200).json({ success: true, project });
    }
    catch (err) {
        next(err);
    }
};
export const declineProposal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await lifecycleService.declineProposal(id, req.user._id);
        res.status(200).json({ success: true, project });
    }
    catch (err) {
        next(err);
    }
};
export const approveDelivery = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await lifecycleService.approveDelivery(id, req.user._id);
        res.status(200).json({ success: true, project });
    }
    catch (err) {
        next(err);
    }
};
export const requestRevision = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { revisionNotes } = req.body;
        const project = await lifecycleService.requestRevision(id, req.user._id, revisionNotes);
        res.status(200).json({ success: true, project, message: 'Revision request sent successfully!' });
    }
    catch (err) {
        next(err);
    }
};
export const getProjectForRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id).select('clientName editingStyle status rated createdAt deliverableUrl packageTier currency price');
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, project });
    }
    catch (err) {
        next(err);
    }
};
