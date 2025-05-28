/**
 * Security Service Class - Güvenlik işlemleri için merkezi servis
 * XSS, CSRF, input validation ve diğer güvenlik önlemleri
 */

class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  /**
   * Singleton pattern
   */
  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * XSS saldırılarına karşı string temizleme
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // HTML tag karakterlerini kaldır
      .replace(/javascript:/gi, '') // JavaScript protokolünü kaldır
      .replace(/on\w+=/gi, '') // Event handler'ları kaldır
      .replace(/script/gi, '') // Script kelimesini kaldır
      .trim();
  }

  /**
   * HTML içeriğini güvenli hale getir
   */
  sanitizeHtml(html: string): string {
    if (typeof html !== 'string') return '';
    
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi;
    
    return html.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  }

  /**
   * Email formatını doğrula
   */
  validateEmail(email: string): boolean {
    if (typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Güçlü şifre kontrolü
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (typeof password !== 'string') {
      return { isValid: false, errors: ['Şifre geçersiz format'] };
    }

    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }

    if (password.length > 128) {
      errors.push('Şifre en fazla 128 karakter olabilir');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }

    if (!/\d/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Şifre en az bir özel karakter içermelidir');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Telefon numarası doğrula (Türkiye formatı)
   */
  validatePhoneNumber(phone: string): boolean {
    if (typeof phone !== 'string') return false;
    
    // Türkiye telefon numarası formatları
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    return phoneRegex.test(cleanPhone);
  }

  /**
   * URL güvenliğini kontrol et
   */
  validateUrl(url: string): boolean {
    if (typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Dosya uzantısını kontrol et
   */
  validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
    if (typeof filename !== 'string') return false;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * Dosya boyutunu kontrol et (bytes)
   */
  validateFileSize(size: number, maxSize: number): boolean {
    return typeof size === 'number' && size > 0 && size <= maxSize;
  }

  /**
   * SQL Injection saldırılarına karşı string temizleme
   */
  sanitizeSqlInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/['";\\]/g, '') // SQL özel karakterlerini kaldır
      .replace(/--/g, '') // SQL yorum satırlarını kaldır
      .replace(/\/\*/g, '') // SQL çok satırlı yorum başlangıcını kaldır
      .replace(/\*\//g, '') // SQL çok satırlı yorum bitişini kaldır
      .trim();
  }

  /**
   * Rate limiting için basit kontrol
   */
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * CSRF token oluştur
   */
  generateCsrfToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Input değerini sayıya güvenli dönüştür
   */
  safeParseNumber(input: any, defaultValue: number = 0): number {
    if (typeof input === 'number' && !isNaN(input)) {
      return input;
    }
    
    if (typeof input === 'string') {
      const parsed = parseFloat(input);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    return defaultValue;
  }

  /**
   * Input değerini integer'a güvenli dönüştür
   */
  safeParseInt(input: any, defaultValue: number = 0): number {
    if (typeof input === 'number' && Number.isInteger(input)) {
      return input;
    }
    
    if (typeof input === 'string') {
      const parsed = parseInt(input, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    return defaultValue;
  }

  /**
   * Güvenli JSON parse
   */
  safeJsonParse<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Hassas bilgileri loglardan temizle
   */
  sanitizeLogData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeLogData(sanitized[key]);
      }
    });

    return sanitized;
  }
}

// Singleton instance export
const securityService = SecurityService.getInstance();

export default securityService;
export { SecurityService };
