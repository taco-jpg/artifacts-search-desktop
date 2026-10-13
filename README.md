# Artifacts + DuckDuckGo for DeepSeek Harness Desktop

在聊天中展示可操作的 HTML/JavaScript 图表、graphs、模拟器和小工具，并让 AI 使用 DuckDuckGo 搜索。针对 **DeepSeek Harness Desktop 0.2.0-rc.2** 开发；插件包声明 `platform: web` 是桌面 UI 的加载契约，安装目标是 `desktop` profile。

## 下载与安装

在 [Releases](https://github.com/taco-jpg/artifacts-search-desktop/releases) 下载 `.tgz`，退出 DeepSeek Harness，再安装：

```sh
ELECTRON_RUN_AS_NODE=1 '/Applications/DeepSeek Harness.app/Contents/MacOS/DeepSeek Harness' \
  --expose-internals '/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js' \
  plugin --profile desktop add ~/Downloads/artifacts-search-desktop-0.1.1.tgz
```

重新打开应用。也可从仓库下载 `scripts/install-macos.sh`，运行 `sh scripts/install-macos.sh /absolute/path/to/package.tgz`。本包内置构建产物，不需要编译。其他系统可在桌面插件管理器支持包安装时选择同一个 tgz；目前真实桌面验证仅覆盖 macOS。

## 用法

- “做一个可以调整振幅的正弦曲线，直接在聊天里展示。”
- “做一个交互关系图，点节点显示详情。”
- “用 DuckDuckGo 搜索 DeepSeek Harness 官方仓库，给我来源链接。”
- “搜索相关公开数据，再画交互图；标明来源。”

插件注册 `present_artifact({id,title,html})`、`duckduckgo_search({query})`，以及 `interactive-artifacts` 和 `duckduckgo-search` 两个可自动发现的 skill。图表卡片有预览、源码、重置和 HTML 下载。完成回复后，作品还会显示在本轮回复底部，不随工具过程自动折叠。重复 id 表示同一作品的后续修订，旧版本留在聊天记录中。

## 预览与搜索边界

预览是 `sandbox="allow-scripts"` iframe，使用独立 origin 和 CSP，阻止网络资源加载、fetch、嵌套 frame、表单提交和宿主 DOM/存储访问。请生成自包含 HTML、CSS、JavaScript、SVG 或 Canvas，不使用 CDN。宿主聊天仍可正常联网。HTML 下载包含作品源码，离开本预览后运行时遵循目标浏览器的规则。

DuckDuckGo 查询由宿主 Node 端转发至固定的 `https://html.duckduckgo.com/html/`，解析标题、真实目标链接与摘要，再以结构化结果回传 AI。这是本地搜索代理适配层，不启动对公网开放的 HTTP 代理，也没有任意 URL 转发接口。DuckDuckGo 搜索服务不是随本包提供的开源搜索索引；其 HTML 端点无可用性保证，可能出现限流、验证码或页面结构变化，插件明确报错，不绕过验证码、不伪造结果。查询会发给 DuckDuckGo，无 API key。

可在 profile 的插件 entry `config` 设置 `searchTimeoutMs`（默认 30000，部署参数）、`searchMaxResults`（默认返回上游本页全部结果）和 `region`（如 `us-en`）。没有硬编码的结果数量限制。不会修改宿主已有的 `web_search` 或模型配置。

## 开发

```sh
npm ci
npm run build
npm test
npm run smoke:search
npm pack
```

`src/` 为维护源文件；`dist/` 为打包产物。搜索测试包括真实链接解析、重复链接、验证码、异常响应、取消和配置截取。插件测试检查实际构建包注册的工具、skill 与可见性提示。真实上游 smoke 需要网络，失败时应区分限流与代码错误。

依据 [DeepSeek Harness 插件源码与扩展契约](https://github.com/deepseek-ai/deepseek-harness) 及安装版运行时实现。MIT licensed. DuckDuckGo 与 DeepSeek 均未赞助或认证此第三方插件。
