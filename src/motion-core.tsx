import type { MotionScene, Pose, Point } from './motion-types'

// Bend around the elbow, keeping the forearm clear of the joint at mid-stroke.
function arcForearms(scene: MotionScene, p: Pose, t: number): Pose {
  const hand = (side: 'left' | 'right'): Point => {
    const from = scene.startPose[`${side}Hand`], to = scene.pose[`${side}Hand`];
    const a = scene.startPose[`${side}Elbow`], b = scene.pose[`${side}Elbow`];
    const startAngle = Math.atan2(from[1]-a[1], from[0]-a[0]);
    let delta = Math.atan2(to[1]-b[1], to[0]-b[0]) - startAngle;
    if (delta > Math.PI) delta -= Math.PI*2;
    if (delta < -Math.PI) delta += Math.PI*2;
    const r = Math.hypot(from[0]-a[0], from[1]-a[1])*(1-t) + Math.hypot(to[0]-b[0], to[1]-b[1])*t;
    const elbow = p[`${side}Elbow`], angle = startAngle+delta*t;
    return [elbow[0]+Math.cos(angle)*r, elbow[1]+Math.sin(angle)*r];
  };
  return { ...p, leftHand: hand('left'), rightHand: hand('right') };
}

const mat = <path className="equipment-pad" d="M48 191h222l15 7H33z" />

function Dumbbell({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="equipment-frame" d="M0-13V13" />
      <rect className="equipment-weight" x="-10" y="-18" width="20" height="9" rx="3" />
      <rect className="equipment-weight" x="-10" y="9" width="20" height="9" rx="3" />
    </g>
  )
}

function CableTower({ x, low = false }: { x: number; low?: boolean }) {
  return (
    <g>
      <path className="equipment-frame" d={`M${x - 10} 193V31h23v162M${x - 18} 193h39`} />
      <rect className="equipment-pad" x={x - 5} y="114" width="14" height="63" rx="3" />
      <path className="equipment-detail" d={`M${x - 3} 125h10m-10 12h10m-10 12h10m-10 12h10`} />
      <circle className="equipment-weight" cx={x} cy={low ? 175 : 38} r="6" />
    </g>
  )
}

