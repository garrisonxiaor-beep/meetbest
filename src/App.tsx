import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Content, Exercise, Source, Supplement } from './types';

type Page = 'exercises' | 'plans' | 'nutrition' | 'supplements';
type IconName = 'arrow' | 'search' | 'bookmark' | 'close' | 'play' | 'check' | 'copy' | 'external' | 'exercise' | 'plan' | 'nutrition' | 'supplement' | 'filter' | 'chevron' | 'info' | 'refresh';
const navigation: { id: Page; label: string; icon: IconName }[] = [
  { id: 'exercises', label: '动作库', icon: 'exercise' },
  { id: 'plans', label: '训练计划', icon: 'plan' },
  { id: 'nutrition', label: '饮食工具', icon: 'nutrition' },
  { id: 'supplements', label: '补剂指南', icon: 'supplement' },
];
const bodyParts = ['全部', '胸部', '背部', '肩部', '腿臀', '手臂', '腹部', '全身'];
const bodyEnglish: Record<string, string> = { 胸部: 'CHEST', 背部: 'BACK', 肩部: 'SHOULDERS', 腿臀: 'LEGS & GLUTES', 手臂: 'ARMS', 腹部: 'CORE', 全身: 'FULL BODY' };
const evidenceClass: Record<string, string> = { 证据较充分: 'strong', 特定情境: 'context', 证据有限: 'limited' };
const safeExternal = (url: string) => /^https?:\/\//i.test(url) ? url : '#';
const safeApp = (url: string) => /^(snssdk1128|snssdk2329|aweme|douyin|bilibili):\/\//i.test(url) || /^https:\/\//i.test(url) ? url : null;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const jumpTo = (id: string) => {
  const element = document.getElementById(id);
  element?.focus({ preventScroll: true });
  element?.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' });
};

function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    search: <><circle cx="10.7" cy="10.7" r="6.5" /><path d="m16 16 4.2 4.2" /></>,
    bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    play: <path d="m9 5 11 7-11 7V5Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 8V4H4v11h4" /></>,
    external: <><path d="M14 4h6v6M20 4 10 14" /><path d="M10 4H4v16h16v-6" /></>,
    exercise: <><path d="m6 9 9 9M9 6l9 9M3 8l5-5M16 21l5-5M2 5l3-3M19 22l3-3M4 10l6-6M14 20l6-6" /></>,
    plan: <><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2" /></>,
    nutrition: <><path d="M8 3v6c0 3-4 3-4 0V3M6 3v18M17 3c-5 5-5 10 0 10V3Zm0 10v8" /></>,
    supplement: <><path d="m7.5 4.5-3 3a6 6 0 0 0 0 8.5l3.5 3.5a6 6 0 0 0 8.5 0l3-3a6 6 0 0 0 0-8.5L16 4.5a6 6 0 0 0-8.5 0Z" /><path d="m7 7 10 10" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    chevron: <path d="m8 5 7 7-7 7" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.2" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14-5L3 9M3 3v6h6M4 13a8 8 0 0 0 14 5l3-3M21 21v-6h-6" /></>,
  };
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Brand() {
  return <span className="brand"><span className="brand-symbol" aria-hidden="true"><span /><span /><span /></span><span className="brand-type">练有据<span>TRAIN WITH REASON</span></span><span className="brand-dot" /></span>;
}

function MuscleDiagram({ body, small = false }: { body: string; small?: boolean }) {
  const active = 'var(--diagram-accent)';
  const muted = 'var(--diagram-muted)';
  const is = (...values: string[]) => values.includes(body) || body === '全身';
  return <svg className={`muscle-diagram ${small ? 'small' : ''}`} viewBox="0 0 210 235" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1" opacity=".13"><circle cx="105" cy="114" r="72" /><circle cx="105" cy="114" r="92" /><path d="M105 8v220M7 114h196" /></g>
    <g stroke="var(--diagram-stroke)" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M91 48v9l-14 7-17 7-8 27-10 31 9 5 17-28 9-15 4 34-7 29 3 29 4 39 12 1 9-43 3-25 3 25 9 43 12-1 4-39 3-29-7-29 4-34 9 15 17 28 9-5-10-31-8-27-17-7-14-7v-9" fill="var(--diagram-base)" />
      <path d="M90 23c2-12 28-12 30 0l-1 20-8 10H99l-8-10-1-20Z" fill="var(--diagram-base)" />
      <path d="m41 129-4 10 3 7 6-1 6-12M169 129l4 10-3 7-6-1-6-12M81 221l-4 7h17l-1-7M117 221l-1 7h17l-4-7" fill="var(--diagram-base)" />
    </g>
    <g fill={is('肩部') ? active : muted}><path d="m77 65-14 7-7 23 10 1 13-20Z" /><path d="m133 65 14 7 7 23-10 1-13-20Z" /></g>
    <g fill={is('手臂') ? active : muted}><path d="m57 98 9 2-8 16-7 10-5-2Z" /><path d="m153 98-9 2 8 16 7 10 5-2Z" /></g>
    {body === '背部' ? <g fill={active}><path d="m83 68 19 8v35l-16 15-5-35Z" /><path d="m127 68-19 8v35l16 15 5-35Z" /><path d="m96 59 9 6 9-6 7 7-16 10-16-10Z" /></g> : <g fill={is('胸部') ? active : muted}><path d="m82 70 20 3v23l-20-5-5-10Z" /><path d="m128 70-20 3v23l20-5 5-10Z" /></g>}
    <g fill={is('腹部') ? active : muted}><path d="M91 99h11v10H90Zm17 0h11l1 10h-12ZM90 113h12v10H91Zm18 0h12l-1 10h-11ZM92 127h10v10l-8-3Zm16 0h10l-2 7-8 3Z" /></g>
    <g fill={is('腿臀') ? active : muted}><path d="m81 140 20 3-6 35-9 17-5-19-3-22Z" /><path d="m129 140-20 3 6 35 9 17 5-19 3-22Z" /><path d="m83 190 9 7-3 18h-5Zm44 0-9 7 3 18h5Z" /></g>
    <g stroke="currentColor" opacity=".35"><path d="M14 171h29l14-12M157 55l13-12h26" /><circle cx="57" cy="159" r="2" /><circle cx="157" cy="55" r="2" /></g>
  </svg>;
}

