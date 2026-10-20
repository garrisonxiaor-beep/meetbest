import type { MotionScene, Point } from './motion-types';

const jointArc = (start: Point, end: Point, pivot: Point, progress: number): Point => {
  if (progress === 0) return start;
  if (progress === 1) return end;
  const startAngle = Math.atan2(start[1] - pivot[1], start[0] - pivot[0]);
  const endAngle = Math.atan2(end[1] - pivot[1], end[0] - pivot[0]);
  const delta = Math.atan2(Math.sin(endAngle - startAngle), Math.cos(endAngle - startAngle));
  const radius = Math.hypot(start[0] - pivot[0], start[1] - pivot[1]) * (1 - progress)
    + Math.hypot(end[0] - pivot[0], end[1] - pivot[1]) * progress;
  const angle = startAngle + delta * progress;
  return [pivot[0] + Math.cos(angle) * radius, pivot[1] + Math.sin(angle) * radius];
};

const dumbbell = (x: number, y: number, vertical = false) => (
  <g transform={`translate(${x} ${y})${vertical ? ' rotate(90)' : ''}`}>
    <path className="equipment-frame" d="M-12 0H12" strokeWidth="4" />
    <rect className="equipment-weight" x="-16" y="-8" width="7" height="16" rx="2" />
    <rect className="equipment-weight" x="9" y="-8" width="7" height="16" rx="2" />
  </g>
);

