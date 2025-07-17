# AI Chat Interface

> ChatGPT/Claude 스타일의 모던하고 깔끔한 AI 채팅 인터페이스

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
# 프로젝트 루트 디렉토리에서
pnpm install

# 또는 npm 사용 시
npm install
```

### 2. API Mock 라이브러리 빌드
```bash
# OpenAI API Mock 패키지 빌드
pnpm --filter openai-api-mock build
```

### 3. 개발 서버 실행
```bash
# 메인 프로젝트에서 실행
pnpm dev

# 또는 직접 chat-app 패키지 실행
cd packages/chat-app
pnpm dev
```

### 4. 브라우저에서 확인
브라우저에서 `http://localhost:3000` (또는 `http://localhost:3001`)에 접속하여 채팅 앱을 사용해보세요!

## ✨ 주요 기능

### 📝 필수 구현 사항 (100% 완료)

#### 1. 채팅 UI
- ✅ **사용자와 AI 구분**: 명확한 아바타와 배경으로 구분
- ✅ **메시지 입력 폼**: 자동 높이 조절, 키보드 단축키 지원
- ✅ **스크롤 처리**: 새 메시지 자동 포커스, 가상 스크롤링으로 성능 최적화

#### 2. 스트리밍 응답 처리
- ✅ **실시간 타이핑 효과**: `stream: true`로 실시간 렌더링
- ✅ **점진적 렌더링**: 글자별 스트리밍 표시
- ✅ **스트리밍 취소**: 응답 중 언제든 취소 가능

#### 3. 콘텐츠 타입별 렌더링
- ✅ **Markdown**: 제목, 리스트, 코드블록, 테이블 완전 지원
- ✅ **HTML**: DOMPurify로 XSS 방지하며 안전한 렌더링
- ✅ **JSON**: 구조화된 JSON 데이터를 코드블록으로 표시
- ✅ **일반 텍스트**: 기본 텍스트 렌더링

#### 4. 에러 및 취소 처리
- ✅ **네트워크 오류**: 적절한 에러 메시지와 재시도 기능
- ✅ **요청 취소**: AbortController를 사용한 안전한 취소
- ✅ **재시도 메커니즘**: 실패한 메시지 개별 재시도

### 🎯 도전과제 (95% 완료)

#### 1. 응답 편집, 재생성
- ✅ **메시지 편집**: 사용자/AI 메시지 모두 편집 가능
- ✅ **응답 재생성**: AI 응답을 다시 생성
- ✅ **실시간 편집**: 편집 중 즉시 UI 업데이트

#### 2. 오프라인 모드
- ✅ **네트워크 상태 감지**: 온라인/오프라인 자동 감지
- ✅ **오프라인 응답**: 미리 정의된 응답으로 체험 가능
- ✅ **상태 표시**: 현재 연결 상태 실시간 표시

#### 3. 채팅 히스토리
- ✅ **자동 저장**: localStorage 기반 대화 기록 저장
- ✅ **내보내기/가져오기**: JSON 파일로 백업/복원
- ✅ **히스토리 관리**: 대화 초기화, 선택적 삭제

#### 4. 성능 최적화
- ✅ **가상 스크롤링**: 대량 메시지 처리
- ✅ **메모이제이션**: React.memo, useMemo 활용
- ✅ **지연 로딩**: 필요시에만 컴포넌트 로드
- ✅ **디바운싱**: 검색, 입력 최적화

#### 5. 접근성 (A11y)
- ✅ **키보드 네비게이션**: 모든 기능 키보드로 접근 가능
- ✅ **ARIA 속성**: 스크린 리더 완전 지원
- ✅ **시각적 표시**: 포커스, 선택 상태 명확히 표시
- ✅ **키보드 단축키**: 효율적인 키보드 사용

#### 6. 사용자 경험 개선
- ✅ **다중 테마**: 라이트/다크/시스템 자동
- ✅ **검색 기능**: Ctrl+F로 메시지 전체 검색
- ✅ **메시지 하이라이팅**: 검색 결과 강조 표시
- ✅ **토스트 알림**: 작업 완료/실패 알림
- ✅ **코드 복사**: 코드블록 일클릭 복사

## 🎮 사용법

### 기본 사용법
1. **메시지 입력**: 하단 입력창에 질문 작성
2. **빠른 예시**: 입력창 아래 버튼들로 다양한 콘텐츠 타입 체험
3. **메시지 편집**: 메시지에 마우스 올려서 편집 버튼 클릭
4. **응답 재생성**: AI 메시지의 재생성 버튼으로 다른 답변 요청

### 테스트 메시지
다음 메시지들로 각 기능을 테스트해보세요:

```
📝 Markdown: "markdown 예시를 보여주세요"
🔖 HTML: "html 태그 예시를 주세요"  
📊 JSON: "json 형태로 데이터를 주세요"
👋 일반: "안녕하세요"
```

### 키보드 단축키
- `Enter`: 메시지 전송
- `Shift+Enter`: 줄바꿈
- `Ctrl+F`: 메시지 검색
- `?`: 키보드 단축키 도움말
- `↑/↓` 또는 `j/k`: 메시지 탐색
- `e`: 선택한 메시지 편집
- `r`: 선택한 메시지 재생성
- `Esc`: 닫기/취소

## 🛠 기술 스택

