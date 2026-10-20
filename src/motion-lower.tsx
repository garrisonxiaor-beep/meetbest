import type { MotionScene } from './motion-types';

const dumbbell = (x: number, y: number, vertical = false) => (
  <g transform={`translate(${x} ${y})${vertical ? ' rotate(90)' : ''}`}>
    <path className="equipment-frame" d="M-12 0H12" strokeWidth="4" />
    <rect className="equipment-weight" x="-16" y="-8" width="7" height="16" rx="2" />
    <rect className="equipment-weight" x="9" y="-8" width="7" height="16" rx="2" />
  </g>
);

export const lowerMotions: Record<string, MotionScene> = {
  'seated-dumbbell-shoulder-press': {
    view: '正面',
    action: '向上推举',
    pose: {
      head: [160, 63], neck: [160, 85], hip: [160, 140],
      leftElbow: [121, 89], leftHand: [116, 52],
      rightElbow: [199, 89], rightHand: [204, 52],
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
    foreground: <g>{dumbbell(116, 52)}{dumbbell(204, 52)}</g>,
    arrows: ['M82 91V48', 'M238 91V48'],
  },
  'reverse-pec-deck': {
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
    equipment: (
      <g>
        <path className="equipment-frame" d="M64 192V48H256V192M50 192H78M242 192H270M160 149V194" />
        <path className="equipment-detail" d="M95 48L80 81M225 48L240 81" />
        <circle className="equipment-weight" cx="95" cy="48" r="6" />
        <circle className="equipment-weight" cx="225" cy="48" r="6" />
        <rect className="equipment-pad" x="134" y="149" width="52" height="9" rx="4" />
      </g>
    ),
    foreground: (
      <g>
        <rect className="equipment-pad" x="145" y="108" width="30" height="33" rx="7" />
        <path className="equipment-frame" d="M80 74V90M240 74V90" strokeWidth="5" />
      </g>
    ),
    arrows: ['M126 63Q102 60 78 67', 'M194 63Q218 60 242 67'],
  },
  'seated-cable-face-pull': {
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
        <path className="equipment-cable" d="M250 73L211 76" />
      </g>
    ),
    foreground: (
      <g>
        <path className="equipment-cable" d="M211 76L165 70M211 76L176 81" strokeWidth="3" />
        <circle className="equipment-weight" cx="165" cy="70" r="4" />
        <circle className="equipment-weight" cx="176" cy="81" r="4" />
      </g>
    ),
    arrows: ['M228 103H190'],
  },
  'prone-y-raise': {
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
    foreground: (
      <g>
        <path className="equipment-frame" d="M158 155H243" strokeWidth="4" />
        <rect className="equipment-weight" x="165" y="138" width="10" height="34" rx="3" />
        <rect className="equipment-weight" x="227" y="138" width="10" height="34" rx="3" />
      </g>
    ),
    arrows: ['M122 101H85', 'M254 110V145'],
  },
  'bulgarian-split-squat': {
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
    foreground: <g>{dumbbell(151, 137)}{dumbbell(199, 138)}</g>,
    arrows: ['M263 95V148'],
  },
  'prone-leg-curl': {
    view: '侧面',
    action: '屈膝带起腿垫',
    pose: {
      head: [79, 103], neck: [100, 112], hip: [163, 120],
      leftElbow: [85, 135], leftHand: [63, 140],
      rightElbow: [102, 139], rightHand: [77, 146],
      leftKnee: [206, 122], leftFoot: [227, 68],
      rightKnee: [216, 126], rightFoot: [242, 74],
      torsoWidth: 23,
    },
    equipment: (
      <g>
        <path className="equipment-frame" d="M106 194V139M210 194V139M94 194H265M215 137L239 82" />
        <path className="equipment-pad" d="M101 123L165 130L224 136L222 147L164 141L99 134Z" />
        <path className="equipment-frame" d="M101 150H60V139M110 157H76V146" />
        <rect className="equipment-weight" x="246" y="151" width="23" height="39" rx="3" />
        <path className="equipment-cable" d="M215 137L256 152" />
        <circle className="equipment-weight" cx="215" cy="137" r="6" />
      </g>
    ),
    foreground: (
      <g transform="translate(235 79) rotate(15)">
        <rect className="equipment-pad" x="-17" y="-6" width="34" height="12" rx="6" />
        <ellipse className="equipment-weight" cx="15" cy="0" rx="4" ry="6" />
      </g>
    ),
    arrows: ['M263 124Q282 92 264 65'],
  },
  'hip-thrust': {
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
    equipment: (
      <g>
        <path className="equipment-frame" d="M71 193V142M119 193V142M58 193H276M169 133L261 176" />
        <rect className="equipment-pad" x="62" y="133" width="69" height="13" rx="5" />
        <rect className="equipment-pad" x="201" y="193" width="51" height="6" rx="3" />
        <circle className="equipment-weight" cx="261" cy="174" r="17" />
        <circle className="equipment-pad" cx="261" cy="174" r="5" />
      </g>
    ),
    foreground: (
      <g>
        <path d="M160 113L177 115L181 132L164 135Z" fill="var(--motion-weight)" />
        <path className="equipment-detail" d="M166 116L172 131" stroke="var(--motion-accent)" />
        <path className="equipment-frame" d="M152 140H181" strokeWidth="4" />
      </g>
    ),
    arrows: ['M176 164V144', 'M172 99V72'],
  },
  'standing-calf-raise': {
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
        <rect className="equipment-pad" x="158" y="187" width="36" height="11" rx="3" />
        <path className="equipment-detail" d="M135 194H149" strokeDasharray="3 4" />
      </g>
    ),
    arrows: ['M117 187V157'],
  },
  'band-lateral-walk': {
    view: '正面',
    action: '保持张力侧移',
    pose: {
      head: [160, 55], neck: [160, 77], hip: [160, 128],
      leftElbow: [124, 104], leftHand: [146, 116],
      rightElbow: [192, 104], rightHand: [175, 115],
      leftKnee: [125, 155], leftFoot: [102, 190],
      rightKnee: [196, 159], rightFoot: [215, 190],
      torsoWidth: 26,
    },
    foreground: (
      <g>
        <path className="equipment-band" d="M132 141Q161 150 188 144L192 153Q159 160 128 150Z" />
        <path d="M133 144Q161 153 188 147" fill="none" stroke="var(--motion-accent)" strokeWidth="2" opacity=".6" />
      </g>
    ),
    arrows: ['M226 142H265', 'M84 177H56'],
  },
  'barbell-curl': {
    view: '正面',
    action: '肘部稳定弯举',
    pose: {
      head: [160, 45], neck: [160, 67], hip: [160, 123],
      leftElbow: [130, 105], leftHand: [133, 80],
      rightElbow: [190, 105], rightHand: [187, 80],
      leftKnee: [145, 157], leftFoot: [141, 190],
      rightKnee: [177, 157], rightFoot: [182, 190],
      torsoWidth: 26,
    },
    foreground: (
      <g>
        <path className="equipment-frame" d="M96 80H224" strokeWidth="4" />
        <rect className="equipment-weight" x="105" y="67" width="10" height="26" rx="3" />
        <rect className="equipment-weight" x="205" y="67" width="10" height="26" rx="3" />
        <path className="equipment-detail" d="M124 80H141M180 80H197" />
      </g>
    ),
    arrows: ['M90 130Q75 102 90 75', 'M230 130Q245 102 230 75'],
  },
};
