import { useState, useEffect } from 'react';
import axios from 'axios';
import { getViewableFileUrl } from '../utils/cloudinaryUrl';

export default function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/books')
            .then(res => setBooks(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">Kitaplar</h1>
                </div>

                {books.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <h3>Henüz kitap eklenmemiş</h3>
                        <p>Kitaplar yakında eklenecektir.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {books.map(book => (
                            <div className="book-card" key={book.id}>
                                {/* Kapak Görseli - file_path varsa tıklanınca dosya açılır */}
                                {book.file_path ? (
                                    <a href={getViewableFileUrl(book.file_path)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', flexShrink: 0 }}>
                                        {book.cover_image ? (
                                            <img src={book.cover_image} alt={book.title} className="book-cover" style={{ cursor: 'pointer' }} />
                                        ) : (
                                            <div className="book-cover-placeholder" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}></div>
                                        )}
                                    </a>
                                ) : (
                                    book.cover_image ? (
                                        <img src={book.cover_image} alt={book.title} className="book-cover" />
                                    ) : (
                                        <div className="book-cover-placeholder"></div>
                                    )
                                )}

                                <div className="book-info">
                                    <h3>
                                        {book.file_path ? (
                                            <a href={getViewableFileUrl(book.file_path)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {book.title}
                                            </a>
                                        ) : book.title}
                                    </h3>
                                    {book.publisher && <p className="book-detail">Yayınevi: {book.publisher}</p>}
                                    {book.year && <p className="book-detail">Basım Yılı: {book.year}</p>}
                                    {book.isbn && <p className="book-detail">ISBN: {book.isbn}</p>}
                                    {book.description && (
                                        <p style={{ marginTop: '10px', color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                                            {book.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
                                        {book.file_path && (
                                            <a href={getViewableFileUrl(book.file_path)} target="_blank" rel="noopener noreferrer" className="book-link">
                                                Kitabı Oku / İndir
                                            </a>
                                        )}
                                        {book.buy_link && (
                                            <a href={book.buy_link} target="_blank" rel="noopener noreferrer" className="book-link">
                                                Satın Al
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
