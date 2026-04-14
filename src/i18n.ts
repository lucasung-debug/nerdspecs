export const messages = {
  en: {
    whyBuilt: 'Why did you build this project?',
    continue: 'Continue?',
    yes: 'Yes',
    no: 'No',
    welcome: "Welcome to NerdSpecs! Let's set things up.",
    chooseLang: 'Choose your language',
    stepLang: 'Step 1/4: Choose your language',
    stepSave: 'Step 2/4: Save your preferences',
    stepCheck: 'Step 3/4: Check connection',
    stepRef: 'Step 4/4: Quick reference',
    allSet: "You're all set! Run `nerdspecs write` to get started.",
  },
  ko: {
    whyBuilt: '이 프로젝트를 왜 만들었나요?',
    continue: '계속할까요?',
    yes: '네',
    no: '아니요',
    welcome: 'NerdSpecs에 오신 걸 환영합니다! 설정을 시작합니다.',
    chooseLang: '언어를 선택하세요',
    stepLang: '1/4단계: 언어 선택',
    stepSave: '2/4단계: 설정 저장',
    stepCheck: '3/4단계: 연결 확인',
    stepRef: '4/4단계: 빠른 참조',
    allSet: '준비 완료! `nerdspecs write`로 시작하세요.',
  },
  zh: {
    whyBuilt: '你为什么要做这个项目？',
    continue: '继续吗？',
    yes: '是',
    no: '否',
    welcome: '欢迎使用 NerdSpecs！让我们开始设置。',
    chooseLang: '选择语言',
    stepLang: '步骤 1/4：选择语言',
    stepSave: '步骤 2/4：保存偏好',
    stepCheck: '步骤 3/4：检查连接',
    stepRef: '步骤 4/4：快速参考',
    allSet: '一切就绪！运行 `nerdspecs write` 开始使用。',
  },
} as const;

type Lang = keyof typeof messages;
type MsgKey = keyof typeof messages.en;

export function t(key: MsgKey, lang: string = 'en'): string {
  const l = (lang in messages ? lang : 'en') as Lang;
  return messages[l][key] ?? messages.en[key];
}
