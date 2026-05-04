import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Articles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/articles')
            .then(res => setArticles(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">Makaleler</h1>
                </div>

                {articles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <h3>Henüz makale eklenmemiş</h3>
                        <p>Makaleler yakında eklenecektir.</p>
                    </div>
                ) : (
                    <div className="card-grid">
                        {articles.map(article => (
                            <Link to={`/makaleler/${article.id}`} key={article.id} style={{ textDecoration: 'none' }}>
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
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
