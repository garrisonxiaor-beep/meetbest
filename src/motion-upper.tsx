import type { MotionScene } from './motion-types'

function Dumbbell({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path className="equipment-frame" d="M-15 0H15" fill="none" strokeWidth="4" />
      <rect className="equipment-weight" x="-17" y="-9" width="7" height="18" rx="2" />
      <rect className="equipment-weight" x="10" y="-9" width="7" height="18" rx="2" />
      <path className="equipment-detail" d="M-14-6V6M13-6V6" fill="none" />
    </g>
  )
}

function FlatBench() {
  return (
    <g>
      <path className="equipment-frame" d="M77 160V193M180 160V193M65 194H91M167 194H194M78 177H180" fill="none" />
      <rect className="equipment-pad" x="60" y="150" width="137" height="12" rx="5" />
      <path className="equipment-detail" d="M70 154H187" fill="none" />
    </g>
  )
}

function WeightStack({ x, y, count = 5 }: { x: number; y: number; count?: number }) {
  return (
    <g>
      <path className="equipment-frame" d={`M${x + 6} ${y - 20}V${y + count * 7 + 7}M${x + 23} ${y - 20}V${y + count * 7 + 7}`} fill="none" />
      {Array.from({ length: count }, (_, index) => (
        <rect className="equipment-weight" key={index} x={x} y={y + index * 7} width="29" height="5" rx="1.5" />
      ))}
      <circle cx={x + 21} cy={y + 17} r="2" fill="var(--motion-accent)" />
    </g>
  )
}

