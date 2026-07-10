const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (useSupabase) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

module.exports = {
    // Middleware to check if admin is logged in
    async adminAuth(req, res, next) {
        const token = req.cookies.admin_session;
        
        if (!token) {
            return res.redirect('/admin/login');
        }

        if (useSupabase) {
            try {
                // Verify Supabase Auth JWT token
                const { data: { user }, error } = await supabase.auth.getUser(token);
                if (error || !user) {
                    res.clearCookie('admin_session');
                    return res.redirect('/admin/login');
                }
                // Optionally verify user role or email
                req.adminUser = user;
                next();
            } catch (err) {
                res.clearCookie('admin_session');
                res.redirect('/admin/login');
            }
        } else {
            // Local fallback validation
            if (token === process.env.SESSION_SECRET) {
                req.adminUser = { email: process.env.ADMIN_EMAIL || 'admin@thistlewood.com' };
                return next();
            }
            res.clearCookie('admin_session');
            res.redirect('/admin/login');
        }
    },

    // Login function helper
    async loginAdmin(email, password) {
        if (useSupabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return {
                token: data.session.access_token,
                email: data.user.email
            };
        } else {
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
    }
};