export const coreMotions: Record<string, MotionScene> = {
  'dumbbell-hammer-curl': {
    samplePose: (p, t) => arcForearms(coreMotions['dumbbell-hammer-curl'], p, t),
    startLabel: '双臂自然垂下，掌心相对',
    endLabel: '屈肘将哑铃带近肩部',
    startPose: { head: [160, 47], neck: [160, 68], hip: [160, 130], leftElbow: [122, 115], leftHand: [119, 153], rightElbow: [198, 115], rightHand: [201, 153], leftKnee: [141, 161], leftFoot: [136, 190], rightKnee: [178, 161], rightFoot: [184, 190], torsoWidth: 28 },
    view: '正面',
    action: '对握屈肘',
    pose: {
      head: [160, 47], neck: [160, 68], hip: [160, 130],
      leftElbow: [122, 115], leftHand: [119, 80],
      rightElbow: [198, 115], rightHand: [201, 80],
      leftKnee: [141, 161], leftFoot: [136, 190],
      rightKnee: [178, 161], rightFoot: [184, 190],
      torsoWidth: 28,
    },
    foreground: p => <><Dumbbell x={p.leftHand[0]} y={p.leftHand[1]} /><Dumbbell x={p.rightHand[0]} y={p.rightHand[1]} /></>,
    arrows: ['M96 126Q85 102 96 83', 'M223 126Q235 102 224 83'],
  },
  'overhead-cable-extension': {
    samplePose: (p, t) => arcForearms(coreMotions['overhead-cable-extension'], p, t),
    startLabel: '上臂过顶，屈肘握绳',
    endLabel: '上臂保持稳定，向上伸肘',
    startPose: { head: [184, 68], neck: [177, 87], hip: [161, 136], leftElbow: [186, 57], leftHand: [159, 70], rightElbow: [198, 61], rightHand: [172, 76], leftKnee: [142, 163], leftFoot: [128, 190], rightKnee: [183, 160], rightFoot: [199, 190] },
    view: '侧面',
    action: '过顶伸肘',
    pose: {
      head: [184, 68], neck: [177, 87], hip: [161, 136],
      leftElbow: [186, 57], leftHand: [195, 31],
      rightElbow: [198, 61], rightHand: [207, 35],
      leftKnee: [142, 163], leftFoot: [128, 190],
      rightKnee: [183, 160], rightFoot: [199, 190],
    },
    equipment: p => <>
      <CableTower x={73} low />
      <path className="equipment-cable" d={`M73 175L${p.leftHand[0]-6} ${p.leftHand[1]+5}`} />
    </>,
    foreground: p => <path className="equipment-band" d={`M${p.leftHand[0]} ${p.leftHand[1]}l-6 5L${p.rightHand.join(" ")}`} />,
    arrows: ['M221 71Q238 52 226 30'],
  },
  'straight-bar-cable-triceps-extension': {
    samplePose: (p, t) => arcForearms(coreMotions['straight-bar-cable-triceps-extension'], p, t),
    startLabel: '上臂贴近躯干，屈肘握杆',
    endLabel: '保持上臂位置，向下伸肘',
    startPose: { head: [146, 49], neck: [141, 70], hip: [132, 133], leftElbow: [151, 104], leftHand: [190, 93], rightElbow: [164, 105], rightHand: [206, 93], leftKnee: [119, 160], leftFoot: [109, 190], rightKnee: [151, 161], rightFoot: [164, 190] },
    view: '侧面',
    action: '固定上臂下压',
    pose: {
      head: [146, 49], neck: [141, 70], hip: [132, 133],
      leftElbow: [151, 104], leftHand: [158, 148],
      rightElbow: [164, 105], rightHand: [174, 148],
      leftKnee: [119, 160], leftFoot: [109, 190],
      rightKnee: [151, 161], rightFoot: [164, 190],
    },
    equipment: p => <>
      <CableTower x={258} />
      <path className="equipment-cable" d={`M258 38L${(p.leftHand[0]+p.rightHand[0])/2} ${p.leftHand[1]}`} />
    </>,
    foreground: p => <path className="equipment-weight" d={`M${p.leftHand[0]-14} ${p.leftHand[1]}h44v7h-44z`} />,
    arrows: ['M195 104v35'],
  },
  crunch: {
    startLabel: '仰卧屈膝，双脚踩稳',
    endLabel: '收紧腹部，让上背离垫',
    startPose: { head: [77, 176], neck: [99, 181], hip: [159, 181], leftElbow: [119, 187], leftHand: [126, 170], rightElbow: [120, 166], rightHand: [109, 182], leftKnee: [196, 132], leftFoot: [229, 190], rightKnee: [207, 135], rightFoot: [242, 190], torsoWidth: 24 },
    view: '侧面',
    action: '上背轻轻卷起',
    pose: {
      head: [81, 149], neck: [100, 163], hip: [159, 181],
      leftElbow: [119, 176], leftHand: [126, 157],
      rightElbow: [120, 149], rightHand: [109, 168],
      leftKnee: [196, 132], leftFoot: [229, 190],
      rightKnee: [207, 135], rightFoot: [242, 190],
      torsoWidth: 24,
    },
    equipment: mat,
    arrows: ['M58 182Q58 155 79 136'],
  },
  'hanging-leg-raise': {
    startLabel: '握杠悬垂，双腿自然下垂',
    endLabel: '腹部收紧，双膝向前上方抬',
    startPose: { head: [143, 56], neck: [132, 74], hip: [134, 127], leftElbow: [111, 54], leftHand: [111, 34], rightElbow: [156, 53], rightHand: [164, 34], leftKnee: [130, 160], leftFoot: [127, 190], rightKnee: [148, 160], rightFoot: [148, 190] },
    view: '侧面',
    action: '悬垂屈膝抬腿',
    pose: {
      head: [143, 56], neck: [132, 74], hip: [134, 127],
      leftElbow: [111, 54], leftHand: [111, 34],
      rightElbow: [156, 53], rightHand: [164, 34],
      leftKnee: [167, 119], leftFoot: [169, 151],
      rightKnee: [180, 121], rightFoot: [184, 152],
    },
    equipment: <>
      <path className="equipment-frame" d="M74 194V34h161v160M62 194h28m132 0h28" />
      <path className="equipment-weight" d="M92 30h122v8H92z" />
    </>,
    arrows: ['M217 182Q232 152 210 130'],
  },
  'ab-wheel-home': {
    startLabel: '双膝着垫，滚轮在肩下',
    endLabel: '保持躯干稳定，向前滚动',
    startPose: { head: [167, 88], neck: [150, 92], hip: [122, 139], leftElbow: [165, 134], leftHand: [177, 176], rightElbow: [175, 133], rightHand: [186, 176], leftKnee: [110, 184], leftFoot: [65, 178], rightKnee: [121, 188], rightFoot: [78, 186], torsoWidth: 24 },
    view: '侧面',
    action: '跪姿向前滚动',
    pose: {
      head: [207, 132], neck: [190, 122], hip: [133, 140],
      leftElbow: [215, 145], leftHand: [243, 176],
      rightElbow: [220, 141], rightHand: [252, 176],
      leftKnee: [110, 184], leftFoot: [65, 178],
      rightKnee: [121, 188], rightFoot: [78, 186],
      torsoWidth: 24,
    },
    equipment: p => <>
      <path className="equipment-pad" d="M55 188h90l12 10H44z" />
      <circle className="equipment-weight" cx={(p.leftHand[0]+p.rightHand[0])/2} cy="181" r="15" />
      <circle className="equipment-pad" cx={(p.leftHand[0]+p.rightHand[0])/2} cy="181" r="7" />
    </>,
    foreground: p => <path className="equipment-frame" d={`M${p.leftHand[0]-9} 176h27`} />,
    arrows: ['M230 154h47'],
  },
  'worlds-greatest-stretch': {
    samplePose: (p, t) => {
      const scene = coreMotions['worlds-greatest-stretch'];
      const sweep = (key: 'rightElbow' | 'rightHand'): Point => {
        const a = scene.startPose[key], b = scene.pose[key];
        const start = Math.atan2(a[1]-p.neck[1], a[0]-p.neck[0]);
        const end = Math.atan2(b[1]-p.neck[1], b[0]-p.neck[0]);
        const radius = Math.hypot(a[0]-p.neck[0], a[1]-p.neck[1])*(1-t) + Math.hypot(b[0]-p.neck[0], b[1]-p.neck[1])*t;
        const angle = start+(end-start)*t;
        return [p.neck[0]+Math.cos(angle)*radius, p.neck[1]+Math.sin(angle)*radius];
      };
      return { ...p, rightElbow: sweep('rightElbow'), rightHand: sweep('rightHand') };
    },
    startLabel: '进入弓步，双手撑地',
    endLabel: '支撑手不动，转胸向上举手',
    startPose: { head: [195, 96], neck: [182, 115], hip: [133, 143], leftElbow: [196, 151], leftHand: [204, 190], rightElbow: [171, 153], rightHand: [159, 190], leftKnee: [82, 184], leftFoot: [47, 190], rightKnee: [204, 144], rightFoot: [224, 190], torsoWidth: 25 },
    view: '斜侧',
    action: '弓步转体上举',
    pose: {
      head: [195, 96], neck: [182, 115], hip: [133, 143],
      leftElbow: [196, 151], leftHand: [204, 190],
      rightElbow: [180, 73], rightHand: [173, 32],
      leftKnee: [82, 184], leftFoot: [47, 190],
      rightKnee: [204, 144], rightFoot: [224, 190],
      torsoWidth: 25,
    },
    equipment: mat,
    arrows: ['M231 116Q253 73 204 51'],
  },
  '90-90-hip-switch': {
    samplePose: (p, t) => ({ ...p, leftKnee: [p.leftKnee[0], p.leftKnee[1] - Math.sin(Math.PI*t)*23], rightKnee: [p.rightKnee[0], p.rightKnee[1] - Math.sin(Math.PI*t)*23] }),
    startLabel: '坐稳，双膝倒向一侧',
    endLabel: '保持坐姿，将双膝换向另一侧',
    startPose: { head: [161, 90], neck: [159, 112], hip: [157, 174], leftElbow: [120, 145], leftHand: [91, 188], rightElbow: [199, 146], rightHand: [224, 188], leftKnee: [119, 151], leftFoot: [102, 183], rightKnee: [199, 182], rightFoot: [187, 157], torsoWidth: 27 },
    view: '斜侧',
    action: '坐姿双膝换侧',
    pose: {
      head: [161, 90], neck: [159, 112], hip: [157, 174],
      leftElbow: [120, 145], leftHand: [91, 188],
      rightElbow: [199, 146], rightHand: [224, 188],
      leftKnee: [115, 182], leftFoot: [127, 157],
      rightKnee: [195, 151], rightFoot: [212, 183],
      torsoWidth: 27,
    },
    equipment: <path className="equipment-pad" d="M80 157h160l40 42H40z" />,
    arrows: ['M124 143Q156 128 184 138'],
  },
  'band-pull-apart': {
    startLabel: '双手在胸前，握住弹力带',
    endLabel: '向两侧拉开，肩膀保持下沉',
    startPose: { head: [160, 47], neck: [160, 69], hip: [160, 132], leftElbow: [133, 87], leftHand: [126, 104], rightElbow: [187, 87], rightHand: [194, 104], leftKnee: [141, 161], leftFoot: [131, 190], rightKnee: [178, 161], rightFoot: [188, 190], torsoWidth: 29 },
    view: '正面',
    action: '胸前向两侧拉开',
    pose: {
      head: [160, 47], neck: [160, 69], hip: [160, 132],
      leftElbow: [111, 80], leftHand: [64, 84],
      rightElbow: [209, 80], rightHand: [256, 84],
      leftKnee: [141, 161], leftFoot: [131, 190],
      rightKnee: [178, 161], rightFoot: [188, 190],
      torsoWidth: 29,
    },
    foreground: p => <path className="equipment-band" d={`M${p.leftHand.join(" ")}Q160 ${p.leftHand[1]+9} ${p.rightHand.join(" ")}`} />,
    arrows: ['M115 105H67', 'M205 105h48'],
  },
  'wall-chest-stretch': {
    startLabel: '前臂贴墙，身体靠近墙侧',
    endLabel: '前臂不动，缓慢转开胸口',
    startPose: { head: [147, 53], neck: [142, 75], hip: [148, 132], leftElbow: [108, 91], leftHand: [105, 49], rightElbow: [178, 103], rightHand: [187, 137], leftKnee: [141, 159], leftFoot: [127, 190], rightKnee: [184, 160], rightFoot: [195, 190], torsoWidth: 23 },
    view: '斜侧',
    action: '前臂扶墙转身',
    pose: {
      head: [174, 53], neck: [169, 75], hip: [163, 132],
      leftElbow: [108, 91], leftHand: [105, 49],
      rightElbow: [203, 101], rightHand: [218, 133],
      leftKnee: [141, 159], leftFoot: [127, 190],
      rightKnee: [184, 160], rightFoot: [195, 190],
      torsoWidth: 27,
    },
    equipment: <>
      <path className="equipment-pad" d="M88 26h13v170H88z" />
      <path className="equipment-detail" d="M88 35l-9 9m9 16-9 9m9 16-9 9m9 16-9 9m9 16-9 9m9 16-9 9m9 16-9 9" />
    </>,
    arrows: ['M176 112Q215 105 235 85'],
  },
  'supine-figure-four-glute-stretch': {
    startLabel: '仰卧，将脚踝搭在另一侧大腿',
    endLabel: '抱住大腿，轻轻拉近身体',
    startPose: { head: [69, 177], neck: [92, 179], hip: [153, 179], leftElbow: [140, 163], leftHand: [185, 157], rightElbow: [138, 173], rightHand: [191, 168], leftKnee: [204, 146], leftFoot: [259, 159], rightKnee: [234, 194], rightFoot: [195, 160], torsoWidth: 23 },
    view: '斜侧',
    action: '脚踝搭腿抱膝',
    pose: {
      head: [69, 177], neck: [92, 179], hip: [153, 179],
      leftElbow: [134, 145], leftHand: [169, 137],
      rightElbow: [125, 154], rightHand: [175, 148],
      leftKnee: [188, 126], leftFoot: [243, 139],
      rightKnee: [218, 184], rightFoot: [179, 140],
      torsoWidth: 23,
    },
    equipment: mat,
    arrows: ['M190 106Q163 103 151 128'],
  },
  'wall-back-active-stretch': {
    startLabel: '双手扶墙，髋部稍向后',
    endLabel: '手掌固定，将髋向后送',
    startPose: { head: [229, 87], neck: [210, 83], hip: [165, 127], leftElbow: [239, 81], leftHand: [263, 85], rightElbow: [239, 93], rightHand: [263, 94], leftKnee: [126, 154], leftFoot: [94, 190], rightKnee: [156, 157], rightFoot: [144, 190], torsoWidth: 23 },
    view: '侧面',
    action: '双手扶墙后移髋',
    pose: {
      head: [198, 114], neck: [180, 104], hip: [119, 119],
      leftElbow: [220, 96], leftHand: [263, 85],
      rightElbow: [222, 102], rightHand: [263, 94],
      leftKnee: [111, 157], leftFoot: [94, 190],
      rightKnee: [139, 157], rightFoot: [144, 190],
      torsoWidth: 23,
    },
    equipment: <>
      <path className="equipment-pad" d="M269 27h12v169h-12z" />
      <path className="equipment-detail" d="M281 36l9 9m-9 16 9 9m-9 16 9 9m-9 16 9 9m-9 16 9 9m-9 16 9 9m-9 16 9 9" />
    </>,
    arrows: ['M138 96L95 104'],
  },
}
