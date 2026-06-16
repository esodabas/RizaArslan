/**
 * Cloudinary raw URL'lerini tarayıcıda açılabilir hale getirir.
 * 
 * Sorun: Cloudinary'ye format belirtmeden yüklenen raw dosyalar (PDF, DOCX vb.)
 * uzantısız URL ile kaydediliyor ve Content-Type olarak application/octet-stream
 * ile sunuluyor. Bu yüzden tarayıcı dosyayı açamıyor.
 * 
 * Çözüm: URL'ye .pdf uzantısı eklenmesi ve fl_attachment flag'inin kullanılması.
 */

/**
 * Cloudinary raw URL'sine uzantı ekler (eğer yoksa)
 * Örnek:
 *   Girdi: https://res.cloudinary.com/xxx/raw/upload/v123/rizaarslan/dosyaadi
 *   Çıktı: https://res.cloudinary.com/xxx/raw/upload/v123/rizaarslan/dosyaadi.pdf
 * 
 * @param {string} url - Cloudinary URL
 * @param {string} defaultExt - Varsayılan uzantı (default: 'pdf')
 * @returns {string} Düzeltilmiş URL
 */
export function fixCloudinaryRawUrl(url, defaultExt = 'pdf') {
    if (!url) return url;

    // Cloudinary raw URL mi kontrol et
    const isCloudinaryRaw = url.includes('res.cloudinary.com') && url.includes('/raw/upload/');
    if (!isCloudinaryRaw) return url;

    // URL'nin sonunda zaten bir uzantı var mı kontrol et
    const urlPath = url.split('?')[0]; // Query string'i ayır
    const lastSegment = urlPath.split('/').pop();
    const hasExtension = lastSegment.includes('.') && lastSegment.split('.').pop().length <= 5;

    if (hasExtension) return url;

    // Uzantı ekle
    return url + '.' + defaultExt;
}

/**
 * Dosya URL'sini tarayıcıda görüntüleme için hazırlar
 * Mobil cihazlarda Google Docs Viewer üzerinden açar (iOS/Android uyumlu)
 * Desktop'ta doğrudan Cloudinary URL'si kullanılır
 * 
 * @param {string} url - Dosya URL'si
 * @returns {string} Düzeltilmiş URL
 */
export function getViewableFileUrl(url) {
    if (!url) return url;

    // Cloudinary raw URL'lerini düzelt
    const fixedUrl = fixCloudinaryRawUrl(url, 'pdf');

    // Mobil cihaz tespiti
    const isMobile = typeof navigator !== 'undefined' &&
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Mobilde Cloudinary raw PDF'lerini Google Docs Viewer ile aç
    if (isMobile && fixedUrl.includes('res.cloudinary.com') && fixedUrl.includes('/raw/upload/')) {
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fixedUrl)}`;
    }

    return fixedUrl;
}

/**
 * Dosya için doğrudan indirme URL'si oluşturur
 * 
 * @param {string} url - Dosya URL'si
 * @returns {string} İndirme URL'si
 */
export function getDownloadUrl(url) {
    if (!url) return url;
    return fixCloudinaryRawUrl(url, 'pdf');
}
