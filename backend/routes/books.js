const express = require('express');
const router = express.Router();
const { queryAll, queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/books
router.get('/', async (req, res) => {
    try {
        const books = await queryAll('SELECT * FROM books ORDER BY year DESC, created_at DESC');
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
    try {
        const book = await queryGet('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (!book) return res.status(404).json({ error: 'Kitap bulunamadı' });
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/books
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, cover_image, publisher, year, isbn, buy_link } = req.body;
        const result = await runSql(
            'INSERT INTO books (title, description, cover_image, publisher, year, isbn, buy_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title || '', description || '', cover_image || '', publisher || '', year || null, isbn || '', buy_link || '']
        );
        const book = await queryGet('SELECT * FROM books WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PUT /api/books/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, cover_image, publisher, year, isbn, buy_link } = req.body;
        const existing = await queryGet('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Kitap bulunamadı' });

        await runSql(
            'UPDATE books SET title = ?, description = ?, cover_image = ?, publisher = ?, year = ?, isbn = ?, buy_link = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [
                title !== undefined ? title : existing.title,
                description !== undefined ? description : existing.description,
                cover_image !== undefined ? cover_image : existing.cover_image,
                publisher !== undefined ? publisher : existing.publisher,
                year !== undefined ? year : existing.year,
                isbn !== undefined ? isbn : existing.isbn,
                buy_link !== undefined ? buy_link : existing.buy_link,
                req.params.id
            ]
        );

        const book = await queryGet('SELECT * FROM books WHERE id = ?', [req.params.id]);
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/books/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await queryGet('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Kitap bulunamadı' });
        await runSql('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: 'Kitap silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
