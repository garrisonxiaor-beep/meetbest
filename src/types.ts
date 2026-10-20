export type Source = { title: string; url: string };
export type Exercise = {
  id: string;
  name: string;
  bodyPart: '胸部' | '背部' | '肩部' | '腿臀' | '手臂' | '腹部' | '全身';
  equipment: string;
  difficulty: '入门' | '基础' | '进阶';
  category: '力量' | '热身' | '拉伸';
  muscles: string[];
  summary: string;
  steps: string[];
  tips: string[];
  prescription: string;
  video: {
    url: string;
    appUrl?: string;
    platform: '抖音' | '哔哩哔哩';
    title: string;
    author: string;
    startLabel?: string;
  } | null;
  sources: Source[];
};
export type Supplement = {
  id: string;
  name: string;
  englishName: string;
  category: string;
  goals: string[];
  evidence: '证据较充分' | '特定情境' | '证据有限';
  summary: string;
  benefits: string[];
  suitableFor: string[];
  cautions: string[];
  usage: string;
  selectionTips: string[];
  myths: { question: string; answer: string }[];
  sources: Source[];
  reviewedAt: string;
};
export type Plan = {
  id: string;
  name: string;
  daysPerWeek: number;
  level: string;
  description: string;
  sources?: Source[];
  days: {
    title: string;
    subtitle: string;
    warmup: string;
    exercises: { exerciseId: string; sets: string | number; reps: string; rest: string; note: string }[];
  }[];
};
export type Content = {
  exercises: Exercise[];
  supplements: Supplement[];
  plans: Plan[];
  meta: { name: string; updatedAt: string; description: string };
};
