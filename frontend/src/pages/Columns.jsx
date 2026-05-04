import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Columns() {
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/columns')
            .then(res => setColumns(res.data))
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
                    <h1 className="section-title">Bireysel Görüşler</h1>
                </div>

                {columns.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <h3>Henüz bireysel görüş eklenmemiş</h3>
                        <p>Bireysel görüşler yakında eklenecektir.</p>
                    </div>
                ) : (
                    <div className="card-grid">
                        {columns.map(col => (
                            <Link to={`/bireysel-gorusler/${col.id}`} key={col.id} style={{ textDecoration: 'none' }}>
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
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