function SupplementGraphic({ index }: { index: number }) {
  const gradient = useId();
  return <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="supplement-graphic">
    <defs><linearGradient id={gradient} x1="22" y1="15" x2="100" y2="108" gradientUnits="userSpaceOnUse"><stop stopColor="currentColor" stopOpacity=".05" /><stop offset="1" stopColor="currentColor" stopOpacity=".24" /></linearGradient></defs>
    <circle cx="60" cy="60" r="49" stroke="currentColor" opacity=".12" />
    <ellipse cx="61" cy="103" rx="27" ry="4" fill="currentColor" opacity=".08" />
    {index === 2 || index === 4 || index === 5 ? <g transform="rotate(32 60 60)"><rect x="41" y="22" width="38" height="77" rx="19" fill={`url(#${gradient})`} stroke="currentColor" strokeWidth="1.4" /><path d="M41 60h38M50 38q0-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M44 62h32v18a16 16 0 0 1-32 0Z" fill="currentColor" opacity=".32" /></g> : index === 3 ? <><path d="M38 24h44l5 73H33Z" fill={`url(#${gradient})`} stroke="currentColor" strokeWidth="1.4" /><path d="M38 31h44M34 88h52" stroke="currentColor" opacity=".5" /><path d="m64 44-14 19h10l-4 15 15-21H61Z" fill="currentColor" opacity=".55" /></> : <><rect x="36" y="23" width="48" height="11" rx="3" fill="currentColor" opacity=".6" /><path d="M37 34h46l6 11v48q0 7-7 7H38q-7 0-7-7V45Z" fill={`url(#${gradient})`} stroke="currentColor" strokeWidth="1.4" /><path d="M32 52h56v31H32Z" fill="currentColor" opacity=".08" /><path d="M44 63h32M44 70h20" stroke="currentColor" strokeWidth="2" opacity=".65" /><path d="M41 27v5m7-5v5m7-5v5m7-5v5m7-5v5m7-5v5" stroke="currentColor" opacity=".35" /></>}
  </svg>;
}

