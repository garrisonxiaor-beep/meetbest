import type { MotionScene, Point } from './motion-types';

const elbowArc = (start: Point, end: Point, elbow: Point, progress: number): Point => {
  if (progress === 0) return start;
  if (progress === 1) return end;
  const from = Math.atan2(start[1] - elbow[1], start[0] - elbow[0]);
  const to = Math.atan2(end[1] - elbow[1], end[0] - elbow[0]);
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  const radius = Math.hypot(start[0] - elbow[0], start[1] - elbow[1]) * (1 - progress)
    + Math.hypot(end[0] - elbow[0], end[1] - elbow[1]) * progress;
  return [elbow[0] + Math.cos(from + delta * progress) * radius, elbow[1] + Math.sin(from + delta * progress) * radius];
};

const dumbbell = ([x, y]: Point) => (
  <g transform={`translate(${x} ${y})`}>
    <path className="equipment-frame" d="M-12 0H12" strokeWidth="4" />
    <rect className="equipment-weight" x="-16" y="-8" width="7" height="16" rx="2" />
    <rect className="equipment-weight" x="9" y="-8" width="7" height="16" rx="2" />
  </g>
);

const bench = (
  <g>
    <path className="equipment-frame" d="M80 192V125M174 192V151M66 192H190" />
    <path className="equipment-pad" d="M62 109L193 144L190 155L59 120Z" />
  </g>
);

const cableTower = (
  <g>
    <path className="equipment-frame" d="M259 194V35H280V194M245 194H291" />
    <rect className="equipment-weight" x="264" y="132" width="20" height="48" rx="3" />
    <path className="equipment-detail" d="M265 144H282M265 155H282M265 166H282" />
  </g>
);

