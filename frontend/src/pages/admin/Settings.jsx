import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Settings() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [infoMessage, setInfoMessage] = useState(null);
    const [passwordMessage, setPasswordMessage] = useState(null);

    const getToken = () => localStorage.getItem('token');

    const handleAuthError = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/admin/login');
    };

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate('/admin/login'); return; }

        axios.get('/api/auth/account', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setUsername(res.data.username || '');
            setEmail(res.data.email || '');
            setLoading(false);
        }).catch(err => {
            if (err.response?.status === 401) {
                handleAuthError();
            } else {
                setLoading(false);
            }
        });
    }, [navigate]);

    const handleSaveInfo = async () => {
        setSavingInfo(true);
        setInfoMessage(null);
        try {
            const res = await axios.put('/api/auth/account', {
                username,
                email
            }, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            if (res.data.username) {
                localStorage.setItem('username', res.data.username);
            }

            setInfoMessage({ type: 'success', text: 'Hesap bilgileri başarıyla güncellendi!' });
        } catch (err) {
            if (err.response?.status === 401) {
                handleAuthError();
                return;
            }
            setInfoMessage({ type: 'error', text: err.response?.data?.error || 'Güncelleme hatası' });
        } finally {
            setSavingInfo(false);
        }
    };

    const handleSavePassword = async () => {
        setPasswordMessage(null);

        if (!currentPassword) {
            setPasswordMessage({ type: 'error', text: 'Mevcut şifrenizi girin' });
            return;
        }
        if (!newPassword) {
            setPasswordMessage({ type: 'error', text: 'Yeni şifre girin' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
            return;
        }
        if (newPassword.length < 3) {
            setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 3 karakter olmalı' });
            return;
        }

        setSavingPassword(true);
        try {
            await axios.put('/api/auth/account', {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            setPasswordMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            if (err.response?.status === 401) {
                handleAuthError();
                return;
            }
            setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Şifre değiştirme hatası' });
        } finally {
            setSavingPassword(false);
        }
    };

    const sectionStyle = {
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '28px',
        marginBottom: '24px'
    };

    const messageStyle = (type) => ({
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '16px',
        background: type === 'success' ? 'rgba(45, 138, 78, 0.1)' : 'rgba(211, 47, 47, 0.1)',
        color: type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
        border: `1px solid ${type === 'success' ? 'rgba(45, 138, 78, 0.2)' : 'rgba(211, 47, 47, 0.2)'}`
    });

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Navbar */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/admin" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: '500' }}>← Panel</Link>
                    <span style={{ color: 'var(--color-text-muted)' }}>|</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>Hesap Ayarları</span>
                </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 24px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>⚙️ Hesap Ayarları</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        Kullanıcı adı, e-posta ve şifre ayarlarınızı buradan yönetebilirsiniz.
                    </p>
                </div>

                {/* Hesap Bilgileri Section */}
                <div style={sectionStyle}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>👤</span> Hesap Bilgileri
                    </h3>

                    {infoMessage && (
                        <div style={messageStyle(infoMessage.type)}>{infoMessage.text}</div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Kullanıcı Adı</label>
                        <input
                            className="form-input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta Adresi</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <button
                        onClick={handleSaveInfo}
                        className="btn btn-primary"
                        disabled={savingInfo}
                        style={{ marginTop: '8px' }}
                    >
                        {savingInfo ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                    </button>
                </div>

                {/* Şifre Değiştir Section */}
                <div style={sectionStyle}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span> Şifre Değiştir
                    </h3>

                    {passwordMessage && (
                        <div style={messageStyle(passwordMessage.type)}>{passwordMessage.text}</div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Mevcut Şifre</label>
                        <input
                            className="form-input"
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Yeni Şifre</label>
                        <input
                            className="form-input"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Yeni Şifre (Tekrar)</label>
                        <input
                            className="form-input"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        onClick={handleSavePassword}
                        className="btn btn-primary"
                        disabled={savingPassword}
                        style={{ marginTop: '8px' }}
                    >
                        {savingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
