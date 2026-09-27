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
  materialTreatment?: "weathered" | "toon";
  shadowExclude: readonly string[];
  lighting: Readonly<Record<Theme, LightingProfile>>;
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
        body: "先看两坊相对的全景，再分别走近金马、碧鸡：起翘的檐角、层叠的瓦面、匾额上的题字，以及马与鸡的浮雕，都可以成为下一次转动模型时的视线落点。"
      }
    ],
    sources: [
      { label: "云南省民政厅 · 昆明地名文化资料", url: "https://ynmz.yn.gov.cn/cms/dimingfengcai/11216.html" },
      { label: "昆明信息港 · 金碧交辉文史报道", url: "https://m.kunming.cn/news/c/2023-01-16/13652377.shtml" }
    ]
  }
];

export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;
