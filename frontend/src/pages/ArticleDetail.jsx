import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ArticleDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/articles/${id}`)
            .then(res => setArticle(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;
    if (!article) return <div className="empty-state"><h3>Makale bulunamadı</h3><Link to="/makaleler">← Makalelere Dön</Link></div>;

    return (
        <div className="detail-page">
            <Link to="/makaleler" className="detail-back">← Makalelere Dön</Link>

            {article.cover_image && (
                <img src={article.cover_image} alt={article.title} className="detail-cover" />
            )}

            <h1 className="detail-title">{article.title}</h1>

            <div className="detail-meta">
                <span>{formatDate(article.created_at)}</span>
                {article.updated_at !== article.created_at && (
                    <span>Güncelleme: {formatDate(article.updated_at)}</span>
                )}
            </div>

            <div className="detail-content" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
    );
}