export const extraLowerMotions: Record<string, MotionScene> = {
  'single-leg-dumbbell-romanian-deadlift': {
    view: '侧面',
    action: '单腿支撑向后折髋',
    startLabel: '支撑脚踩稳、双手持铃',
    endLabel: '折髋前倾、另一腿后伸',
    startPose: {
      head: [175, 29], neck: [175, 51], hip: [175, 111],
      leftElbow: [184, 92], leftHand: [191, 130],
      rightElbow: [194, 93], rightHand: [202, 131],
      leftKnee: [175, 151], leftFoot: [173, 190], leftToe: [185, 192],
      rightKnee: [188, 152], rightFoot: [190, 190], rightToe: [201, 192],
      torsoWidth: 24,
    },
    pose: {
      head: [231, 95], neck: [210, 106], hip: [146, 115],
      leftElbow: [202, 132], leftHand: [203, 157],
      rightElbow: [213, 133], rightHand: [214, 157],
      leftKnee: [173, 148], leftFoot: [173, 190], leftToe: [185, 192],
      rightKnee: [104, 109], rightFoot: [61, 103], rightToe: [49, 103],
      torsoWidth: 24,
    },
    foreground: (p) => <g>{dumbbell(p.leftHand)}{dumbbell(p.rightHand)}</g>,
    arrows: ['M134 88H98', 'M79 145Q57 133 48 118', 'M252 121V151'],
  },
  'reclined-hip-adduction': {
    view: '正面',
    action: '双腿缓慢向内夹拢',
    startLabel: '坐稳背靠、双腿分开',
    endLabel: '大腿内收、缓慢夹拢',
    startPose: {
      head: [160, 55], neck: [160, 77], hip: [160, 132],
      leftElbow: [124, 104], leftHand: [119, 126],
      rightElbow: [196, 104], rightHand: [201, 126],
      leftKnee: [106, 155], leftFoot: [86, 190],
      rightKnee: [214, 155], rightFoot: [234, 190],
      torsoWidth: 25,
    },
    pose: {
      head: [160, 55], neck: [160, 77], hip: [160, 132],
      leftElbow: [124, 104], leftHand: [119, 126],
      rightElbow: [196, 104], rightHand: [201, 126],
      leftKnee: [146, 158], leftFoot: [136, 190],
      rightKnee: [174, 158], rightFoot: [184, 190],
      torsoWidth: 25,
    },
    equipment: (p) => (
      <g>
        <path className="equipment-frame" d="M141 191V145M180 191V145M95 193H225M119 132V119M201 132V119" />
        <rect className="equipment-pad" x="139" y="75" width="42" height="62" rx="9" />
        <rect className="equipment-pad" x="129" y="137" width="62" height="11" rx="4" />
        <path className="equipment-frame" d={`M160 149L${p.leftKnee[0]} ${p.leftKnee[1] + 10}L${p.leftFoot[0]} ${p.leftFoot[1] + 5}M160 149L${p.rightKnee[0]} ${p.rightKnee[1] + 10}L${p.rightFoot[0]} ${p.rightFoot[1] + 5}`} />
        <path className="equipment-frame" d={`M${p.leftFoot[0] - 10} ${p.leftFoot[1] + 6}h22M${p.rightFoot[0] - 10} ${p.rightFoot[1] + 6}h22`} />
        <circle className="equipment-weight" cx="160" cy="149" r="6" />
      </g>
    ),
    foreground: (p) => (
      <g>
        <rect className="equipment-pad" x={p.leftKnee[0] + 5} y={p.leftKnee[1] - 15} width="9" height="26" rx="4" />
        <rect className="equipment-pad" x={p.rightKnee[0] - 14} y={p.rightKnee[1] - 15} width="9" height="26" rx="4" />
      </g>
    ),
    arrows: ['M75 155H116', 'M245 155H204'],
  },
  'standing-cable-hip-extension': {
    view: '侧面',
    action: '固定躯干向后伸腿',
    startLabel: '扶稳器械、单脚支撑',
    endLabel: '髋部稳定、另一腿后伸',
    startPose: {
      head: [191, 40], neck: [186, 62], hip: [171, 118],
      leftElbow: [215, 84], leftHand: [249, 88],
      rightElbow: [217, 102], rightHand: [249, 105],
      leftKnee: [169, 154], leftFoot: [169, 190],
      rightKnee: [185, 151], rightFoot: [185, 190], rightToe: [198, 192],
      torsoWidth: 24,
    },
    pose: {
      head: [191, 40], neck: [186, 62], hip: [171, 118],
      leftElbow: [215, 84], leftHand: [249, 88],
      rightElbow: [217, 102], rightHand: [249, 105],
      leftKnee: [169, 154], leftFoot: [169, 190],
      rightKnee: [141, 145], rightFoot: [112, 173], rightToe: [101, 178],
      torsoWidth: 24,
    },
    equipment: (p) => (
      <g>
        {cableTower}
        <path className="equipment-frame" d="M259 88H247V108" />
        <circle className="equipment-pad" cx="253" cy="181" r="8" />
        <path className="equipment-cable" d={`M253 181L${p.rightFoot[0]} ${p.rightFoot[1] - 5}`} />
      </g>
    ),
    foreground: (p) => (
      <g>
        <path d={`M${p.rightFoot[0] - 6} ${p.rightFoot[1] - 7}l11 4`} stroke="var(--motion-weight)" strokeWidth="7" strokeLinecap="round" />
        <circle cx={p.rightFoot[0] + 5} cy={p.rightFoot[1] - 3} r="3" className="equipment-detail" />
      </g>
    ),
    arrows: ['M142 174Q122 160 95 159'],
  },
  'lying-barbell-triceps-extension': {
    view: '侧面',
    action: '上臂稳定只屈伸肘',
    startLabel: '仰卧双臂向上持铃',
    endLabel: '肘部弯曲、杠铃落向额头上方',
    samplePose: (p, progress) => {
      const scene = extraLowerMotions['lying-barbell-triceps-extension'];
      return {
        ...p,
        leftHand: elbowArc(scene.startPose.leftHand, scene.pose.leftHand, p.leftElbow, progress),
        rightHand: elbowArc(scene.startPose.rightHand, scene.pose.rightHand, p.rightElbow, progress),
      };
    },
    startPose: {
      head: [78, 100], neck: [100, 105], hip: [163, 122],
      leftElbow: [113, 67], leftHand: [122, 28],
      rightElbow: [125, 68], rightHand: [133, 29],
      leftKnee: [200, 151], leftFoot: [207, 190],
      rightKnee: [215, 148], rightFoot: [222, 190],
      torsoWidth: 23,
    },
    pose: {
      head: [78, 100], neck: [100, 105], hip: [163, 122],
      leftElbow: [113, 67], leftHand: [77, 77],
      rightElbow: [125, 68], rightHand: [88, 78],
      leftKnee: [200, 151], leftFoot: [207, 190],
      rightKnee: [215, 148], rightFoot: [222, 190],
      torsoWidth: 23,
    },
    equipment: bench,
    foreground: (p) => {
      const x = (p.leftHand[0] + p.rightHand[0]) / 2;
      const y = (p.leftHand[1] + p.rightHand[1]) / 2;
      return <g transform={`translate(${x} ${y})`}>
        <path className="equipment-frame" d="M-48 0H48" strokeWidth="4" />
        <rect className="equipment-weight" x="-39" y="-12" width="9" height="24" rx="3" />
        <rect className="equipment-weight" x="30" y="-12" width="9" height="24" rx="3" />
      </g>;
    },
    arrows: ['M151 24Q95 8 61 31'],
  },
  'kneeling-cable-crunch': {
    view: '侧面',
    action: '保持跪姿向下卷腹',
    startLabel: '高跪持绳、双手靠近头侧',
    endLabel: '呼气卷曲躯干、肘部靠近膝盖',
    startPose: {
      head: [178, 51], neck: [172, 73], hip: [161, 131],
      leftElbow: [191, 93], leftHand: [187, 60],
      rightElbow: [204, 98], rightHand: [198, 67],
      leftKnee: [164, 178], leftFoot: [119, 188],
      rightKnee: [178, 178], rightFoot: [133, 188],
      torsoWidth: 25,
    },
    pose: {
      head: [208, 130], neck: [192, 113], hip: [158, 133],
      leftElbow: [213, 150], leftHand: [216, 123],
      rightElbow: [226, 157], rightHand: [227, 131],
      leftKnee: [164, 178], leftFoot: [119, 188],
      rightKnee: [178, 178], rightFoot: [133, 188],
      torsoWidth: 25,
    },
    equipment: (
      <g>
        {cableTower}
        <circle className="equipment-pad" cx="253" cy="47" r="8" />
        <rect className="equipment-pad" x="103" y="185" width="97" height="10" rx="4" />
      </g>
    ),
    foreground: (p) => {
      const x = (p.leftHand[0] + p.rightHand[0]) / 2 + 8;
      const y = (p.leftHand[1] + p.rightHand[1]) / 2 - 14;
      return <g>
        <path className="equipment-cable" d={`M253 47L${x} ${y}`} />
        <path className="equipment-cable" d={`M${p.leftHand.join(' ')}L${x} ${y}L${p.rightHand.join(' ')}`} strokeWidth="3" />
        <circle className="equipment-weight" cx={p.leftHand[0]} cy={p.leftHand[1]} r="4" />
        <circle className="equipment-weight" cx={p.rightHand[0]} cy={p.rightHand[1]} r="4" />
      </g>;
    },
    arrows: ['M225 77Q242 88 241 106'],
  },
  'side-plank-rotation-warmup': {
    view: '斜侧',
    action: '单手撑地抬臀开胸',
    startLabel: '屈膝坐稳、单手在身后撑地',
    endLabel: '撑稳抬臀、另一手举起打开胸廓',
    startPose: {
      head: [138, 104], neck: [143, 126], hip: [164, 182],
      leftElbow: [121, 157], leftHand: [100, 190],
      rightElbow: [174, 141], rightHand: [205, 152],
      leftKnee: [205, 151], leftFoot: [224, 190],
      rightKnee: [222, 156], rightFoot: [242, 190],
      torsoWidth: 25,
    },
    pose: {
      head: [109, 98], neck: [122, 117], hip: [164, 143],
      leftElbow: [109, 151], leftHand: [100, 190],
      rightElbow: [147, 80], rightHand: [175, 46],
      leftKnee: [205, 151], leftFoot: [224, 190],
      rightKnee: [222, 156], rightFoot: [242, 190],
      torsoWidth: 25,
    },
    equipment: (
      <g>
        <rect className="equipment-pad" x="57" y="195" width="218" height="6" rx="3" />
        <path className="equipment-detail" d="M71 198H263" opacity=".35" />
      </g>
    ),
    arrows: ['M221 122Q222 78 194 55', 'M164 171V154'],
  },
};
