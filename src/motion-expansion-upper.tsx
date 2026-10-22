import type { MotionScene, Point, Pose } from './motion-types'

type Side = 'left' | 'right'
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])

// Keep every arm segment on an arc about its joint; straight interpolation
// would shorten an arm when the start and end point lie on opposite sides.
function orbit(from: Point, to: Point, fromPivot: Point, toPivot: Point, pivot: Point, t: number): Point {
  const start = Math.atan2(from[1] - fromPivot[1], from[0] - fromPivot[0])
  const end = Math.atan2(to[1] - toPivot[1], to[0] - toPivot[0])
  const turn = Math.atan2(Math.sin(end - start), Math.cos(end - start))
  const length = mix(distance(from, fromPivot), distance(to, toPivot), t)
  return [pivot[0] + Math.cos(start + turn * t) * length, pivot[1] + Math.sin(start + turn * t) * length]
}

function arcArms(scene: MotionScene, p: Pose, t: number, sides: Side[] = ['left', 'right']): Pose {
  const result = { ...p }
  for (const side of sides) {
    const elbow = `${side}Elbow` as const
    const hand = `${side}Hand` as const
    result[elbow] = orbit(scene.startPose[elbow], scene.pose[elbow], scene.startPose.neck, scene.pose.neck, p.neck, t)
    result[hand] = orbit(scene.startPose[hand], scene.pose[hand], scene.startPose[elbow], scene.pose[elbow], result[elbow], t)
  }
  return result
}

// Solve a two-segment arm while keeping a planted hand exactly on its support.
function reachElbow(shoulder: Point, hand: Point, upper: number, forearm: number, bend: number): Point {
  const dx = hand[0] - shoulder[0], dy = hand[1] - shoulder[1]
  const span = Math.max(.001, Math.hypot(dx, dy))
  const along = (upper * upper - forearm * forearm + span * span) / (2 * span)
  const height = Math.sqrt(Math.max(0, upper * upper - along * along))
  return [shoulder[0] + dx / span * along - dy / span * height * bend, shoulder[1] + dy / span * along + dx / span * height * bend]
}

function supportedArms(p: Pose, upper = 38, forearm = 38): Pose {
  return {
    ...p,
    leftElbow: reachElbow(p.neck, p.leftHand, upper, forearm, 1),
    rightElbow: reachElbow(p.neck, p.rightHand, upper, forearm, 1),
  }
}

