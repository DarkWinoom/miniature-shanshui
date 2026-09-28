export type Theme = "day" | "night";

export interface SceneView {
  id: string;
  label: string;
  nodeMatch?: string;
  cameraOffset: readonly [number, number, number];
  targetOffset?: readonly [number, number, number];
  mobileTargetOffset?: readonly [number, number, number];
  distanceScale: number;
}

export interface StorySection {
  label: string;
  title: string;
  body: string;
}

export interface StorySource {
  label: string;
  url: string;
}

export interface LightingProfile {
  ambient: { color: string; intensity: number };
  hemisphere: { sky: string; ground: string; intensity: number };
  key: { color: string; intensity: number; position: readonly [number, number, number]; castShadow: boolean; shadowIntensity: number };
  fill: { color: string; intensity: number; position: readonly [number, number, number] };
  accent: { color: string; intensity: number; distance: number };
  plaque: { color: string; intensity: number; distance: number };
  exposure: number;
}

export interface SceneDefinition {
  id: string;
  city: string;
  eyebrow: string;
  title: string;
  titleLines: readonly [string, string];
  verse: readonly [string, string];
  captions: Readonly<Record<Theme, string>>;
  overviewTitle: string;
  storyButtonLabel: string;
  modelPath: string;
  cover?: { avifPath: string; webpPath: string };
  materialTreatment?: "toon";
  shadowExclude: readonly string[];
  lighting: Readonly<Record<Theme, LightingProfile>>;
  nightFixtures?: readonly { position: readonly [number, number, number]; role: "accent" | "plaque"; viewId?: string }[];
  views: readonly SceneView[];
  storyLead: string;
  story: readonly StorySection[];
  sources: readonly StorySource[];
}

