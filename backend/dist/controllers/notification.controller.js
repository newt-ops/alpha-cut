import { Notification } from '../models/Notification.js';
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        res.status(200).json({ success: true, notifications });
    }
    catch (err) {
        next(err);
    }
};
export const markRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { read: true }, { new: true });
        res.status(200).json({ success: true, notification });
    }
    catch (err) {
        next(err);
    }
};
export const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
    catch (err) {
        next(err);
    }
};
