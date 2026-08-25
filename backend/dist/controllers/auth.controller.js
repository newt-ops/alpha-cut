import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
const googleClient = new OAuth2Client(config.googleClientId, config.googleClientSecret);
export const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, config.jwtAccessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, config.jwtRefreshSecret, { expiresIn: '14d' });
    return { accessToken, refreshToken };
};
const getCookieDomain = () => {
    if (process.env.COOKIE_DOMAIN)
        return process.env.COOKIE_DOMAIN;
    if (process.env.NODE_ENV === 'production')
        return '.alpha-cut.com';
    return undefined;
};
export const setRefreshCookie = (res, refreshToken) => {
    const domain = getCookieDomain();
    res.cookie('alpha_cut_refresh', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        ...(domain ? { domain } : {}),
        maxAge: 14 * 24 * 60 * 60 * 1000,
    });
};
const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const verifyTurnstileToken = async (token, req) => {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '0x4AAAAAAEcK-mP0HILAUZFBV_a-iy28gIw';
    if (!token) {
        if (process.env.NODE_ENV !== 'production' && secretKey.startsWith('1x000000')) {
            return true;
        }
        return false;
    }
    try {
        const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);
        if (remoteIp)
            formData.append('remoteip', remoteIp.split(',')[0].trim());
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        return data.success === true;
    }
    catch (err) {
        console.error('[TURNSTILE VERIFY EXCEPTION]:', err);
        return process.env.NODE_ENV !== 'production';
    }
};
export const signup = async (req, res, next) => {
    try {
        const { name, email, password, turnstileToken } = req.body;
        const isHuman = await verifyTurnstileToken(turnstileToken, req);
        if (!isHuman) {
            return res.status(400).json({ success: false, message: 'Security check failed. Please complete the "I am not a robot" verification.' });
        }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const rawOtp = generateOtpCode();
        const verificationCode = await bcrypt.hash(rawOtp, 10);
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            authProvider: 'local',
            role: 'client',
            emailVerified: false,
            verificationCode,
            verificationCodeExpires,
        });
        await sendVerificationEmail({ toEmail: user.email, name: user.name, code: rawOtp });
        res.status(201).json({
            success: true,
            message: 'Account created. Verification code sent to your email.',
            requiresVerification: true,
            email: user.email,
        });
    }
    catch (err) {
        next(err);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password, turnstileToken } = req.body;
        const isHuman = await verifyTurnstileToken(turnstileToken, req);
        if (!isHuman) {
            return res.status(400).json({ success: false, message: 'Security check failed. Please complete the "I am not a robot" verification.' });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in.',
                requiresVerification: true,
                email: user.email,
            });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        setRefreshCookie(res, refreshToken);
        res.status(200).json({
            success: true,
            accessToken,
            user,
        });
    }
    catch (err) {
        next(err);
    }
};
export const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential is required' });
        }
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: config.googleClientId,
            });
            payload = ticket.getPayload();
        }
        catch (e) {
            return res.status(401).json({ success: false, message: 'Invalid Google credential token' });
        }
        const { email, name, picture } = payload;
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({
                name: name || 'Google User',
                email: email.toLowerCase(),
                authProvider: 'google',
                role: 'client',
                emailVerified: true,
                avatarUrl: picture || null,
            });
        }
        else if (!user.emailVerified) {
            user.emailVerified = true;
            await user.save();
        }
        const { accessToken, refreshToken } = generateTokens(user);
        setRefreshCookie(res, refreshToken);
        res.status(200).json({
            success: true,
            accessToken,
            user,
        });
    }
    catch (err) {
        next(err);
    }
};
export const googleCallback = async (req, res, next) => {
    try {
        const { code, redirectUri } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Authorization code is required' });
        }
        const targetRedirectUri = redirectUri || `${config.clientUrl}/auth/google/callback`;
        const { tokens } = await googleClient.getToken({
            code,
            redirect_uri: targetRedirectUri,
        });
        if (!tokens.id_token) {
            return res.status(400).json({ success: false, message: 'Failed to obtain ID token from Google' });
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: 'Invalid Google user profile payload' });
        }
        const { email, name, picture } = payload;
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({
                name: name || 'Google User',
                email: email.toLowerCase(),
                authProvider: 'google',
                role: 'client',
                emailVerified: true,
                avatarUrl: picture || null,
            });
        }
        else if (!user.emailVerified) {
            user.emailVerified = true;
            await user.save();
        }
        const { accessToken, refreshToken } = generateTokens(user);
        setRefreshCookie(res, refreshToken);
        res.status(200).json({
            success: true,
            accessToken,
            user,
        });
    }
    catch (err) {
        console.error('[GOOGLE OAUTH CALLBACK ERROR]:', err.message);
        return res.status(401).json({ success: false, message: err.message || 'Google OAuth code exchange failed' });
    }
};
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User account not found' });
        }
        if (user.emailVerified) {
            return res.status(200).json({ success: true, message: 'Email is already verified' });
        }
        if (!user.verificationCode || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
        }
        const isMatch = await bcrypt.compare(code, user.verificationCode);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }
        user.emailVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();
        const { accessToken, refreshToken } = generateTokens(user);
        setRefreshCookie(res, refreshToken);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            accessToken,
            user,
        });
    }
    catch (err) {
        next(err);
    }
};
export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User account not found' });
        }
        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }
        if (user.verificationCooldown && user.verificationCooldown > new Date()) {
            const waitSeconds = Math.ceil((user.verificationCooldown.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitSeconds} seconds before requesting another code.`,
            });
        }
        const rawOtp = generateOtpCode();
        user.verificationCode = await bcrypt.hash(rawOtp, 10);
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        user.verificationCooldown = new Date(Date.now() + 60 * 1000);
        await user.save();
        await sendVerificationEmail({ toEmail: user.email, name: user.name, code: rawOtp });
        res.status(200).json({ success: true, message: 'New verification code sent' });
    }
    catch (err) {
        next(err);
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const { email, turnstileToken } = req.body;
        const isHuman = await verifyTurnstileToken(turnstileToken, req);
        if (!isHuman) {
            return res.status(400).json({ success: false, message: 'Security check failed. Please complete the "I am not a robot" verification.' });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.authProvider === 'google') {
            return res.status(200).json({
                success: true,
                message: 'If an account with this email exists, a password reset code has been sent.',
            });
        }
        const rawOtp = generateOtpCode();
        user.verificationCode = await bcrypt.hash(rawOtp, 10);
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await sendPasswordResetEmail({ toEmail: user.email, name: user.name, code: rawOtp });
        res.status(200).json({
            success: true,
            message: 'If an account with this email exists, a password reset code has been sent.',
        });
    }
    catch (err) {
        next(err);
    }
};
export const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.verificationCode || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset code.' });
        }
        const isMatch = await bcrypt.compare(code, user.verificationCode);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid password reset code.' });
        }
        user.passwordHash = await bcrypt.hash(newPassword, 12);
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
    }
    catch (err) {
        next(err);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        const { name, oldPassword, newPassword, avatarUrl } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (name && name.trim().length >= 2) {
            user.name = name.trim();
        }
        if (avatarUrl) {
            user.avatarUrl = avatarUrl;
        }
        if (newPassword) {
            if (!user.passwordHash) {
                return res.status(400).json({ success: false, message: 'Google accounts cannot change password directly.' });
            }
            if (!oldPassword) {
                return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
            }
            const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Incorrect current password.' });
            }
            user.passwordHash = await bcrypt.hash(newPassword, 12);
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user,
        });
    }
    catch (err) {
        next(err);
    }
};
export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.alpha_cut_refresh;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Refresh token cookie missing' });
        }
        const decoded = jwt.verify(token, config.jwtRefreshSecret);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        setRefreshCookie(res, newRefreshToken);
        res.status(200).json({
            success: true,
            accessToken,
            user,
        });
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};
export const logout = (req, res) => {
    const domain = getCookieDomain();
    res.clearCookie('alpha_cut_refresh', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        ...(domain ? { domain } : {}),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
export const getMe = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};
