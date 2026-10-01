# 内容与许可

微缩山水中的景观是艺术化的微缩创作，峰形、街巷与聚落布局经过概括，并非文物测绘或实景地形复原。

## 开放范围

以下内容按项目根目录的 [MIT License](../LICENSE) 开放，使用与分发时请保留其版权声明和许可文本。

| 内容 | 位置 |
| --- | --- |
| 项目代码与文档 | `src/`、`README.md`、`docs/` 等 |
| 四个网页模型 | [`public/models/`](../public/models/) |
| 模型预览图与页面截图 | [`public/covers/`](../public/covers/)、[`docs/screenshots/`](screenshots/) |

第三方组件与字体适用各自的许可，详见下方说明。可编辑的源 `.blend`、原始预览、制作脚本与内部验证记录保存在本地忽略目录 `.agents-docs/`，暂不随仓库公开。

## 模型与视觉素材

公开网页模型不包含从第三方实景照片裁切的贴图或描摹轮廓。目录封面与仓库截图均由公开模型在本项目中渲染生成。

| 景观 | 制作说明 |
| --- | --- |
| 金马碧鸡坊 | 公开模型的题字与瑞兽采用独立绘制，替换源文件中的照片衍生细节。 |
| 大观楼 | 公开模型的匾额与窗格采用简化重绘，替换源文件中的照片衍生细节。 |
| 周庄双桥 | 使用 Blender 5.2 制作原创桥梁、民居、船只与植物几何，采用纯色材质；没有摄影贴图、第三方模型或外部法线图片。 |
| 漓江兴坪 | 使用 Blender 5.2 制作原创峰林、村舍与水岸几何；岩石起伏、植被、顶点色和云雾由程序生成，没有摄影纹理、外部模型或云图片。 |

周庄的周边街巷与兴坪的村落、峰形均为风貌概括。建筑、岩壁沿用七级 Toon 风格，兴坪地面采用柔和的草土色与色板插值；水纹、倒影和云雾效果由项目代码实现。

## 文字与资料来源

各景题词与介绍文字由项目独立撰写，历史内容为原创概述，民间掌故明确标注。以下资料用于核对事实与参考一般风貌；来源图片和原文段落不进入公开资源，相关出处也列于页面故事面板。

| 景观 | 参考资料 |
| --- | --- |
| 漓江兴坪 | [桂林漓江景区 · 黄布倒影](https://www.liriver.org.cn/page/article/zglj.hbdy)、[阳朔漓江景区 · 兴坪](https://www.ljjq.com/xingping.html) |
| 金马碧鸡坊 | [云南省民政厅 · 地名文化资料](https://ynmz.yn.gov.cn/cms/dimingfengcai/11216.html)、[昆明信息港 · 文史报道](https://m.kunming.cn/news/c/2023-01-16/13652377.shtml) |
| 大观楼 | [昆明历史建筑科普](https://www.kunming.cn/news/c/2026-04-22/14035565.shtml)、[大观楼文史报道](https://www.kunming.cn/news/c/2022-08-11/13585378.shtml) |
| 周庄双桥 | [周庄旅游官网](https://zhouzhuang.net/scenic_4/1257.html)、[昆山市人民政府](https://www.ks.gov.cn/kss/tsks/202112/e6157a6b261149879f8322af3980ee62.shtml)、[苏州市地方志资料](https://dfzb.suzhou.gov.cn/dfzb/szdq/201604/949ce3099ec640709af67935765015a8.shtml) |

## 字体与第三方组件

| 名称 | 用途 | 许可 |
| --- | --- | --- |
| [霞鹜臻楷 GB](https://github.com/lxgw/LxgwZhenKai) | 金马碧鸡坊简化题字制作 | SIL OFL 1.1 |
| [Ma Shan Zheng](https://github.com/googlefonts/mashanzheng) | 大观楼简化题字制作 | SIL OFL 1.1 |
| Three.js | 网页三维渲染 | [MIT](../public/licenses/three-MIT.txt) |
| Draco 解码器 | 网页模型解压 | [Apache License 2.0](../public/licenses/draco-Apache-2.0.txt) · [NOTICE](../public/licenses/draco-NOTICE.txt) |

上述字体仅用于制作题字网格，字体文件不随项目分发。

项目 MIT 全文、运行时第三方许可与告知文件位于 [`public/licenses/`](../public/licenses/)，构建后随静态资源包含在 `dist/licenses/`。
