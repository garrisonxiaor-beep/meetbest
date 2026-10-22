import type { MotionScene, Point } from './motion-types';

const mat = <path className="equipment-pad" d="M39 193H281L293 201H27Z" opacity=".6" />;
const dumbbell = ([x, y]: Point, angle = 0) => <g transform={`translate(${x} ${y}) rotate(${angle})`}>
  <path className="equipment-frame" d="M-12 0H12" strokeWidth="4" />
  <rect className="equipment-weight" x="-17" y="-8" width="8" height="16" rx="2" />
  <rect className="equipment-weight" x="9" y="-8" width="8" height="16" rx="2" />
</g>;
const kneeArc = (from: Point, to: Point, knee: Point, t: number): Point => {
  if (t === 0) return from;
  if (t === 1) return to;
  const a = Math.atan2(from[1] - knee[1], from[0] - knee[0]);
  const b = Math.atan2(to[1] - knee[1], to[0] - knee[0]);
  const turn = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const radius = Math.hypot(from[0] - knee[0], from[1] - knee[1]) * (1 - t) + Math.hypot(to[0] - knee[0], to[1] - knee[1]) * t;
  return [knee[0] + Math.cos(a + turn * t) * radius, knee[1] + Math.sin(a + turn * t) * radius];
};

export const expansionLowerMotions: Record<string, MotionScene> = {
  'goblet-squat': {
    view: '正面', action: '胸前抱铃、屈髋下蹲', startLabel: '抱铃站稳', endLabel: '膝盖顺脚尖方向下蹲',
    startPose: {
      head: [160, 43], neck: [160, 65], hip: [160, 126],
      leftElbow: [133, 100], leftHand: [151, 83], rightElbow: [187, 100], rightHand: [169, 83],
      leftKnee: [133, 159], leftFoot: [109, 192], rightKnee: [187, 159], rightFoot: [211, 192], torsoWidth: 27,
    },
    pose: {
      head: [160, 80], neck: [160, 102], hip: [160, 155],
      leftElbow: [129, 136], leftHand: [151, 120], rightElbow: [191, 136], rightHand: [169, 120],
      leftKnee: [111, 160], leftFoot: [109, 192], rightKnee: [209, 160], rightFoot: [211, 192], torsoWidth: 27,
    },
    foreground: p => dumbbell([160, (p.leftHand[1] + p.rightHand[1]) / 2 + 6], 90),
    arrows: ['M77 108V153', 'M243 108V153'],
  },
  'reverse-lunge': {
    view: '侧面', action: '向后迈步、垂直下沉', startLabel: '双脚站稳', endLabel: '后撤一步、屈膝下沉',
    startPose: {
      head: [178, 43], neck: [174, 65], hip: [174, 125],
      leftElbow: [144, 93], leftHand: [165, 116], rightElbow: [199, 94], rightHand: [177, 115],
      leftKnee: [167, 158], leftFoot: [168, 190], rightKnee: [190, 156], rightFoot: [211, 190], torsoWidth: 25,
    },
    pose: {
      head: [165, 76], neck: [161, 98], hip: [161, 151],
      leftElbow: [130, 117], leftHand: [153, 135], rightElbow: [187, 118], rightHand: [166, 135],
      leftKnee: [112, 184], leftFoot: [81, 190], rightKnee: [207, 151], rightFoot: [211, 190], torsoWidth: 25,
    },
    arrows: ['M141 182H94', 'M235 109V150'],
  },
  'dumbbell-step-up': {
    view: '侧面', action: '踩稳台面、前腿蹬起', startLabel: '一脚踩稳低台', endLabel: '以台上腿发力站起',
    startPose: {
      head: [162, 65], neck: [160, 87], hip: [158, 138],
      leftElbow: [140, 119], leftHand: [137, 150], rightElbow: [190, 118], rightHand: [196, 148],
      leftKnee: [149, 169], leftFoot: [137, 194], rightKnee: [190, 125], rightFoot: [218, 148], torsoWidth: 24,
    },
    pose: {
      head: [210, 24], neck: [208, 46], hip: [208, 96],
      leftElbow: [189, 77], leftHand: [188, 109], rightElbow: [231, 79], rightHand: [231, 111],
      leftKnee: [170, 127], leftFoot: [162, 164], rightKnee: [211, 123], rightFoot: [218, 148], torsoWidth: 24,
    },
    equipment: <g><rect className="equipment-pad" x="191" y="154" width="69" height="42" rx="3" /><path className="equipment-frame" d="M189 151H262M199 158V193M252 158V193" /><path className="equipment-detail" d="M204 168H246M204 177H246" /></g>,
    foreground: p => <>{dumbbell(p.leftHand)}{dumbbell(p.rightHand)}</>,
    arrows: ['M276 143V95'],
  },
  'leg-press': {
    view: '侧面', action: '背贴靠垫、双腿推台', startLabel: '屈膝、双脚贴稳踏板', endLabel: '向斜上方推开、膝不过锁',
    startPose: {
      head: [88, 70], neck: [101, 93], hip: [136, 144],
      leftElbow: [91, 128], leftHand: [119, 156], rightElbow: [124, 124], rightHand: [149, 156],
      leftKnee: [182, 121], leftFoot: [207, 88], rightKnee: [194, 131], rightFoot: [219, 98], torsoWidth: 26,
    },
    pose: {
      head: [88, 70], neck: [101, 93], hip: [136, 144],
      leftElbow: [91, 128], leftHand: [119, 156], rightElbow: [124, 124], rightHand: [149, 156],
      leftKnee: [194, 99], leftFoot: [251, 52], rightKnee: [207, 111], rightFoot: [263, 62], torsoWidth: 26,
    },
    equipment: <g>
      <path className="equipment-frame" d="M55 194H290M147 180L282 42M165 187L297 52M94 151V193" />
      <path className="equipment-pad" d="M73 86L91 78L142 154L126 164Z" />
      <rect className="equipment-pad" x="117" y="157" width="49" height="12" rx="4" />
    </g>,
    foreground: p => <g><path className="equipment-frame" d={`M${p.leftFoot[0] - 13} ${p.leftFoot[1] - 16}L${p.rightFoot[0] + 14} ${p.rightFoot[1] + 15}`} strokeWidth="8" /><circle className="equipment-weight" cx={p.rightFoot[0] + 9} cy={p.rightFoot[1] + 20} r="11" /></g>,
    arrows: ['M215 147L249 113'],
  },
  'seated-leg-extension': {
    view: '侧面', action: '大腿贴垫、向前伸膝', startLabel: '屈膝坐稳、脚踝贴垫', endLabel: '保持上身、向前伸膝',
    startPose: {
      head: [121, 53], neck: [125, 75], hip: [132, 134],
      leftElbow: [107, 111], leftHand: [115, 151], rightElbow: [145, 113], rightHand: [147, 151],
      leftKnee: [169, 140], leftFoot: [170, 180], rightKnee: [177, 145], rightFoot: [180, 187], torsoWidth: 25,
    },
    pose: {
      head: [121, 53], neck: [125, 75], hip: [132, 134],
      leftElbow: [107, 111], leftHand: [115, 151], rightElbow: [145, 113], rightHand: [147, 151],
      leftKnee: [169, 140], leftFoot: [209, 140], rightKnee: [177, 145], rightFoot: [219, 145], torsoWidth: 25,
    },
    samplePose: (p, t) => {
      const scene = expansionLowerMotions['seated-leg-extension'];
      return { ...p, leftFoot: kneeArc(scene.startPose.leftFoot, scene.pose.leftFoot, p.leftKnee, t), rightFoot: kneeArc(scene.startPose.rightFoot, scene.pose.rightFoot, p.rightKnee, t) };
    },
    equipment: <g><path className="equipment-frame" d="M88 194H231M111 148V194M165 147V194M94 148V76" /><rect className="equipment-pad" x="96" y="73" width="17" height="65" rx="5" /><rect className="equipment-pad" x="104" y="142" width="76" height="13" rx="5" /></g>,
    foreground: p => <g><path className="equipment-frame" d={`M176 153L${p.rightFoot[0] + 4} ${p.rightFoot[1] + 5}`} /><rect className="equipment-pad" x={p.rightFoot[0] - 12} y={p.rightFoot[1] - 11} width="27" height="13" rx="6" /></g>,
    arrows: ['M196 177Q237 179 240 145'],
  },
  'glute-bridge': {
    view: '侧面', action: '双脚踩稳、臀部抬起', startLabel: '仰卧屈膝、双脚贴地', endLabel: '抬髋至肩髋膝连线',
    startPose: {
      head: [80, 170], neck: [101, 175], hip: [161, 183],
      leftElbow: [125, 185], leftHand: [157, 189], rightElbow: [129, 190], rightHand: [161, 194],
      leftKnee: [205, 139], leftFoot: [235, 189], rightKnee: [213, 145], rightFoot: [245, 194], torsoWidth: 24,
    },
    pose: {
      head: [80, 170], neck: [101, 175], hip: [160, 157],
      leftElbow: [125, 185], leftHand: [157, 189], rightElbow: [129, 190], rightHand: [161, 194],
      leftKnee: [205, 139], leftFoot: [235, 189], rightKnee: [213, 145], rightFoot: [245, 194], torsoWidth: 24,
    },
    equipment: mat, arrows: ['M166 145V118'],
  },
  'seated-hip-abduction': {
    view: '正面', action: '坐稳后双膝向外推开', startLabel: '双膝靠拢、外侧贴垫', endLabel: '控制双膝向外打开',
    startPose: {
      head: [160, 49], neck: [160, 71], hip: [160, 135],
      leftElbow: [126, 104], leftHand: [120, 147], rightElbow: [194, 104], rightHand: [200, 147],
      leftKnee: [146, 168], leftFoot: [143, 192], rightKnee: [174, 168], rightFoot: [177, 192], torsoWidth: 27,
    },
    pose: {
      head: [160, 49], neck: [160, 71], hip: [160, 135],
      leftElbow: [126, 104], leftHand: [120, 147], rightElbow: [194, 104], rightHand: [200, 147],
      leftKnee: [111, 163], leftFoot: [95, 191], rightKnee: [209, 163], rightFoot: [225, 191], torsoWidth: 27,
    },
    equipment: p => <g><path className="equipment-frame" d="M137 194H184M160 146V194M115 148V128M205 148V128" /><rect className="equipment-pad" x="145" y="77" width="30" height="62" rx="5" /><rect className="equipment-pad" x="131" y="140" width="58" height="12" rx="5" /><path className="equipment-frame" d={`M160 153L${p.leftFoot[0]} ${p.leftFoot[1] + 4}M160 153L${p.rightFoot[0]} ${p.rightFoot[1] + 4}`} /></g>,
    foreground: p => <g>{[p.leftKnee, p.rightKnee].map(([x, y], i) => <rect key={i} className="equipment-pad" x={x + (i ? 6 : -17)} y={y - 13} width="11" height="26" rx="5" />)}</g>,
    arrows: ['M116 122H84', 'M204 122H236'],
  },
  'dead-bug': {
    view: '侧面', action: '对侧手脚缓慢远伸', startLabel: '仰卧抬臂、髋膝弯曲', endLabel: '对侧手脚伸远、躯干稳定',
    startPose: {
      head: [77, 170], neck: [98, 169], hip: [158, 169],
      leftElbow: [110, 130], leftHand: [114, 92], rightElbow: [123, 132], rightHand: [127, 98],
      leftKnee: [172, 123], leftFoot: [211, 124], rightKnee: [190, 126], rightFoot: [226, 130], torsoWidth: 23,
    },
    pose: {
      head: [77, 170], neck: [98, 169], hip: [158, 169],
      leftElbow: [110, 130], leftHand: [114, 92], rightElbow: [65, 148], rightHand: [32, 147],
      leftKnee: [197, 166], leftFoot: [242, 185], rightKnee: [190, 126], rightFoot: [226, 130], torsoWidth: 23,
    },
    equipment: mat, arrows: ['M74 119L44 126', 'M233 161L263 174'],
  },
  'bird-dog': {
    view: '侧面', action: '对侧伸展、骨盆保持水平', startLabel: '手膝支撑、背部平稳', endLabel: '伸出对侧手臂与腿',
    startPose: {
      head: [219, 93], neck: [199, 111], hip: [137, 115],
      leftElbow: [204, 151], leftHand: [210, 188], rightElbow: [216, 153], rightHand: [225, 193],
      leftKnee: [129, 176], leftFoot: [85, 187], rightKnee: [146, 184], rightFoot: [100, 193], torsoWidth: 24,
    },
    pose: {
      head: [219, 93], neck: [199, 111], hip: [137, 115],
      leftElbow: [204, 151], leftHand: [210, 188], rightElbow: [240, 100], rightHand: [279, 87],
      leftKnee: [95, 113], leftFoot: [51, 111], leftToe: [40, 114], rightKnee: [146, 184], rightFoot: [100, 193], torsoWidth: 24,
    },
    equipment: mat, arrows: ['M252 71H284', 'M87 90H51'],
  },
  'reverse-crunch': {
    view: '侧面', action: '小幅卷起骨盆、控制还原', startLabel: '仰卧屈髋屈膝', endLabel: '卷起骨盆、膝盖靠近身体',
    startPose: {
      head: [85, 171], neck: [105, 174], hip: [162, 178],
      leftElbow: [121, 186], leftHand: [145, 190], rightElbow: [130, 190], rightHand: [155, 194],
      leftKnee: [180, 132], leftFoot: [219, 142], rightKnee: [192, 136], rightFoot: [230, 147], torsoWidth: 24,
    },
    pose: {
      head: [85, 171], neck: [105, 174], hip: [154, 158],
      leftElbow: [121, 186], leftHand: [145, 190], rightElbow: [130, 190], rightHand: [155, 194],
      leftKnee: [138, 112], leftFoot: [174, 118], rightKnee: [151, 115], rightFoot: [187, 122], torsoWidth: 24,
    },
    equipment: mat, arrows: ['M226 117Q201 90 174 94'],
  },
  'half-kneeling-hip-flexor-stretch': {
    view: '侧面', action: '半跪收髋、轻移重心', startLabel: '前脚踩地、后膝垫软垫', endLabel: '骨盆稳定、重心轻向前',
    startPose: {
      head: [169, 56], neck: [164, 78], hip: [155, 134],
      leftElbow: [180, 109], leftHand: [197, 140], rightElbow: [151, 111], rightHand: [160, 148],
      leftKnee: [115, 187], leftFoot: [73, 191], rightKnee: [200, 143], rightFoot: [211, 190], torsoWidth: 25,
    },
    pose: {
      head: [181, 62], neck: [176, 84], hip: [166, 140],
      leftElbow: [191, 113], leftHand: [208, 141], rightElbow: [164, 117], rightHand: [174, 152],
      leftKnee: [115, 187], leftFoot: [73, 191], rightKnee: [211, 144], rightFoot: [211, 190], torsoWidth: 25,
    },
    equipment: <g>{mat}<rect className="equipment-pad" x="95" y="191" width="43" height="7" rx="3" /></g>,
    arrows: ['M139 107H161'],
  },
  'cat-cow': {
    view: '侧面', action: '呼吸配合、缓慢拱背回落', startLabel: '胸口轻展开、骨盆自然转动', endLabel: '呼气拱背、头随躯干轻收',
    startPose: {
      head: [226, 100], neck: [205, 113], hip: [129, 125], torsoControl: [164, 147],
      leftElbow: [207, 151], leftHand: [209, 188], rightElbow: [219, 155], rightHand: [226, 193],
      leftKnee: [128, 180], leftFoot: [82, 187], rightKnee: [144, 184], rightFoot: [98, 193], torsoWidth: 24,
    },
    pose: {
      head: [220, 140], neck: [204, 118], hip: [130, 119], torsoControl: [164, 70],
      leftElbow: [207, 151], leftHand: [209, 188], rightElbow: [219, 155], rightHand: [226, 193],
      leftKnee: [128, 180], leftFoot: [82, 187], rightKnee: [144, 184], rightFoot: [98, 193], torsoWidth: 24,
    },
    equipment: mat, arrows: ['M166 88V65'],
  },
};
