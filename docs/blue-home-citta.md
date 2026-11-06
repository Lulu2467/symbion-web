# 蓝色首页与侧栏：界面还原和对接

源文件：`H2-B-switching-twin-prototype.html`。对照的线上地址是 `H2-B-switching-twin-prototype.html#citta=expanded`。下面只记这份文件里实际执行的行为。文件里没有聊天接口。

## 本地打开

文件放在仓库根目录，和 `assets/` 同级。直接打开该 HTML，或在仓库根目录起静态服务后打开它。

本地副本和线上文件有两处不同：

1. 线上 `<head>` 只在 `localStorage['h2-theme']==='blue'` 时给 `<html>` 写 `data-theme="blue"`。本地副本在该值不是 `'green'` 时就写 `data-theme="blue"`。读 `localStorage` 失败时也写蓝色。点「绿色」后 `applyTheme` 会删掉 `data-theme` 并把 `h2-theme` 写成 `green`，再打开仍是绿色。
2. 线上没有 hash 时执行 `setScreen('welcome')`。本地副本没有 hash 时执行 `setScreen('home')` 再 `setCittaExpanded(true)`。`setCittaExpanded(true)` 会 `history.replaceState` 成 `#citta=expanded`。已有 hash 时仍走 `readHash()`，不改 hash 含义。

`#citta=expanded` 且没有 `screen` 时，`readHash` 把 `screen` 缺省成 `home`，再 `setCittaExpanded(true)`。顶栏「平时在用」是 `[data-screen="home"]`。

字体来自 `https://fonts.googleapis.com` 的 Inter 和 Noto Sans SC。离线时页面仍能跑，字体会落到浏览器默认字体。蓝色主题的 Citta 头像是 `assets/citta-avatar.png?v=2`。蓝色下孪生头像走 `AIS.*.illustration`（`assets/gunther-roland-illustrated.jpg`、`assets/enrico-pajer-illustrated.jpg`、`assets/haifeng-xu-illustrated.jpg`），不走 `AIS.*.photo` 的远程地址。

## 蓝色首页实际画出来的部分

`#screen-home` 加上 class `on`，`#tail-home` 同时加上 class `on`。蓝色并且 `#screen-home.on` 时，这些被 CSS 藏掉：

- `#greeting-home .eyebrow`
- `#greeting-home .course-banner`，以及 `.course-banner ~ p[data-live="sub"]`
- `#greeting-home .day`
- `#composer .working`
- `#composerFoot`
- `#tail-home .goal-sec`

所以蓝色首页问候只剩 `#greeting-home h2`。课程条、日期行、当天时间轴、副标题都在 DOM 里，`syncLiveGreeting` 仍会改它们，只是蓝色首页不显示。

看得到的是：

- 标题 `h2`，由 `syncLiveGreeting` 写成 `Good morning|Good afternoon|Good evening, {name}`。小时 `<12` 为 morning，`<17` 为 afternoon，否则 evening。
- `#composer` 的输入、加号、发送、以及 `#composerTools` 的 Doc / Deck / Numbers / SymTex / Code。
- `#tail-home`：标题在蓝色下显示「Quick start」（`.tools-title-week` 隐藏，`.tools-title-usual` 显示），五张 `.week-card`，Discover，Reminders 四条，Cosmos 五条（`.cosmos-title-full` 隐藏，显示 `.cosmos-title-short` 的 `Cosmos`，徽章文字是 HTML 里的 `5 new`）。`2 of 5 tried` 是 HTML 里的固定文字。

名字来自 `userName()`。`localStorage['symbion-user-name']` 为空或等于 `Jess` 时用 `Lulu`。`#accountName` 有内容时用输入框里的字。`bindUserName` 会把解析结果写回 `symbion-user-name`。

`syncLiveGreeting` 每 60 秒跑一次，并在启动时跑一次。它还写这些当前被藏住的节点：

