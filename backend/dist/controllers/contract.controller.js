import { Contract } from '../models/Contract.js';
import { Deliverable } from '../models/Deliverable.js';
import * as lifecycleService from '../services/lifecycle.service.js';
// Admin: Create Retainer Contract Proposal
export const createContractProposal = async (req, res, next) => {
    try {
        const contract = await lifecycleService.createContractProposal(req.user._id, req.body);
        res.status(201).json({ success: true, contract });
    }
    catch (err) {
        next(err);
    }
};
// Admin: Get All Contracts & Deliverables Progress
export const getAllContractsAdmin = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { clientEmail: { $regex: search, $options: 'i' } },
            ];
        }
        const contracts = await Contract.find(query).sort({ createdAt: -1 });
        const contractIds = contracts.map((c) => c._id);
        const deliverables = await Deliverable.find({ contractId: { $in: contractIds } }).sort({ sequenceNumber: 1 });
        const contractsWithDeliverables = contracts.map((contract) => {
            const contractDeliverables = deliverables.filter((d) => d.contractId.toString() === contract._id.toString());
            return {
                ...contract.toObject(),
                deliverables: contractDeliverables,
                deliveredCount: contractDeliverables.length,
            };
        });
        res.status(200).json({ success: true, contracts: contractsWithDeliverables });
    }
    catch (err) {
        next(err);
    }
};
// Admin: Add Deliverable under Retainer Contract
export const addDeliverable = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deliverable = await lifecycleService.addDeliverable(id, req.user._id, req.body);
        res.status(201).json({ success: true, deliverable });
    }
    catch (err) {
        next(err);
    }
};
// Admin: Complete Contract Term
export const completeContract = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contract = await lifecycleService.completeContract(id, req.user._id);
        res.status(200).json({ success: true, contract });
    }
    catch (err) {
        next(err);
    }
};
// Client: Get Own Retainer Contracts & Deliverables
export const getClientContracts = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            query = {};
        }
        else {
            query = {
                $or: [
                    { clientId: req.user._id },
                    { clientEmail: req.user.email ? req.user.email.toLowerCase() : '' },
                ],
            };
        }
        const contracts = await Contract.find(query).sort({ createdAt: -1 });
        const contractIds = contracts.map((c) => c._id);
        const deliverables = await Deliverable.find({ contractId: { $in: contractIds } }).sort({ sequenceNumber: 1 });
        const contractsWithDeliverables = contracts.map((contract) => {
            const contractDeliverables = deliverables.filter((d) => d.contractId.toString() === contract._id.toString());
            return {
                ...contract.toObject(),
                deliverables: contractDeliverables,
                deliveredCount: contractDeliverables.length,
            };
        });
        res.status(200).json({ success: true, contracts: contractsWithDeliverables });
    }
    catch (err) {
        next(err);
    }
};
// Client: Accept Contract
export const acceptContract = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contract = await lifecycleService.acceptContract(id, req.user._id);
        res.status(200).json({ success: true, contract });
    }
    catch (err) {
        next(err);
    }
};
// Client: Decline Contract
export const declineContract = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contract = await lifecycleService.declineContract(id, req.user._id);
        res.status(200).json({ success: true, contract });
    }
    catch (err) {
        next(err);
    }
};
// Client: Approve Deliverable
export const approveDeliverable = async (req, res, next) => {
    try {
        const { id, deliverableId } = req.params;
        const deliverable = await lifecycleService.approveDeliverable(id, deliverableId, req.user._id);
        res.status(200).json({ success: true, deliverable });
    }
    catch (err) {
        next(err);
    }
};
// Client: Submit Rating for Completed Contract
export const submitContractRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { stars, review } = req.body;
        const rating = await lifecycleService.submitContractRating(id, req.user._id, stars, review);
        res.status(201).json({ success: true, rating });
    }
    catch (err) {
        next(err);
    }
};
// Admin: Delete Deliverable
export const deleteDeliverable = async (req, res, next) => {
    try {
        const { id, deliverableId } = req.params;
        const result = await lifecycleService.deleteDeliverable(id, deliverableId, req.user._id);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
// Admin: Cancel Contract
export const cancelContract = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contract = await lifecycleService.cancelContract(id, req.user._id);
        res.status(200).json({ success: true, contract });
    }
    catch (err) {
        next(err);
    }
};