export const scenes: readonly SceneDefinition[] = [
  {
    id: "001",
    city: "昆明",
    eyebrow: "春城微景",
    title: "金马碧鸡坊",
    titleLines: ["金马", "碧鸡坊"],
    verse: ["金马迎朝晖，", "碧鸡映月华。"],
    captions: { day: "春城晴光", night: "月色夜游" },
    overviewTitle: "双坊相望",
    storyButtonLabel: "走近双坊",
    modelPath: "models/jinma-biji.glb",
    cover: { avifPath: "covers/jinma-biji.avif", webpPath: "covers/jinma-biji.webp" },
    materialTreatment: "toon",
    shadowExclude: [
      "grass stems", "ridge carving", "carved relief", "carved surface", "glazed tiles",
      "Chiselled relief", "fine painted edges", "botanical relief", "herbaceous planting",
      "staggered individual slabs", "pavement detail", "granite inlay", "diorama base"
    ],
    lighting: {
      day: {
        ambient: { color: "#fff6e9", intensity: 0.27 },
        hemisphere: { sky: "#e7f0ef", ground: "#96a8a2", intensity: 0.62 },
        key: { color: "#ffe8bf", intensity: 1.7, position: [-22, 28, 16], castShadow: true, shadowIntensity: 0.64 },
        fill: { color: "#cbdde8", intensity: 0.36, position: [17, 12, -12] },
        accent: { color: "#ffbf75", intensity: 0, distance: 24 },
        plaque: { color: "#ffbf75", intensity: 0, distance: 14 },
        exposure: 0.93
      },
      night: {
        ambient: { color: "#809bb0", intensity: 0.16 },
        hemisphere: { sky: "#86a9c0", ground: "#263e47", intensity: 0.4 },
        key: { color: "#8fb1ca", intensity: 0.12, position: [12, 25, 18], castShadow: false, shadowIntensity: 0 },
        fill: { color: "#a9bbc0", intensity: 0.16, position: [-15, 13, 9] },
        accent: { color: "#ffc38a", intensity: 26, distance: 24 },
        plaque: { color: "#ffd5a0", intensity: 22, distance: 14 },
        exposure: 1.02
      }
    },
    views: [
      { id: "all", label: "双坊", cameraOffset: [0.34, 0.72, 1.28], targetOffset: [0, -7, 0], mobileTargetOffset: [0, -2, 0], distanceScale: 1.05 },
      {
        id: "jinma",
        label: "金马坊",
        nodeMatch: "JINMA",
        cameraOffset: [0, 0.32, 1],
        distanceScale: 1.2
      },
      {
        id: "biji",
        label: "碧鸡坊",
        nodeMatch: "BIJI",
        cameraOffset: [0, 0.32, 1],
        distanceScale: 1.2
      }
    ],
    storyLead: "一东一西，两坊相望。金瓦、青绿斗拱与石柱，把昆明熟悉的街口收进一方微缩景观。",
    story: [
      {
        label: "01 / PLACE",
        title: "山名与街名",
        body: "金马坊在东，碧鸡坊在西，分别呼应昆明东面的金马山与西面的碧鸡山。两座牌坊的名字相连，也成为“金碧路”这一街名的来处。"
      },
      {
        label: "02 / HISTORY",
        title: "几度重建",
        body: "二坊始建于明宣德年间，后来在城市变迁中数次损毁、重建。昆明今天可见的两坊是二十世纪末建成的仿古建筑，延续着这处街口的城市记忆。"
      },
      {
        label: "03 / FOLKLORE",
        title: "金碧交辉",
        body: "民间相传，中秋黄昏的日光与月光曾在两坊之间投下相接的影子，形成“金碧交辉”的景象。这是地方流传的掌故；此处借光影与模型回应它的意象。"
      },
      {
        label: "04 / MINIATURE",
        title: "从双坊看细节",
        body: "先看两坊相对的全景，再分别走近金马、碧鸡：起翘的檐角、层叠的瓦面，以及独立重绘的匾额题字与马、鸡简化浮雕，都可以成为下一次转动模型时的视线落点。"
      }
    ],
    sources: [
      { label: "云南省民政厅 · 昆明地名文化资料", url: "https://ynmz.yn.gov.cn/cms/dimingfengcai/11216.html" },
      { label: "昆明信息港 · 金碧交辉文史报道", url: "https://m.kunming.cn/news/c/2023-01-16/13652377.shtml" }
    ]
  },
  {
    id: "002",
    city: "昆明",
    eyebrow: "滇池楼影",
    title: "大观楼",
    titleLines: ["滇池", "大观楼"],
    verse: ["楼影临滇水，", "长联写春城。"],
    captions: { day: "湖畔晴光", night: "灯映楼台" },
    overviewTitle: "临水望远",
    storyButtonLabel: "走近大观楼",
    modelPath: "models/daguan-lou.glb",
    cover: { avifPath: "covers/daguan-lou.avif", webpPath: "covers/daguan-lou.webp" },
    materialTreatment: "toon",
    shadowExclude: ["DAGUAN | ground", "DAGUAN | water", "DAGUAN | planting"],
    lighting: {
      day: {
        ambient: { color: "#fff6e9", intensity: 0.27 },
        hemisphere: { sky: "#e7f0ef", ground: "#96a8a2", intensity: 0.62 },
        key: { color: "#ffe8bf", intensity: 1.7, position: [-22, 28, 16], castShadow: true, shadowIntensity: 0.64 },
        fill: { color: "#cbdde8", intensity: 0.36, position: [17, 12, -12] },
        accent: { color: "#ffc38a", intensity: 0, distance: 18 },
        plaque: { color: "#ffe1ab", intensity: 0, distance: 18 },
        exposure: 0.93
      },
      night: {
        ambient: { color: "#809bb0", intensity: 0.24 },
        hemisphere: { sky: "#86a9c0", ground: "#263e47", intensity: 0.46 },
        key: { color: "#8fb1ca", intensity: 0.26, position: [-22, 28, 16], castShadow: false, shadowIntensity: 0 },
        fill: { color: "#a9bbc0", intensity: 0.25, position: [17, 12, -12] },
        accent: { color: "#ffc38a", intensity: 36, distance: 18 },
        plaque: { color: "#ffe1ab", intensity: 42, distance: 18 },
        exposure: 1.02
      }
    },
    nightFixtures: [
      { position: [-5, 6, 5], role: "accent", viewId: "front" },
      { position: [5, 6, 5], role: "accent", viewId: "front" },
      { position: [0, 12, 5], role: "plaque", viewId: "front" },
      { position: [-5, 7, -5], role: "accent", viewId: "rear" },
      { position: [5, 7, -5], role: "accent", viewId: "rear" }
    ],
    views: [
      { id: "all", label: "全景", cameraOffset: [0.47, 0.47, 1], targetOffset: [0, -2, 0], mobileTargetOffset: [0, -1, 0], distanceScale: 1.25 },
      { id: "front", label: "南面", cameraOffset: [0, 0.13, 1], targetOffset: [0, -1.5, 0], distanceScale: 0.86 },
      { id: "rear", label: "北面", cameraOffset: [-0.55, 0.4, -1], targetOffset: [0, -0.7, 0], distanceScale: 0.86 }
    ],
    storyLead: "一座楼临近滇池草海，三重黄瓦映着水面；登临之意，也藏在檐下与长联之间。",
    story: [
      {
        label: "01 / PLACE",
        title: "近华浦畔",
        body: "大观楼位于昆明大观公园的近华浦，南望滇池草海。临水的楼台与岸边园林相连，得名于登楼可观湖山的开阔视野。"
      },
      {
        label: "02 / HISTORY",
        title: "层楼几度兴修",
        body: "清康熙二十九年起，近华浦陆续兴建亭台楼阁；大观楼后来增建为三层，又经历兵火与重修。今日所见的楼体承接了同治年间重建后的形制与城市记忆。"
      },
      {
        label: "03 / COUPLET",
        title: "湖山与往事",
        body: "清代孙髯翁所撰的 180 字长联，上联铺展滇池风物，下联回望云南史事，有“天下第一长联”的称誉。楼与联相互映照，成为昆明熟悉的人文意象。"
      },
      {
        label: "04 / MINIATURE",
        title: "在一方水岸转身",
        body: "转动模型，可从南面石阶走近檐下，再绕到北面看环廊。三重檐、临水台基与柳竹以微缩方式呈现；匾额和窗格为独立简化绘制，模型并非文物测绘复原。"
      }
    ],
    sources: [
      { label: "昆明信息港 · 大观楼历史建筑科普", url: "https://www.kunming.cn/news/c/2026-04-22/14035565.shtml" },
      { label: "昆明信息港 · 大观楼与长联文史报道", url: "https://www.kunming.cn/news/c/2022-08-11/13585378.shtml" }
    ]
  }
];

export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;
