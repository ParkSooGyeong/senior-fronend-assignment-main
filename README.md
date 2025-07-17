# 넥스트챕터 시니어 프론트엔드 개발자 채용 과제

AI 채팅 인터페이스 구현 과제입니다.

## 기술 스택

- **React 18** + **TypeScript**
- **Tailwind CSS** (스타일링)
- **Zustand** (상태 관리)
- **Vite** (빌드 도구)
- **pnpm** (패키지 관리)

## 실행 방법

### 1. 패키지 설치
```bash
pnpm install
```

### 2. API Mock 라이브러리 빌드
```bash
pnpm --filter openai-api-mock build
```

### 3. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`에 접속하여 사용할 수 있습니다.

## 필수 구현 사항

### ✅ 1. 채팅 UI
- 사용자와 AI 구분되는 말풍선 디자인
- 메시지 입력 폼과 전송 기능 (Enter 키 지원)
- 스크롤 처리 및 최신 메시지 자동 포커스
- 가상 스크롤링으로 성능 최적화

### ✅ 2. 스트리밍 응답 처리
- 실시간 타이핑 효과 구현
- 글자별 점진적 렌더링
- 스트리밍 중 취소 기능 (AbortController 사용)

### ✅ 3. 콘텐츠 타입별 렌더링

각 타입을 테스트할 수 있는 예시 버튼이 제공됩니다:

#### Markdown
- **테스트**: "markdown 예시를 보여주세요"
- **구현**: react-markdown, 코드 하이라이팅, 테이블 지원

#### HTML
- **테스트**: "html 태그 예시를 주세요"
- **구현**: DOMPurify로 XSS 방지하며 안전한 렌더링

#### JSON
- **테스트**: "json 형태로 데이터를 주세요"
- **구현**: 구조화된 JSON 데이터 표시

#### 일반 텍스트
- **테스트**: "안녕하세요"
- **구현**: 기본 텍스트 렌더링

### ✅ 4. 에러 및 취소 처리
- 네트워크 오류 시 적절한 에러 메시지 표시
- 요청 중 취소 기능
- 재시도 메커니즘

## 도전과제 구현 현황

### ✅ 응답 편집, 재생성
- 메시지 호버 시 편집/재생성 버튼 표시
- 사용자 메시지 편집 가능
- AI 응답 재생성 기능

### ✅ 오프라인 모드
- 네트워크 상태 자동 감지
- 오프라인 시 미리 정의된 응답 제공
- 연결 상태 표시

### ✅ 채팅 히스토리
- localStorage 기반 자동 저장
- JSON 파일로 백업/복원 기능
- 채팅 기록 초기화

### ✅ 성능 최적화
- 가상 스크롤링으로 대량 메시지 처리
- React.memo, useMemo를 활용한 메모이제이션
- 검색 시 디바운싱 적용

### ✅ 접근성
- 키보드 네비게이션 완전 지원
- ARIA 속성 적용
- 스크린 리더 지원
- 키보드 단축키 (`?` 키로 도움말)

### ✅ 사용자 경험 개선
- 다크모드/라이트모드 지원
- 전체 메시지 검색 기능 (`Ctrl+F`)
- 토스트 알림 시스템
- 코드 블록 복사 기능

## 프로젝트 구조

```
senior-frontend-assignment/
├── packages/
│   ├── chat-app/              # 메인 채팅 애플리케이션
│   │   ├── src/
│   │   │   ├── components/    # React 컴포넌트
│   │   │   ├── hooks/         # 커스텀 훅
│   │   │   ├── services/      # API 서비스
│   │   │   ├── store/         # 상태 관리
│   │   │   ├── utils/         # 유틸리티 함수
│   │   │   └── types/         # TypeScript 타입
│   │   └── __tests__/         # 테스트 파일
│   └── openai-api-mock/       # API Mock 라이브러리
└── package.json
```

## API Mock 서버

Mock 서버는 Express.js로 구현되어 8080 포트에서 실행됩니다:

- **Health Check**: `GET http://localhost:8080/health`
- **Chat Completions**: `POST http://localhost:8080/v1/chat/completions`
- **Config**: `GET http://localhost:8080/config`

Mock 응답은 사용자 입력의 키워드를 분석하여 적절한 콘텐츠 타입의 응답을 생성합니다.

## 테스트

```bash
# 모든 테스트 실행
pnpm test

# 빌드 테스트
pnpm build
```

32개의 테스트가 포함되어 있으며 핵심 기능들을 검증합니다.

## 기술적 특징

### 상태 관리
- Zustand를 사용한 간결한 전역 상태 관리
- localStorage 연동으로 데이터 영속성

### 컴포넌트 설계
- 모듈화된 컴포넌트 구조
- React.memo를 활용한 렌더링 최적화

### 타입 안전성
- 100% TypeScript 적용
- 엄격한 타입 검사로 런타임 오류 방지

### 스타일링
- Tailwind CSS 유틸리티 클래스
- 다크모드 지원
- 반응형 디자인

## 주요 라이브러리

- `react-markdown`: Markdown 렌더링
- `dompurify`: XSS 방지
- `react-syntax-highlighter`: 코드 하이라이팅
- `react-hot-toast`: 알림 시스템
- `zustand`: 상태 관리

## 문제 해결 접근법

### 콘텐츠 타입 감지
키워드 기반 + 패턴 매칭을 통한 자동 콘텐츠 타입 감지:
```typescript
export const detectContentType = (content: string): ContentType => {
  // 키워드 우선 검사
  if (content.includes('markdown')) return 'markdown';
  if (content.includes('json')) return 'json';
  
  // 패턴 매칭
  if (markdownFeatures.some(pattern => pattern.test(content))) {
    return 'markdown';
  }
  // ...
}
```

### 스트리밍 처리
AbortController를 활용한 안전한 스트리밍 취소:
```typescript
const abortController = new AbortController();
const stream = await openai.chat.completions.create({
  // ...
  signal: abortController.signal
});
```

### 성능 최적화
가상 스크롤링으로 대량 메시지 처리:
```typescript
const VirtualScroller = ({ items, renderItem, itemHeight }) => {
  // 보이는 영역의 아이템만 렌더링
}
```

## 향후 개선 사항

- E2E 테스트 추가
- 더 많은 콘텐츠 타입 지원 (이미지, 파일 등)
- 다국어 지원
- PWA 변환

---

이 프로젝트는 실제 AI 서비스에서 마주할 수 있는 다양한 응답 형태를 처리하는 능력을 중심으로 구현되었습니다.
