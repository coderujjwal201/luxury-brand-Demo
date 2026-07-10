const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // Middleware to check if admin is logged in
    async adminAuth(req, res, next) {
        const token = req.cookies.admin_session;

        if (!token) {
            return res.redirect('/admin/login');
        }

        if (token === process.env.SESSION_SECRET) {
            req.adminUser = { email: process.env.ADMIN_EMAIL || 'admin@thistlewood.com' };
            return next();
        }

        res.clearCookie('admin_session');
        return res.redirect('/admin/login');
    },

    // Login function helper
    async loginAdmin(email, password) {
        const expectedEmail = process.env.ADMIN_EMAIL || 'admin@thistlewood.com';
        const expectedPassword = process.env.ADMIN_PASSWORD || 'Couture2026!';

        if (email === expectedEmail && password === expectedPassword) {
            return {
                token: process.env.SESSION_SECRET,
                email: expectedEmail
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }
};