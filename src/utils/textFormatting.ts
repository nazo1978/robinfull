/**
 * Text formatting utilities for consistent product display
 */

/**
 * Ürün/başlık ismini büyük harfe çevirir (tüm ürün türleri için)
 * @param text - Formatlanacak metin
 * @returns Büyük harflerle formatlanmış metin
 */
export const formatTitle = (text: string): string => {
  if (!text) return '';
  return text.toUpperCase().trim();
};

/**
 * Açıklamayı ilk harf büyük, gerisi küçük olacak şekilde formatlar
 * @param text - Formatlanacak metin
 * @returns İlk harf büyük, gerisi küçük formatlanmış metin
 */
export const formatDescription = (text: string): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
