import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function Editor({ type }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [filePath, setFilePath] = useState('');
    const [status, setStatus] = useState('draft');
    const [saveStatus, setSaveStatus] = useState('');
    const [itemId, setItemId] = useState(id || null);
    const [uploading, setUploading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);

    const saveTimerRef = useRef(null);
    const getToken = () => localStorage.getItem('token');
    const apiPath = type === 'article' ? 'articles' : 'columns';
    const typeName = type === 'article' ? 'Makale' : 'Bireysel Görüş';
    const [mediaItems, setMediaItems] = useState([]);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate('/admin/login');
            return;
        }

        if (isEdit && id) {
            axios.get(`/api/${apiPath}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setTitle(res.data.title || '');
                setContent(res.data.content || '');
                setSummary(res.data.summary || '');
                setCoverImage(res.data.cover_image || '');
                setFilePath(res.data.file_path || '');
                setStatus(res.data.status || 'draft');
                try { setMediaItems(res.data.media ? JSON.parse(res.data.media) : []); } catch (e) { setMediaItems([]); }
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
    }, [id, isEdit, apiPath, navigate]);

    const saveData = useCallback(async (data) => {
        const token = getToken();
        if (!token) { navigate('/admin/login'); return; }
        setSaveStatus('saving');

        try {
            const headers = { Authorization: `Bearer ${token}` };

            if (itemId) {
                await axios.put(`/api/${apiPath}/${itemId}`, data, { headers });
            } else {
                const res = await axios.post(`/api/${apiPath}`, data, { headers });
                setItemId(res.data.id);
                // Update URL without reload
                window.history.replaceState(null, '', `/admin/${apiPath}/edit/${res.data.id}`);
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/admin/login');
                return;
            }
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 5000);
        }
    }, [itemId, apiPath, navigate]);

    // Auto-save with debounce (3 seconds)
    const triggerAutoSave = useCallback((newTitle, newContent, newSummary, newCoverImage) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        saveTimerRef.current = setTimeout(() => {
            const data = {
                title: newTitle,
                content: newContent,
                summary: newSummary,
                cover_image: newCoverImage,
                file_path: filePath,
                status: 'draft'
            };
            if (type === 'column') data.media = JSON.stringify(mediaItems);
            saveData(data);
        }, 3000);
    }, [saveData, mediaItems, filePath, type]);

    const handleTitleChange = (val) => {
        setTitle(val);
        triggerAutoSave(val, content, summary, coverImage);
    };

    const handleContentChange = (val) => {
        setContent(val);
        triggerAutoSave(title, val, summary, coverImage);
    };

    const handleSummaryChange = (val) => {
        setSummary(val);
        triggerAutoSave(title, content, val, coverImage);
    };

    const handlePublish = async () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const data = { title, content, summary, cover_image: coverImage, file_path: filePath, status: 'published' };
        if (type === 'column') data.media = JSON.stringify(mediaItems);
        await saveData(data);
        setStatus('published');
    };

    const handleUnpublish = async () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const data = { title, content, summary, cover_image: coverImage, file_path: filePath, status: 'draft' };
        if (type === 'column') data.media = JSON.stringify(mediaItems);
        await saveData(data);
        setStatus('draft');
    };

    const handleSaveNow = async () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const data = { title, content, summary, cover_image: coverImage, file_path: filePath, status };
        if (type === 'column') data.media = JSON.stringify(mediaItems);
        await saveData(data);
    };

    const handleMediaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploadingMedia(true);

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
            const msg = err.response?.data?.error || err.message || 'Bilinmeyen hata';
            alert(`Medya yükleme hatası (${err.response?.status || '?'}): ${msg}`);
        } finally {
            setUploadingMedia(false);
            e.target.value = '';
        }
    };

    const removeMedia = (index) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateMediaCaption = (index, caption) => {
        setMediaItems(prev => prev.map((item, i) => i === index ? { ...item, caption } : item));
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
            setCoverImage(res.data.url);
            triggerAutoSave(title, content, summary, res.data.url);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Bilinmeyen hata';
            alert(`Görsel yükleme hatası (${err.response?.status || '?'}): ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    // Read text/html/md files and populate content editor
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

            // Convert plain text and markdown to basic HTML
            if (ext === '.txt' || ext === '.md') {
                fileContent = fileContent
                    .split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
            }

            if (window.confirm('Mevcut içerik değiştirilecek. Devam etmek istiyor musunuz?')) {
                setContent(fileContent);
                triggerAutoSave(title, fileContent, summary, coverImage);
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

            setFilePath(res.data.url);
            triggerAutoSave(title, content, summary, coverImage);
            alert('Dosya başarıyla yüklendi.');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Bilinmeyen hata';
            alert(`Dosya yükleme hatası (${err.response?.status || '?'}): ${msg}`);
        } finally {
            setFileUploading(false);
            e.target.value = '';
        }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'link', 'image'],
            ['clean']
        ]
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Editor Navbar */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/admin" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Panel</Link>
                    <span style={{ color: 'var(--color-text-muted)' }}>|</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>
                        {isEdit ? `${typeName} Düzenle` : `Yeni ${typeName}`}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Auto-save indicator */}
                    {saveStatus && (
                        <span className={`autosave-indicator ${saveStatus}`}>
                            {saveStatus === 'saving' && 'Kaydediliyor...'}
                            {saveStatus === 'saved' && 'Kaydedildi'}
                            {saveStatus === 'error' && 'Kayıt hatası'}
                        </span>
                    )}

                    <button onClick={handleSaveNow} className="btn btn-sm btn-secondary">Kaydet</button>

                    {status === 'draft' ? (
                        <button onClick={handlePublish} className="btn btn-sm btn-primary">Yayınla</button>
                    ) : (
                        <button onClick={handleUnpublish} className="btn btn-sm btn-secondary" style={{ color: 'var(--color-warning)' }}>
                            Taslağa Al
                        </button>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 24px' }}>
                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder={`${typeName} başlığı...`}
                    style={{
                        width: '100%',
                        fontSize: '2rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '700',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        marginBottom: '16px',
                        outline: 'none'
                    }}
                />

                {/* Summary */}
                <div className="form-group">
                    <label className="form-label">Özet</label>
                    <textarea
                        className="form-textarea"
                        value={summary}
                        onChange={e => handleSummaryChange(e.target.value)}
                        placeholder="Kısa bir özet yazın..."
                        rows={2}
                        style={{ minHeight: '60px' }}
                    />
                </div>

                {/* Cover Image (only for articles) */}
                {type === 'article' && (
                    <div className="form-group">
                        <label className="form-label">Kapak Görseli</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                            {uploading && <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>Yükleniyor...</span>}
                        </div>
                        {coverImage && (
                            <img src={coverImage} alt="Kapak" style={{
                                maxWidth: '300px', maxHeight: '200px', marginTop: '10px',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)'
                            }} />
                        )}
                    </div>
                )}

                {/* Media Upload Section (only for columns/bireysel görüşler) */}
                {type === 'column' && (
                    <div className="form-group">
                        <label className="form-label">Görsel ve Videolar</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                            <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} />
                            {uploadingMedia && <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>Yükleniyor...</span>}
                        </div>

                        {mediaItems.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {mediaItems.map((item, index) => (
                                    <div key={index} style={{
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden',
                                        background: 'var(--color-bg-secondary)'
                                    }}>
                                        {item.type === 'video' ? (
                                            <video src={item.url} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                        ) : (
                                            <img src={item.url} alt={item.caption || `Medya ${index + 1}`} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ padding: '8px' }}>
                                            <input
                                                type="text"
                                                value={item.caption}
                                                onChange={e => updateMediaCaption(index, e.target.value)}
                                                placeholder="Açıklama ekle..."
                                                style={{
                                                    width: '100%', fontSize: '0.8rem', padding: '4px 6px',
                                                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                                    borderRadius: '4px', color: 'var(--color-text)', marginBottom: '6px'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeMedia(index)}
                                                className="btn btn-sm btn-danger"
                                                style={{ width: '100%', fontSize: '0.75rem' }}
                                            >Kaldır</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                            {/* Text file import */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                                    Metin Dosyası İçe Aktar
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                    .txt, .html, .md dosyalarının içeriği editöre aktarılır
                                </p>
                                <input
                                    type="file"
                                    accept=".txt,.html,.htm,.md"
                                    onChange={handleFileContentUpload}
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            {/* Document attachment */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                                    Dosya Ekle (PDF, DOCX vb.)
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                    Dosya sunucuya yüklenir ve içerik olarak atanır
                                </p>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                                    onChange={handleDocumentUpload}
                                    style={{ fontSize: '0.85rem' }}
                                />
                                {fileUploading && <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginLeft: '8px' }}>Yükleniyor...</span>}
                                {filePath && (
                                    <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                                        <a href={filePath} target="_blank" rel="noreferrer">Yüklü Dosyayı Görüntüle</a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rich Text Editor */}
                <div className="form-group">
                    <label className="form-label">İçerik</label>
                    <div className="editor-container">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={handleContentChange}
                            modules={quillModules}
                            placeholder={`${typeName} içeriğini buraya yazın...`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
