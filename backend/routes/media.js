const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { queryAll, queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'media-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim ve video dosyaları yüklenebilir'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// GET /api/media - get all media items
router.get('/', async (req, res) => {
    try {
        const media = await queryAll('SELECT * FROM media_table ORDER BY sort_order ASC, created_at DESC');
        res.json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/media - upload new media
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Dosya yüklenmedi' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const isVideo = req.file.mimetype.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';
        const caption = req.body.caption || '';

        const maxOrder = await queryGet('SELECT MAX(sort_order) as max_order FROM media_table');
        const sortOrder = (maxOrder?.max_order || 0) + 1;

        const result = await runSql(
            'INSERT INTO media_table (file_path, media_type, caption, sort_order) VALUES (?, ?, ?, ?)',
            [fileUrl, mediaType, caption, sortOrder]
        );

        const media = await queryGet('SELECT * FROM media_table WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Medya yükleme hatası' });
    }
});

// PUT /api/media/:id - update caption
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await queryGet('SELECT * FROM media_table WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Medya bulunamadı' });

        const { caption } = req.body;
        await runSql('UPDATE media_table SET caption = ? WHERE id = ?', [caption || '', req.params.id]);

        const media = await queryGet('SELECT * FROM media_table WHERE id = ?', [req.params.id]);
        res.json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/media/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await queryGet('SELECT * FROM media_table WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Medya bulunamadı' });

        // Delete file from disk
        const filePath = path.join(__dirname, '..', existing.file_path);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileErr) {
            console.warn('Medya dosyası diskten silinemedi (kullanımda olabilir):', fileErr.message);
        }

        await runSql('DELETE FROM media_table WHERE id = ?', [req.params.id]);
        res.json({ message: 'Medya silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
