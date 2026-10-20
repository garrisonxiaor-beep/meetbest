import { useId } from 'react';
import type { Exercise } from './types';
import type { Point, Pose } from './motion-types';
import { upperMotions } from './motion-upper';
import { lowerMotions } from './motion-lower';
import { coreMotions } from './motion-core';
import { extraUpperMotions } from './motion-extra-upper';
import { extraLowerMotions } from './motion-extra-lower';

export const exerciseMotions = { ...upperMotions, ...lowerMotions, ...coreMotions, ...extraUpperMotions, ...extraLowerMotions };

const line = (...points: Point[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');

function Athlete({ pose: p, topView }: { pose: Pose; topView: boolean }) {
  const headAngle = Math.atan2(p.head[1] - p.neck[1], p.head[0] - p.neck[0]) * 180 / Math.PI + 90;
  const midpoint = (a: Point, b: Point, fraction: number): Point => [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
  const leg = (knee: Point, foot: Point, far = false, toe?: Point) => <g className={far ? 'athlete-far' : undefined}>
    <path d={line(p.hip, knee, foot)} className="athlete-leg" />
    <path d={line(p.hip, midpoint(p.hip, knee, .55))} className="athlete-shorts" />
    <path d={toe ? line(foot, toe) : `M${foot[0] - 3} ${foot[1] + 2}l12 0`} className="athlete-shoe" />
  </g>;
  const arm = (elbow: Point, hand: Point, far = false) => <g className={far ? 'athlete-far' : undefined}>
    <path d={line(p.neck, elbow, hand)} className="athlete-arm" />
    <path d={line(p.neck, midpoint(p.neck, elbow, .4))} className="athlete-sleeve" />
    <circle cx={hand[0]} cy={hand[1]} r="4.8" className="athlete-hand" />
  </g>;
  return <g className="athlete">
    {leg(p.leftKnee, p.leftFoot, true, p.leftToe)}
    {arm(p.leftElbow, p.leftHand, true)}
    <path d={line(p.hip, p.neck)} className="athlete-torso" strokeWidth={p.torsoWidth ?? 24} />
    <path d={line(p.neck, midpoint(p.neck, p.head, .67))} className="athlete-neck" />
    {leg(p.rightKnee, p.rightFoot, false, p.rightToe)}
    {arm(p.rightElbow, p.rightHand)}
    <g transform={`translate(${p.head[0]} ${p.head[1]}) rotate(${headAngle})`}>
      <ellipse rx="10" ry="12" className={topView ? 'athlete-hair' : 'athlete-head'} />
      {!topView && <><path d="M-10 0C-14-15 9-19 11-4L3-6-2-2-5 3Z" className="athlete-hair" /><path d="M8-1l3 3-3 1" className="athlete-face" /></>}
    </g>
  </g>;
}

export function ExerciseIllustration({ exercise, compact = false, progress = 1 }: { exercise: Exercise; compact?: boolean; progress?: number }) {
  const arrowId = useId();
  const scene = exerciseMotions[exercise.id];
  if (!scene) return <div className="motion-unavailable">动作示意整理中</div>;
  const amount = Math.max(0, Math.min(1, progress));
  const pose = interpolatePose(scene.startPose, scene.pose, amount);
  const sampled = scene.samplePose?.(pose, amount) ?? pose;
  const phase = amount === 0 ? '起始姿势' : amount === 1 ? '结束姿势' : '动作过渡';
  return <svg className={`exercise-illustration${compact ? ' compact' : ''}`} viewBox="0 0 320 220" fill="none" role="img" aria-label={`${exercise.name}${phase}，${scene.view}，${scene.action}`}>
    <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 2l6 3-6 3" fill="none" stroke="var(--motion-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
    <path d="M32 198H288" className="motion-ground" />
    <ellipse cx="160" cy="199" rx="80" ry="5" fill="var(--motion-equipment)" opacity=".06" />
    <g className="motion-equipment">{typeof scene.equipment === 'function' ? scene.equipment(sampled, amount) : scene.equipment}</g>
    <Athlete pose={sampled} topView={scene.view === '俯视'} />
    <g className="motion-equipment">{typeof scene.foreground === 'function' ? scene.foreground(sampled, amount) : scene.foreground}</g>
    {!compact && <g className="motion-arrows">{scene.arrows?.map((d, index) => <path key={index} d={d} markerEnd={`url(#${arrowId})`} />)}</g>}
  </svg>;
}

export function interpolatePose(start: Pose, end: Pose, progress: number): Pose {
  const mix = (a: Point, b: Point): Point => [a[0] + (b[0] - a[0]) * progress, a[1] + (b[1] - a[1]) * progress];
  const result = {} as Pose;
  const joints = ['head', 'neck', 'hip', 'leftElbow', 'leftHand', 'rightElbow', 'rightHand', 'leftKnee', 'leftFoot', 'rightKnee', 'rightFoot'] as const;
  for (const joint of joints) result[joint] = mix(start[joint], end[joint]);
  for (const side of ['left', 'right'] as const) {
    const toe = `${side}Toe` as const;
    const foot = `${side}Foot` as const;
    if (start[toe] || end[toe]) {
      result[toe] = mix(start[toe] ?? [start[foot][0] + 9, start[foot][1] + 2], end[toe] ?? [end[foot][0] + 9, end[foot][1] + 2]);
    }
  }
  result.torsoWidth = (start.torsoWidth ?? 24) + ((end.torsoWidth ?? 24) - (start.torsoWidth ?? 24)) * progress;
  return result;
}
