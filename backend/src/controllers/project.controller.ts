import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project.js';
import * as lifecycleService from '../services/lifecycle.service.js';

export const getClientProjects = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let query: any = {};
    if (req.user!.role === 'admin') {
      query = {};
    } else {
      query = {
        $or: [
          { clientId: req.user!._id },
          { clientEmail: req.user!.email ? req.user!.email.toLowerCase() : '' },
        ],
      };
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

export const acceptProposal = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const project = await lifecycleService.acceptProposal(id as string, req.user!._id);
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const declineProposal = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const project = await lifecycleService.declineProposal(id as string, req.user!._id);
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const approveDelivery = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const project = await lifecycleService.approveDelivery(id as string, req.user!._id);
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const requestRevision = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const { revisionNotes } = req.body;
    const project = await lifecycleService.requestRevision(id as string, req.user!._id, revisionNotes);
    res.status(200).json({ success: true, project, message: 'Revision request sent successfully!' });
  } catch (err) {
    next(err);
  }
};

export const getProjectForRating = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).select('clientName editingStyle status rated createdAt deliverableUrl packageTier currency price');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};