### Frontend
- **React 18** - 최신 React 기능 활용
- **TypeScript** - 완전한 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 스타일링
- **Zustand** - 간결한 상태 관리

### 주요 라이브러리
- **react-markdown** - Markdown 렌더링
- **react-syntax-highlighter** - 코드 하이라이팅
- **dompurify** - XSS 방지 HTML 정화
- **react-hot-toast** - 사용자 알림
- **openai** - OpenAI API 클라이언트

### 개발 도구
- **Vite** - 빠른 개발 서버
- **Vitest** - 테스트 프레임워크
- **ESLint** - 코드 품질 관리
- **pnpm** - 효율적인 패키지 관리

## 📁 프로젝트 구조

```
packages/chat-app/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── ChatInterface/   # 채팅 관련 컴포넌트
│   │   │   ├── index.tsx           # 메인 채팅 인터페이스
│   │   │   ├── Message.tsx         # 개별 메시지 컴포넌트
│   │   │   ├── MessageInput.tsx    # 메시지 입력
│   │   │   ├── MessageList.tsx     # 메시지 목록
│   │   │   ├── MessageEditor.tsx   # 메시지 편집기
│   │   │   ├── SearchBar.tsx       # 검색 바
│   │   │   ├── OfflineIndicator.tsx # 오프라인 표시
│   │   │   └── ChatExportImport.tsx # 백업/복원
│   │   ├── CodeBlock.tsx     # 코드 블록 렌더링
│   │   ├── ThemeToggle.tsx   # 테마 전환
│   │   ├── KeyboardHelp.tsx  # 키보드 도움말
│   │   └── VirtualScroller.tsx # 가상 스크롤링
│   ├── hooks/               # 커스텀 훅
│   │   ├── useA11y.ts       # 접근성 훅
│   │   ├── useKeyboardNavigation.ts # 키보드 탐색
│   │   └── useMessageQueue.ts # 메시지 큐 관리
│   ├── services/            # 비즈니스 로직
│   │   └── chatService.ts   # 채팅 서비스
│   ├── store/               # 상태 관리
│   │   ├── chatStore.ts     # 채팅 상태
│   │   └── themeStore.ts    # 테마 상태
│   ├── types/               # TypeScript 타입
│   │   └── chat.ts          # 채팅 관련 타입
│   ├── utils/               # 유틸리티 함수
│   │   ├── chatExport.ts    # 채팅 내보내기/가져오기
│   │   ├── contentTypeDetector.ts # 콘텐츠 타입 감지
│   │   └── performance.ts   # 성능 최적화 유틸
│   └── __tests__/           # 테스트 파일
│       ├── chatService.test.ts
│       ├── contentTypeDetector.test.ts
│       └── chatExport.test.ts
└── ...
```

## 🧪 테스트

```bash
# 모든 테스트 실행
pnpm test

# 테스트 커버리지 확인
pnpm test --coverage

# 특정 테스트 파일 실행
pnpm test chatService.test.ts
```

### 테스트 커버리지
- ✅ **ChatService**: API 호출, 스트리밍, 에러 처리
- ✅ **ContentTypeDetector**: 마크다운, HTML, JSON 감지
- ✅ **ChatExport**: 내보내기/가져오기 기능
- ✅ **성능 최적화**: 메모이제이션, 디바운싱

## 🚀 빌드 및 배포

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview

# 타입 검사
pnpm tsc --noEmit

# 린팅
pnpm lint
```

## 🔧 설정 및 커스터마이징

### 환경 변수
현재는 Mock API를 사용하므로 별도 환경 변수가 필요하지 않습니다. 실제 OpenAI API를 사용하려면:

```env
VITE_OPENAI_API_KEY=your_api_key_here
```

### Mock 응답 커스터마이징
`src/services/chatService.ts`에서 `mockResponses` 객체를 수정하여 다른 응답을 테스트할 수 있습니다.

## 📝 개발 노트

### 핵심 설계 원칙
1. **사용자 중심**: ChatGPT/Claude와 유사한 직관적 UX
2. **성능 우선**: 가상 스크롤링, 메모이제이션으로 최적화
3. **접근성 완비**: 모든 사용자가 접근 가능한 UI
4. **확장 가능**: 모듈화된 구조로 쉬운 기능 추가
5. **타입 안전**: TypeScript로 런타임 오류 방지

### 주요 기술적 특징
- **스트리밍 처리**: 실시간 타이핑 효과로 자연스러운 대화
- **콘텐츠 타입 자동 감지**: 사용자 입력에 따른 적절한 렌더링
- **가상 스크롤링**: 수천 개 메시지도 부드럽게 처리
- **오프라인 대응**: 네트워크 없이도 기본 기능 사용 가능
- **키보드 중심**: 마우스 없이도 모든 기능 사용 가능

## 🤝 기여 가이드

1. Fork 후 브랜치 생성
2. 변경사항 구현
3. 테스트 추가/수정
4. 린팅 및 타입 검사 통과
5. Pull Request 생성

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🔗 관련 링크

- [과제 원본 명세](../../README.md)
- [OpenAI API Mock 라이브러리](../openai-api-mock/README.md)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com)

---

**🎉 완성된 AI 채팅 인터페이스를 체험해보세요!**

모든 필수 사항과 도전과제가 구현되어 있어 실제 AI 서비스와 동일한 경험을 제공합니다. 