export const lowerMotions: Record<string, MotionScene> = {
  'seated-dumbbell-shoulder-press': {
    startLabel: '哑铃位于肩侧',
    endLabel: '向上推至头顶',
    startPose: {
      head: [160, 63], neck: [160, 85], hip: [160, 140],
      leftElbow: [119, 106], leftHand: [114, 73],
      rightElbow: [201, 106], rightHand: [206, 73],
      leftKnee: [138, 163], leftFoot: [126, 189],
      rightKnee: [183, 163], rightFoot: [190, 189], torsoWidth: 25,
    },
    view: '正面',
    action: '向上推举',
    pose: {
      head: [160, 63], neck: [160, 85], hip: [160, 140],
      leftElbow: [132, 57], leftHand: [129, 24],
      rightElbow: [188, 57], rightHand: [191, 24],
      leftKnee: [138, 163], leftFoot: [126, 189],
      rightKnee: [183, 163], rightFoot: [190, 189],
      torsoWidth: 25,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M145 193V139M175 193V139M135 193H185" />
        <rect className="equipment-pad" x="141" y="80" width="38" height="63" rx="8" />
        <rect className="equipment-pad" x="130" y="143" width="60" height="10" rx="4" />
      </g>
    ),
    foreground: (p) => <g>{dumbbell(...p.leftHand)}{dumbbell(...p.rightHand)}</g>,
    arrows: ['M82 91V48', 'M238 91V48'],
  },
  'reverse-pec-deck': {
    startLabel: '双臂向前握柄',
    endLabel: '肘部向两侧打开',
    startPose: {
      head: [160, 65], neck: [160, 88], hip: [160, 146],
      leftElbow: [139, 103], leftHand: [147, 82],
      rightElbow: [181, 103], rightHand: [173, 82],
      leftKnee: [138, 164], leftFoot: [129, 190],
      rightKnee: [182, 164], rightFoot: [188, 190], torsoWidth: 25,
    },
    view: '正面',
    action: '向两侧打开',
    pose: {
      head: [160, 65], neck: [160, 88], hip: [160, 146],
      leftElbow: [115, 97], leftHand: [80, 81],
      rightElbow: [205, 97], rightHand: [240, 81],
      leftKnee: [138, 164], leftFoot: [129, 190],
      rightKnee: [182, 164], rightFoot: [188, 190],
      torsoWidth: 25,
    },
    equipment: (p) => (
      <g>
        <path className="equipment-frame" d="M64 192V48H256V192M50 192H78M242 192H270M160 149V194" />
        <path className="equipment-detail" d={`M95 48L${p.leftHand.join(" ")}M225 48L${p.rightHand.join(" ")}`} />
        <circle className="equipment-weight" cx="95" cy="48" r="6" />
        <circle className="equipment-weight" cx="225" cy="48" r="6" />
        <rect className="equipment-pad" x="134" y="149" width="52" height="9" rx="4" />
      </g>
    ),
    foreground: (p) => (
      <g>
        <rect className="equipment-pad" x="145" y="108" width="30" height="33" rx="7" />
        <path className="equipment-frame" d={`M${p.leftHand[0]} ${p.leftHand[1] - 7}v16M${p.rightHand[0]} ${p.rightHand[1] - 7}v16`} strokeWidth="5" />
      </g>
    ),
    arrows: ['M126 63Q102 60 78 67', 'M194 63Q218 60 242 67'],
  },
  'seated-cable-face-pull': {
    startLabel: '双臂向前伸展',
    endLabel: '绳端拉至面部两侧',
    startPose: {
      head: [151, 70], neck: [143, 91], hip: [137, 146],
      leftElbow: [185, 82], leftHand: [221, 72],
      rightElbow: [190, 94], rightHand: [228, 82],
      leftKnee: [175, 151], leftFoot: [180, 190],
      rightKnee: [184, 147], rightFoot: [195, 190],
    },
    view: '侧面',
    action: '拉向面部两侧',
    pose: {
      head: [151, 70], neck: [143, 91], hip: [137, 146],
      leftElbow: [109, 101], leftHand: [165, 70],
      rightElbow: [125, 109], rightHand: [176, 81],
      leftKnee: [175, 151], leftFoot: [180, 190],
      rightKnee: [184, 147], rightFoot: [195, 190],
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M106 194V154M161 194V154M93 194H174M269 194V41H250V194M237 194H283" />
        <rect className="equipment-pad" x="100" y="151" width="72" height="10" rx="4" />
        <rect className="equipment-weight" x="255" y="128" width="23" height="51" rx="3" />
        <path className="equipment-detail" d="M256 140H277M256 151H277M256 162H277" />
        <circle className="equipment-pad" cx="250" cy="73" r="9" />

      </g>
    ),
    foreground: (p) => {
      const x = Math.min(242, (p.leftHand[0] + p.rightHand[0]) / 2 + 25);
      const y = (p.leftHand[1] + p.rightHand[1]) / 2;
      return <g>
        <path className="equipment-cable" d={`M250 73L${x} ${y}`} />
        <path className="equipment-cable" d={`M${p.leftHand.join(' ')}L${x} ${y}L${p.rightHand.join(' ')}`} strokeWidth="3" />
        <circle className="equipment-weight" cx={p.leftHand[0]} cy={p.leftHand[1]} r="4" />
        <circle className="equipment-weight" cx={p.rightHand[0]} cy={p.rightHand[1]} r="4" />
      </g>;
    },
    arrows: ['M228 103H190'],
  },
  'prone-y-raise': {
    startLabel: '俯卧双臂呈Y形',
    endLabel: '肩胛控制轻抬双臂',
    startPose: {
      head: [160, 85], neck: [160, 106], hip: [160, 145],
      leftElbow: [129, 82], leftHand: [105, 51],
      rightElbow: [191, 82], rightHand: [215, 51],
      leftKnee: [145, 166], leftFoot: [133, 190],
      rightKnee: [175, 166], rightFoot: [185, 190], torsoWidth: 26,
    },
    view: '俯视',
    action: '双臂呈Y形',
    pose: {
      head: [160, 85], neck: [160, 106], hip: [160, 145],
      leftElbow: [122, 76], leftHand: [92, 43],
      rightElbow: [198, 76], rightHand: [228, 43],
      leftKnee: [145, 166], leftFoot: [133, 190],
      rightKnee: [175, 166], rightFoot: [185, 190],
      torsoWidth: 26,
    },
    equipment: (
      <g>
        <rect x="71" y="27" width="178" height="171" rx="19" fill="var(--motion-pad)" opacity=".18" />
        <rect className="equipment-detail" x="78" y="34" width="164" height="157" rx="14" fill="none" opacity=".45" />
      </g>
    ),
    arrows: ['M81 77L67 56', 'M239 77L253 56'],
  },
  'squat-pattern': {
    startLabel: '站稳收紧核心',
    endLabel: '髋膝弯曲下蹲',
    startPose: {
      head: [161, 24], neck: [160, 46], hip: [160, 109],
      leftElbow: [187, 66], leftHand: [220, 73],
      rightElbow: [193, 59], rightHand: [225, 65],
      leftKnee: [154, 150], leftFoot: [153, 190],
      rightKnee: [173, 150], rightFoot: [169, 190], torsoWidth: 25,
    },
    view: '侧面',
    action: '髋膝一起弯曲',
    pose: {
      head: [178, 73], neck: [162, 91], hip: [116, 140],
      leftElbow: [183, 112], leftHand: [213, 109],
      rightElbow: [188, 103], rightHand: [218, 101],
      leftKnee: [167, 151], leftFoot: [153, 190],
      rightKnee: [180, 147], rightFoot: [169, 190],
      torsoWidth: 25,
    },
    arrows: ['M90 104Q76 125 89 151', 'M222 163V128'],
  },
  'romanian-deadlift': {
    startLabel: '站立杠铃贴近大腿',
    endLabel: '向后折髋缓慢下放',
    startPose: {
      head: [175, 26], neck: [175, 48], hip: [175, 109],
      leftElbow: [183, 91], leftHand: [188, 127],
      rightElbow: [193, 91], rightHand: [197, 127],
      leftKnee: [169, 151], leftFoot: [173, 190],
      rightKnee: [185, 151], rightFoot: [184, 190], torsoWidth: 25,
    },
    view: '侧面',
    action: '髋部向后折叠',
    pose: {
      head: [219, 85], neck: [198, 98], hip: [134, 109],
      leftElbow: [193, 127], leftHand: [195, 154],
      rightElbow: [202, 127], rightHand: [204, 154],
      leftKnee: [174, 146], leftFoot: [173, 190],
      rightKnee: [184, 145], rightFoot: [184, 190],
      torsoWidth: 25,
    },
    foreground: (p) => (
      <g transform={`translate(${(p.leftHand[0] + p.rightHand[0]) / 2 - 199.5} ${(p.leftHand[1] + p.rightHand[1]) / 2 - 154})`}>
        <path className="equipment-frame" d="M158 155H243" strokeWidth="4" />
        <rect className="equipment-weight" x="165" y="138" width="10" height="34" rx="3" />
        <rect className="equipment-weight" x="227" y="138" width="10" height="34" rx="3" />
      </g>
    ),
    arrows: ['M122 101H85', 'M254 110V145'],
  },
  'bulgarian-split-squat': {
    startLabel: '前脚踩稳后脚搭凳',
    endLabel: '前腿屈膝垂直下蹲',
    startPose: {
      head: [188, 30], neck: [187, 52], hip: [190, 103],
      leftElbow: [176, 82], leftHand: [172, 112],
      rightElbow: [217, 84], rightHand: [220, 113],
      leftKnee: [149, 137], leftFoot: [103, 127],
      rightKnee: [224, 145], rightFoot: [225, 190], torsoWidth: 24,
    },
    view: '侧面',
    action: '后脚搭凳下蹲',
    pose: {
      head: [185, 56], neck: [182, 78], hip: [169, 128],
      leftElbow: [155, 107], leftHand: [151, 137],
      rightElbow: [196, 109], rightHand: [199, 138],
      leftKnee: [155, 169], leftFoot: [103, 127],
      rightKnee: [229, 145], rightFoot: [225, 190],
      torsoWidth: 24,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M74 194V141M113 194V141M62 194H125" />
        <rect className="equipment-pad" x="61" y="134" width="65" height="10" rx="4" />
      </g>
    ),
    foreground: (p) => <g>{dumbbell(...p.leftHand)}{dumbbell(...p.rightHand)}</g>,
    arrows: ['M263 95V148'],
  },
  'prone-leg-curl': {
    startLabel: '俯卧双腿伸展',
    endLabel: '屈膝带起腿垫',
    startPose: {
      head: [79, 103], neck: [100, 112], hip: [163, 120],
      leftElbow: [85, 135], leftHand: [63, 140],
      rightElbow: [102, 139], rightHand: [77, 146],
      leftKnee: [206, 122], leftFoot: [260, 140],
      rightKnee: [216, 126], rightFoot: [271, 145], torsoWidth: 23,
    },
    view: '侧面',
    action: '屈膝带起腿垫',
    samplePose: (p, progress) => {
      const scene = lowerMotions['prone-leg-curl'];
      return {
        ...p,
        leftFoot: jointArc(scene.startPose.leftFoot, scene.pose.leftFoot, p.leftKnee, progress),
        rightFoot: jointArc(scene.startPose.rightFoot, scene.pose.rightFoot, p.rightKnee, progress),
      };
    },
    pose: {
      head: [79, 103], neck: [100, 112], hip: [163, 120],
      leftElbow: [85, 135], leftHand: [63, 140],
      rightElbow: [102, 139], rightHand: [77, 146],
      leftKnee: [206, 122], leftFoot: [227, 68],
      rightKnee: [216, 126], rightFoot: [242, 74],
      torsoWidth: 23,
    },
    equipment: (p) => (
      <g>
        <path className="equipment-frame" d="M106 194V139M210 194V139M94 194H265" />
        <path className="equipment-frame" d={`M215 137L${(p.leftFoot[0] + p.rightFoot[0]) / 2} ${(p.leftFoot[1] + p.rightFoot[1]) / 2 + 8}`} />
        <path className="equipment-pad" d="M101 123L165 130L224 136L222 147L164 141L99 134Z" />
        <path className="equipment-frame" d="M101 150H60V139M110 157H76V146" />
        <rect className="equipment-weight" x="246" y="151" width="23" height="39" rx="3" />
        <path className="equipment-cable" d="M215 137L256 152" />
        <circle className="equipment-weight" cx="215" cy="137" r="6" />
      </g>
    ),
    foreground: (p, progress) => (
      <g transform={`translate(${(p.leftFoot[0] + p.rightFoot[0]) / 2} ${(p.leftFoot[1] + p.rightFoot[1]) / 2 + 8}) rotate(${progress * 15})`}>
        <rect className="equipment-pad" x="-17" y="-6" width="34" height="12" rx="6" />
        <ellipse className="equipment-weight" cx="15" cy="0" rx="4" ry="6" />
      </g>
    ),
    arrows: ['M263 124Q282 92 264 65'],
  },
  'hip-thrust': {
    startLabel: '上背抵凳髋部下沉',
    endLabel: '双脚踩稳向上伸髋',
    startPose: {
      head: [84, 109], neck: [104, 121], hip: [156, 158],
      leftElbow: [125, 146], leftHand: [147, 175],
      rightElbow: [137, 143], rightHand: [151, 167],
      leftKnee: [196, 133], leftFoot: [214, 187],
      rightKnee: [208, 133], rightFoot: [226, 187], torsoWidth: 26,
    },
    view: '侧面',
    action: '踩稳双脚伸髋',
    pose: {
      head: [84, 109], neck: [104, 121], hip: [168, 123],
      leftElbow: [120, 144], leftHand: [159, 140],
      rightElbow: [127, 132], rightHand: [163, 132],
      leftKnee: [217, 130], leftFoot: [214, 187],
      rightKnee: [228, 129], rightFoot: [226, 187],
      torsoWidth: 26,
    },
    equipment: (p) => (
      <g>
        <path className="equipment-frame" d="M71 193V142M119 193V142M58 193H276" />
        <path className="equipment-frame" d={`M${p.hip[0] + 1} ${p.hip[1] + 10}L261 176`} />
        <rect className="equipment-pad" x="62" y="133" width="69" height="13" rx="5" />
        <rect className="equipment-pad" x="201" y="193" width="51" height="6" rx="3" />
        <circle className="equipment-weight" cx="261" cy="174" r="17" />
        <circle className="equipment-pad" cx="261" cy="174" r="5" />
      </g>
    ),
    foreground: (p) => (
      <g transform={`translate(${p.hip[0] - 168} ${p.hip[1] - 123})`}>
        <path d="M160 113L177 115L181 132L164 135Z" fill="var(--motion-weight)" />
        <path className="equipment-detail" d="M166 116L172 131" stroke="var(--motion-accent)" />
        <path className="equipment-frame" d="M152 140H181" strokeWidth="4" />
      </g>
    ),
    arrows: ['M176 164V144', 'M172 99V72'],
  },
  'standing-calf-raise': {
    startLabel: '脚跟回落前脚掌踩稳',
    endLabel: '前脚掌固定抬起脚跟',
    startPose: {
      head: [154, 53], neck: [154, 75], hip: [151, 126],
      leftElbow: [181, 97], leftHand: [211, 82],
      rightElbow: [179, 115], rightHand: [211, 100],
      leftKnee: [146, 158], leftFoot: [148, 183], leftToe: [164, 183],
      rightKnee: [160, 158], rightFoot: [155, 183], rightToe: [170, 183],
    },
    view: '侧面',
    action: '脚跟缓慢抬起',
    pose: {
      head: [154, 44], neck: [154, 66], hip: [151, 117],
      leftElbow: [181, 88], leftHand: [211, 82],
      rightElbow: [179, 106], rightHand: [211, 100],
      leftKnee: [146, 149], leftFoot: [148, 174], leftToe: [164, 183],
      rightKnee: [160, 149], rightFoot: [155, 174], rightToe: [170, 183],
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M215 65V194M204 194H228" />
        <rect className="equipment-pad" x="136" y="187" width="58" height="11" rx="3" />
        <path className="equipment-detail" d="M135 194H149" strokeDasharray="3 4" />
      </g>
    ),
    arrows: ['M117 187V157'],
  },
  'band-lateral-walk': {
    startLabel: '微蹲保持弹力带张力',
    endLabel: '迈出右脚保持膝盖朝外',
    startPose: {
      head: [147, 55], neck: [147, 77], hip: [147, 128],
      leftElbow: [111, 104], leftHand: [133, 116],
      rightElbow: [179, 104], rightHand: [162, 115],
      leftKnee: [126, 155], leftFoot: [102, 190],
      rightKnee: [173, 159], rightFoot: [173, 190], torsoWidth: 26,
    },
    view: '正面',
    action: '保持张力侧移',
    samplePose: (p, progress) => {
      const lift = Math.sin(Math.PI * progress) * 6;
      return {
        ...p,
        rightFoot: [p.rightFoot[0], p.rightFoot[1] - lift],
        ...(p.rightToe ? { rightToe: [p.rightToe[0], p.rightToe[1] - lift] as [number, number] } : {}),
      };
    },
    pose: {
      head: [160, 55], neck: [160, 77], hip: [160, 128],
      leftElbow: [124, 104], leftHand: [146, 116],
      rightElbow: [192, 104], rightHand: [175, 115],
      leftKnee: [125, 155], leftFoot: [102, 190],
      rightKnee: [196, 159], rightFoot: [215, 190],
      torsoWidth: 26,
    },
    foreground: (p) => {
      const lx = p.hip[0] + (p.leftKnee[0] - p.hip[0]) * .8;
      const ly = p.hip[1] + (p.leftKnee[1] - p.hip[1]) * .6;
      const rx = p.hip[0] + (p.rightKnee[0] - p.hip[0]) * .8;
      const ry = p.hip[1] + (p.rightKnee[1] - p.hip[1]) * .6;
      const mx = (lx + rx) / 2;
      return <g>
        <path className="equipment-band" d={`M${lx} ${ly}Q${mx} ${Math.max(ly, ry) + 4} ${rx} ${ry}L${rx + 4} ${ry + 9}Q${mx} ${Math.max(ly, ry) + 14} ${lx - 4} ${ly + 9}Z`} />
      </g>;
    },
    arrows: ['M226 142H265', 'M84 177H56'],
  },
  'barbell-curl': {
    startLabel: '上臂贴身自然下垂',
    endLabel: '肘部稳定弯举杠铃',
    startPose: {
      head: [148, 44], neck: [147, 66], hip: [144, 123],
      leftElbow: [161, 107], leftHand: [165, 141],
      rightElbow: [173, 107], rightHand: [177, 141],
      leftKnee: [138, 157], leftFoot: [139, 190],
      rightKnee: [159, 157], rightFoot: [159, 190], torsoWidth: 25,
    },
    view: '侧面',
    action: '肘部稳定弯举',
    samplePose: (p, progress) => {
      const scene = lowerMotions['barbell-curl'];
      return {
        ...p,
        leftHand: jointArc(scene.startPose.leftHand, scene.pose.leftHand, p.leftElbow, progress),
        rightHand: jointArc(scene.startPose.rightHand, scene.pose.rightHand, p.rightElbow, progress),
      };
    },
    pose: {
      head: [148, 44], neck: [147, 66], hip: [144, 123],
      leftElbow: [161, 107], leftHand: [185, 84],
      rightElbow: [173, 107], rightHand: [197, 84],
      leftKnee: [138, 157], leftFoot: [139, 190],
      rightKnee: [159, 157], rightFoot: [159, 190],
      torsoWidth: 25,
    },
    foreground: (p) => (
      <g transform={`translate(${(p.leftHand[0] + p.rightHand[0]) / 2 - 160} ${(p.leftHand[1] + p.rightHand[1]) / 2 - 80})`}>
        <path className="equipment-frame" d="M96 80H224" strokeWidth="4" />
        <rect className="equipment-weight" x="105" y="67" width="10" height="26" rx="3" />
        <rect className="equipment-weight" x="205" y="67" width="10" height="26" rx="3" />
        <path className="equipment-detail" d="M124 80H141M180 80H197" />
      </g>
    ),
    arrows: ['M240 137Q259 112 236 90'],
  },
};
