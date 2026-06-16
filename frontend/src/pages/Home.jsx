import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getViewableFileUrl } from '../utils/cloudinaryUrl';

export default function Home() {
    const [about, setAbout] = useState({});
    const [articles, setArticles] = useState([]);
    const [columns, setColumns] = useState([]);
    const [books, setBooks] = useState([]);
    const [media, setMedia] = useState([]);

    useEffect(() => {
        axios.get('/api/about').then(res => setAbout(res.data)).catch(() => { });
        axios.get('/api/articles').then(res => setArticles(res.data.slice(0, 3))).catch(() => { });
        axios.get('/api/columns').then(res => setColumns(res.data.slice(0, 3))).catch(() => { });
        axios.get('/api/books').then(res => setBooks(res.data.slice(0, 3))).catch(() => { });
        axios.get('/api/media').then(res => setMedia(res.data.slice(0, 3))).catch(() => { });
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="page">
            <div className="container">
                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-tag">Akademisyen</div>
                            <h1 className="hero-name">{about.full_name || 'Rıza Arslan'}</h1>
                            <p className="hero-title">{about.academic_title || 'Prof. Dr. rer. pol.'}{about.university ? ` — ${about.university}` : ''}</p>
                            {about.bio && (
                                <p className="hero-bio" dangerouslySetInnerHTML={{
                                    __html: about.bio.length > 250 ? about.bio.substring(0, 250).replace(/<[^>]*>/g, '') + '...' : about.bio.replace(/<[^>]*>/g, '')
                                }} />
                            )}
                        </div>
                    </div>
                </section>

                {/* Latest Articles */}
                {articles.length > 0 && (
                    <section style={{ marginTop: '60px' }}>
                        <div className="section-header">
                            <h2 className="section-title">Son Makaleler</h2>
                            <Link to="/makaleler" className="section-link">Tümünü Gör →</Link>
                        </div>
                        <div className="card-grid">
                            {articles.map(article => {
                                const destination = article.file_path ? getViewableFileUrl(article.file_path) : `/makaleler/${article.id}`;
                                const isFile = !!article.file_path;
                                const Wrapper = isFile ? 'a' : Link;
                                const props = isFile ? { href: destination, target: '_blank', rel: 'noreferrer' } : { to: destination };
                                
                                return (
                                <Wrapper {...props} key={article.id} style={{ textDecoration: 'none' }}>
                                    <div className="card">
                                        {article.cover_image ? (
                                            <img src={article.cover_image} alt={article.title} className="card-image" />
                                        ) : (
                                            <div className="card-image-placeholder"></div>
                                        )}
                                        <div className="card-body">
                                            <span className="card-tag">Makale</span>
                                            <h3 className="card-title">{article.title}</h3>
                                            {article.summary && <p className="card-summary">{article.summary}</p>}
                                            <div className="card-meta">
                                                <span>{formatDate(article.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Wrapper>
                            )})}
                        </div>
                    </section>
                )}

                {/* Latest Columns */}
                {columns.length > 0 && (
                    <section style={{ marginTop: '60px' }}>
                        <div className="section-header">
                            <h2 className="section-title">Son Bireysel Görüşler</h2>
                            <Link to="/bireysel-gorusler" className="section-link">Tümünü Gör →</Link>
                        </div>
                        <div className="card-grid">
                            {columns.map(col => {
                                const destination = col.file_path ? getViewableFileUrl(col.file_path) : `/bireysel-gorusler/${col.id}`;
                                const isFile = !!col.file_path;
                                const Wrapper = isFile ? 'a' : Link;
                                const props = isFile ? { href: destination, target: '_blank', rel: 'noreferrer' } : { to: destination };

                                return (
                                <Wrapper {...props} key={col.id} style={{ textDecoration: 'none' }}>
                                    <div className="card">
                                        <div className="card-body">
                                            <span className="card-tag">Bireysel Görüş</span>
                                            <h3 className="card-title">{col.title}</h3>
                                            {col.summary && <p className="card-summary">{col.summary}</p>}
                                            <div className="card-meta">
                                                <span>{formatDate(col.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Wrapper>
                            )})}
                        </div>
                    </section>
                )}

                {/* Books */}
                {books.length > 0 && (
                    <section style={{ marginTop: '60px' }}>
                        <div className="section-header">
                            <h2 className="section-title">Kitaplar</h2>
                            <Link to="/kitaplar" className="section-link">Tümünü Gör →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {books.map(book => (
                                <div className="book-card" key={book.id}>
                                    {book.file_path ? (
                                        <a href={getViewableFileUrl(book.file_path)} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                                            {book.cover_image ? (
                                                <img src={book.cover_image} alt={book.title} className="book-cover" />
                                            ) : (
                                                <div className="book-cover-placeholder"></div>
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
                                        <h3>{book.title}</h3>
                                        {book.publisher && <p className="book-detail"> {book.publisher}</p>}
                                        {book.year && <p className="book-detail"> {book.year}</p>}
                                        {book.description && (
                                            <p className="card-summary" style={{ marginTop: '8px' }}>
                                                {book.description.length > 150 ? book.description.substring(0, 150) + '...' : book.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {media.length > 0 && (
                    <section style={{ marginTop: '60px' }}>
                        <div className="section-header">
                            <h2 className="section-title">Son Medya</h2>
                            <Link to="/medya" className="section-link">Tümünü Gör →</Link>
                        </div>
                        <div className="card-grid">
                            {media.map(item => (
                                <Link to={`/medya`} key={item.id} style={{ textDecoration: 'none' }}>
                                    <div className="card">
                                        <div className="card-image" style={{ background: '#111', position: 'relative', height: '200px' }}>
                                            {item.media_type === 'video' ? (
                                                <video src={item.file_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <img src={item.file_path} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                            {item.media_type === 'video' && (
                                                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>Video</span>
                                            )}
                                        </div>
                                        {item.caption && (
                                            <div className="card-body">
                                                <p className="card-summary" style={{ marginBottom: 0 }}>{item.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state if nothing yet */}
                {articles.length === 0 && columns.length === 0 && books.length === 0 && media.length === 0 && (
                    <div className="empty-state" style={{ marginTop: '60px' }}>
                        <div className="empty-state-icon"></div>
                        <h3>Hoş Geldiniz</h3>
                        <p>İçerikler yakında eklenecektir. Admin panelinden içerik ekleyebilirsiniz.</p>
                        <Link to="/admin" className="btn btn-primary" style={{ marginTop: '20px' }}>Admin Paneli</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