- `[data-live="eyebrow-text"]`（home）：`{WEEKDAY} {D} {MONTH}  ·  WEEK {n} OF FALL TERM`。`fallTermWeek` 从当年 9 月第一个星期一开始算，结果限制在 1 到 16。
- `[data-live="sub"]`（home）由 `homeSub` 写成下面三句之一。蓝色首页这句被 CSS 隐藏。当前分钟 `<11:00`：`Reply to Prof. Roland is at <b>11:00</b>. Lecture 5 follows at <b>2:30</b> — want Citta to prep a <b>10-minute deck</b>?`。`<14:30`：`Lecture 5 is at <b>2:30</b>. Want Citta to prep a <b>10-minute deck</b> before you go?`。否则：`Lecture 5 is done. Your reading report is <b>due tomorrow</b> — finish it with Citta?`。
- `[data-live="day"]`：轨道常量 `DAY_START_MIN=480`、`DAY_END_MIN=1200`、`DAY_TRACK_W=420`。home 的 `[data-live="day-note"]` 在 14:30 前是 `Lecture 5 at 2:30`，否则是 `Evening free`。

天气是这份首页里唯一的网络请求。`initLiveGreeting` 先按本地钟点画图标，再 `fetchWeather`：

`GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=weather_code`

有定位就用定位；失败、超时 4 秒、或没有定位时用纬度 `42.36`、经度 `-71.06`。读到的字段是 `data.current.weather_code`。`weatherFromCode` 按这个顺序：`code==null` 时，小时 `<6` 或 `>=20` 为月亮，小时 `>=17` 且 `<20` 为云，其余为太阳。`code===0` 时，小时 `<6` 或 `>=20` 为月亮，否则太阳。`code<=3` 为云。其余为雨。请求失败则留在本地钟点图标。图标只写入 `[data-live="weather"]`，蓝色首页里这个节点在被隐藏的 eyebrow 中。

## 首页上会打开侧栏的操作

这些都不请求后端。

- `#composer` 发送走 `sendFromComposer`。有文字或 `composer` 附件时：打开侧栏，把文字抄进 `#cittaInput`，附件名追加为 ` [attached: a, b]`；只有附件时正文是 `Please look at the attached file(s).` 加同样的附件注记。然后清空首页输入和首页附件，调用 `sendFromCittaPanel`。没有文字也没有附件时只打开侧栏并 toast `Type a message or attach a file first`。
- 蓝色首页点 `#composerTools .tool` 不会取消已选工具，只 `setComposerToolSelection(key)` 并聚焦输入。`syncComposerCases` 给 `#composerTools` 加上 `is-prompts`。这时五个 `.tool` 被 CSS 设为 `display: none`，改成三颗 `.tool-prompt`。点某一句只 `setComposerDraft`，不发送。`selectedComposerTool` 不会写进发出去的消息。三句原文：
  - doc：`Help me write a one-page summary of Lecture 1`；`Help me outline a reading report`；`Help me explain quark-gluon plasma for my notes`
  - deck：`Help me turn Lecture 1 into 6 slides`；`Help me prep a 10-minute lecture deck`；`Help me make a slide for the phase diagram`
  - numbers：`Help me plot the sPHENIX sample data`；`Help me chart my Lab 3 measurements`；`Help me compare two runs side by side`
  - symtex：`Help me typeset the Bjorken energy formula`；`Help me typeset the phase-diagram labels`；`Help me write one equation with a short note`
  - code：`Help me run a tiny particle simulation`；`Help me plot the sample data in Python`；`Help me check the units in a short script`
- 首页加号 `openAttachPicker('composer')`，选文件后只放进内存数组 `composerAttachments`。图片用 `URL.createObjectURL`。没有上传。非图片按扩展名选工具：`ppt`、`pptx`、`key`→deck；`xls`、`xlsx`、`csv`、`tsv`→numbers；`py`、`js`、`ts`、`tsx`、`jsx`、`java`、`cpp`、`c`、`h`、`rs`、`go`、`ipynb`→code；`tex`、`latex`→symtex；其余→doc。首页还没选工具时，用最后一个文件的工具调用 `setComposerToolSelection`。
- `#tail-home` 的 `.btn-soft` 走 `runReminderAction`：打开侧栏，若按钮有 `data-tool` 就选中该工具，toast `{prefix}  {verb} — Citta is on it`。不往侧栏写消息，也不填 `#cittaInput`。蓝色且当前是 Citta 时 `prefix` 是 `★`。
- `.act-link`（Cosmos 那几条，以及侧栏回复里的 Open in Deck）在 `frame` 的点击处理里先被命中：flash、toast 按钮的 `textContent`、`setCittaExpanded(true)`，然后 return。后面的 `.citta-panel .asst-card .act-link` 分支（toast `Opening in Deck`）因此不会执行。
- `[data-action="add-reminder"]` 打开侧栏并把 `#cittaInput` 设为 `Remind me to `，不发送。
- Quick start 里 `data-action="open"` 走 `openWeekTool`：选中工具并 toast `Opening {label} · {sub}`。`data-action="try-citta"` 走 `tryToolWithCitta`：切回 Citta，选中工具，打开侧栏，把首页草稿设为 `Try {Label} with Citta — what should we make first?`，toast `Citta is opening {Label} — ready when you are`。不发送。

