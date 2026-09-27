# 微缩山水 · Miniature ShanShui

从昆明的金马碧鸡坊开始，在浏览器里转动一方微缩景观。项目是纯前端单页应用，无账号、后端或外部数据服务。

![金马碧鸡坊日游预览](public/images/jinma-biji-day.png)

## 浏览与操作

- 在“双坊”“金马坊”“碧鸡坊”之间切换，拖动模型旋转，使用滚轮或双指缩放。
- 使用展台右下角的按钮暂停或开启自动旋转、复位视角、进入沉浸观景；按 `Esc` 可以退出沉浸模式。
- 切换“日游”“夜游”，查看柔和阳光与夜间灯光。点击“走近双坊”阅读历史与民间掌故，点击“景观目录”查看已收录场景。
- 若设备无法运行 WebGL 或模型加载失败，页面会显示对应效果图，文字资料仍可阅读。启用系统的“减少动态效果”后，页面会简化切换动效。

目前收录 `01 · 金马碧鸡坊`。景观信息、子视图、相机和灯光统一登记在 `src/scenes.ts`，方便今后加入更多景观；目录只显示实际收录的场景。

## 本地运行

需要 Node.js 24 和 pnpm 11.19.0。下载仓库后，在项目根目录运行：

```sh
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
pnpm dev
```

打开终端给出的本地地址。检查和构建生产文件：

```sh
pnpm check
pnpm build
pnpm preview
```

构建结果位于 `dist/`。也可以用 `npm install`、`npm run dev` 和 `npm run build`；仓库以 pnpm 锁文件作为可复现安装基准。

## 部署

运行 `pnpm build` 后，把 **`dist/` 内的全部文件** 放到任意静态网站服务的站点目录。资源使用相对路径，放在站点根目录或子目录均可。无需配置 API、数据库或服务端路由。直接双击本地 `index.html` 不适合加载模型，请通过静态服务器访问。

若使用 Docker，项目提供只构建前端并由 Nginx 提供静态文件的多阶段镜像：

```sh
docker build -t miniature-shanshui .
docker run --rm -p 8080:80 miniature-shanshui
```

然后访问 [http://localhost:8080](http://localhost:8080)。

## 内容与许可

项目代码、`public/models/jinma-biji.glb` 与 `public/images/` 中的原创模型效果图按仓库根目录的 [MIT License](LICENSE) 开放。页面题词“金马迎朝晖，碧鸡映月华。”为本项目原创。页面历史内容为原创概述；“金碧交辉”明确作为民间掌故呈现，资料出处可在故事面板查看，也可参阅[云南省民政厅地名文化资料](https://ynmz.yn.gov.cn/cms/dimingfengcai/11216.html)与[昆明信息港文史报道](https://m.kunming.cn/news/c/2023-01-16/13652377.shtml)。本项目不使用这两处来源的图片或原文段落。

运行时使用的 Three.js 依其 MIT 许可分发，Draco 解码器依 Apache License 2.0 分发。第三方许可和告知文件随静态资源保存在 [`public/licenses/`](public/licenses/)。
