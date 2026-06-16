const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const { queryAll, queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'rizaarslan/media',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'ogg', 'mov'],
        };
    },
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

// GET /api/media
router.get('/', async (req, res) => {
    try {
        const media = await queryAll('SELECT * FROM media_table ORDER BY sort_order ASC, created_at DESC');
        res.json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/media
router.post('/', authMiddleware, (req, res) => {
    upload.single('file')(req, res, async (multerErr) => {
        try {
            if (multerErr) {
                console.error('Multer hatası:', multerErr.message);
                if (multerErr.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Dosya boyutu çok büyük (max 50MB)' });
                }
                return res.status(400).json({ error: multerErr.message || 'Dosya yükleme hatası' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Dosya yüklenmedi' });
            }

            // Cloudinary URL'i direkt kullan
            const fileUrl = req.file.path;
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
});

// PUT /api/media/:id
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

        // Cloudinary'den sil
        try {
            const urlParts = existing.file_path.split('/');
            const publicId = 'rizaarslan/media/' + urlParts[urlParts.length - 1].split('.')[0];
            const resourceType = existing.media_type === 'video' ? 'video' : 'image';
            await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        } catch (cloudErr) {
            console.warn('Cloudinary silme hatası:', cloudErr.message);
        }

        await runSql('DELETE FROM media_table WHERE id = ?', [req.params.id]);
        res.json({ message: 'Medya silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
