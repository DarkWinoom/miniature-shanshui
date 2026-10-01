import type { SceneDefinition } from "./scenes";

export const landscapeScene: SceneDefinition = {
  id: "004",
  city: "桂林",
  eyebrow: "青峰江影",
  title: "漓江兴坪",
  titleLines: ["漓江", "兴坪"],
  verse: ["青峰入江镜，", "归筏带渔灯。"],
  captions: { day: "晴江映峰", night: "江月渔灯" },
  overviewTitle: "青峰临水",
  storyButtonLabel: "走近兴坪",
  modelPath: "models/li-river-xingping.glb",
  cover: { avifPath: "covers/li-river-xingping.avif", webpPath: "covers/li-river-xingping.webp" },
  materialTreatment: "toon",
  terrain: { nodeName: "XINGPING | terrain" },
  water: { nodeName: "XINGPING | water", color: { day: "#518e81", night: "#233e46" } },
  atmosphere: { color: { day: "#dbe5d9", night: "#223940" }, near: 110, far: 650 },
  mist: {
    color: { day: "#edf1e9", night: "#7f9b9e" },
    formations: [
      { position: [-21, 17, -16], size: [40, 8], density: 0.34 },
      { position: [23, 12, 0], size: [32, 6], density: 0.27 },
      { position: [-3, 3.2, 0], size: [24, 3.4], density: 0.16 },
      { position: [-30, 12, 15], size: [22, 5.6], density: 0.25 },
      { position: [11, 25, -19], size: [28, 6], density: 0.29 }
    ]
  },
  shadowExclude: ["pedestal", "terrain", "land_edge", "shore_stones", "planting", "tree_branches", "roof_detail", "small_detail", "water", "village_ground", "village_footing"],
  lighting: {
    day: {
      ambient: { color: "#fff7e8", intensity: 0.34 },
      hemisphere: { sky: "#e7f0e8", ground: "#92a58c", intensity: 0.70 },
      key: { color: "#ffe9c9", intensity: 1.6, position: [-85, 110, 70], castShadow: true, shadowIntensity: 0.57 },
      fill: { color: "#cddde2", intensity: 0.42, position: [70, 50, -40] },
      accent: { color: "#ffd09b", intensity: 0, distance: 24 },
      plaque: { color: "#ffdb9e", intensity: 0, distance: 15 },
      exposure: 0.93
    },
    night: {
      ambient: { color: "#8ba5b3", intensity: 0.42 },
      hemisphere: { sky: "#94b4c9", ground: "#344f4b", intensity: 0.72 },
      key: { color: "#a3c3d9", intensity: 0.65, position: [30, 95, 65], castShadow: false, shadowIntensity: 0 },
      fill: { color: "#9ab5bf", intensity: 0.34, position: [-65, 48, -40] },
      accent: { color: "#ffd09b", intensity: 7, distance: 14 },
      plaque: { color: "#ffdb9e", intensity: 8, distance: 15 },
      exposure: 1.02
    }
  },
  nightFixtures: [
    { position: [-29.0, 5.05, 18.35], role: "accent" },
    { position: [-22.14, 5.05, 18.39], role: "accent" },
    { position: [-30.80, 4.61, 28.09], role: "accent" },
    { position: [-25.35, 4.61, 27.67], role: "accent" },
    { position: [-18.68, 4.49, 22.69], role: "accent" },
    { position: [-6.06, 1.65, 29.49], role: "plaque" },
    { position: [6.33, 1.65, 10.90], role: "plaque" }
  ],
  views: [
    { id: "all", label: "全景", cameraOffset: [-0.65, 0.60, 1.2], targetOffset: [0, -10, 0], mobileTargetOffset: [0, -1, 0], distanceScale: 1.23 },
    { id: "river", label: "江湾", cameraOffset: [-0.08, 0.36, 1.3], targetOffset: [-5, -14, 15], mobileTargetOffset: [-5, -12, 15], distanceScale: 0.52 },
    { id: "peaks", label: "峰林", cameraOffset: [0.4, 0.45, 1.1], targetOffset: [-5, 4, -18], distanceScale: 0.63 },
    { id: "village", label: "村舍", cameraOffset: [-0.25, 0.65, 1], targetOffset: [-24, -17.5, 23], distanceScale: 0.20, mobileDistanceScale: 0.13 }
  ],
  storyLead: "青峰围合，江水回转。竹筏、岸边人家与水中的山影，把兴坪一带的山水意象收进一方微缩景观。",
  story: [
    {
      label: "01 / PLACE",
      title: "兴坪江畔",
      body: "兴坪位于广西桂林阳朔，是漓江沿岸的一处水乡。山峰、江面与临水聚落共同构成这里的风景，舟船经过江湾，人家与田地落在两岸之间。"
    },
    {
      label: "02 / LANDSCAPE",
      title: "青峰与岩壁",
      body: "兴坪段的漓江山水以峰林、岩壁和沿江竹丛见长。山形有高低与疏密，裸露的岩石和坡面的植被相互穿插；从不同方向观看，远近峰体会组成不同的轮廓。"
    },
    {
      label: "03 / RIVER",
      title: "江中看山",
      body: "黄布倒影位于兴坪上游，是漓江沿线以山影著称的一处景观。平静的江面让山峰与竹丛映入水中，舟行与水纹又会改变倒影。此处借宽阔江湾与小筏，回应这种从水上观看山河的意趣。"
    },
    {
      label: "04 / MINIATURE",
      title: "一方山水",
      body: "模型以峰林、江湾为主体，岸边加入村舍、院落、凉亭、码头与弧形田地。全景看山河关系，江湾看舟筏与倒影，峰林看岩壁和植被，再走近村舍看石巷、井台与窗瓦；峰形与聚落布局均为原创概括，并非实景地形测绘复原。"
    }
  ],
  sources: [
    { label: "桂林漓江景区 · 黄布倒影", url: "https://www.liriver.org.cn/page/article/zglj.hbdy" },
    { label: "桂林漓江景区 · 漓江风光", url: "https://www.liriver.org.cn/" },
    { label: "阳朔漓江景区 · 兴坪", url: "https://www.ljjq.com/xingping.html" }
  ]
};
