import type { MotionScene } from './motion-types'

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
    foreground: <><Dumbbell x={119} y={80} /><Dumbbell x={201} y={80} /></>,
    arrows: ['M96 126Q85 102 96 83', 'M223 126Q235 102 224 83'],
  },
  'overhead-cable-extension': {
    view: '侧面',
    action: '过顶伸肘',
    pose: {
      head: [184, 68], neck: [177, 87], hip: [161, 136],
      leftElbow: [186, 57], leftHand: [195, 31],
      rightElbow: [198, 61], rightHand: [207, 35],
      leftKnee: [142, 163], leftFoot: [128, 190],
      rightKnee: [183, 160], rightFoot: [199, 190],
    },
    equipment: <>
      <CableTower x={73} low />
      <path className="equipment-cable" d="M73 175L189 36" />
    </>,
    foreground: <path className="equipment-band" d="M189 36l6-5m-6 5 18-1" />,
    arrows: ['M221 71Q238 52 226 30'],
  },
  'straight-bar-cable-triceps-extension': {
    view: '侧面',
    action: '固定上臂下压',
    pose: {
      head: [146, 49], neck: [141, 70], hip: [132, 133],
      leftElbow: [151, 104], leftHand: [158, 148],
      rightElbow: [164, 105], rightHand: [174, 148],
      leftKnee: [119, 160], leftFoot: [109, 190],
      rightKnee: [151, 161], rightFoot: [164, 190],
    },
    equipment: <>
      <CableTower x={258} />
      <path className="equipment-cable" d="M258 38L166 147" />
    </>,
    foreground: <path className="equipment-weight" d="M144 148h44v7h-44z" />,
    arrows: ['M195 104v35'],
  },
  crunch: {
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
    view: '侧面',
    action: '悬垂屈膝抬腿',
    pose: {
      head: [143, 76], neck: [132, 94], hip: [134, 147],
      leftElbow: [111, 63], leftHand: [111, 34],
      rightElbow: [156, 62], rightHand: [164, 34],
      leftKnee: [178, 137], leftFoot: [179, 180],
      rightKnee: [192, 139], rightFoot: [196, 181],
    },
    equipment: <>
      <path className="equipment-frame" d="M74 194V34h161v160M62 194h28m132 0h28" />
      <path className="equipment-weight" d="M92 30h122v8H92z" />
    </>,
    arrows: ['M217 182Q232 152 210 130'],
  },
  'ab-wheel-home': {
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
    equipment: <>
      <path className="equipment-pad" d="M55 188h90l12 10H44z" />
      <circle className="equipment-weight" cx="248" cy="181" r="15" />
      <circle className="equipment-pad" cx="248" cy="181" r="7" />
    </>,
    foreground: <path className="equipment-frame" d="M234 176h27" />,
    arrows: ['M230 154h47'],
  },
  'worlds-greatest-stretch': {
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
    foreground: <path className="equipment-band" d="M64 84Q160 93 256 84" />,
    arrows: ['M115 105H67', 'M205 105h48'],
  },
  'wall-chest-stretch': {
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
