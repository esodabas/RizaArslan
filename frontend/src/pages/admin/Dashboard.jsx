import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [articles, setArticles] = useState([]);
    const [columns, setColumns] = useState([]);
    const [books, setBooks] = useState([]);
    const [activeTab, setActiveTab] = useState('articles');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        axios.get('/api/articles?status=all', { headers }).then(res => setArticles(res.data)).catch(() => { });
        axios.get('/api/columns?status=all', { headers }).then(res => setColumns(res.data)).catch(() => { });
        axios.get('/api/books', { headers }).then(res => setBooks(res.data)).catch(() => { });
    }, [token, navigate]);

    const handleDelete = async (type, id) => {
        if (!window.confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;

        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`/api/${type}/${id}`, { headers });
            if (type === 'articles') setArticles(prev => prev.filter(a => a.id !== id));
            if (type === 'columns') setColumns(prev => prev.filter(c => c.id !== id));
            if (type === 'books') setBooks(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            alert('Silme hatası oluştu');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/admin/login');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Admin Navbar */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/" style={{ color: 'var(--color-accent)', fontWeight: '700', fontSize: '1.1rem', textDecoration: 'none' }}>
                        ← Siteye Dön
                    </Link>
                    <span style={{ color: 'var(--color-text-muted)' }}>|</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>Yönetim Paneli</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link to="/admin/about" className="btn btn-sm btn-secondary">Hakkımda</Link>
                    <Link to="/admin/media" className="btn btn-sm btn-secondary">Medya</Link>
                    <button onClick={handleLogout} className="btn btn-sm btn-danger">Çıkış</button>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ marginBottom: '8px' }}>İçerik Yönetimi</h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Makalelerinizi, görüşlerinizi ve kitaplarınızı buradan yönetebilirsiniz.</p>
                    </div>
                    <Link to="/admin/media" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', background: 'var(--color-accent)' }}>
                        Medya ve Video Ekle
                    </Link>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
                    {[
                        { key: 'articles', label: 'Makaleler', count: articles.length },
                        { key: 'columns', label: 'Bireysel Görüşler', count: columns.length },
                        { key: 'books', label: 'Kitaplar', count: books.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '12px 24px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                                color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.key ? '600' : '400',
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Articles Tab */}
                {activeTab === 'articles' && (
                    <div>
                        <div className="admin-header">
                            <h2>Makaleler</h2>
                            <Link to="/admin/articles/new" className="btn btn-primary">+ Yeni Makale</Link>
                        </div>
                        {articles.length === 0 ? (
                            <div className="empty-state">
                                <p>Henüz makale yok. İlk makalenizi oluşturun!</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Başlık</th>
                                        <th>Durum</th>
                                        <th>Tarih</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articles.map(article => (
                                        <tr key={article.id}>
                                            <td><strong>{article.title || 'Başlıksız'}</strong></td>
                                            <td><span className={`card-status ${article.status}`}>{article.status === 'published' ? 'Yayında' : 'Taslak'}</span></td>
                                            <td>{formatDate(article.created_at)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <Link to={`/admin/articles/edit/${article.id}`} className="btn btn-sm btn-secondary">Düzenle</Link>
                                                    <button onClick={() => handleDelete('articles', article.id)} className="btn btn-sm btn-danger">Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Columns Tab */}
                {activeTab === 'columns' && (
                    <div>
                        <div className="admin-header">
                            <h2>Bireysel Görüşler</h2>
                            <Link to="/admin/columns/new" className="btn btn-primary">+ Yeni Yazı</Link>
                        </div>
                        {columns.length === 0 ? (
                            <div className="empty-state">
                                <p>Henüz bireysel görüş yok. İlk görüşünüzü oluşturun!</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Başlık</th>
                                        <th>Durum</th>
                                        <th>Tarih</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {columns.map(col => (
                                        <tr key={col.id}>
                                            <td><strong>{col.title || 'Başlıksız'}</strong></td>
                                            <td><span className={`card-status ${col.status}`}>{col.status === 'published' ? 'Yayında' : 'Taslak'}</span></td>
                                            <td>{formatDate(col.created_at)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <Link to={`/admin/columns/edit/${col.id}`} className="btn btn-sm btn-secondary">Düzenle</Link>
                                                    <button onClick={() => handleDelete('columns', col.id)} className="btn btn-sm btn-danger">Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Books Tab */}
                {activeTab === 'books' && (
                    <div>
                        <div className="admin-header">
                            <h2>Kitaplar</h2>
                            <Link to="/admin/books/new" className="btn btn-primary">+ Yeni Kitap</Link>
                        </div>
                        {books.length === 0 ? (
                            <div className="empty-state">
                                <p>Henüz kitap yok. İlk kitabınızı ekleyin!</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Başlık</th>
                                        <th>Yayınevi</th>
                                        <th>Yıl</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map(book => (
                                        <tr key={book.id}>
                                            <td><strong>{book.title || 'Başlıksız'}</strong></td>
                                            <td>{book.publisher || '-'}</td>
                                            <td>{book.year || '-'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <Link to={`/admin/books/edit/${book.id}`} className="btn btn-sm btn-secondary">Düzenle</Link>
                                                    <button onClick={() => handleDelete('books', book.id)} className="btn btn-sm btn-danger">Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
