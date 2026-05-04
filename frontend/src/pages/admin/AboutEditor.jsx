import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function AboutEditor() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        bio: '',
        academic_title: 'Prof. Dr. rer. pol.',
        full_name: 'Rıza Arslan',
        university: '',
        department: '',
        email: '',
        phone: '',
        address: '',
        profile_image: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/admin/login'); return; }

        axios.get('/api/about').then(res => {
            if (res.data) {
                setForm(prev => ({
                    ...prev,
                    ...Object.fromEntries(Object.entries(res.data).filter(([_, v]) => v !== null))
                }));
            }
        }).catch(() => { });
    }, [token, navigate]);

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
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            handleChange('profile_image', res.data.url);
        } catch {
            alert('Görsel yükleme hatası');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('/api/about', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Hakkımda bilgileri güncellendi!');
        } catch {
            alert('Kayıt hatası');
        } finally {
            setSaving(false);
        }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'link'],
            ['clean']
        ]
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
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>Hakkımda Düzenle</span>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 24px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Üniversite</label>
                        <input className="form-input" value={form.university} onChange={e => handleChange('university', e.target.value)} placeholder="Üniversite adı..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Bölüm</label>
                        <input className="form-input" value={form.department} onChange={e => handleChange('department', e.target.value)} placeholder="Bölüm adı..." />
                    </div>
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

                <div className="form-group">
                    <label className="form-label">Adres</label>
                    <input className="form-input" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Adres bilgisi..." />
                </div>

                <div className="form-group">
                    <label className="form-label">Profil Fotoğrafı</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    {uploading && <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginTop: '6px' }}>Yükleniyor...</p>}
                    {form.profile_image && (
                        <img src={form.profile_image} alt="Profil" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: 'var(--radius-md)' }} />
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Biyografi</label>
                    <div className="editor-container">
                        <ReactQuill
                            theme="snow"
                            value={form.bio}
                            onChange={val => handleChange('bio', val)}
                            modules={quillModules}
                            placeholder="Biyografi yazın..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