function SourceList({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return <section className="source-section"><h3>参考来源</h3><p className="muted small-text">可查看原始资料，了解适用范围与研究局限。</p><ul className="source-list">{sources.map((s, i) => <li key={`${s.url}-${i}`}><a href={safeExternal(s.url)} target="_blank" rel="noopener noreferrer"><span className="source-number">{String(i + 1).padStart(2, '0')}</span><span>{s.title}</span><Icon name="external" size={16} /></a></li>)}</ul></section>;
}

function Modal({ children, onClose, label, wide = false }: { children: ReactNode; onClose: () => void; label: string; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const closeTimer = useRef<number | null>(null);
  const outsidePointer = useRef(false);
  const [closing, setClosing] = useState(false);
  onCloseRef.current = onClose;
  const dismiss = () => {
    if (closeTimer.current !== null) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => onCloseRef.current(), prefersReducedMotion() ? 0 : 180);
  };
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;
  useEffect(() => {
    const el = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el?.showModal();
    const closeOnEscape = (event: Event) => { event.preventDefault(); dismissRef.current(); };
    el?.addEventListener('cancel', closeOnEscape);
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = originalOverflow;
      el?.removeEventListener('cancel', closeOnEscape); el?.close();
      // A helper can open another dialog; do not take focus away from that dialog.
      requestAnimationFrame(() => {
        if (!document.querySelector('dialog[open]')) {
          const target = trigger?.isConnected && !trigger.closest('[hidden], [inert]') ? trigger : document.getElementById('main-content');
          target?.focus({ preventScroll: true });
        }
      });
    };
  }, []);
  const isOutside = (event: React.PointerEvent<HTMLDialogElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  return <dialog ref={ref} className={`detail-modal ${wide ? 'wide' : ''} ${closing ? 'is-closing' : ''}`} aria-label={label} onPointerDown={event => { outsidePointer.current = event.target === event.currentTarget && isOutside(event); }} onPointerUp={event => { if (outsidePointer.current && event.target === event.currentTarget && isOutside(event)) dismiss(); outsidePointer.current = false; }}><div className="modal-inner"><button className="icon-button modal-close" onClick={dismiss} aria-label="关闭详情"><Icon name="close" /></button>{children}</div></dialog>;
}

function ExerciseDetail({ exercise, favorite, onFavorite }: { exercise: Exercise; favorite: boolean; onFavorite: () => void }) {
  const [copyState, setCopyState] = useState('');
  useEffect(() => { setCopyState(''); }, [exercise.id]);
  const copy = async () => {
    if (!exercise.video) return;
    try { await navigator.clipboard.writeText(exercise.video.url); setCopyState('已复制链接'); }
    catch { setCopyState('未能自动复制，请长按下方链接复制'); }
  };
  return <>
    <div className={`detail-top body-${bodyParts.indexOf(exercise.bodyPart)}`}>
      <div><p className="eyebrow">{bodyEnglish[exercise.bodyPart]} / 动作讲解</p><h2>{exercise.name}</h2><p className="detail-description">{exercise.summary}</p><div className="tag-row"><span>{exercise.equipment}</span><span>{exercise.difficulty}</span><span>{exercise.category}</span></div></div><MuscleDiagram body={exercise.bodyPart} />
    </div>
    <div className="detail-content">
      <div className="detail-facts"><div><span>主要训练部位</span><strong>{exercise.muscles.join(' · ')}</strong></div><button className={`text-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite}><Icon name={favorite ? 'check' : 'bookmark'} size={17} />{favorite ? '已收藏动作' : '收藏动作'}</button></div>
      <section><h3><span className="section-marker">01</span>怎么做</h3><ol className="step-list">{exercise.steps.map((step, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol></section>
      <div className="two-detail-columns"><section className="detail-note"><h3>动作要点</h3><ul className="dot-list">{exercise.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></section><section className="detail-note alt"><h3>如何安排</h3><p>{exercise.prescription}</p><p className="small-text muted">先保证动作稳定，再逐步增加负荷。出现疼痛时停止该动作。</p></section></div>
      <section className="video-section"><div className="video-icon"><Icon name="play" size={25} /></div><div className="video-copy"><h3>跟着视频看一遍</h3>{exercise.video ? <><p>{exercise.video.title}</p><span className="muted small-text">{exercise.video.platform} · {exercise.video.author}{exercise.video.startLabel ? ` · ${exercise.video.startLabel}` : ''}</span></> : <p className="muted">这个动作暂未收录经过核验的视频教程，先参考上方动作说明与原始来源。</p>}</div>{exercise.video && <div className="video-actions">{exercise.video.appUrl && safeApp(exercise.video.appUrl) && <a className="primary-button small-button" href={safeApp(exercise.video.appUrl)!}>在{exercise.video.platform} App 打开<Icon name="external" size={15} /></a>}<a className="secondary-button small-button" href={safeExternal(exercise.video.url)} target="_blank" rel="noopener noreferrer">打开视频网页<Icon name="external" size={15} /></a><button className="text-button" onClick={copy}><Icon name="copy" size={15} />复制链接</button></div>}</section>
      {exercise.video && <div className="video-fallback"><p>如果没有安装 App，或当前浏览器未能唤起，请打开视频网页，也可以复制链接后在 App 中查看。</p><a href={safeExternal(exercise.video.url)} target="_blank" rel="noopener noreferrer">{exercise.video.url}</a><span role="status">{copyState}</span></div>}
      <SourceList sources={exercise.sources} />
    </div>
  </>;
}

function SupplementDetail({ item }: { item: Supplement }) {
  return <>
    <div className="supplement-detail-heading"><p className="eyebrow">THE SUPPLEMENT GUIDE / 成分档案</p><span className={`evidence-tag ${evidenceClass[item.evidence]}`}>{item.evidence}</span><h2>{item.name}<span>{item.englishName}</span></h2><p>{item.summary}</p><div className="tag-row">{item.goals.map(goal => <span key={goal}>{goal}</span>)}</div></div>
    <div className="detail-content">
      <div className="review-meta"><Icon name="check" size={16} />资料核对日期：{item.reviewedAt}<span>成分科普 · 非品牌推荐</span></div>
      <section><h3>证据支持什么</h3><ul className="dot-list">{item.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul></section>
      <div className="two-detail-columns"><section className="detail-note"><h3>哪些情境值得了解</h3><ul className="dot-list">{item.suitableFor.map((s, i) => <li key={i}>{s}</li>)}</ul></section><section className="detail-note caution"><h3>先看注意事项</h3><ul className="dot-list">{item.cautions.map((c, i) => <li key={i}>{c}</li>)}</ul></section></div>
      <section><h3>研究中的使用方式</h3><p className="body-copy">{item.usage}</p><p className="muted small-text">这里介绍一般研究与使用情境，不根据你的健康状况开具补充方案。</p></section>
      <section><h3>挑选时看什么</h3><ol className="step-list compact">{item.selectionTips.map((tip, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><p>{tip}</p></li>)}</ol></section>
      {item.myths.length > 0 && <section><h3>常见误区</h3><div className="myths">{item.myths.map((myth, i) => <details key={i}><summary>{myth.question}<Icon name="chevron" size={16} /></summary><p>{myth.answer}</p></details>)}</div></section>}
      <SourceList sources={item.sources} />
    </div>
  </>;
}

function ExerciseCard({ item, index, favorite, onFavorite, onOpen }: { item: Exercise; index: number; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return <article className={`exercise-card card-spotlight body-${bodyParts.indexOf(item.bodyPart)}`}>
    <div className="exercise-art"><button className="art-open" onClick={onOpen} aria-label={`查看${item.name}动作讲解`}><span className="art-eyebrow">{bodyEnglish[item.bodyPart]}</span><MuscleDiagram body={item.bodyPart} /><span className="art-play"><Icon name="play" size={18} /><span>查看动作</span></span><span className="art-caption">肌群示意 · {item.bodyPart}</span><span className="art-index">{String(index + 1).padStart(2, '0')}</span></button><button className={`favorite-button ${favorite ? 'active' : ''}`} onClick={onFavorite} aria-label={`${favorite ? '取消收藏' : '收藏'}${item.name}`} aria-pressed={favorite}><Icon name="bookmark" size={18} /></button></div>
    <button className="exercise-info" onClick={onOpen}><div className="card-kicker"><span>{item.bodyPart}</span><span className="difficulty"><i />{item.difficulty}</span></div><h3>{item.name}<Icon name="arrow" size={18} /></h3><p>{item.summary}</p><div className="card-meta"><span>{item.equipment}</span><span>{item.category}</span><span className="video-status">{item.video ? <><Icon name="play" size={12} />视频教程</> : '动作讲解'}</span></div></button>
  </article>;
}

function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><Icon name="search" size={30} /><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

function ExerciseLibrary({ data, favorites, toggleFavorite, openExercise, goPage }: { data: Content; favorites: string[]; toggleFavorite: (id: string) => void; openExercise: (id: string) => void; goPage: (page: Page) => void }) {
  const [query, setQuery] = useState('');
  const [body, setBody] = useState('全部');
  const [equipment, setEquipment] = useState('全部器械');
  const [category, setCategory] = useState('全部类型');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const equipmentOptions = [...new Set(data.exercises.map(item => item.equipment))];
  const filtered = useMemo(() => data.exercises.filter(item =>
    (body === '全部' || item.bodyPart === body) &&
    (equipment === '全部器械' || item.equipment === equipment) &&
    (category === '全部类型' || item.category === category) &&
    (!favoriteOnly || favorites.includes(item.id)) &&
    `${item.name} ${item.muscles.join(' ')} ${item.equipment} ${item.summary}`.toLowerCase().includes(query.trim().toLowerCase()),
  ), [data.exercises, body, equipment, category, favoriteOnly, favorites, query]);
  const clearFilters = () => { setQuery(''); setBody('全部'); setEquipment('全部器械'); setCategory('全部类型'); setFavoriteOnly(false); };
  return <>
    <PageIntro variant="exercises" index="01" eyebrow="THE MOVEMENT LIBRARY" title="每一次训练，" accent="有据可循。" description="找到适合的动作，看懂发力与细节。从一个动作开始，建立自己的训练节奏。" statValue={String(data.exercises.length).padStart(2, '0')} statLabel="常用动作资料" statNote={`${data.exercises.filter(item => item.video).length} 个视频教程 · 随时查阅`}><button className="primary-button" onClick={() => jumpTo('exercise-catalog')}>探索动作<Icon name="arrow" size={18} /></button><button className="hero-text-button" onClick={() => goPage('plans')}>找到训练计划<Icon name="chevron" size={16} /></button></PageIntro>
    <div className="content-with-aside" id="exercise-catalog" tabIndex={-1}><div className="catalog">
      <div className="section-heading"><div><span className="small-label">EXPLORE / 探索动作</span><h2>今天，练哪里？</h2></div><span className="soft-count">{data.exercises.length} 个动作</span></div>
      <div className="body-tabs" aria-label="按训练部位筛选">{bodyParts.map(part => <button key={part} className={body === part ? 'active' : ''} onClick={() => setBody(part)} aria-pressed={body === part}>{part}{part === '全部' && <span>{data.exercises.length}</span>}</button>)}</div>
      <div className="filter-toolbar"><label className="search-field"><Icon name="search" size={18} /><span className="sr-only">搜索动作名称、肌群或器械</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索动作、肌群或器械" />{query && <button onClick={() => setQuery('')} aria-label="清空搜索"><Icon name="close" size={15} /></button>}</label><label className="select-field"><span className="sr-only">器械筛选</span><select value={equipment} onChange={event => setEquipment(event.target.value)}><option>全部器械</option>{equipmentOptions.map(option => <option key={option}>{option}</option>)}</select></label><label className="select-field category-select"><span className="sr-only">动作类型筛选</span><select value={category} onChange={event => setCategory(event.target.value)}><option>全部类型</option><option>力量</option><option>热身</option><option>拉伸</option></select></label></div>
      <div className="results-bar"><span aria-live="polite">找到 <strong>{filtered.length}</strong> 个动作{body !== '全部' && <span className="result-body"> / {body}</span>}</span>{(query || body !== '全部' || equipment !== '全部器械' || category !== '全部类型') && <button className="text-button filter-reset" onClick={clearFilters}><Icon name="refresh" size={13} />清除筛选</button>}<button className={`text-button favorite-filter ${favoriteOnly ? 'active' : ''}`} onClick={() => setFavoriteOnly(!favoriteOnly)} aria-pressed={favoriteOnly}><Icon name="bookmark" size={15} />我的收藏 <span>{favorites.filter(id => data.exercises.some(e => e.id === id)).length}</span></button></div>
      {filtered.length ? <div className="exercise-grid">{filtered.map(item => <ExerciseCard key={item.id} item={item} index={data.exercises.findIndex(e => e.id === item.id)} favorite={favorites.includes(item.id)} onFavorite={() => toggleFavorite(item.id)} onOpen={() => openExercise(item.id)} />)}</div> : <EmptyState title={favoriteOnly ? '还没有符合条件的收藏' : '没有找到这个动作'} detail={favoriteOnly ? '点击动作卡片右上角的书签，就可以把常用动作留在这里。' : '换一个关键词，或者减少筛选条件再试试。'} action={<button className="secondary-button" onClick={clearFilters}>查看全部动作<Icon name="arrow" size={16} /></button>} />}
    </div><aside className="library-aside">
      <div className="aside-plan"><span className="small-label">MAKE IT A ROUTINE</span><h3>有计划，<br />更容易坚持。</h3><p>把零散的动作，<br />串成适合自己的训练节奏。</p><div className="week-mini" aria-hidden="true">{['一', '二', '三', '四', '五', '六', '日'].map((day, i) => <span key={day} className={[0, 2, 4].includes(i) ? 'train' : ''}>{day}<i>{[0, 2, 4].includes(i) ? '●' : '·'}</i></span>)}</div><button className="aside-link" onClick={() => goPage('plans')}>看看训练计划<Icon name="arrow" size={17} /></button><span className="plan-annotation">从每周 3 次，建立你的节奏</span></div>
      <div className="aside-note"><div className="note-heading"><span className="mini-square" /><span className="small-label">BEFORE YOU START</span></div><h3>练得稳，再加重量。</h3><p>先熟悉动作路径，保留余力。感受肌肉用力，也尊重身体发出的信号。</p><div className="note-rule" /><div className="check-line"><Icon name="check" size={14} />先做适当热身</div><div className="check-line"><Icon name="check" size={14} />从可控的负荷开始</div><div className="check-line"><Icon name="check" size={14} />疼痛时停止动作</div></div>
      <button className="aside-supplement" onClick={() => goPage('supplements')}><span className="supplement-mini-icon"><Icon name="supplement" size={23} /></span><span><strong>补剂，先懂再选。</strong><span>证据、情境与选购要点</span></span><Icon name="arrow" size={17} /></button>
      <p className="aside-footnote">知识会更新，训练也需要循序渐进。<br />资料最后更新于 {data.meta.updatedAt?.slice(0, 10)}。</p>
    </aside></div>
  </>;
}

function TrainingPlans({ data, openExercise }: { data: Content; openExercise: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState(data.plans[0]?.id ?? '');
  const [dayIndex, setDayIndex] = useState(0);
  const plan = data.plans.find(item => item.id === selectedId) ?? data.plans[0];
  if (!plan) return <EmptyState title="训练计划正在整理" detail="可以先从动作库中了解常用动作。" />;
  const day = plan.days[Math.min(dayIndex, plan.days.length - 1)];
  return <>
    <PageIntro variant="plans" index="02" statValue="03/04" statLabel="每周训练天数" statNote="适合自己的频率，更容易坚持" eyebrow="BUILD YOUR ROUTINE" title="让每一次训练，" accent="连成进步。" description="选一个可持续的频率，把动作、组数与休息安排清楚。按自己的恢复情况逐步调整。" />
    <div className="plans-layout"><aside className="plan-picker"><span className="small-label">选择训练节奏</span>{data.plans.map(item => <button key={item.id} className={`plan-option ${plan.id === item.id ? 'active' : ''}`} onClick={() => { setSelectedId(item.id); setDayIndex(0); }}><span className="plan-option-number">{item.daysPerWeek}<small>天 / 周</small></span><span><strong>{item.name}</strong><small>{item.level}</small></span><Icon name={plan.id === item.id ? 'check' : 'chevron'} size={18} /></button>)}<div className="aside-note plan-picker-note"><h3>坚持比排满更重要</h3><p>休息也是计划的一部分。根据训练经验、时间安排和恢复情况选择频率；不用把每一天都填满。</p></div></aside>
      <div className="plan-main"><div className="plan-summary"><div><span className="small-label">YOUR TRAINING OUTLINE</span><h2>{plan.name}</h2><p>{plan.description}</p></div><span className="plan-frequency">{plan.daysPerWeek}<small>次 / 周</small></span></div><div className="day-tabs" aria-label="选择训练日">{plan.days.map((d, i) => <button key={d.title} className={dayIndex === i ? 'active' : ''} onClick={() => setDayIndex(i)} aria-pressed={dayIndex === i}><span>DAY {String(i + 1).padStart(2, '0')}</span><strong>{d.title}</strong></button>)}</div>{day && <><div className="day-heading"><h3>{day.subtitle || day.title}</h3><span>{day.exercises.length} 个动作</span></div><div className="warmup-note"><Icon name="info" size={19} /><div><strong>从热身开始</strong><p>{day.warmup}</p></div></div><div className="plan-exercises">{day.exercises.map((entry, index) => { const exercise = data.exercises.find(e => e.id === entry.exerciseId); return <article className="plan-exercise" key={`${entry.exerciseId}-${index}`}><span className="plan-order">{String(index + 1).padStart(2, '0')}</span><div className={`plan-thumb body-${bodyParts.indexOf(exercise?.bodyPart ?? '')}`}><MuscleDiagram body={exercise?.bodyPart ?? '全身'} small /></div><div className="plan-exercise-description"><h4>{exercise?.name ?? '动作资料暂未收录'}</h4><p>{entry.note || exercise?.muscles.join(' · ')}</p><span className="mobile-plan-stats">{entry.sets} 组 × {entry.reps} · 休息 {entry.rest}</span></div><div className="plan-exercise-stat"><strong>{entry.sets} <span>组</span></strong><small>{entry.reps}</small></div><div className="plan-exercise-rest"><span>组间休息</span><strong>{entry.rest}</strong></div>{exercise && <button className="icon-button" aria-label={`查看${exercise.name}动作讲解`} onClick={() => openExercise(exercise.id)}><Icon name="arrow" size={20} /></button>}</article>; })}</div><div className="plan-bottom-note"><Icon name="info" size={17} /><p>这是一般训练模板。组数和次数可按经验、动作熟练度和恢复情况调整。刚开始时减少训练量，掌握动作后再递增。</p></div>{plan.sources && <SourceList sources={plan.sources} />}</>}</div>
    </div>
  </>;
}

function PageIntro({ eyebrow, title, accent, description, variant = 'plans', index = '02', statValue, statLabel, statNote, children }: { eyebrow: string; title: string; accent: string; description: string; variant?: Page; index?: string; statValue?: string; statLabel?: string; statNote?: string; children?: ReactNode }) {
  return <div className={`page-intro page-hero hero-${variant}`}>
    <div className="hero-copy"><p className="eyebrow"><span className="hero-index">{index} /</span>{eyebrow}</p><h1>{title}<em>{accent}</em></h1><p className="intro-description">{description}</p>{children && <div className="hero-actions">{children}</div>}</div>
    {statValue && <div className="intro-stat"><strong>{statValue}</strong><div>{statLabel}<span>{statNote}</span></div><span className="stat-line" /></div>}
  </div>;
}

type NutritionForm = { sex: 'male' | 'female'; age: string; height: string; weight: string; activity: string; goal: string };
type NutritionResult = { bmr: number; maintenance: number; calories: number; protein: number; fat: number; carbs: number; goal: string };
function NutritionCalculator() {
  const [form, setForm] = useState<NutritionForm>({ sex: 'male', age: '28', height: '175', weight: '70', activity: '1.375', goal: 'maintain' });
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [error, setError] = useState('');
  const update = (key: keyof NutritionForm, value: string) => { setForm(prev => ({ ...prev, [key]: value })); setError(''); setResult(null); };
  const calculate = (event: React.FormEvent) => {
    event.preventDefault();
    const age = Number(form.age), height = Number(form.height), weight = Number(form.weight), activity = Number(form.activity);
    if (!Number.isFinite(age) || age < 18 || age > 80 || !Number.isFinite(height) || height < 130 || height > 220 || !Number.isFinite(weight) || weight < 40 || weight > 200) {
      setError('请输入有效范围：年龄 18–80 岁，身高 130–220 cm，体重 40–200 kg。超出范围不适合使用这个通用估算工具。'); return;
    }
    const bmi = weight / (height / 100) ** 2;
    if (form.goal === 'reduce' && bmi < 18.5) {
      setResult(null);
      setError('当前身高体重对应的 BMI 低于 18.5，不适合使用本工具估算减脂热量。建议先咨询医生或注册营养师，了解适合你的饮食目标。'); return;
    }
    const bmr = 10 * weight + 6.25 * height - 5 * age + (form.sex === 'male' ? 5 : -161);
    const maintenance = bmr * activity;
    const calories = maintenance * (form.goal === 'reduce' ? .9 : form.goal === 'gain' ? 1.05 : 1);
    if (calories < 1500) { setError('该组输入得出的能量过低，不显示通用饮食目标。请核对输入，并向注册营养师咨询适合你的摄入量。'); return; }
    const protein = weight * 1.6;
    const fat = calories * .3 / 9;
    const carbs = (calories - protein * 4 - fat * 9) / 4;
    if (carbs <= 0) { setError('这组参数不适合通用营养分配，请咨询营养专业人员。'); return; }
    requestAnimationFrame(() => jumpTo('nutrition-result'));
    setResult({ bmr: Math.round(bmr), maintenance: Math.round(maintenance), calories: Math.round(calories / 10) * 10, protein: Math.round(protein), fat: Math.round(fat), carbs: Math.round(carbs), goal: form.goal });
  };
  return <>
    <PageIntro variant="nutrition" index="03" statValue="01" statLabel="找到饮食起点" statNote="你的数据，仅在本机计算" eyebrow="FOOD IS THE FOUNDATION" title="吃得明白，" accent="练得更好。" description="从身体数据估算日常能量需求，建立饮食起点。数字是参考，实际变化才是调整的依据。" />
    <div className="nutrition-layout"><form className="nutrition-form panel" onSubmit={calculate}><div className="section-heading"><div><span className="small-label">YOUR BASELINE</span><h2>了解你的基础需求</h2></div><span className="subtle-badge">仅适用于成年人</span></div><fieldset className="sex-field"><legend>公式中的生理性别</legend><div className="segmented"><button type="button" className={form.sex === 'male' ? 'active' : ''} onClick={() => update('sex', 'male')} aria-pressed={form.sex === 'male'}>男性</button><button type="button" className={form.sex === 'female' ? 'active' : ''} onClick={() => update('sex', 'female')} aria-pressed={form.sex === 'female'}>女性</button></div></fieldset><div className="numeric-fields"><label>年龄<div className="number-input"><input type="number" inputMode="numeric" min="18" max="80" required value={form.age} onChange={e => update('age', e.target.value)} /><span>岁</span></div><small>18–80 岁</small></label><label>身高<div className="number-input"><input type="number" inputMode="decimal" min="130" max="220" step=".1" required value={form.height} onChange={e => update('height', e.target.value)} /><span>cm</span></div><small>130–220 cm</small></label><label>体重<div className="number-input"><input type="number" inputMode="decimal" min="40" max="200" step=".1" required value={form.weight} onChange={e => update('weight', e.target.value)} /><span>kg</span></div><small>40–200 kg</small></label></div><label className="form-label">日常活动水平<select value={form.activity} onChange={e => update('activity', e.target.value)}><option value="1.2">久坐为主 · 很少运动</option><option value="1.375">轻度活跃 · 每周少量运动</option><option value="1.55">中度活跃 · 每周规律运动</option><option value="1.725">高度活跃 · 高活动量或体力工作</option></select><small>结合整天的活动量判断，运动次数只是参考。</small></label><fieldset className="goal-field"><legend>目前的方向</legend><div className="goal-options">{[{ id: 'reduce', label: '温和减脂', hint: '估算维持量 −10%' }, { id: 'maintain', label: '维持体重', hint: '估算维持量' }, { id: 'gain', label: '缓慢增肌', hint: '估算维持量 +5%' }].map(item => <button type="button" key={item.id} className={form.goal === item.id ? 'active' : ''} onClick={() => update('goal', item.id)} aria-pressed={form.goal === item.id}><strong>{item.label}</strong><small>{item.hint}</small></button>)}</div></fieldset><p className="calculator-privacy"><Icon name="check" size={14} />数据只在当前浏览器计算，不上传服务器。</p>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="primary-button calculate-button">计算我的参考需求<Icon name="arrow" size={18} /></button></form>
      <div id="nutrition-result" tabIndex={-1} className={`nutrition-result panel ${result ? 'has-result' : ''}`} aria-live="polite">{result ? <><span className="small-label">YOUR ESTIMATED DAILY INTAKE</span><div className="result-heading"><h2>每天的参考摄入</h2><span>{result.goal === 'gain' ? '缓慢增肌' : result.goal === 'reduce' ? '温和减脂' : '维持体重'}</span></div><div className="calorie-number">{result.calories.toLocaleString()}<span>kcal / 天</span></div><div className="energy-track"><span style={{ width: `${result.protein * 4 / result.calories * 100}%` }} /><span style={{ width: '30%' }} /><span /></div><div className="macro-grid"><div><i className="protein-dot" /><span>蛋白质</span><strong>{result.protein}<small>g</small></strong></div><div><i className="fat-dot" /><span>脂肪</span><strong>{result.fat}<small>g</small></strong></div><div><i className="carb-dot" /><span>碳水化合物</span><strong>{result.carbs}<small>g</small></strong></div></div><div className="energy-breakdown"><div><span>估算静息代谢 RMR</span><strong>{result.bmr} kcal</strong></div><div><span>估算维持体重能量 TDEE</span><strong>{result.maintenance} kcal</strong></div></div><div className="result-note"><Icon name="info" size={19} /><p>先观察 2–3 周的体重趋势、饥饿感和训练表现，再小幅调整。活动系数和个体差异会带来误差。</p></div></> : <div className="result-placeholder"><div className="plate-illustration" aria-hidden="true"><div className="plate-ring"><span /><span /><span /></div><i /><b /></div><span className="small-label">A STARTING POINT, NOT A RULE</span><h2>为身体，<br />找到合适的燃料。</h2><p>填写身体信息，查看能量<br />与三大营养素的参考分配。</p><div className="placeholder-macros"><span><i className="protein-dot" />蛋白质</span><span><i className="fat-dot" />脂肪</span><span><i className="carb-dot" />碳水</span></div></div>}</div></div>
    <div className="nutrition-method"><details><summary><span><Icon name="info" size={17} />这个结果如何计算？</span><Icon name="chevron" size={17} /></summary><div className="method-content"><p>使用 Mifflin–St Jeor 静息代谢估算公式：10 × 体重(kg) ＋ 6.25 × 身高(cm) − 5 × 年龄 ＋ 性别项（男性 ＋5，女性 −161）。再乘活动系数，估算维持体重的总能量。</p><p>目标热量采用维持量、−10% 或 +5% 作为工具中的温和起点；这不是原研究中的处方。营养分配按蛋白质 1.6 g/kg、脂肪占能量 30%，其余分给碳水；均为普通健康成年训练者的参考。</p><p>不适用于未成年人、孕期或哺乳期、有进食障碍史或需疾病相关饮食管理的人群。工具显示范围及 1500 kcal 下限是保守的使用限制，不代表个体安全摄入标准。</p><a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noopener noreferrer">Mifflin 等，1990：静息能量估算公式<Icon name="external" size={14} /></a><a href="https://pubmed.ncbi.nlm.nih.gov/28698222/" target="_blank" rel="noopener noreferrer">ISSN：蛋白质与运动立场文件<Icon name="external" size={14} /></a></div></details></div>
  </>;
}

function SupplementCard({ item, index, selected, toggleComparison, onOpen }: { item: Supplement; index: number; selected: boolean; toggleComparison: () => void; onOpen: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const backId = useId();
  return <article className={`supplement-card supplement-color-${index % 3}`} data-flipped={flipped}>
    <div className="supplement-card-top">
      <span className={`evidence-tag ${evidenceClass[item.evidence]}`}>{item.evidence}</span>
      <button className={`compare-toggle ${selected ? 'active' : ''}`} onClick={toggleComparison} aria-pressed={selected} aria-label={`${selected ? '取消对比' : '加入对比'}${item.name}`}><span>{selected && <Icon name="check" size={12} />}</span>{selected ? '已选' : '对比'}</button>
    </div>
    <div className="supplement-flip-stage"><div className="supplement-flip-inner">
      <div className="supplement-face supplement-front" aria-hidden={flipped} inert={flipped}>
        <div className="supplement-title"><div><p>{item.englishName}</p><h3>{item.name}</h3></div><SupplementGraphic index={index} /></div>
        <p className="supplement-summary">{item.summary}</p>
        <div className="supplement-bottom"><div>{item.goals.slice(0, 2).map(g => <span key={g}>{g}</span>)}</div><span className="card-number">{String(index + 1).padStart(2, '0')}</span></div>
      </div>
      <div className="supplement-face supplement-back" id={backId} aria-hidden={!flipped} inert={!flipped}>
        <div className="quick-heading"><span>选择之前</span><h3>{item.name}</h3></div>
        <div className="quick-block"><h4><Icon name="check" size={15} />适用情境</h4><p>{item.suitableFor[0]}</p></div>
        <div className="quick-block caution"><h4><Icon name="info" size={15} />先看提醒</h4><p>{item.cautions[0]}</p></div>
        <p className="quick-footnote">更多适用条件与来源，见完整档案。</p>
      </div>
    </div></div>
    <div className="supplement-card-actions">
      <button className="flip-toggle" onClick={() => setFlipped(value => !value)} aria-expanded={flipped} aria-controls={backId} aria-label={`${item.name}：${flipped ? '返回简介' : '翻面查看适用情境与提醒'}`}><Icon name="refresh" size={15} />{flipped ? '返回简介' : '翻面看要点'}</button>
      <button className="supplement-read" onClick={onOpen} aria-label={`阅读${item.name}完整档案`}>完整档案<Icon name="arrow" size={17} /></button>
    </div>
  </article>;
}

function SupplementGuide({ data, active, openSupplement }: { data: Content; active: boolean; openSupplement: (id: string) => void }) {
  const [goal, setGoal] = useState('全部');
  const [evidence, setEvidence] = useState('全部证据');
  const [query, setQuery] = useState('');
  const [comparison, setComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [helperGoal, setHelperGoal] = useState('先了解基础');
  const [basics, setBasics] = useState(false);
  const [compareMessage, setCompareMessage] = useState('');
  useEffect(() => {
    if (!active) { setShowComparison(false); setShowHelper(false); }
  }, [active]);
  const goals = [...new Set(data.supplements.flatMap(s => s.goals))];
  const filtered = data.supplements.filter(s => (goal === '全部' || s.goals.includes(goal)) && (evidence === '全部证据' || s.evidence === evidence) && `${s.name} ${s.englishName} ${s.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  const compared = data.supplements.filter(s => comparison.includes(s.id));
  const toggleComparison = (id: string) => {
    if (comparison.includes(id)) { setComparison(comparison.filter(item => item !== id)); setCompareMessage(''); }
    else if (comparison.length < 3) { setComparison([...comparison, id]); setCompareMessage(''); }
    else setCompareMessage('每次最多比较 3 种成分，请先取消一个已选项。');
  };
  const matches = data.supplements.filter(s => s.goals.includes(helperGoal) && s.evidence !== '证据有限').slice(0, 3);
  return <>
    <PageIntro variant="supplements" index="04" eyebrow="THE INGREDIENT EDIT" title="补剂，" accent="先懂再选。" description="从成分与证据出发，了解能做什么、适合谁。把饮食和训练放在前面，把选择留给自己。" statValue={String(data.supplements.length).padStart(2, '0')} statLabel="成分研究档案" statNote="有来源 · 有适用条件"><button className="primary-button" onClick={() => jumpTo('supplement-catalog')}>浏览成分档案<Icon name="arrow" size={18} /></button><button className="hero-text-button" onClick={() => setShowHelper(true)}>我需要补剂吗？<Icon name="chevron" size={16} /></button></PageIntro>
    <div className="supplement-principles"><div><span>01</span><strong>先看证据</strong><p>效果有多可靠，适用条件是什么</p></div><div><span>02</span><strong>再看需求</strong><p>饮食能满足的，不必额外补充</p></div><div><span>03</span><strong>最后看产品</strong><p>核对成分、剂量和质量信息</p></div></div>
    <div className="section-heading supplement-section-heading" id="supplement-catalog" tabIndex={-1}><div><span className="small-label">INGREDIENT NOTES / 成分档案</span><h2>把每一种成分看清楚</h2></div><span className="soft-count">{data.supplements.length} 份档案</span></div>
    <div className="supplement-filter-row"><div className="body-tabs supplement-goals" aria-label="按需求筛选"><button className={goal === '全部' ? 'active' : ''} onClick={() => setGoal('全部')} aria-pressed={goal === '全部'}>全部</button>{goals.map(g => <button className={goal === g ? 'active' : ''} key={g} onClick={() => setGoal(g)} aria-pressed={goal === g}>{g}</button>)}</div><label className="select-field"><span className="sr-only">证据等级筛选</span><select value={evidence} onChange={e => setEvidence(e.target.value)}><option>全部证据</option><option>证据较充分</option><option>特定情境</option><option>证据有限</option></select></label></div>
    <div className="supplement-search-row"><label className="search-field"><Icon name="search" size={17} /><span className="sr-only">搜索补剂成分</span><input placeholder="搜索成分或英文名称" value={query} onChange={e => setQuery(e.target.value)} /></label><span className="muted small-text" aria-live="polite">{filtered.length} 份档案 · 翻面看要点，勾选可对比</span></div>
    {filtered.length ? <div className="supplement-grid">{filtered.map(item => <SupplementCard key={item.id} item={item} index={data.supplements.findIndex(s => s.id === item.id)} selected={comparison.includes(item.id)} toggleComparison={() => toggleComparison(item.id)} onOpen={() => openSupplement(item.id)} />)}</div> : <EmptyState title="暂时没有匹配的成分" detail="试试其他需求，或清除搜索词和筛选条件。" action={<button className="secondary-button" onClick={() => { setGoal('全部'); setEvidence('全部证据'); setQuery(''); }}>查看全部成分<Icon name="arrow" size={16} /></button>} />}
    <p className="compare-message" role="status">{!comparison.length && compareMessage}</p>
    <div className="evidence-explainer"><Icon name="info" size={20} /><div><strong>如何理解证据标签？</strong><p>“证据较充分”也有适用情境；“特定情境”通常取决于饮食缺口、训练类型或检测结果；“证据有限”意味着效果仍不确定。标签是本站对所列来源的简化归纳，不是官方评级或质量认证。</p></div></div>
    {comparison.length > 0 && <div className="comparison-bar" aria-label="已选择的对比成分"><div className="comparison-copy"><strong>已选 {comparison.length} / 3</strong><span>{comparison.length < 2 ? '再选 1 种，即可并排比较' : '对照证据、适用情境与提醒'}</span></div><div className="comparison-chips">{compared.map(s => <button key={s.id} onClick={() => toggleComparison(s.id)} aria-label={`移除对比${s.name}`}>{s.name}<Icon name="close" size={13} /></button>)}</div><div className="comparison-actions"><button className="text-button" onClick={() => { setComparison([]); setCompareMessage(''); }}>清空</button><button className="primary-button small-button" disabled={comparison.length < 2} onClick={() => setShowComparison(true)}>开始对比<Icon name="arrow" size={16} /></button></div>{compareMessage && <p className="comparison-bar-message" role="status">{compareMessage}</p>}</div>}
    {active && showComparison && <Modal label="补剂成分对比" wide onClose={() => setShowComparison(false)}><div className="comparison-heading"><p className="eyebrow">SIDE BY SIDE</p><h2>看清差别，再作选择。</h2><p>成分对比不构成搭配建议，选中不意味着适合同时服用。</p></div><p className="comparison-scroll-hint">左右滑动，查看其他成分</p><div className="comparison-table-scroll" tabIndex={0} role="region" aria-label="可横向滚动的成分对比表"><table className="comparison-table"><thead><tr><th>比较维度</th>{compared.map(s => <th key={s.id}>{s.name}<span>{s.englishName}</span></th>)}</tr></thead><tbody><tr><th>证据概况</th>{compared.map(s => <td key={s.id}><span className={`evidence-tag ${evidenceClass[s.evidence]}`}>{s.evidence}</span><p>{s.summary}</p></td>)}</tr><tr><th>适用情境</th>{compared.map(s => <td key={s.id}><ul className="dot-list">{s.suitableFor.map((t, i) => <li key={i}>{t}</li>)}</ul></td>)}</tr><tr><th>注意事项</th>{compared.map(s => <td key={s.id}><ul className="dot-list">{s.cautions.map((t, i) => <li key={i}>{t}</li>)}</ul></td>)}</tr><tr><th>核验日期</th>{compared.map(s => <td key={s.id}>{s.reviewedAt}<br />{s.sources[0] && <a href={safeExternal(s.sources[0].url)} target="_blank" rel="noopener noreferrer">查看参考来源 <Icon name="external" size={12} /></a>}</td>)}</tr></tbody></table></div></Modal>}
    {active && showHelper && <Modal label="补剂需求自查" onClose={() => setShowHelper(false)}><div className="helper-content"><p className="eyebrow">START WITH YOUR NEEDS</p><h2>先问需求，<br />再考虑补充。</h2><p className="body-copy">这个小工具按需求匹配科普主题，不判断你的健康状况，也不生成个人剂量。</p><label className="form-label">你最想了解哪方面？<select value={helperGoal} onChange={e => setHelperGoal(e.target.value)}><option>先了解基础</option>{goals.map(g => <option key={g}>{g}</option>)}</select></label><label className="helper-checkbox"><input type="checkbox" checked={basics} onChange={e => setBasics(e.target.checked)} /><span>我已经在规律训练，也在关注日常饮食与睡眠。</span></label><div className="helper-result"><Icon name="info" size={22} /><div><h3>{!basics || helperGoal === '先了解基础' ? '你现在可能无需补充。' : '先确认是否存在实际需求。'}</h3><p>{!basics ? '先建立规律训练、均衡饮食和足够休息。补剂无法替代这些基础；没有明确缺口时，也可以选择不补。' : helperGoal === '先了解基础' ? '如果日常饮食足以满足需求、训练与恢复正常，没有必要为了“更专业”而额外购买补剂。' : '下面的成分与你选择的话题相关，但适不适合你，仍取决于饮食缺口、训练类型和健康状况。证据支持效果，不等于每个人都需要。'}</p></div></div>{basics && matches.length > 0 && <div className="helper-reading"><h3>可以继续阅读</h3>{matches.map(s => <button key={s.id} onClick={() => { setShowHelper(false); openSupplement(s.id); }}><span><strong>{s.name}</strong><small>{s.evidence} · {s.summary}</small></span><Icon name="arrow" size={18} /></button>)}</div>}<p className="muted small-text">未成年人、孕期或哺乳期、有疾病或正在用药者，应先向医生或注册营养师核实适用性。</p></div></Modal>}
  </>;
}

function readLocation(): { page: Page; detailType: 'exercise' | 'supplement' | null; detailId: string } {
  const raw = window.location.hash.slice(1);
  if (raw.startsWith('exercise=')) return { page: 'exercises', detailType: 'exercise', detailId: decodeHash(raw.slice(9)) };
  if (raw.startsWith('supplement=')) return { page: 'supplements', detailType: 'supplement', detailId: decodeHash(raw.slice(11)) };
  return { page: navigation.some(n => n.id === raw) ? raw as Page : 'exercises', detailType: null, detailId: '' };
}
function decodeHash(value: string) { try { return decodeURIComponent(value); } catch { return value; } }

export default function App() {
  const [data, setData] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [location, setLocation] = useState(readLocation);
  const [favorites, setFavorites] = useState<string[]>(() => { try { const saved: unknown = JSON.parse(localStorage.getItem('lianyouju:favorites') || '[]'); return Array.isArray(saved) ? saved.filter((x): x is string => typeof x === 'string') : []; } catch { return []; } });
  const [storageMessage, setStorageMessage] = useState('');
  const [notice, setNotice] = useState('');
  const previousPage = useRef<Page>(location.page);
  const scrollPositions = useRef<Partial<Record<Page, number>>>({});
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    fetch('/api/content', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('load'); return response.json(); }).then((json: Content) => {
      if (!Array.isArray(json.exercises) || !Array.isArray(json.supplements) || !Array.isArray(json.plans) || !json.meta) throw new Error('data');
      setData(json); setLoading(false);
    }).catch(err => { if (err.name !== 'AbortError') { setError('暂时没有连接到内容服务。请检查网络后重试。'); setLoading(false); } });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const onHash = () => {
      const next = readLocation();
      const parent: unknown = window.history.state?.fitnessParentPage;
      if (next.detailType && navigation.some(item => item.id === parent)) previousPage.current = parent as Page;
      else if (!next.detailType) previousPage.current = next.page;
      setLocation(next);
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onHash); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const activePage = location.detailType === 'exercise' ? previousPage.current : location.page;
  useEffect(() => { document.title = `${navigation.find(n => n.id === activePage)?.label ?? '动作库'} · 练有据`; }, [activePage]);
  const goPage = (page: Page) => {
    const current = location.detailType === 'exercise' ? previousPage.current : location.page;
    scrollPositions.current[current] = window.scrollY;
    previousPage.current = page;
    if (window.location.hash !== `#${page}`) window.history.pushState(null, '', `#${page}`);
    setLocation({ page, detailType: null, detailId: '' });
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      window.scrollTo({ top: current === page ? 0 : scrollPositions.current[page] ?? 0, behavior: 'instant' });
    });
  };
  const openExercise = (id: string) => {
    previousPage.current = location.page;
    window.history.pushState({ fitnessOverlay: true, fitnessParentPage: location.page }, '', `#exercise=${encodeURIComponent(id)}`);
    setLocation({ page: location.page, detailType: 'exercise', detailId: id });
  };
  const openSupplement = (id: string) => {
    previousPage.current = 'supplements';
    window.history.pushState({ fitnessOverlay: true, fitnessParentPage: 'supplements' }, '', `#supplement=${encodeURIComponent(id)}`);
    setLocation({ page: 'supplements', detailType: 'supplement', detailId: id });
  };
  const closeDetail = () => {
    if (window.history.state?.fitnessOverlay) window.history.back();
    else {
      const page = previousPage.current;
      window.history.replaceState(null, '', `#${page}`);
      setLocation({ page, detailType: null, detailId: '' });
    }
  };
  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    setFavorites(updated);
    setNotice(favorites.includes(id) ? '已取消收藏' : '已收藏，可在「我的收藏」中找到');
    try { localStorage.setItem('lianyouju:favorites', JSON.stringify(updated)); setStorageMessage(''); } catch { setStorageMessage('浏览器暂时无法保存收藏，本次打开期间仍可使用。'); }
  };
  const selectedExercise = data?.exercises.find(e => e.id === location.detailId);
  const selectedSupplement = data?.supplements.find(s => s.id === location.detailId);
  return <div className="site-shell"><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>跳到主要内容</a><header className="site-header"><div className="header-inner"><button className="brand-button" onClick={() => goPage('exercises')} aria-label="练有据首页"><Brand /></button><nav className="desktop-nav" aria-label="主要导航">{navigation.map(item => <button key={item.id} onClick={() => goPage(item.id)} className={activePage === item.id ? 'active' : ''} aria-current={activePage === item.id ? 'page' : undefined}>{item.label}</button>)}</nav><div className="header-caption"><span className="live-dot" />把训练，建立在理解之上</div></div></header>
    <main id="main-content" className="main-container" tabIndex={-1}>{loading ? <div className="loading-state" role="status"><span className="loading-mark"><Brand /></span><p>正在整理你的训练资料…</p><div className="loading-cards"><span /><span /><span /></div></div> : error ? <div className="error-state" role="alert"><Icon name="refresh" size={36} /><h1>资料暂时没有加载出来</h1><p>{error}</p><button className="primary-button" onClick={() => setAttempt(a => a + 1)}>重新加载<Icon name="refresh" size={17} /></button></div> : data ? <><section className="page-view" hidden={activePage !== 'exercises'} aria-label="动作库"><ExerciseLibrary data={data} favorites={favorites} toggleFavorite={toggleFavorite} openExercise={openExercise} goPage={goPage} /></section><section className="page-view" hidden={activePage !== 'plans'} aria-label="训练计划"><TrainingPlans data={data} openExercise={openExercise} /></section><section className="page-view" hidden={activePage !== 'nutrition'} aria-label="饮食工具"><NutritionCalculator /></section><section className="page-view" hidden={activePage !== 'supplements'} aria-label="补剂指南"><SupplementGuide data={data} active={activePage === 'supplements'} openSupplement={openSupplement} /></section></> : null}</main>
    <footer className="site-footer"><div><Brand /><p>练习有方法，选择有依据。</p></div><p>公开的健身与营养知识工具<br /><span>科普内容用于理解与参考，不能代替个体化专业评估。</span></p><span className="footer-edition">EST. 2026<br />KEEP LEARNING. KEEP MOVING.</span></footer>
    <nav className="mobile-nav" aria-label="移动端主要导航">{navigation.map(item => <button key={item.id} onClick={() => goPage(item.id)} className={activePage === item.id ? 'active' : ''} aria-current={activePage === item.id ? 'page' : undefined}><Icon name={item.icon} size={21} /><span>{item.label}</span></button>)}</nav>
    {notice && !storageMessage && <div className="notice-toast" role="status"><Icon name="check" size={17} />{notice}</div>}
    {storageMessage && <div className="storage-message" role="status">{storageMessage}<button aria-label="关闭提示" onClick={() => setStorageMessage('')}><Icon name="close" size={15} /></button></div>}
    {data && location.detailType === 'exercise' && <Modal label={selectedExercise?.name ?? '动作详情'} onClose={closeDetail}>{selectedExercise ? <ExerciseDetail exercise={selectedExercise} favorite={favorites.includes(selectedExercise.id)} onFavorite={() => toggleFavorite(selectedExercise.id)} /> : <EmptyState title="没有找到这个动作" detail="这个链接对应的动作可能尚未收录。" action={<button className="secondary-button" onClick={closeDetail}>返回动作库</button>} />}</Modal>}
    {data && location.detailType === 'supplement' && <Modal label={selectedSupplement?.name ?? '补剂详情'} onClose={closeDetail}>{selectedSupplement ? <SupplementDetail item={selectedSupplement} /> : <EmptyState title="没有找到这个成分" detail="这个链接对应的资料可能尚未收录。" action={<button className="secondary-button" onClick={closeDetail}>返回补剂指南</button>} />}</Modal>}
  </div>;
}
