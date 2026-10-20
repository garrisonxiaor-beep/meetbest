import type { MotionScene, Point } from './motion-types'

function Dumbbell({ at: [x, y], angle = 0 }: { at: Point; angle?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path className="equipment-frame" d="M-15 0H15" fill="none" strokeWidth="4" />
    <rect className="equipment-weight" x="-17" y="-9" width="7" height="18" rx="2" />
    <rect className="equipment-weight" x="10" y="-9" width="7" height="18" rx="2" />
    <path className="equipment-detail" d="M-14-6V6M13-6V6" fill="none" />
  </g>
}

// Rotate the forearm about its fixed elbow; linear wrist interpolation would
// pass through the elbow halfway through a curl.
function curlWrist(start: Point, end: Point, elbow: Point, progress: number): Point {
  const from = Math.atan2(start[1] - elbow[1], start[0] - elbow[0])
  const to = Math.atan2(end[1] - elbow[1], end[0] - elbow[0])
  const turn = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  const startLength = Math.hypot(start[0] - elbow[0], start[1] - elbow[1])
  const endLength = Math.hypot(end[0] - elbow[0], end[1] - elbow[1])
  const length = startLength + (endLength - startLength) * progress
  const angle = from + turn * progress
  return [elbow[0] + Math.cos(angle) * length, elbow[1] + Math.sin(angle) * length]
}

function InclineBench() {
  return <g>
    <path className="equipment-frame" d="M117 96L169 158M130 115L109 192M175 161L191 193M96 194H203M109 181H188" fill="none" />
    <rect className="equipment-pad" x="104" y="87" width="95" height="12" rx="5" transform="rotate(51 104 87)" />
    <rect className="equipment-pad" x="170" y="150" width="43" height="12" rx="5" />
    <circle className="equipment-weight" cx="172" cy="158" r="4" />
  </g>
}

export const extraUpperMotions: Record<string, MotionScene> = {
  'pec-deck-chest-fly': {
    view: '正面',
    action: '坐稳后双臂内收',
    startLabel: '双臂打开贴住靠垫',
    endLabel: '胸前合拢',
    startPose: {
      head: [160, 69], neck: [160, 90], hip: [160, 151],
      leftElbow: [106, 115], leftHand: [99, 78],
      rightElbow: [214, 115], rightHand: [221, 78],
      leftKnee: [130, 174], leftFoot: [122, 194],
      rightKnee: [190, 174], rightFoot: [198, 194],
      torsoWidth: 26,
    },
    pose: {
      head: [160, 69], neck: [160, 90], hip: [160, 151],
      leftElbow: [137, 131], leftHand: [149, 100],
      rightElbow: [183, 131], rightHand: [171, 100],
      leftKnee: [130, 174], leftFoot: [122, 194],
      rightKnee: [190, 174], rightFoot: [198, 194],
      torsoWidth: 26,
    },
    equipment: (p) => <g>
      <path className="equipment-frame" d="M76 194V44H244V194M64 194H91M229 194H256M160 171V194M143 194H178" fill="none" />
      <rect className="equipment-pad" x="145" y="91" width="30" height="69" rx="6" />
      <rect className="equipment-pad" x="126" y="157" width="68" height="13" rx="5" />
      <path className="equipment-frame" d={`M94 47L${p.leftHand[0]} ${p.leftHand[1]}L${p.leftElbow[0]} ${p.leftElbow[1]}M226 47L${p.rightHand[0]} ${p.rightHand[1]}L${p.rightElbow[0]} ${p.rightElbow[1]}`} fill="none" />
      <circle className="equipment-weight" cx="94" cy="47" r="6" /><circle className="equipment-weight" cx="226" cy="47" r="6" />
    </g>,
    foreground: (p) => <g>
      {[p.leftElbow, p.rightElbow].map(([x, y], index) => <rect key={`pad-${index}`} className="equipment-pad" x={x - 7} y={y - 15} width="14" height="29" rx="5" />)}
      {[p.leftHand, p.rightHand].map(([x, y], index) => <path key={`grip-${index}`} className="equipment-frame" d={`M${x} ${y - 8}V${y + 8}`} fill="none" strokeWidth="5" />)}
    </g>,
    arrows: ['M87 139Q107 155 126 147', 'M233 139Q213 155 194 147'],
  },
  'parallel-bar-dip-home': {
    view: '正面',
    action: '握住双杠撑起身体',
    startLabel: '屈肘缓慢下沉',
    endLabel: '伸肘撑起',
    startPose: {
      head: [160, 68], neck: [160, 89], hip: [160, 145],
      leftElbow: [115, 85], leftHand: [116, 126],
      rightElbow: [205, 85], rightHand: [204, 126],
      leftKnee: [148, 170], leftFoot: [156, 190],
      rightKnee: [172, 175], rightFoot: [164, 190],
      torsoWidth: 26,
    },
    pose: {
      head: [160, 33], neck: [160, 54], hip: [160, 110],
      leftElbow: [137, 88], leftHand: [116, 126],
      rightElbow: [183, 88], rightHand: [204, 126],
      leftKnee: [148, 135], leftFoot: [156, 155],
      rightKnee: [172, 140], rightFoot: [164, 155],
      torsoWidth: 26,
    },
    equipment: <g>
      <path className="equipment-frame" d="M89 194V130Q89 122 97 122H131M231 194V130Q231 122 223 122H189M112 194V130M208 194V130M79 194H122M198 194H241" fill="none" strokeWidth="5" />
      <path className="equipment-detail" d="M90 176H112M208 176H230" fill="none" />
    </g>,
    foreground: <g>
      <path className="equipment-frame" d="M99 126H133M187 126H221" fill="none" strokeWidth="6" />
      <path className="equipment-weight" d="M106 126H126M194 126H214" fill="none" strokeWidth="7" />
    </g>,
    arrows: ['M69 114V71', 'M251 114V71'],
  },
  'chest-supported-t-bar-row': {
    view: '斜侧',
    action: '胸贴靠垫、开肘划拉',
    startLabel: '双臂下垂握柄',
    endLabel: '肘向两侧打开拉回',
    startPose: {
      head: [197, 80], neck: [181, 96], hip: [123, 135],
      leftElbow: [197, 119], leftHand: [202, 151],
      rightElbow: [211, 126], rightHand: [218, 159],
      leftKnee: [100, 161], leftFoot: [85, 194],
      rightKnee: [135, 168], rightFoot: [151, 194],
      torsoWidth: 24,
    },
    pose: {
      head: [197, 80], neck: [181, 96], hip: [123, 135],
      leftElbow: [138, 109], leftHand: [173, 120],
      rightElbow: [158, 89], rightHand: [189, 116],
      leftKnee: [100, 161], leftFoot: [85, 194],
      rightKnee: [135, 168], rightFoot: [151, 194],
      torsoWidth: 24,
    },
    equipment: <g>
      <path className="equipment-frame" d="M67 194H264M157 194L171 125M154 194L210 194M140 139L197 101M139 139L162 194" fill="none" />
      <rect className="equipment-pad" x="134" y="134" width="79" height="13" rx="5" transform="rotate(-34 134 134)" />
      <path className="equipment-weight" d="M73 194H99M139 194H165" fill="none" strokeWidth="5" />
    </g>,
    foreground: (p) => {
      const x = (p.leftHand[0] + p.rightHand[0]) / 2
      const y = (p.leftHand[1] + p.rightHand[1]) / 2
      const weightX = 86 + (x - 86) * .65
      const weightY = 194 + (y - 194) * .65
      const angle = Math.atan2(y - 194, x - 86) * 180 / Math.PI
      return <g>
        <path className="equipment-frame" d={`M86 194L${x} ${y}M${p.leftHand[0] - 7} ${p.leftHand[1] - 3}L${p.rightHand[0] + 7} ${p.rightHand[1] + 3}`} fill="none" strokeWidth="5" />
        <g transform={`translate(${weightX} ${weightY}) rotate(${angle})`}>
          <rect className="equipment-weight" x="-5" y="-18" width="11" height="36" rx="3" />
          <path className="equipment-detail" d="M0-13V13" fill="none" />
        </g>
        <circle className="equipment-weight" cx="86" cy="194" r="5" />
      </g>
    },
    arrows: ['M243 147Q239 121 215 109'],
  },
  'standing-overhead-press': {
    view: '正面',
    action: '站姿将杠铃推过头顶',
    startLabel: '杠铃位于面前',
    endLabel: '推至头顶上方',
    startPose: {
      head: [160, 51], neck: [160, 72], hip: [160, 132],
      leftElbow: [116, 95], leftHand: [119, 60],
      rightElbow: [204, 95], rightHand: [201, 60],
      leftKnee: [146, 163], leftFoot: [143, 194],
      rightKnee: [174, 163], rightFoot: [177, 194],
      torsoWidth: 26,
    },
    pose: {
      head: [160, 51], neck: [160, 72], hip: [160, 132],
      leftElbow: [139, 46], leftHand: [119, 20],
      rightElbow: [181, 46], rightHand: [201, 20],
      leftKnee: [146, 163], leftFoot: [143, 194],
      rightKnee: [174, 163], rightFoot: [177, 194],
      torsoWidth: 26,
    },
    foreground: (p) => <g transform={`translate(0 ${(p.leftHand[1] + p.rightHand[1]) / 2})`}>
      <path className="equipment-frame" d="M72 0H248" fill="none" strokeWidth="4" />
      <rect className="equipment-weight" x="84" y="-15" width="11" height="30" rx="3" />
      <rect className="equipment-weight" x="225" y="-15" width="11" height="30" rx="3" />
      <rect className="equipment-weight" x="77" y="-11" width="6" height="22" rx="2" />
      <rect className="equipment-weight" x="237" y="-11" width="6" height="22" rx="2" />
    </g>,
    arrows: ['M67 96V54', 'M253 96V54'],
  },
  'dumbbell-reverse-fly': {
    view: '斜侧',
    action: '保持俯身向两侧展开',
    startLabel: '髋部后移、双铃下垂',
    endLabel: '向两侧展开双臂',
    startPose: {
      head: [196, 82], neck: [181, 98], hip: [145, 143],
      leftElbow: [172, 132], leftHand: [154, 165],
      rightElbow: [208, 131], rightHand: [218, 165],
      leftKnee: [126, 166], leftFoot: [115, 194],
      rightKnee: [162, 167], rightFoot: [177, 194],
      torsoWidth: 24,
    },
    pose: {
      head: [196, 82], neck: [181, 98], hip: [145, 143],
      leftElbow: [139, 99], leftHand: [99, 92],
      rightElbow: [223, 101], rightHand: [259, 99],
      leftKnee: [126, 166], leftFoot: [115, 194],
      rightKnee: [162, 167], rightFoot: [177, 194],
      torsoWidth: 24,
    },
    foreground: (p, progress) => <g><Dumbbell at={p.leftHand} angle={-90 * progress} /><Dumbbell at={p.rightHand} angle={90 * progress} /></g>,
    arrows: ['M111 155Q84 143 82 119', 'M258 159Q280 146 281 125'],
  },
  'incline-dumbbell-curl': {
    view: '侧面',
    action: '斜靠凳背固定上臂弯举',
    startLabel: '哑铃在身体两侧下垂',
    endLabel: '屈肘弯举至肩前',
    startPose: {
      head: [109, 65], neck: [126, 81], hip: [177, 144],
      leftElbow: [122, 121], leftHand: [111, 159],
      rightElbow: [157, 129], rightHand: [149, 168],
      leftKnee: [206, 165], leftFoot: [198, 194],
      rightKnee: [226, 155], rightFoot: [235, 194],
      torsoWidth: 23,
    },
    pose: {
      head: [109, 65], neck: [126, 81], hip: [177, 144],
      leftElbow: [122, 121], leftHand: [122, 84],
      rightElbow: [157, 129], rightHand: [159, 91],
      leftKnee: [206, 165], leftFoot: [198, 194],
      rightKnee: [226, 155], rightFoot: [235, 194],
      torsoWidth: 23,
    },
    samplePose: (p, progress) => ({
      ...p,
      leftHand: curlWrist([111, 159], [122, 84], p.leftElbow, progress),
      rightHand: curlWrist([149, 168], [159, 91], p.rightElbow, progress),
    }),
    equipment: <InclineBench />,
    foreground: (p, progress) => <g><Dumbbell at={p.leftHand} angle={-25 * progress} /><Dumbbell at={p.rightHand} angle={-25 * progress} /></g>,
    arrows: ['M82 144Q73 113 91 96', 'M187 127Q192 105 182 92'],
  },
}
