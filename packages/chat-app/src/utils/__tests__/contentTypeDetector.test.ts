import { describe, it, expect } from 'vitest';
import { detectContentType } from '../contentTypeDetector';

describe('detectContentType', () => {
  it('should detect markdown from keywords', () => {
    expect(detectContentType('markdown 예시를 보여주세요')).toBe('markdown');
    expect(detectContentType('md 파일을 만들어주세요')).toBe('markdown');
  });

  it('should detect html from keywords', () => {
    expect(detectContentType('html 태그 예시를 주세요')).toBe('html');
    expect(detectContentType('HTML 코드를 작성해주세요')).toBe('html');
  });

  it('should detect json from keywords', () => {
    expect(detectContentType('json 형태로 데이터를 주세요')).toBe('json');
    expect(detectContentType('JSON 파일을 만들어주세요')).toBe('json');
  });

  it('should detect json from valid JSON content', () => {
    const jsonContent = '{"name": "test", "value": 123}';
    expect(detectContentType(jsonContent)).toBe('json');
  });

  it('should detect markdown from content features', () => {
    expect(detectContentType('# 제목\n\n내용입니다.')).toBe('markdown');
    expect(detectContentType('**굵은 글씨** 입니다.')).toBe('markdown');
    expect(detectContentType('- 리스트\n- 항목')).toBe('markdown');
    expect(detectContentType('[링크](http://example.com)')).toBe('markdown');
    expect(detectContentType('```\ncode block\n```')).toBe('markdown');
  });

  it('should handle overlapping content types', () => {
    expect(detectContentType('json 키워드가 있는 **markdown** 텍스트')).toBe('json');
    expect(detectContentType('<p>HTML과 **markdown**</p>')).toBe('html');
    expect(detectContentType('<div>{"json": "data"}</div>')).toBe('html');
    expect(detectContentType('<p>HTML content</p>')).toBe('html');
  });

  it('should default to text for plain content', () => {
    expect(detectContentType('안녕하세요')).toBe('text');
    expect(detectContentType('일반 텍스트입니다')).toBe('text');
    expect(detectContentType('12345')).toBe('text');
  });
}); 