`#composerFoot` 在蓝色首页隐藏，所以「Continue with」和 `continueWithChip` / `resumeCittaThread` 从蓝色首页点不到。`resumeCittaThread` 会用 `innerHTML` 换掉整个 `.citta-scroll`，预置的 `#toolCallPreview` 会一起被删掉。

## 侧栏在蓝色下看见什么

`#cittaPanel`。`setCittaExpanded(true)` 给 `.frame` 加 `citta-open`，去掉 `hidden`，并隐藏 `#dock`。蓝色下面板 `top: 48px; right: 0`，`.citta-open` 时 `transform: none`。

蓝色 CSS 隐藏 `.task-pill`、`.ctx`、`.run-hd`、`.run-list`。HTML 里那三张 `.citta-run`（Lecture 4 summary、Lab 3 trends、Create a deck called “Lab 3”）还在，蓝色不显示。

滚动区 `#cittaScroll` 的固定内容：

1. 用户：`Prep me for lecture 5`
2. 回复：`I drafted a 10-slide deck from Prof. Roland’s lecture 5 slides, with 3 quiz questions at the end.` 按钮文字 `Open in Deck`
3. 用户：`Can you also pull quiz answers from the reading?`
4. 回复：`Yes — I lined up 3 quiz prompts with short answer keys from the QGP reading notes. Open the deck to tweak wording.` 按钮文字 `Open in Deck`
5. `#toolCallPreview`，class 是 `asst-card is-tools`。HTML 里 `hidden`。`applyTheme` 调 `syncToolCallPreview`：蓝色时去掉 `hidden`，没有 `.think-row` 就 `prepend(buildThinkRow())`，没有 `.tool-calls` 就 `appendChild(buildToolCalls())`。

底部两个建议按钮的文字是 `Elaborate in the deck editor` 和 `Turn Lab 3 trends into slides`。点击监听在按钮上，并且 `stopPropagation`，所以只发送一次。`#cittaPanelClose` 调用 `setCittaExpanded(false)`。`#cittaPlus` 调用 `openAttachPicker('citta')`。Enter 不按 Shift 时发送。

## Thinking

可见的 Thinking 只有 `buildThinkRow()` 放进 `#toolCallPreview` 的那一行。class 是 `think-row`，文字节点是 `Thinking`。

点阵：`think-dots` 里 16 个 `span`，4 列 4 行。第 `i` 个点 `col=i%4`，`line=floor(i/4)`，`diag=line+(3-col)`，`delay=((diag/6)*0.2+(diag%2)*0.5)*1.5` 秒，写到 `animation-delay`。动画名 `think-drift`，1.5s linear infinite。`prefers-reduced-motion: reduce` 时动画关掉，点的 opacity 为 0.45。

`.asst-card.is-thinking` 有样式。`fillReply` 会 `classList.remove('is-thinking')`。全文件没有 `classList.add('is-thinking')`。发送出去的新卡片不会出现 Thinking 行。

## 工具调用效果

数据在 `TOOL_CALLS`。每行一个动词和轮换的 detail，顺序固定：

| verb | lines |
| --- | --- |
| Searching | quark-gluon plasma, lecture 5 slides, Bjorken energy, sPHENIX sample |
| Reading | QGP notes, lecture 5 notes, the reading report |
| Creating | Lecture 5 slides, 3 quiz questions, speaker notes |
| Browsing | heavy-ion course page, lecture 5 files, course readings |
| Designing | lecture page 7, the chart slide, the title slide |
| Running | Lab 3 trend chart, the sPHENIX plot, sample data |
| Processing | quiz answer key, the QGP reading, answer keys |

`buildToolCalls` 给每行建 `.tool-call`，里面一个 `.ink` 和一个 `.glint`。`.ink` 是图标加 `<b>{verb}</b>` 加第一句 detail。`.glint` 是 `.ink` 的拷贝，`aria-hidden`，用来做扫光。扫光动画 `tool-sweep`，3s linear infinite。`prefers-reduced-motion: reduce` 时 `.glint` 设为 `visibility: hidden` 且动画关掉。

