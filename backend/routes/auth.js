const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { queryGet, runSql } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
        }

        const admin = await queryGet('SELECT * FROM admin WHERE username = ?', [username]);

        if (!admin) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const isValidPassword = bcrypt.compareSync(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
            expiresIn: '30d'
        });

        res.json({ token, username: admin.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Yetkilendirme gerekli' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await queryGet('SELECT * FROM admin WHERE id = ?', [decoded.id]);

        if (!admin || !bcrypt.compareSync(currentPassword, admin.password)) {
            return res.status(401).json({ error: 'Mevcut şifre yanlış' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await runSql('UPDATE admin SET password = ? WHERE id = ?', [hashedPassword, admin.id]);

        res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// GET /api/auth/account - Hesap bilgileri
router.get('/account', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Yetkilendirme gerekli' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await queryGet('SELECT id, username, email FROM admin WHERE id = ?', [decoded.id]);

        if (!admin) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        res.json({ username: admin.username, email: admin.email || '' });
    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın' });
        }
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PUT /api/auth/account - Hesap güncelle
router.put('/account', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Yetkilendirme gerekli' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await queryGet('SELECT * FROM admin WHERE id = ?', [decoded.id]);

        if (!admin) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const { username, email, currentPassword, newPassword } = req.body;

        // E-posta güncelle
        if (email !== undefined) {
            await runSql('UPDATE admin SET email = ? WHERE id = ?', [email, admin.id]);
        }

        // Kullanıcı adı güncelle
        if (username && username !== admin.username) {
            await runSql('UPDATE admin SET username = ? WHERE id = ?', [username, admin.id]);
        }

        // Şifre güncelle
        if (currentPassword && newPassword) {
            if (!bcrypt.compareSync(currentPassword, admin.password)) {
                return res.status(400).json({ error: 'Mevcut şifre yanlış' });
            }
            if (newPassword.length < 3) {
                return res.status(400).json({ error: 'Yeni şifre en az 3 karakter olmalı' });
            }
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            await runSql('UPDATE admin SET password = ? WHERE id = ?', [hashedPassword, admin.id]);
        }

        // Güncel bilgileri döndür
        const updatedAdmin = await queryGet('SELECT id, username, email FROM admin WHERE id = ?', [admin.id]);
        
        // Kullanıcı adı değiştiyse yeni token oluştur
        let newToken = null;
        if (username && username !== admin.username) {
            newToken = jwt.sign({ id: updatedAdmin.id, username: updatedAdmin.username }, JWT_SECRET, {
                expiresIn: '30d'
            });
        }

        res.json({ 
            message: 'Hesap bilgileri güncellendi',
            username: updatedAdmin.username,
            email: updatedAdmin.email || '',
            ...(newToken ? { token: newToken } : {})
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın' });
        }
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