export const upperMotions: Record<string, MotionScene> = {
  'barbell-bench-press': {
    view: '侧面',
    action: '仰卧向上推',
    pose: {
      head: [83, 138], neck: [104, 140], hip: [173, 142],
      leftElbow: [106, 104], leftHand: [94, 66],
      rightElbow: [124, 102], rightHand: [119, 66],
      leftKnee: [190, 173], leftFoot: [182, 194],
      rightKnee: [211, 163], rightFoot: [217, 194],
      torsoWidth: 21,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M58 76V194M46 194H72M58 87H72M158 76V130M158 87H145" fill="none" />
        <FlatBench />
      </g>
    ),
    foreground: (
      <g>
        <path className="equipment-frame" d="M50 65H166" fill="none" strokeWidth="4" />
        <rect className="equipment-weight" x="60" y="49" width="11" height="32" rx="3" />
        <rect className="equipment-weight" x="147" y="49" width="11" height="32" rx="3" />
        <rect className="equipment-weight" x="53" y="54" width="6" height="22" rx="2" />
        <rect className="equipment-weight" x="159" y="54" width="6" height="22" rx="2" />
      </g>
    ),
    arrows: ['M187 111V70'],
  },
  'dumbbell-bench-press': {
    view: '斜侧',
    action: '双铃独立推举',
    pose: {
      head: [82, 136], neck: [103, 139], hip: [173, 142],
      leftElbow: [118, 103], leftHand: [103, 72],
      rightElbow: [147, 108], rightHand: [150, 72],
      leftKnee: [191, 173], leftFoot: [184, 194],
      rightKnee: [212, 163], rightFoot: [218, 194],
      torsoWidth: 21,
    },
    equipment: <FlatBench />,
    foreground: <g><Dumbbell x={103} y={72} angle={-8} /><Dumbbell x={150} y={72} angle={8} /></g>,
    arrows: ['M185 113V77'],
  },
  'incline-dumbbell-chest-press': {
    view: '侧面',
    action: '斜靠凳背上推',
    pose: {
      head: [109, 65], neck: [126, 81], hip: [177, 144],
      leftElbow: [134, 64], leftHand: [139, 34],
      rightElbow: [174, 75], rightHand: [176, 34],
      leftKnee: [206, 165], leftFoot: [198, 194],
      rightKnee: [226, 155], rightFoot: [235, 194],
      torsoWidth: 23,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M117 96L169 158M130 115L109 192M175 161L191 193M96 194H203M109 181H188" fill="none" />
        <rect className="equipment-pad" x="104" y="87" width="95" height="12" rx="5" transform="rotate(51 104 87)" />
        <rect className="equipment-pad" x="170" y="150" width="43" height="12" rx="5" />
        <circle className="equipment-weight" cx="172" cy="158" r="4" />
      </g>
    ),
    foreground: <g><Dumbbell x={139} y={34} angle={-8} /><Dumbbell x={176} y={34} angle={8} /></g>,
    arrows: ['M214 108V55'],
  },
  'seated-machine-chest-press': {
    view: '侧面',
    action: '坐稳向前推',
    pose: {
      head: [139, 62], neck: [141, 82], hip: [137, 144],
      leftElbow: [181, 91], leftHand: [223, 91],
      rightElbow: [188, 105], rightHand: [231, 104],
      leftKnee: [178, 160], leftFoot: [171, 194],
      rightKnee: [190, 147], rightFoot: [198, 194],
      torsoWidth: 24,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M98 194V49H121M86 194H185M141 163V194M106 60L204 63L232 104M112 58L199 51L224 91" fill="none" />
        <WeightStack x={67} y={143} count={6} />
        <path className="equipment-cable" d="M81 121V62Q81 49 98 49" fill="none" />
        <rect className="equipment-pad" x="114" y="80" width="14" height="72" rx="6" />
        <rect className="equipment-pad" x="123" y="151" width="63" height="12" rx="5" />
        <circle className="equipment-weight" cx="106" cy="60" r="5" />
      </g>
    ),
    foreground: <path className="equipment-weight" d="M229 96H235V114H229ZM220 83H226V101H220Z" />,
    arrows: ['M188 127H237'],
  },
  'cable-chest-fly': {
    view: '正面',
    action: '双臂弧线合拢',
    pose: {
      head: [160, 55], neck: [160, 76], hip: [160, 137],
      leftElbow: [107, 94], leftHand: [146, 100],
      rightElbow: [213, 94], rightHand: [174, 100],
      leftKnee: [141, 163], leftFoot: [131, 193],
      rightKnee: [180, 166], rightFoot: [191, 194],
      torsoWidth: 25,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M41 194V36H59V194M261 194V36H279V194M33 194H65M255 194H287" fill="none" />
        <WeightStack x={36} y={151} />
        <WeightStack x={255} y={151} />
        <circle className="equipment-pad" cx="50" cy="74" r="7" />
        <circle className="equipment-pad" cx="270" cy="74" r="7" />
        <path className="equipment-cable" d="M50 74L146 100M270 74L174 100" fill="none" />
      </g>
    ),
    foreground: (
      <g>
        <path className="equipment-frame" d="M138 94L148 93L151 105ZM182 94L172 93L169 105Z" fill="none" />
      </g>
    ),
    arrows: ['M85 110Q106 130 136 121', 'M235 110Q214 130 184 121'],
  },
  'push-up-home': {
    view: '侧面',
    action: '身体一线推地',
    pose: {
      head: [223, 105], neck: [204, 116], hip: [144, 142],
      leftElbow: [196, 155], leftHand: [204, 193],
      rightElbow: [219, 154], rightHand: [225, 193],
      leftKnee: [101, 161], leftFoot: [62, 183],
      rightKnee: [105, 167], rightFoot: [64, 191],
      torsoWidth: 22,
    },
    equipment: (
      <g>
        <rect className="equipment-pad" x="43" y="196" width="207" height="4" rx="2" opacity=".6" />
        <path className="equipment-detail" d="M49 200H244" fill="none" />
      </g>
    ),
    foreground: <path className="equipment-frame" d="M201 195H213M222 195H234" fill="none" />,
    arrows: ['M162 173V151'],
  },
  'pull-up': {
    view: '正面',
    action: '屈肘向上拉',
    pose: {
      head: [160, 59], neck: [160, 80], hip: [160, 133],
      leftElbow: [117, 92], leftHand: [111, 34],
      rightElbow: [203, 92], rightHand: [209, 34],
      leftKnee: [145, 151], leftFoot: [155, 169],
      rightKnee: [174, 156], rightFoot: [169, 174],
      torsoWidth: 25,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M64 194V29H256V194M52 194H77M243 194H268" fill="none" />
        <path className="equipment-frame" d="M85 29H235" fill="none" strokeWidth="6" />
        <path className="equipment-detail" d="M64 57L92 29M256 57L228 29" fill="none" />
      </g>
    ),
    foreground: <path className="equipment-weight" d="M99 26H122V32H99ZM198 26H221V32H198Z" />,
    arrows: ['M230 145V102'],
  },
  'narrow-seated-row': {
    view: '侧面',
    action: '把手拉向腹部',
    pose: {
      head: [127, 63], neck: [135, 83], hip: [122, 141],
      leftElbow: [116, 109], leftHand: [156, 119],
      rightElbow: [111, 120], rightHand: [160, 128],
      leftKnee: [169, 168], leftFoot: [204, 193],
      rightKnee: [183, 160], rightFoot: [217, 183],
      torsoWidth: 24,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M100 159V194M88 194H154M142 159V192M254 194V68H279V194M244 194H288" fill="none" />
        <rect className="equipment-pad" x="86" y="147" width="72" height="12" rx="5" />
        <WeightStack x={253} y={156} />
        <path className="equipment-frame" d="M210 159L230 191M224 186H252" fill="none" strokeWidth="5" />
        <circle className="equipment-pad" cx="258" cy="126" r="7" />
        <path className="equipment-cable" d="M161 125H258V139" fill="none" />
      </g>
    ),
    foreground: <path className="equipment-frame" d="M156 116L166 125L156 135" fill="none" strokeWidth="4" />,
    arrows: ['M217 107H176'],
  },
  'angled-handle-lat-pulldown': {
    view: '正面',
    action: '肘部向下收',
    pose: {
      head: [157, 85], neck: [157, 106], hip: [157, 159],
      leftElbow: [112, 133], leftHand: [103, 106],
      rightElbow: [202, 133], rightHand: [211, 106],
      leftKnee: [127, 176], leftFoot: [119, 194],
      rightKnee: [187, 176], rightFoot: [195, 194],
      torsoWidth: 26,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M70 194V28H255V194M59 194H82M243 194H282M157 174V194M145 194H170" fill="none" />
        <circle className="equipment-pad" cx="157" cy="29" r="6" />
        <path className="equipment-cable" d="M157 29V96M157 29H266V132" fill="none" />
        <WeightStack x={252} y={149} count={6} />
        <rect className="equipment-pad" x="123" y="161" width="68" height="12" rx="5" />
        <path className="equipment-frame" d="M114 176V153M200 176V153" fill="none" />
      </g>
    ),
    foreground: (
      <g>
        <path className="equipment-frame" d="M98 108L124 96H190L216 108" fill="none" strokeWidth="4" />
        <path className="equipment-weight" d="M97 102L114 94L118 101L101 110ZM200 94L217 102L213 110L196 101Z" />
        <rect className="equipment-pad" x="111" y="160" width="35" height="10" rx="5" />
        <rect className="equipment-pad" x="169" y="160" width="35" height="10" rx="5" />
      </g>
    ),
    arrows: ['M88 65V95', 'M226 65V95'],
  },
  'single-arm-dumbbell-row': {
    view: '侧面',
    action: '单臂沿髋划拉',
    pose: {
      head: [202, 71], neck: [183, 85], hip: [126, 112],
      leftElbow: [144, 77], leftHand: [141, 119],
      rightElbow: [202, 117], rightHand: [219, 149],
      leftKnee: [118, 156], leftFoot: [101, 194],
      rightKnee: [160, 149], rightFoot: [173, 194],
      torsoWidth: 23,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M202 163V194M254 163V194M192 194H213M244 194H266M203 180H254" fill="none" />
        <rect className="equipment-pad" x="186" y="151" width="85" height="12" rx="5" />
      </g>
    ),
    foreground: <Dumbbell x={141} y={121} angle={-7} />,
    arrows: ['M108 124Q102 106 120 90'],
  },
  'straight-arm-pulldown': {
    view: '侧面',
    action: '直臂压向大腿',
    pose: {
      head: [180, 61], neck: [172, 81], hip: [143, 132],
      leftElbow: [181, 112], leftHand: [184, 145],
      rightElbow: [194, 108], rightHand: [201, 139],
      leftKnee: [129, 160], leftFoot: [118, 194],
      rightKnee: [164, 162], rightFoot: [169, 194],
      torsoWidth: 24,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M263 194V34H282V194M254 194H290M263 42H251" fill="none" />
        <circle className="equipment-pad" cx="258" cy="42" r="7" />
        <WeightStack x={257} y={156} />
        <path className="equipment-cable" d="M270 134V42H258L193 141" fill="none" />
      </g>
    ),
    foreground: <path className="equipment-frame" d="M176 148L211 135" fill="none" strokeWidth="5" />,
    arrows: ['M223 89Q235 123 214 154'],
  },
  'dumbbell-lateral-raise': {
    view: '正面',
    action: '双臂向侧方抬',
    pose: {
      head: [160, 50], neck: [160, 71], hip: [160, 135],
      leftElbow: [106, 86], leftHand: [68, 81],
      rightElbow: [214, 86], rightHand: [252, 81],
      leftKnee: [146, 163], leftFoot: [143, 194],
      rightKnee: [174, 163], rightFoot: [177, 194],
      torsoWidth: 25,
    },
    foreground: <g><Dumbbell x={68} y={81} angle={90} /><Dumbbell x={252} y={81} angle={90} /></g>,
    arrows: ['M83 138Q57 125 56 104', 'M237 138Q263 125 264 104'],
  },
}