function Dumbbell({ at: [x, y], angle = 0 }: { at: Point; angle?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path className="equipment-frame" d="M-15 0H15" fill="none" strokeWidth="4" />
    <rect className="equipment-weight" x="-17" y="-9" width="7" height="18" rx="2" />
    <rect className="equipment-weight" x="10" y="-9" width="7" height="18" rx="2" />
    <path className="equipment-detail" d="M-14-6V6M13-6V6" fill="none" />
  </g>
}

function Barbell({ left, right }: { left: Point; right: Point }) {
  const x = (left[0] + right[0]) / 2, y = (left[1] + right[1]) / 2
  const angle = Math.atan2(right[1] - left[1], right[0] - left[0]) * 180 / Math.PI
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path className="equipment-frame" d="M-76 0H76" fill="none" strokeWidth="4" />
    <rect className="equipment-weight" x="-64" y="-16" width="11" height="32" rx="3" />
    <rect className="equipment-weight" x="53" y="-16" width="11" height="32" rx="3" />
    <rect className="equipment-weight" x="-71" y="-11" width="6" height="22" rx="2" />
    <rect className="equipment-weight" x="65" y="-11" width="6" height="22" rx="2" />
    <path className="equipment-detail" d="M-47 0H-34M34 0H47" fill="none" />
  </g>
}

function CableTower({ x }: { x: number }) {
  return <g>
    <path className="equipment-frame" d={`M${x - 9} 194V35H${x + 15}V194M${x - 18} 194H${x + 24}`} fill="none" />
    <rect className="equipment-pad" x={x - 3} y="106" width="13" height="62" rx="3" />
    <path className="equipment-detail" d={`M${x - 1} 119H${x + 8}M${x - 1} 132H${x + 8}M${x - 1} 145H${x + 8}M${x - 1} 158H${x + 8}`} fill="none" />
    <circle className="equipment-weight" cx={x} cy="179" r="6" />
  </g>
}

function FlatBench() {
  return <g>
    <path className="equipment-frame" d="M79 161V194M188 161V194M67 194H93M174 194H201M80 179H188" fill="none" />
    <rect className="equipment-pad" x="64" y="151" width="140" height="12" rx="5" />
    <path className="equipment-detail" d="M74 155H194" fill="none" />
  </g>
}

function stretchHold(p: Pose): Pose {
  const armLength = distance(p.rightElbow, p.neck)
  const fraction = Math.min(1, 8 / Math.max(1, armLength))
  const contact: Point = [mix(p.rightElbow[0], p.neck[0], fraction), mix(p.rightElbow[1], p.neck[1], fraction)]
  return { ...p, leftHand: contact, leftElbow: reachElbow(p.neck, contact, 47, 33, -1) }
}

export const expansionUpperMotions: Record<string, MotionScene> = {
  'incline-push-up': {
    view: '侧面',
    action: '手撑高台，身体保持一线推起',
    startLabel: '屈肘让胸部靠近高台',
    endLabel: '伸肘将身体推离高台',
    startPose: supportedArms({
      head: [251, 98], neck: [232, 109], hip: [140, 152],
      leftElbow: [199, 130], leftHand: [238, 126],
      rightElbow: [222, 145], rightHand: [253, 126],
      leftKnee: [94, 173], leftFoot: [46, 190],
      rightKnee: [105, 173], rightFoot: [57, 190], torsoWidth: 21,
    }),
    pose: supportedArms({
      head: [226, 53], neck: [209, 68], hip: [132, 125],
      leftElbow: [206, 106], leftHand: [238, 126],
      rightElbow: [220, 105], rightHand: [253, 126],
      leftKnee: [88, 159], leftFoot: [46, 190],
      rightKnee: [99, 159], rightFoot: [57, 190], torsoWidth: 21,
    }),
    samplePose: p => supportedArms(p),
    equipment: <g>
      <path className="equipment-frame" d="M225 137V194M278 137V194M215 194H237M267 194H289M226 174H278" fill="none" />
      <rect className="equipment-pad" x="214" y="126" width="75" height="12" rx="5" />
      <path className="equipment-detail" d="M222 131H282" fill="none" />
    </g>,
    foreground: <path className="equipment-frame" d="M234 127H245M249 127H260" fill="none" strokeWidth="4" />,
    arrows: ['M169 138L160 106'],
  },
  'dumbbell-chest-fly': {
    view: '斜侧',
    action: '仰卧保持微屈肘，双臂弧线合拢',
    startLabel: '哑铃向胸部两侧打开',
    endLabel: '双臂向胸部上方合拢',
    startPose: {
      head: [93, 135], neck: [114, 137], hip: [178, 140],
      leftElbow: [76, 133], leftHand: [47, 107],
      rightElbow: [155, 135], rightHand: [192, 110],
      leftKnee: [195, 171], leftFoot: [186, 194],
      rightKnee: [219, 163], rightFoot: [226, 194], torsoWidth: 21,
    },
    pose: {
      head: [93, 135], neck: [114, 137], hip: [178, 140],
      leftElbow: [115, 96], leftHand: [126, 59],
      rightElbow: [148, 107], rightHand: [152, 59],
      leftKnee: [195, 171], leftFoot: [186, 194],
      rightKnee: [219, 163], rightFoot: [226, 194], torsoWidth: 21,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['dumbbell-chest-fly'], p, t),
    equipment: <FlatBench />,
    foreground: (p, t) => <g><Dumbbell at={p.leftHand} angle={-20 - 70 * t} /><Dumbbell at={p.rightHand} angle={20 + 70 * t} /></g>,
    arrows: ['M51 82Q75 52 100 53', 'M212 94Q214 60 179 48'],
  },
  'band-row': {
    view: '侧面',
    action: '坐姿将绕过双脚的弹力带拉向腰部',
    startLabel: '坐稳伸腿，双手前伸握带',
    endLabel: '肘向后拉，双手靠近腰部',
    startPose: {
      head: [121, 68], neck: [125, 89], hip: [111, 166],
      leftElbow: [165, 104], leftHand: [204, 119],
      rightElbow: [174, 116], rightHand: [216, 128],
      leftKnee: [175, 173], leftFoot: [234, 186], leftToe: [243, 175],
      rightKnee: [184, 181], rightFoot: [243, 194], rightToe: [252, 183], torsoWidth: 23,
    },
    pose: {
      head: [121, 68], neck: [125, 89], hip: [111, 166],
      leftElbow: [101, 117], leftHand: [143, 130],
      rightElbow: [109, 130], rightHand: [156, 139],
      leftKnee: [175, 173], leftFoot: [234, 186], leftToe: [243, 175],
      rightKnee: [184, 181], rightFoot: [243, 194], rightToe: [252, 183], torsoWidth: 23,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['band-row'], p, t),
    equipment: <g>
      <path className="equipment-pad" d="M69 190H260L277 199H51Z" opacity=".5" />
      <path className="equipment-detail" d="M70 196H260" fill="none" />
    </g>,
    foreground: p => <g>
      <path className="equipment-band" d={`M${p.leftHand[0]} ${p.leftHand[1]}L241 178Q253 179 248 190L${p.rightHand[0]} ${p.rightHand[1]}`} fill="none" />
      {[p.leftHand, p.rightHand].map(([x, y], i) => <path key={i} className="equipment-frame" d={`M${x - 3} ${y - 6}L${x + 3} ${y + 6}`} fill="none" strokeWidth="4" />)}
    </g>,
    arrows: ['M207 105L166 108'],
  },
  'barbell-bent-over-row': {
    view: '侧面',
    action: '髋部后移固定躯干，将杠铃划向腹部',
    startLabel: '俯身、双臂自然下垂握杠',
    endLabel: '肘向后上方拉，杠铃靠近腹部',
    startPose: {
      head: [207, 72], neck: [190, 88], hip: [131, 133],
      leftElbow: [187, 125], leftHand: [186, 160],
      rightElbow: [209, 123], rightHand: [211, 160],
      leftKnee: [119, 165], leftFoot: [101, 194],
      rightKnee: [153, 165], rightFoot: [174, 194], torsoWidth: 23,
    },
    pose: {
      head: [207, 72], neck: [190, 88], hip: [131, 133],
      leftElbow: [147, 78], leftHand: [152, 119],
      rightElbow: [161, 85], rightHand: [177, 119],
      leftKnee: [119, 165], leftFoot: [101, 194],
      rightKnee: [153, 165], rightFoot: [174, 194], torsoWidth: 23,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['barbell-bent-over-row'], p, t),
    foreground: p => <Barbell left={p.leftHand} right={p.rightHand} />,
    arrows: ['M250 150Q243 121 221 111'],
  },
  'inverted-row': {
    view: '侧面',
    action: '双脚踩稳、身体一线，屈肘将胸部拉向低杠',
    startLabel: '杠下悬垂，手臂伸展',
    endLabel: '屈肘把身体拉向低杠',
    startPose: supportedArms({
      head: [111, 145], neck: [132, 147], hip: [191, 168],
      leftElbow: [132, 109], leftHand: [114, 76],
      rightElbow: [147, 112], rightHand: [135, 76],
      leftKnee: [229, 180], leftFoot: [267, 190], leftToe: [278, 191],
      rightKnee: [235, 184], rightFoot: [275, 194], rightToe: [286, 194], torsoWidth: 21,
    }),
    pose: supportedArms({
      head: [86, 94], neck: [106, 100], hip: [181, 144],
      leftElbow: [140, 109], leftHand: [114, 76],
      rightElbow: [143, 113], rightHand: [135, 76],
      leftKnee: [225, 169], leftFoot: [267, 190], leftToe: [278, 191],
      rightKnee: [232, 174], rightFoot: [275, 194], rightToe: [286, 194], torsoWidth: 21,
    }),
    samplePose: p => supportedArms(p),
    equipment: <g>
      <path className="equipment-frame" d="M60 194V76H177V194M48 194H74M165 194H189M60 95L80 76M177 95L158 76" fill="none" />
      <path className="equipment-frame" d="M69 76H167" fill="none" strokeWidth="6" />
    </g>,
    foreground: <path className="equipment-weight" d="M105 76H123M127 76H145" fill="none" strokeWidth="6" />,
    arrows: ['M201 142L180 114'],
  },
  'single-arm-cable-lateral-raise': {
    view: '正面',
    action: '站稳保持躯干不动，单臂向侧方抬起',
    startLabel: '低位拉索握于身体侧前方',
    endLabel: '单臂抬至肩部附近',
    startPose: {
      head: [174, 52], neck: [174, 73], hip: [174, 136],
      leftElbow: [145, 112], leftHand: [157, 140],
      rightElbow: [192, 115], rightHand: [203, 151],
      leftKnee: [156, 165], leftFoot: [148, 194],
      rightKnee: [193, 165], rightFoot: [202, 194], torsoWidth: 25,
    },
    pose: {
      head: [174, 52], neck: [174, 73], hip: [174, 136],
      leftElbow: [145, 112], leftHand: [157, 140],
      rightElbow: [222, 82], rightHand: [264, 78],
      leftKnee: [156, 165], leftFoot: [148, 194],
      rightKnee: [193, 165], rightFoot: [202, 194], torsoWidth: 25,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['single-arm-cable-lateral-raise'], p, t, ['right']),
    equipment: p => <g>
      <CableTower x={57} />
      <path className="equipment-cable" d={`M57 179L${p.rightHand[0] - 6} ${p.rightHand[1] + 5}`} fill="none" />
    </g>,
    foreground: p => <g transform={`translate(${p.rightHand[0]} ${p.rightHand[1]})`}>
      <path className="equipment-frame" d="M-6-5V6L-16 5Q-23 0-16-5Z" fill="none" strokeWidth="3" />
      <path className="equipment-weight" d="M-6-6V7" fill="none" strokeWidth="4" />
    </g>,
    arrows: ['M247 144Q274 127 278 105'],
  },
  'dumbbell-front-raise': {
    view: '侧面',
    action: '肘微屈，双臂向身体正前方抬起',
    startLabel: '哑铃置于大腿前侧',
    endLabel: '双臂前抬至肩部附近',
    startPose: {
      head: [130, 51], neck: [126, 72], hip: [125, 132],
      leftElbow: [137, 113], leftHand: [145, 151],
      rightElbow: [150, 110], rightHand: [158, 150],
      leftKnee: [115, 163], leftFoot: [112, 194],
      rightKnee: [143, 164], rightFoot: [152, 194], torsoWidth: 25,
    },
    pose: {
      head: [130, 51], neck: [126, 72], hip: [125, 132],
      leftElbow: [168, 74], leftHand: [207, 73],
      rightElbow: [175, 87], rightHand: [216, 88],
      leftKnee: [115, 163], leftFoot: [112, 194],
      rightKnee: [143, 164], rightFoot: [152, 194], torsoWidth: 25,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['dumbbell-front-raise'], p, t),
    foreground: (p, t) => <g><Dumbbell at={p.leftHand} angle={15 + 75 * t} /><Dumbbell at={p.rightHand} angle={15 + 75 * t} /></g>,
    arrows: ['M211 151Q248 128 241 106'],
  },
  'prone-t-raise': {
    view: '俯视',
    action: '俯卧固定躯干，双臂呈 T 形轻抬',
    startLabel: '俯卧，双臂打开贴近垫面',
    endLabel: '肩胛稳定，轻抬双臂',
    startPose: {
      head: [160, 55], neck: [160, 77], hip: [160, 135],
      leftElbow: [110, 92], leftHand: [68, 100],
      rightElbow: [210, 92], rightHand: [252, 100],
      leftKnee: [148, 164], leftFoot: [137, 191], leftToe: [132, 194],
      rightKnee: [172, 164], rightFoot: [183, 191], rightToe: [188, 194], torsoWidth: 25,
    },
    pose: {
      head: [160, 55], neck: [160, 77], hip: [160, 135],
      leftElbow: [110, 77], leftHand: [68, 77],
      rightElbow: [210, 77], rightHand: [252, 77],
      leftKnee: [148, 164], leftFoot: [137, 191], leftToe: [132, 194],
      rightKnee: [172, 164], rightFoot: [183, 191], rightToe: [188, 194], torsoWidth: 25,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['prone-t-raise'], p, t),
    equipment: <g>
      <rect className="equipment-pad" x="45" y="34" width="230" height="164" rx="12" opacity=".34" />
      <path className="equipment-detail" d="M57 188H263M57 45H263" fill="none" opacity=".5" />
    </g>,
    arrows: ['M71 125V111', 'M249 125V111'],
  },
  'concentration-curl': {
    view: '斜侧',
    action: '坐姿将上臂抵住大腿内侧，固定肘部弯举',
    startLabel: '上臂抵住大腿，哑铃向下',
    endLabel: '保持肘部位置，将哑铃弯举至胸前',
    startPose: {
      head: [146, 76], neck: [153, 97], hip: [172, 148],
      leftElbow: [129, 138], leftHand: [139, 175],
      rightElbow: [191, 125], rightHand: [207, 157],
      leftKnee: [119, 157], leftFoot: [103, 194],
      rightKnee: [207, 160], rightFoot: [221, 194], torsoWidth: 24,
    },
    pose: {
      head: [146, 76], neck: [153, 97], hip: [172, 148],
      leftElbow: [129, 138], leftHand: [151, 108],
      rightElbow: [191, 125], rightHand: [207, 157],
      leftKnee: [119, 157], leftFoot: [103, 194],
      rightKnee: [207, 160], rightFoot: [221, 194], torsoWidth: 24,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['concentration-curl'], p, t, ['left']),
    equipment: <g>
      <path className="equipment-frame" d="M151 164V194M195 164V194M140 194H161M185 194H207M152 181H195" fill="none" />
      <rect className="equipment-pad" x="140" y="151" width="68" height="13" rx="5" />
    </g>,
    foreground: (p, t) => <Dumbbell at={p.leftHand} angle={10 - 25 * t} />,
    arrows: ['M92 153Q84 125 104 112'],
  },
  'cable-biceps-curl': {
    view: '侧面',
    action: '面向低位拉索，固定上臂屈肘弯举',
    startLabel: '肘贴身体，握住低位拉索杆',
    endLabel: '前臂向上弯举，上臂保持稳定',
    startPose: {
      head: [131, 50], neck: [128, 71], hip: [125, 132],
      leftElbow: [141, 111], leftHand: [162, 145],
      rightElbow: [155, 113], rightHand: [176, 147],
      leftKnee: [114, 163], leftFoot: [111, 194],
      rightKnee: [145, 163], rightFoot: [157, 194], torsoWidth: 25,
    },
    pose: {
      head: [131, 50], neck: [128, 71], hip: [125, 132],
      leftElbow: [141, 111], leftHand: [173, 88],
      rightElbow: [155, 113], rightHand: [187, 90],
      leftKnee: [114, 163], leftFoot: [111, 194],
      rightKnee: [145, 163], rightFoot: [157, 194], torsoWidth: 25,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['cable-biceps-curl'], p, t),
    equipment: p => <g>
      <CableTower x={264} />
      <path className="equipment-cable" d={`M264 179L${(p.leftHand[0] + p.rightHand[0]) / 2} ${(p.leftHand[1] + p.rightHand[1]) / 2}`} fill="none" />
    </g>,
    foreground: p => <g>
      <path className="equipment-frame" d={`M${p.leftHand[0] - 14} ${p.leftHand[1] - 2}L${p.rightHand[0] + 14} ${p.rightHand[1] + 2}`} fill="none" strokeWidth="5" />
      <circle className="equipment-weight" cx={(p.leftHand[0] + p.rightHand[0]) / 2} cy={(p.leftHand[1] + p.rightHand[1]) / 2} r="3.5" />
    </g>,
    arrows: ['M203 135Q218 112 207 97'],
  },
  'dumbbell-triceps-kickback': {
    view: '侧面',
    action: '俯身单手撑凳，固定上臂向后伸肘',
    startLabel: '上臂靠近躯干，前臂自然下垂',
    endLabel: '肘部不动，将哑铃伸向身后',
    startPose: {
      head: [209, 75], neck: [190, 89], hip: [135, 136],
      leftElbow: [150, 115], leftHand: [157, 155],
      rightElbow: [211, 121], rightHand: [231, 151],
      leftKnee: [119, 165], leftFoot: [106, 194],
      rightKnee: [157, 165], rightFoot: [177, 194], torsoWidth: 23,
    },
    pose: {
      head: [209, 75], neck: [190, 89], hip: [135, 136],
      leftElbow: [150, 115], leftHand: [118, 140],
      rightElbow: [211, 121], rightHand: [231, 151],
      leftKnee: [119, 165], leftFoot: [106, 194],
      rightKnee: [157, 165], rightFoot: [177, 194], torsoWidth: 23,
    },
    samplePose: (p, t) => arcArms(expansionUpperMotions['dumbbell-triceps-kickback'], p, t, ['left']),
    equipment: <g>
      <path className="equipment-frame" d="M222 164V194M269 164V194M212 194H233M259 194H280M223 181H269" fill="none" />
      <rect className="equipment-pad" x="211" y="153" width="69" height="12" rx="5" />
    </g>,
    foreground: (p, t) => <Dumbbell at={p.leftHand} angle={90 - 55 * t} />,
    arrows: ['M151 177Q125 185 106 167'],
  },
  'cross-body-shoulder-stretch': {
    view: '正面',
    action: '将一侧手臂横过胸前，另一只手轻托上臂',
    startLabel: '一臂横过胸前，另一手托住上臂',
    endLabel: '轻轻拉近胸部，肩部保持下沉',
    startPose: stretchHold({
      head: [160, 48], neck: [160, 69], hip: [160, 132],
      leftElbow: [182, 110], leftHand: [154, 100],
      rightElbow: [154, 100], rightHand: [118, 115],
      leftKnee: [146, 163], leftFoot: [143, 194],
      rightKnee: [174, 163], rightFoot: [177, 194], torsoWidth: 25,
    }),
    pose: stretchHold({
      head: [160, 48], neck: [160, 69], hip: [160, 132],
      leftElbow: [144, 114], leftHand: [127, 83],
      rightElbow: [127, 83], rightHand: [88, 82],
      leftKnee: [146, 163], leftFoot: [143, 194],
      rightKnee: [174, 163], rightFoot: [177, 194], torsoWidth: 25,
    }),
    samplePose: (p, t) => stretchHold(arcArms(expansionUpperMotions['cross-body-shoulder-stretch'], p, t, ['right'])),
    arrows: ['M118 58L94 64'],
  },
}
