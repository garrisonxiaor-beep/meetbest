import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { Exercise } from './types';
import { ExerciseIllustration, exerciseMotions } from './ExerciseIllustration';

const PlaybackContext = createContext<{
  active: string | null;
  setActive: Dispatch<SetStateAction<string | null>>;
  reducedMotion: boolean;
  pageVisible: boolean;
}>({ active: null, setActive: () => {}, reducedMotion: false, pageVisible: true });

export function MotionPlaybackProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => { setReducedMotion(preference.matches); setActive(null); };
    const onVisibility = () => { setPageVisible(!document.hidden); if (document.hidden) setActive(null); };
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  const value = useMemo(() => ({ active, setActive, reducedMotion, pageVisible }), [active, reducedMotion, pageVisible]);
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function ExercisePlayer({ exercise, display = false, autoEnabled = true }: { exercise: Exercise; display?: boolean; autoEnabled?: boolean }) {
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const { active, setActive, reducedMotion, pageVisible } = useContext(PlaybackContext);
  const [inView, setInView] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const wasInView = useRef(false);
  const playing = inView && pageVisible && !reducedMotion && (display ? autoEnabled && !manuallyPaused : active === id);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const elapsedRef = useRef(0);
  const scene = exerciseMotions[exercise.id];
  useEffect(() => {
    // Detail controls remain manual; cards are independently gated by visibility.
    if (!display) setActive(null);
    return () => setActive(current => current === id ? null : current);
  }, [id, setActive, display]);
  const updateProgress = (next: number) => { progressRef.current = next; setProgress(next); };

  // Observe while idle as well as while playing, so scrolling back can restart a card.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0]?.isIntersecting ?? false;
      if (visible && !wasInView.current) setManuallyPaused(false);
      wasInView.current = visible;
      setInView(visible);
      if (!visible) setActive(current => current === id ? null : current);
    });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, [id, setActive]);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const from = progressRef.current;
    const elapsedBefore = elapsedRef.current;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      let next: number;
      if (display) {
        // One complete five-second cycle: hold, extend, hold, return, rest.
        const elapsed = (elapsedBefore + now - start) % 5000;
        elapsedRef.current = elapsed;
        next = elapsed < 350 ? 0
          : elapsed < 2050 ? (elapsed - 350) / 1700
          : elapsed < 2650 ? 1
          : elapsed < 4350 ? 1 - (elapsed - 2650) / 1700
          : 0;
      } else {
        next = Math.min(1, from + Math.max(0, now - start - 220) / 1700);
      }
      updateProgress(next);
      if (display || next < 1) frame = requestAnimationFrame(tick);
      else setActive(current => current === id ? null : current);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reducedMotion, setActive, id, display]);

  if (!scene) return <div className="motion-unavailable">动作演示整理中</div>;
  const selectPhase = (next: number) => {
    if (playing) setActive(null);
    updateProgress(next);
  };
  const toggle = () => {
    if (reducedMotion) { selectPhase(progress < .5 ? 1 : 0); return; }
    if (display) { setManuallyPaused(paused => !paused); return; }
    if (playing) setActive(null);
    else {
      if (!display && progressRef.current >= 1) updateProgress(0);
      setActive(id);
    }
  };
  const phase = progress === 0 ? '起始' : progress === 1 ? '结束' : '过渡';
  const toggleText = reducedMotion ? '切换姿势' : playing ? '暂停' : progress === 1 ? '重播' : progress > 0 ? '继续' : '播放';
  const easing = progress * progress * (3 - 2 * progress);
  if (display) {
    const label = reducedMotion ? '切换姿势' : manuallyPaused ? '恢复' : '暂停';
    return <div className="motion-player is-display" ref={container} data-motion-id={exercise.id} data-playing={playing} data-phase={phase}>
      <button className="motion-stage" onClick={toggle} aria-pressed={playing} aria-label={`${label}${exercise.name}动作展示`}>
        <ExerciseIllustration exercise={exercise} progress={easing} />
        <span className="motion-display-caption" aria-hidden="true"><span>{scene.action}</span><span className="motion-display-hint"><i className="motion-signal" />{reducedMotion ? '轻点切换姿势' : manuallyPaused ? '已暂停 · 轻点继续' : '5s 自动演示'}</span></span>
      </button>
    </div>;
  }
  return <div className="motion-player" ref={container} data-motion-id={exercise.id} data-playing={playing} data-phase={phase}>
    <button className="motion-stage" onClick={toggle} aria-label={`${toggleText}${exercise.name}动作演示`}>
      <ExerciseIllustration exercise={exercise} progress={easing} />
      <span className="motion-view" aria-hidden="true">{scene.view} · 动作路径示意</span>
    </button>
    <div className="motion-cue"><span>{phase}</span>{progress === 0 ? scene.startLabel ?? scene.action : progress === 1 ? scene.endLabel ?? scene.action : scene.action}</div>
    <div className="motion-controls" role="group" aria-label={`${exercise.name}演示控制`}>
      <button className="motion-toggle" onClick={toggle} aria-pressed={playing} aria-label={`${toggleText}${exercise.name}演示`}><svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">{playing ? <path d="M6 4v12M14 4v12" stroke="currentColor" strokeWidth="2.5" /> : <path d="m7 4 9 6-9 6Z" fill="currentColor" />}</svg>{toggleText}</button>
      <div className="motion-phase-buttons"><button onClick={() => selectPhase(0)} aria-pressed={progress === 0} aria-label={`查看${exercise.name}起始姿势`}>起始</button><button onClick={() => selectPhase(1)} aria-pressed={progress === 1} aria-label={`查看${exercise.name}结束姿势`}>结束</button></div>
    </div>
    <div className="motion-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
  </div>;
}