detail 轮换常量 `TOOL_DETAIL_HOLD=2200`。第 `index` 行第一次切换在 `2200 + index * Math.round(2200/7)` 毫秒，之后每 2200 毫秒一次。`Math.round(2200/7)` 是 314。`swapToolDetail` 在不减少动效时给 `.detail-track` 加上 `is-sliding`，新句子放在旧句子下面，动画 `detail-up` 0.42s，位移到 `translateY(-20px)`，旧行同时 `detail-fade`。`animationend` 或 480 毫秒后删掉旧行并去掉 `is-sliding`。减少动效时直接改最后一行的 `textContent`，不播动画。

`#toolCallPreview` 里的七行在 `syncToolCallPreview` 建好后就开始轮换，不需要发消息。`applyTheme` 在蓝色启动时就会调用它，早于侧栏打开。再切回蓝色时，已有 `.think-row` 和 `.tool-calls` 不会重建。

发消息时 `sendFromCittaPanel`：

- 蓝色：立刻建 `.asst-card.is-tools`，只放入一份新的 `buildToolCalls()`，没有 `.think-row`，马上放进滚动区。1500 毫秒后 `fillReply`：留下 `.tool-calls`，把回复文字放进新建的 `.tool-reply`。有 `link` 时在 `.tool-reply` 里加按钮。
- 非蓝色：220 毫秒后才把卡片放进滚动区，卡片只有回复文字，没有工具行。

`cittaReplyFor` 按这个顺序匹配，不请求网络：

1. `parseReminderIntent`：`/^\s*remind\s+me\s+(?:to\s+)?(.+)$/i` 或 `/^\s*提醒我(?:去|要)?(.+)$/`。任务去掉首尾空白和句末 `.!?。！？`，首字母改大写，得到 `title`。回复 HTML 是 `Done — I added “{title}” to your Reminders. Say when you want to tackle it.`，`link` 为 null。然后 `addReminderFromCitta`：在 `h3` 匹配 `/Reminders|Coming up/i` 且内部没有 `.onboard-row` 的列表顶部插入 `.rem`。`data-from-citta="1"`，时间文字 `Today`，徽章 `Yours`，按钮 `data-verb="Open with Citta"`。同一列表里已有相同 `.t` 则不插。这种回复不 toast `Sent to Citta`。
2. 小写文本包含 `elaborate` 或 `deck editor`：`Opening the deck editor with speaker notes expanded on slides 1–3. You can edit anything before I keep going.`，按钮 `Open in Deck`。
3. 包含 `lab 3`、`trends` 或 `slides`：`I’ll turn Lab 3 trends into a 6-slide deck with a chart on slide 2. Drafting now…`，按钮 `Open in Deck`。
4. 其余：`Got it — working on “{text}”. I’ll keep the file open so you can edit as I go.` 超过 72 个字符时 text 截成前 72 个字符加 `…`。`link` 为 null。

第 2、3、4 类 toast `Sent to Citta`。空内容 toast `Type a message or attach a file first`。

两个建议按钮因此分别落到第 2 条和第 3 条。

## 对接时替换什么

替换时保留上面的 DOM class 和出现顺序，否则扫光、detail 上移和 Thinking 点阵对不上。

- 回复正文现在来自 `cittaReplyFor`。接后端时，仍由 `sendFromCittaPanel` 先画出 `.is-tools` 和 `buildToolCalls()`，等真实结果回来再 `fillReply`。现在的等待是固定 1500 毫秒，不是流式。
- 工具行现在来自写死的 `TOOL_CALLS`。后端若要换动词和 detail，输入仍是 `{ verb, lines: string[], svg }` 这一结构；`buildToolCalls` 只读这三项。
- Thinking 行现在只在 `syncToolCallPreview` 里出现一次。新消息的卡片没有这行。
- `selectedComposerTool` 和附件文件现在都不会随消息提交。附件只在消息字符串里留下文件名。
- 首页问候和天气已经由 `syncLiveGreeting` 与 `fetchWeather` 接上本地钟点和 open-meteo。Reminders、Cosmos、Quick start、侧栏前两轮对话是 HTML 固定文案。
