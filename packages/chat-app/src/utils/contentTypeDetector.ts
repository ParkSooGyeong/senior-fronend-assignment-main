import { ContentType } from '../types/chat';

export const detectContentType = (content: string): ContentType => {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('markdown')) {
    return 'markdown';
  }
  if (lowerContent.includes('html')) {
    return 'html';
  }
  if (lowerContent.includes('json')) {
    return 'json';
  }

  try {
    JSON.parse(content);
    return 'json';
  } catch (e) {
    // Continue checking other types
  }

  const markdownFeatures = [
    /^#\s/m,           // Headers
    /\*\*.+\*\*/,      // Bold
    /\*.+\*/,          // Italic
    /\[.+\]\(.+\)/,    // Links
    /```[\s\S]+```/,   // Code blocks
    /^\s*[-*+]\s/m,    // Lists
    /\|.+\|.+\|/,      // Tables
  ];

  if (markdownFeatures.some(pattern => pattern.test(content))) {
    return 'markdown';
  }

  const htmlPattern = /<[a-z][\s\S]*>/i;
  if (htmlPattern.test(content)) {
    return 'html';
  }

  return 'text';
}; 