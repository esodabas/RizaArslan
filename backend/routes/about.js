const express = require('express');
const router = express.Router();
const { queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/about
router.get('/', async (req, res) => {
    try {
        const about = await queryGet('SELECT * FROM about WHERE id = 1');
        res.json(about || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PUT /api/about
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { bio, academic_title, full_name, university, department, email, phone, address, profile_image, media_items, universities_list } = req.body;
        const existing = await queryGet('SELECT * FROM about WHERE id = 1');

        if (!existing) {
            await runSql(
                'INSERT INTO about (id, bio, academic_title, full_name, university, department, email, phone, address, profile_image, media_items, universities_list) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [bio || '', academic_title || '', full_name || '', university || '', department || '', email || '', phone || '', address || '', profile_image || '', media_items || '[]', universities_list || '[]']
            );
        } else {
            await runSql(
                'UPDATE about SET bio = ?, academic_title = ?, full_name = ?, university = ?, department = ?, email = ?, phone = ?, address = ?, profile_image = ?, media_items = ?, universities_list = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
                [
                    bio !== undefined ? bio : existing.bio,
                    academic_title !== undefined ? academic_title : existing.academic_title,
                    full_name !== undefined ? full_name : existing.full_name,
                    university !== undefined ? university : existing.university,
                    department !== undefined ? department : existing.department,
                    email !== undefined ? email : existing.email,
                    phone !== undefined ? phone : existing.phone,
                    address !== undefined ? address : existing.address,
                    profile_image !== undefined ? profile_image : existing.profile_image,
                    media_items !== undefined ? media_items : (existing.media_items || '[]'),
                    universities_list !== undefined ? universities_list : (existing.universities_list || '[]')
                ]
            );
        }

        const about = await queryGet('SELECT * FROM about WHERE id = 1');
        res.json(about);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
