import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function AboutEditor() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [universities, setUniversities] = useState([{ university: '', department: '' }]);
    const [form, setForm] = useState({
        bio: '',
        academic_title: 'Prof. Dr. rer. pol.',
        full_name: 'Riza Arslan',
        university: '',
        department: '',
        email: '',
        phone: '',
        address: '',
        profile_image: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mediaItems, setMediaItems] = useState([]);
    const [mediaUploading, setMediaUploading] = useState(false);
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate('/admin/login'); return; }
        axios.get('/api/about').then(res => {
            if (res.data) {
                setForm(prev => ({
                    ...prev,
                    ...Object.fromEntries(Object.entries(res.data).filter(([_, v]) => v !== null))
                }));
                // Medya listesini yükle
                if (res.data.media_items) {
                    try { setMediaItems(JSON.parse(res.data.media_items)); } catch {}
                }
                // Üniversiteler listesini yükle
                if (res.data.universities_list) {
                    try {
                        const list = JSON.parse(res.data.universities_list);
                        if (Array.isArray(list) && list.length > 0) setUniversities(list);
                    } catch {}
                } else if (res.data.university) {
                    setUniversities([{ university: res.data.university, department: res.data.department || '' }]);
                }
            }
        }).catch(err => {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/admin/login');
            }
        });
        // Medya yönetiminden medyaları çek
        axios.get('/api/media', { headers: { Authorization: `Bearer ${getToken()}` } })
            .then(res => {
                // about için özel medya yoksa media_table'dan çek
            }).catch(() => {});
    }, [navigate]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            handleChange('profile_image', res.data.url);
        } catch {
            alert('Görsel yükleme hatası');
        } finally {
            setUploading(false);
        }
    };

    const handleMediaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setMediaUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                const res = await axios.post('/api/upload', formData, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                const isVideo = file.type.startsWith('video/');
                setMediaItems(prev => [...prev, {
                    url: res.data.url,
                    type: isVideo ? 'video' : 'image',
                    caption: ''
                }]);
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            alert(`Medya yükleme hatası: ${msg}`);
        } finally {
            setMediaUploading(false);
            e.target.value = '';
        }
    };

    const removeMediaItem = (index) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateCaption = (index, caption) => {
        setMediaItems(prev => prev.map((item, i) => i === index ? { ...item, caption } : item));
    };

    const addUniversity = () => setUniversities(prev => [...prev, { university: '', department: '' }]);
    const removeUniversity = (index) => setUniversities(prev => prev.filter((_, i) => i !== index));
    const updateUniversity = (index, field, value) => {
        setUniversities(prev => prev.map((u, i) => i === index ? { ...u, [field]: value } : u));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Ana üniversite alanını ilk girişten al
            const primaryUni = universities[0] || {};
            await axios.put('/api/about', {
                ...form,
                university: primaryUni.university || '',
                department: primaryUni.department || '',
                universities_list: JSON.stringify(universities),
                media_items: JSON.stringify(mediaItems)
            }, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            alert('Hakkımda bilgileri güncellendi!');
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/admin/login');
                return;
            }
            const msg = err.response?.data?.error || err.message;
            alert(`Kayıt hatası: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'link'],
            ['clean']
        ]
    };

    const tabs = [
        { key: 'profile', label: 'Profil Bilgileri' },
        { key: 'bio', label: 'Biyografi' },
        { key: 'media', label: 'Resim & Video' },
    ];

    const sectionStyle = {
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '20px'
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Navbar */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/admin" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Panel</Link>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>Hakkımda Düzenle</span>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '30px 24px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', marginBottom: '28px', borderBottom: '1px solid var(--color-border)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '12px 22px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                                color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.key ? '600' : '400',
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-body)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* === PROFİL BİLGİLERİ === */}
                {activeTab === 'profile' && (
                    <div>
                        {/* Profil Fotoğrafı */}
                        <div style={sectionStyle}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--color-text)', fontSize: '1rem' }}>Profil Fotoğrafı</h3>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {form.profile_image && (
                                    <img
                                        src={form.profile_image}
                                        alt="Profil"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '3px solid var(--color-accent)' }}
                                    />
                                )}
                                <div>
                                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} id="profile-img-input" style={{ display: 'none' }} />
                                    <label
                                        htmlFor="profile-img-input"
                                        className="btn btn-secondary"
                                        style={{ cursor: 'pointer', display: 'inline-block' }}
                                    >
                                        {uploading ? 'Yükleniyor...' : 'Fotograf Sec'}
                                    </label>
                                    {form.profile_image && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            style={{ marginLeft: '10px' }}
                                            onClick={() => handleChange('profile_image', '')}
                                        >
                                            Kaldır
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kişisel Bilgiler */}
                        <div style={sectionStyle}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--color-text)', fontSize: '1rem' }}>Kişisel Bilgiler</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Unvan</label>
                                    <input className="form-input" value={form.academic_title} onChange={e => handleChange('academic_title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ad Soyad</label>
                                    <input className="form-input" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} />
                                </div>
                            </div>
                        {/* Üniversiteler - Dinamik Liste */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label className="form-label" style={{ margin: 0 }}>Üniversite / Kurum Bilgileri</label>
                                <button
                                    type="button"
                                    onClick={addUniversity}
                                    className="btn btn-sm btn-secondary"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    + Kurum Ekle
                                </button>
                            </div>
                            {universities.map((uni, index) => (
                                <div key={index} style={{
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px 16px',
                                    marginBottom: '10px',
                                    background: 'var(--color-bg)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Kurum {index + 1}</span>
                                        {universities.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeUniversity(index)}
                                                className="btn btn-sm btn-danger"
                                                style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                                            >
                                                Kaldir
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Üniversite / Kurum</label>
                                            <input
                                                className="form-input"
                                                value={uni.university}
                                                onChange={e => updateUniversity(index, 'university', e.target.value)}
                                                placeholder="Üniversite adı..."
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Bölüm / Pozisyon</label>
                                            <input
                                                className="form-input"
                                                value={uni.department}
                                                onChange={e => updateUniversity(index, 'department', e.target.value)}
                                                placeholder="Bölüm adı..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">E-posta</label>
                                    <input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@uni.edu.tr" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Telefon</label>
                                    <input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+90..." />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '4px' }}>
                                <label className="form-label">Adres</label>
                                <input className="form-input" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Adres bilgisi..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* === BİYOGRAFİ === */}
                {activeTab === 'bio' && (
                    <div style={sectionStyle}>
                        <h3 style={{ marginBottom: '16px', color: 'var(--color-text)', fontSize: '1rem' }}>Biyografi & Hakkımda Yazısı</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                            Bu metin ana sayfada ve hakkımda sayfasında görüntülenir. Zengin metin formatlaması kullanabilirsiniz.
                        </p>
                        <div className="editor-container">
                            <ReactQuill
                                theme="snow"
                                value={form.bio}
                                onChange={val => handleChange('bio', val)}
                                modules={quillModules}
                                placeholder="Biyografinizi buraya yazın..."
                                style={{ minHeight: '300px' }}
                            />
                        </div>
                    </div>
                )}

                {/* === MEDYA (RESİM & VİDEO) === */}
                {activeTab === 'media' && (
                    <div>
                        {/* Yükleme Alanı */}
                        <div style={sectionStyle}>
                            <h3 style={{ marginBottom: '8px', color: 'var(--color-text)', fontSize: '1rem' }}>Resim & Video Yükle</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                                JPEG, PNG, GIF, WebP ve MP4, WebM, MOV formatları desteklenir. Birden fazla dosya seçebilirsiniz.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleMediaUpload}
                                    id="about-media-input"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="about-media-input"
                                    className="btn btn-primary"
                                    style={{ cursor: 'pointer', display: 'inline-block' }}
                                >
                                    {mediaUploading ? 'Yukleniyor...' : 'Dosya Sec'}
                                </label>
                                {mediaItems.length > 0 && (
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                                        {mediaItems.length} dosya yüklendi
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Medya Listesi */}
                        {mediaItems.length === 0 ? (
                            <div className="empty-state" style={{ marginTop: 0 }}>
                                <div className="empty-state-icon"></div>
                                <h3>Henüz medya eklenmedi</h3>
                                <p>Yukarıdan resim veya video yükleyin.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '16px'
                            }}>
                                {mediaItems.map((item, index) => (
                                    <div key={index} style={{
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-secondary)'
                                    }}>
                                        {item.type === 'video' ? (
                                            <video
                                                src={item.url}
                                                style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={item.url}
                                                alt={item.caption || 'Medya'}
                                                style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                                            />
                                        )}
                                        <div style={{ padding: '10px' }}>
                                            <input
                                                type="text"
                                                value={item.caption}
                                                onChange={e => updateCaption(index, e.target.value)}
                                                placeholder="Açıklama ekle..."
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.8rem',
                                                    padding: '4px 8px',
                                                    background: 'var(--color-bg)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '4px',
                                                    color: 'var(--color-text)',
                                                    marginBottom: '8px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeMediaItem(index)}
                                                className="btn btn-sm btn-danger"
                                                style={{ width: '100%', fontSize: '0.8rem' }}
                                            >
                                                Kaldir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Alt Kaydet butonu */}
                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                    <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px' }}>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
