import type { ReactNode } from 'react';

export type Point = [number, number];
export type Pose = {
  head: Point;
  neck: Point;
  hip: Point;
  leftElbow: Point;
  leftHand: Point;
  rightElbow: Point;
  rightHand: Point;
  leftKnee: Point;
  leftFoot: Point;
  rightKnee: Point;
  rightFoot: Point;
  leftToe?: Point;
  rightToe?: Point;
  torsoWidth?: number;
};
export type MotionScene = {
  view: '侧面' | '正面' | '斜侧' | '俯视';
  action: string;
  pose: Pose;
  startPose: Pose;
  startLabel?: string;
  endLabel?: string;
  equipment?: ReactNode | ((pose: Pose, progress: number) => ReactNode);
  foreground?: ReactNode | ((pose: Pose, progress: number) => ReactNode);
  samplePose?: (interpolated: Pose, progress: number) => Pose;
  arrows?: string[];
};
