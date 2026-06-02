import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function BookEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState({
        title: '',
        description: '',
        cover_image: '',
        file_path: '',
        publisher: '',
        year: '',
        isbn: '',
        buy_link: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate('/admin/login'); return; }

        if (isEdit && id) {
            axios.get(`/api/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setForm({
                    title: res.data.title || '',
                    description: res.data.description || '',
                    cover_image: res.data.cover_image || '',
                    file_path: res.data.file_path || '',
                    publisher: res.data.publisher || '',
                    year: res.data.year || '',
                    isbn: res.data.isbn || '',
                    buy_link: res.data.buy_link || ''
                });
            }).catch(err => {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    navigate('/admin/login');
                } else {
                    navigate('/admin');
                }
            });
        }
    }, [id, isEdit, navigate]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            handleChange('cover_image', res.data.url);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Bilinmeyen hata';
            const status = err.response?.status || '?';
            alert(`Görsel yükleme hatası (${status}): ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    // Read text/html/md files and populate description
    const handleFileContentUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTextTypes = ['.txt', '.html', '.htm', '.md'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!allowedTextTypes.includes(ext)) {
            alert('Desteklenen dosya formatları: .txt, .html, .htm, .md');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            let fileContent = event.target.result;
            if (ext === '.txt' || ext === '.md') {
                fileContent = fileContent
                    .split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
            }
            if (window.confirm('Mevcut açıklama değiştirilecek. Devam etmek istiyor musunuz?')) {
                handleChange('description', fileContent);
            }
        };
        reader.readAsText(file, 'UTF-8');
        e.target.value = '';
    };

    // Upload document files (PDF, DOCX, etc.) as attachments
    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            handleChange('file_path', res.data.url);
            alert('Dosya başarıyla yüklendi.');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Bilinmeyen hata';
            const status = err.response?.status || '?';
            alert(`Dosya yükleme hatası (${status}): ${msg}`);
        } finally {
            setFileUploading(false);
            e.target.value = '';
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const headers = { Authorization: `Bearer ${getToken()}` };
        const data = { ...form, year: form.year ? parseInt(form.year) : null };

        try {
            if (isEdit) {
                await axios.put(`/api/books/${id}`, data, { headers });
            } else {
                await axios.post('/api/books', data, { headers });
            }
            navigate('/admin');
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/admin/login');
                return;
            }
            alert('Kayıt hatası');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/admin" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Panel</Link>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>
                        {isEdit ? 'Kitap Düzenle' : 'Yeni Kitap'}
                    </span>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 24px' }}>
                <div className="form-group">
                    <label className="form-label">Kitap Adı</label>
                    <input className="form-input" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Kitap adı..." />
                </div>

                {/* File Content Upload Section */}
                <div className="form-group">
                    <label className="form-label">Dosyadan İçerik Yükle</label>
                    <div style={{
                        border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        background: 'var(--color-bg-elevated)'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                                    Metin Dosyası İçe Aktar
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                    .txt, .html, .md dosyalarının içeriği açıklamaya aktarılır
                                </p>
                                <input type="file" accept=".txt,.html,.htm,.md" onChange={handleFileContentUpload} style={{ fontSize: '0.85rem' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                                    Dosya Ekle (PDF, DOCX vb.)
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                    Dosya sunucuya yüklenir ve direkt dosya içeriği olarak atanır
                                </p>
                                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar" onChange={handleDocumentUpload} style={{ fontSize: '0.85rem' }} />
                                {fileUploading && <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginLeft: '8px' }}>Yükleniyor...</span>}
                                {form.file_path && (
                                    <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                                        <a href={form.file_path} target="_blank" rel="noreferrer">Yüklü Dosyayı Görüntüle</a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Açıklama</label>
                    <textarea className="form-textarea" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Kitap hakkında..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Yayınevi</label>
                        <input className="form-input" value={form.publisher} onChange={e => handleChange('publisher', e.target.value)} placeholder="Yayınevi..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Basım Yılı</label>
                        <input className="form-input" type="number" value={form.year} onChange={e => handleChange('year', e.target.value)} placeholder="2024" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">ISBN</label>
                        <input className="form-input" value={form.isbn} onChange={e => handleChange('isbn', e.target.value)} placeholder="ISBN numarası..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Satın Alma Linki</label>
                        <input className="form-input" value={form.buy_link} onChange={e => handleChange('buy_link', e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Kapak Görseli</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    {uploading && <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginTop: '6px' }}>Yükleniyor...</p>}
                    {form.cover_image && (
                        <img src={form.cover_image} alt="Kapak" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: 'var(--radius-sm)' }} />
                    )}
                </div>
            </div>
        </div>
    );
}
