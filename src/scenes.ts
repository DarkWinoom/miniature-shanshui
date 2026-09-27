export type Theme = "day" | "night";

export interface SceneView {
  id: string;
  label: string;
  nodeMatch?: string;
  cameraOffset: readonly [number, number, number];
  targetOffset?: readonly [number, number, number];
  mobileTargetOffset?: readonly [number, number, number];
  distanceScale: number;
  posters?: Readonly<Record<Theme, string>>;
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
  key: { color: string; intensity: number; position: readonly [number, number, number] };
  fill: { color: string; intensity: number; position: readonly [number, number, number] };
  accent: { color: string; intensity: number; distance: number };
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
  posters: Readonly<Record<Theme, string>>;
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
    posters: {
      day: "images/jinma-biji-day.png",
      night: "images/jinma-biji-night.png"
    },
    lighting: {
      day: {
        ambient: { color: "#fff7e7", intensity: 0.38 },
        hemisphere: { sky: "#e9f2f1", ground: "#95a5a0", intensity: 0.72 },
        key: { color: "#ffe1ae", intensity: 1.3, position: [16, 30, 20] },
        fill: { color: "#c8deeb", intensity: 0.48, position: [-18, 15, -9] },
        accent: { color: "#ffbf75", intensity: 0, distance: 24 },
        exposure: 0.9
      },
      night: {
        ambient: { color: "#90acc3", intensity: 0.24 },
        hemisphere: { sky: "#9abbd1", ground: "#2c3f4a", intensity: 0.6 },
        key: { color: "#93b2cf", intensity: 0.5, position: [12, 25, 18] },
        fill: { color: "#f1bc79", intensity: 0.65, position: [-14, 13, 10] },
        accent: { color: "#ffc178", intensity: 18, distance: 20 },
        exposure: 1
      }
    },
    views: [
      { id: "all", label: "双坊", cameraOffset: [0.34, 0.72, 1.28], targetOffset: [0, -7, 0], mobileTargetOffset: [0, -2, 0], distanceScale: 1.05 },
      {
        id: "jinma",
        label: "金马坊",
        nodeMatch: "JINMA",
        cameraOffset: [0, 0.32, 1],
        distanceScale: 1.2,
        posters: { day: "images/jinma-day.png", night: "images/jinma-night.png" }
      },
      {
        id: "biji",
        label: "碧鸡坊",
        nodeMatch: "BIJI",
        cameraOffset: [0, 0.32, 1],
        distanceScale: 1.2,
        posters: { day: "images/biji-day.png", night: "images/biji-night.png" }
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
