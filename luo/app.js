(function () {
  var KEY = "lwy-cosmo-v1";
  var DUTY_START = 8;
  var DUTY_END = 24;
  var VOICE = "assets/voice/01.wav";
  var FACE = "assets/luo-portrait.png";

  var SCHEMES = {
    youcao: {
      name: "油糙方案",
      who: "出油偏旺 + 粗糙堵塞。控住多余油脂和堵塞，但不越洗越干。",
      am: "丝塔芙三酸洁面 → 理貌 C10 → 珀莱雅蓝管防晒",
      pm: "三酸洁面 → 上水和肌水杨酸精华水 → SVR 14% PHA 与植然方适烟酰胺乳隔天",
      note: "酸类和 VC 的白天必须防晒。",
      chips: ["白天防晒", "PHA 隔天"]
    },
    youdou: {
      name: "油痘方案",
      who: "出油 + 堵塞 + 痘痘。控油、疏通、舒缓同时管理，不把痘“刷掉”。",
      am: "丝塔芙三酸洁面 → 理貌 C10 → 珀莱雅蓝管防晒",
      pm: "三酸洁面 → 达尔肤杏仁酸与厚脸皮水隔天 → 珀莱雅源力精华",
      note: "红肿范围大时停用功效成分，只留清洁和修护。不手挤痘。",
      chips: ["白天防晒", "杏仁酸隔天"]
    },
    mindou: {
      name: "敏痘方案",
      who: "出油痘 + 低耐受。功效与耐受平衡，解决一个问题不制造另一个。",
      am: "丝塔芙三酸洁面 → 艾培科 EGCG → 珀莱雅蓝管防晒",
      pm: "三酸洁面 → 丝塔芙净痘精华（用一休一，先点涂）→ 丝塔芙自修精华",
      note: "酸类和 VC 的白天必须防晒。很红很痒先停功效。",
      chips: ["白天防晒", "用一休一"]
    },
    gancao: {
      name: "干糙方案",
      who: "水脂不足 + 干燥粗糙。先补水补脂，再温和改善粗糙，不靠强剥脱。",
      am: "可温水不洁面 → 欧邦琪 C10 → B5 与角鲨烷 → 羽西白玉防晒",
      pm: "三式洁面 → B5 与油 → 芯丝翠活性乳与 Olay 油霜隔天",
      note: "酸类和 VC 的白天必须防晒。",
      chips: ["白天防晒", "油霜隔天"]
    },
    ganmin: {
      name: "干敏方案",
      who: "干燥缺脂 + 低耐受。稳定优先于改善，先降刺激再谈功效。",
      am: "温水不洁面 → EGCG → B5 与油 → 珀莱雅蓝管防晒",
      pm: "三式洁面 → B5 → 芯丝翠胶水精华与优色林舒安霜隔天",
      note: "泛红时先停功效成分。",
      chips: ["白天防晒", "舒安霜隔天"]
    },
    kanglao: {
      name: "抗老方案",
      who: "偏干 + 老化迹象。补水补脂打底，抗氧防晒+更新重塑长期管理老化。",
      am: "可温水不洁面 → 欧邦琪 C15 → B5 与油 → 欧莱雅牡丹防晒",
      pm: "三式洁面 → 芯丝翠淡斑乳与 Olay 黑管隔天 → 舒安霜 Pro 与角鲨烷",
      note: "孕妇和哺乳不用 A 醇。酸类和 VC 的白天必须防晒。",
      chips: ["白天防晒", "不用 A 醇"]
    }
  };

  var KITS = {
    cetaphil: {
      name: "丝塔芙三酸洁面",
      am: "每天可用，每次 1–2 泵。日常清洁湿手湿脸，30 秒内冲掉。卸通勤防晒时改成湿手干脸。",
      pm: "洁面后按肤质方案用功效。屏障不稳时先停功效，清洁可以留。",
      voice: "丝塔芙三酸洁面每次 1 到 2 泵。日常清洁湿手湿脸，搓出泡沫后上脸，30 秒内冲掉。卸通勤防晒改成湿手干脸。"
    },
    drwu: {
      name: "达尔肤8%杏仁酸",
      am: "不用这支。留下洁面、保湿、防晒。",
      pm: "夜间使用，避开眼周，用量 5–10 滴。初期用 1 休 1。不要叠第二支功效。",
      voice: "达尔肤 8% 杏仁酸只在晚上用，5 到 10 滴，避开眼周。初期用一休一。不要叠其他功效，白天做好防晒。"
    }
  };

  var OPT4 = ["从不", "很少", "经常会", "每次都会"];
  var BASE = [
    { key: "b0", t: "洗完脸后不使用任何保湿霜、防晒霜、柔肤水、粉或其他产品。过 2–3 小时，在明亮灯光下照镜子，你的额头和脸颊会：", o: ["很粗糙，易脱皮，或起皮屑", "皮肤紧绷", "皮肤很水润，在灯光下没有反射", "肉眼可见的油光"] },
    { key: "b1", t: "在照片上，你的皮肤看起来油光发亮：", o: ["从来不会，或你从未注意", "偶尔", "经常", "一直如此"] },
    { key: "b2", t: "使用粉底但不用遮盖粉后 2–3 小时，你的粉底会表现：", o: ["局部出现卡纹、卡粉", "妆容完整，不出油也不卡粉", "局部出油", "大面积出油、脱妆，需要补妆", "我不用粉底"] },
    { key: "b3", t: "在干燥的环境中，如果不使用保湿霜或防晒霜，你面部的皮肤会：", o: ["感觉很干或干裂，但后续会出油", "感觉很紧绷，但后续会出油", "感觉很正常", "看上去很油光，或我从来没有感觉到我需要保湿霜", "我不知道"] },
    { key: "b4", t: "从放大镜里观察，你面部有多少粗大的毛孔直径超过大头针？", o: ["没有", "只在 T 区（额头和鼻子）有一些", "有许多", "非常多", "不知道"], c: "请仔细观察，只有在确实不能确定时才选 E。" },
    { key: "b5", t: "你会怎样描述你面部的皮肤？", o: ["干的", "正常的", "混合性的", "油性的"] },
    { key: "b6", t: "当你用肥皂泡沫、泡沫乳、泡沫丰富的洁面乳洁面时，你面部的皮肤会：", o: ["感觉干或干裂", "感觉有轻微的干但是没有裂开", "感觉正常", "感觉油性的", "我不用肥皂或其他泡沫洁面乳"], c: "如果不用泡沫洁面是因为它们会让你的脸很干，请选 A。" },
    { key: "b7", t: "如果没有保湿霜，你脸部的皮肤会感觉紧绷：", o: ["经常", "有时会", "很少", "从来不会"] },
    { key: "b8", t: "你有毛孔堵塞（黑头或白头）：", o: ["从来没有过", "很少", "有时会有", "总有"] },
    { key: "b9", t: "你脸部在 T 字区（额头和鼻子）是油性的：", o: ["从来没有", "有时", "时常会有", "总是"] },
    { key: "b10", t: "使用保湿霜后 2–3 小时，你的颊部会：", o: ["非常粗糙，起屑或还是觉得很干", "平滑", "轻度油光发亮", "光滑油亮，或我根本就不用保湿霜"] }
  ];
  var SENS_G = "以下场景中，你脸上（或场景相关的皮肤部位）是否会出现发痒、灼烧、发痘、发红、刺痛等症状？";
  var SENS_RED = "以下场景中，你脸上是否会出现发红等症状？";
  var SENS = [
    { key: "s0", t: "你脸上是否会出现红色突起（红斑、丘疹等）？", o: ["从不", "很少", "经常会，至少一个月出现一次", "总是会，至少每周出现一次"] },
    { key: "s1", g: SENS_G, t: "环境温度突然变化（如换季、天气降温、出入空调房等）", o: ["从不", "很少", "经常会，但症状不严重", "每次都会，症状较严重"] },
    { key: "s2", g: SENS_G, t: "环境中有敏感源（如花粉、尘埃、雾霾、柳絮、猫狗毛、螨虫等）出现", o: ["从不", "很少", "经常会，但症状不严重", "每次都会，症状较严重"] },
    { key: "s3", g: SENS_G, t: "使用护肤产品（如洁面、水乳、膏霜等）", o: ["从不", "很少", "经常会，但症状不严重", "每次都会，症状较严重", "我从不使用以上产品"], w: "S" },
    { key: "s4", g: SENS_G, t: "使用防晒产品或彩妆产品（如粉底、眼影等）", o: ["从不", "很少", "经常会，但症状不严重", "每次都会，症状较严重", "我从不使用以上产品"], w: "S" },
    { key: "s5", g: SENS_G, t: "使用身体洗护产品（如沐浴产品、身体乳、按摩精油等）", o: ["从不", "很少", "经常会，但症状不严重", "每次都会，症状较严重", "我从不使用以上产品"] },
    { key: "s6", g: SENS_RED, t: "运动后，或情绪激动、因压力而紧张时", o: OPT4 },
    { key: "s7", g: SENS_RED, t: "饮用含酒精的饮品后", o: ["从不", "很少", "经常会，但症状不严重", "每次都会", "我从不饮酒"] },
    { key: "s8", g: SENS_RED, t: "食用辛辣、热烫或其他刺激性食物", o: ["从不", "很少", "经常会，但症状不严重", "每次都会", "我从不食用刺激性食物"] },
    { key: "s9", g: "以下场景中，你脸上（或场景相关的皮肤部位）是否会出现发红等症状？", t: "佩戴金属饰品（如耳环、戒指等），或使用其他金属材质接触皮肤（如剃须、使用美容仪等）", o: ["从不", "很少", "经常会，但症状不严重", "每次都会", "我从不佩戴金属饰品或使用类似产品"] },
    { key: "s10", g: "以下场景中，你脸上（或场景相关的皮肤部位）是否会出现发红等症状？", t: "佩戴其他饰品（玉佩等）经常摩擦皮肤", o: ["从不", "很少", "经常会，但症状不严重", "每次都会", "我从不佩戴这类饰品"] },
    { key: "s11", t: "仔细观察面部时，肉眼可见的红血丝状况：", o: ["没有红血丝", "有轻微红血丝，少于面颊 1/4", "有较多红血丝，约占面颊 1/4–1/2", "有大量红血丝，大于面颊的 1/2"] },
    { key: "s12", t: "人们会问你「脸上怎么发红了」，或「是不是被晒伤了」（即使你没有晒太阳）之类的话：", o: ["从不", "很少", "经常会，至少一个月出现一次", "总是会，至少每周出现一次"] },
    { key: "s13", t: "近一年内，你曾被诊断为红斑痤疮、局部性皮炎、湿疹或接触性皮炎等病症：", o: ["没有", "没去看过，并不在意，简单自用一些舒缓、止痒的药物便能自愈", "是的，最近一年看过皮肤科医生并被确诊。经治疗痊愈后，不再复发", "是的，最近一年看过皮肤科医生并被确诊。经过治疗后，症状不严重", "是的，最近一年被确诊过。经过治疗后，症状仍很严重"], w: "Q7" },
    { key: "s14", t: "你的亲属中有人被诊断过红斑痤疮、局部性皮炎、湿疹、接触性皮炎、过敏或哮喘等病症吗？", o: ["没有", "据我所知有一个", "有 2–4 位亲属被诊断过", "有 5 位以上亲属被诊断过"] }
  ];
  var ACNE = [
    { key: "a0", t: "皮肤的毛孔是否有黑头、白头情况？", o: ["少量分布在鼻尖", "鼻尖和鼻翼、额头等处明显可见", "面部大部分都有"] },
    { key: "a1", t: "是否有痤疮情况？", o: ["偶尔会冒出一两个", "经常会长", "大面积分布，同时冒出 5 个以上，反复交替"] },
    { key: "a2", t: "痤疮的大小和形状：", o: ["单个散在分布，大小不超过绿豆", "明显地聚集在某个皮肤区域，大小经常超过绿豆", "明显的聚集成团，痤疮之间的正常皮肤呈红色，肉眼可见的结节或囊肿"] },
    { key: "a3", t: "一年内，是否被皮肤科明确诊断为痤疮？", o: ["从未因为痤疮而去皮肤科", "明确被医生诊断为痤疮", "因为痤疮反复而去皮肤科治疗"] },
    { key: "a4", t: "你的痤疮治疗情况：", o: ["在一两周内不做处理也会自行消退", "使用外用药物会加速消退", "必须使用外用药物和内服药物，否则情况会持续"] }
  ];
  var SC_BASE = [1, 2, 3, 4, 2.5];
  var SC_NORMAL = [1, 2, 3, 4, 1.5];
  var SC_S34 = [2, 4, 6, 8, 3];
  var SC_Q7 = [2, 3, 4, 6, 10];
  var SC_ABC = [1, 2, 3];
  var BANDS_BASE = [{ hi: 16, name: "非常干性" }, { hi: 26, name: "轻度干性" }, { hi: 33, name: "轻度油性" }, { hi: 44, name: "非常油性" }];
  var BANDS_SENS = [{ hi: 29, name: "耐受肌" }, { hi: 35, name: "脆弱肌" }, { hi: 999, name: "敏感肌" }];
  var BANDS_ACNE = [{ hi: 6, name: "接近正常皮肤" }, { hi: 11, name: "易长痤疮 A 型" }, { hi: 15, name: "高度易长痤疮 AA 型" }];

  var RECENT = [
    { id: "DY-9210042", kit: "cetaphil", name: "丝塔芙三酸洁面", time: "2026-09-18 21:06", status: "已发货", img: "assets/product-cetaphil.png" },
    { id: "DY-9181103", kit: "drwu", name: "达尔肤8%杏仁酸", time: "2026-09-05 12:20", status: "已完成", img: "assets/product-drwu.jpg" },
    { id: "DY-9072201", kit: "", name: "珀莱雅蓝管防晒", time: "2026-08-22 10:15", status: "已完成", img: "assets/product-sunscreen.jpg" }
  ];

  var app = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var audio = new Audio(VOICE);

  var state = load() || blank();
  var smsLeft = 0;
  var smsTimer = null;
  var qToken = 0;

  function blank() {
    return {
      screen: "splash",
      tab: "a",
      via: "",
      person: "",
      orders: [],
      info: { name: "", age: "18–25 岁", sex: "女", note: "" },
      oil: "",
      trouble: "",
      schemeId: "",
      qMod: "base",
      qIdx: 0,
      ans: {},
      concerns: [],
      saved: false,
      chat: [],
      agreed: true
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.saved || !data.schemeId) return null;
      data.screen = "home";
      data.tab = "a";
      data.chat = [];
      return data;
    } catch (e) {
      return null;
    }
  }

  function save() {
    if (!state.saved) return;
    var copy = JSON.parse(JSON.stringify(state));
    copy.chat = [];
    copy.screen = "home";
    try { localStorage.setItem(KEY, JSON.stringify(copy)); } catch (e) {}
  }

  function toast(text) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.hidden = true; }, 1600);
  }

  function onDuty() {
    var now = new Date();
    var day = now.getDay();
    if (day === 0 || day === 6) return false;
    var h = now.getHours();
    return h >= DUTY_START && h < DUTY_END;
  }

  function scheme() {
    return SCHEMES[state.schemeId] || null;
  }

  function matureAge() {
    var age = state.info.age;
    return age === "36–45 岁" || age === "45 岁以上" || age === "36 岁以上";
  }

  function pickScheme() {
    if (state.trouble === "sensitive" && state.oil === "dry") return "ganmin";
    if (state.trouble === "sensitive") return "mindou";
    if (state.trouble === "acne" && state.oil === "oily") return "youdou";
    if (state.trouble === "acne") return "gancao";
    if (state.oil === "dry" && matureAge()) return "kanglao";
    if (state.oil === "dry") return "gancao";
    return "youcao";
  }

  function replyTo(text) {
    var t = String(text || "");
    if (/过敏|渗液|红肿|破皮|就医|医生/.test(t)) {
      return "这类情况先停功效成分，并建议就医。需要的话点「转导师」。退款不会在这里答应。";
    }
    if (/怀孕|孕妇|哺乳/.test(t)) {
      return "孕妇和哺乳不用 A 醇。其余用法以你已买的那几件为准，我不会另推商品。";
    }
    if (/达尔肤|杏仁酸/.test(t)) return KITS.drwu.voice;
    if (/丝塔芙|三酸/.test(t)) return KITS.cetaphil.voice;
    if (!state.saved || !scheme()) return "先完成肤质测试。信息不够时我不猜用法，也不推新的商品。";
    if (/怎么用|用法|早晚/.test(t)) {
      return "按你的" + scheme().name + "用已经买过的。早：" + scheme().am + "。晚：" + scheme().pm + "。要听某一件，从化妆台点听用法。";
    }
    return "这个问题超出已有用法。我不会另推商品。信息不够时可以转导师。";
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function backBtn(id) {
    return '<button type="button" class="back" id="' + id + '" aria-label="返回"><img src="assets/back.svg" alt="" width="24" height="24"></button>';
  }

  function bar(backId, title, large) {
    var back = backId ? backBtn(backId) : '<span class="back-slot" aria-hidden="true"></span>';
    return '<header class="bar">' + back + '<h1 class="bar-title' + (large ? " lg" : "") + '">' + esc(title) + "</h1></header>";
  }

  function mark() {
    return '<span class="wordmark"><svg viewBox="0 0 588 403" fill="none" aria-hidden="true"><path fill="currentColor" d="M185.04 0C187.182 3.06253e-05 189.308 0.132502 191.416 0.392578H286.586V0.400391C341.645 1.26989 386.18 90.4861 386.501 200.658H386.502C386.502 256.016 397.767 306.114 415.962 342.356C434.169 378.623 459.247 400.902 486.827 400.902C507.519 400.902 526.803 388.362 542.833 366.783C529.371 380.528 514.049 388.306 497.791 388.307C479.154 388.306 461.745 378.087 446.961 360.373C471.082 323.732 486.693 217.758 486.821 152.566C527.76 167.042 549.726 138.984 587.553 124.762L587.551 124.766H587.965C587.965 180.223 576.681 306.343 558.418 342.722C540.167 379.076 514.879 401.715 486.827 401.715C484.625 401.715 482.44 401.576 480.273 401.301H385.281V401.293C330.226 400.423 285.693 311.22 285.366 201.058H285.365C285.365 145.699 274.1 95.6005 255.905 59.3574C237.699 23.0909 212.62 0.812901 185.04 0.8125C164.357 0.812501 145.082 13.3405 129.056 34.9014C142.512 21.1704 157.827 13.3994 174.076 13.3994C192.713 13.3996 210.122 23.6195 224.906 41.333C201.594 76.7453 186.233 132.003 185.112 194.521C188.22 199.377 191.517 203.495 195.087 207.117C207.406 219.616 226.5 229.76 263.77 239.379L267.474 299.194C231.961 313.226 210.157 325.952 194.709 340.73C179.655 355.132 168.548 373.497 158.114 402.569L98.7021 402.298C88.1495 372.03 79.0104 353.078 65.9092 338.014C52.9951 323.165 34.0985 309.707 0 294.966L4.2041 235.645C38.3376 226.325 56.6173 216.907 69.2891 204.628C74.6055 199.476 79.4868 193.287 84.2051 185.356C86.115 136.155 96.9255 91.9056 113.448 58.9932C131.699 22.6387 156.988 1.2262e-06 185.04 0ZM131.692 227.95C126.189 235.865 120.071 243.174 113.145 249.887C104.752 258.019 95.5671 264.895 85.5312 270.848C96.0057 278.698 105.241 287.203 113.463 296.656C119.726 303.858 125.214 311.402 130.13 319.292C136.342 310.725 143.28 302.715 151.144 295.191C159.464 287.232 168.565 280.065 178.521 273.458C168.069 267.181 158.645 259.921 150.202 251.355C143.112 244.161 137.019 236.352 131.692 227.95Z"/></svg><span>Symbion</span></span>';
  }

  function render() {
    app.classList.toggle("dy-on", state.screen === "douyin");
    app.classList.toggle("chat-on", state.screen === "chat");
    var s = state.screen;
    if (s === "splash") splash();
    else if (s === "login") login();
    else if (s === "douyin") douyin();
    else if (s === "quiz") quiz();
    else if (s === "ask") ask();
    else if (s === "triage") triage();
    else if (s === "blocked") blocked();
    else if (s === "plan") plan();
    else if (s === "home") home();
    else if (s === "chat") chat();
    bind();
  }

  function splash() {
    app.innerHTML =
      '<header class="bar">' + mark() + "</header>" +
      '<div class="hero">' +
        '<figure class="portrait-frame"><img class="portrait" src="assets/luo-hero.png" alt="骆王宇"></figure>' +
        '<p class="kicker">Symbion · 私屿</p><h1>骆王宇</h1>' +
        '<p class="sub hero-tags"><span>科学</span><span>极简</span><span>高效</span></p>' +
      "</div>" +
      '<button type="button" class="btn" id="enter">进入</button>';
  }

  function loginMarkup(live) {
    var back = live
      ? backBtn("backSplash")
      : '<span class="back" aria-hidden="true"><img src="assets/back.svg" alt="" width="24" height="24"></span>';
    var id = function (name) { return live ? ' id="' + name + '"' : ""; };
    return '<header class="bar">' + back + '<h1 class="bar-title lg">登录</h1></header>' +
      '<section class="login-mod">' +
        '<label class="field">手机号</label>' +
        '<div class="phone-row">' +
          '<span class="dial" aria-hidden="true"><svg viewBox="0 0 1024 1024" width="16" height="16"><path fill="currentColor" d="M647.499 60.657H375.167c-89.602 0-162.497 72.895-162.497 162.497v573.907c0 89.602 72.895 162.497 162.497 162.497h272.332c89.602 0 162.497-72.895 162.497-162.497V223.154c0.001-89.602-72.895-162.497-162.497-162.497z m108.332 736.404c0 59.733-48.598 108.331-108.331 108.331H375.167c-59.733 0-108.331-48.598-108.331-108.331V223.154c0-59.733 48.598-108.332 108.331-108.332h56.168c0.15 14.827 12.193 26.81 27.055 26.81h105.885c14.863 0 26.905-11.983 27.055-26.81h56.168c59.733 0 108.331 48.598 108.331 108.332v573.907z"/><path fill="currentColor" d="M564.276 819.304H458.391c-14.956 0-27.083 12.126-27.083 27.083s12.126 27.083 27.083 27.083h105.885c14.956 0 27.083-12.126 27.083-27.083s-12.127-27.083-27.083-27.083z"/></svg><span>+86</span></span>' +
          '<input class="line"' + id("phone") + ' type="tel" inputmode="numeric" maxlength="11" placeholder="请输入手机号" value="13800138000" />' +
          '<button type="button" class="sms-get"' + id("sms") + ">获取验证码</button>" +
        "</div>" +
        '<label class="field">验证码</label>' +
        '<input class="line"' + id("smsCode") + ' type="tel" inputmode="numeric" maxlength="4" placeholder="4 位" />' +
        '<p class="sub" id="smsSent" hidden>验证码已发送</p>' +
        '<label class="field">邀请码（选填）</label>' +
        '<input class="box"' + id("invite") + ' type="text" placeholder="请输入邀请码" />' +
        '<label class="check"><input type="checkbox"' + id("agree") + (state.agreed ? " checked" : "") + " /> 已阅读并同意用户协议与隐私政策</label>" +
        '<button type="button" class="btn"' + id("smsNext") + (live ? "" : " disabled") + ">下一步</button>" +
      "</section>" +
      '<section class="login-douyin">' +
        '<button type="button" class="dy-mark"' + id("dyMark") + ">" +
          dyIcon() +
          "<span>抖音一键登录</span>" +
        "</button>" +
      "</section>";
  }

  function login() {
    app.innerHTML = loginMarkup(true);
  }

  function dyIcon() {
    return '<svg viewBox="0 0 1024 1024" width="36" height="36" aria-hidden="true"><path fill="#111" d="M937.4 423.9c-84 0-165.7-27.3-232.9-77.8v352.3c0 179.9-138.6 325.6-309.6 325.6S85.3 878.3 85.3 698.4c0-179.9 138.6-325.6 309.6-325.6 17.1 0 33.7 1.5 49.9 4.3v186.6c-15.5-6.1-32-9.2-48.6-9.2-76.3 0-138.2 65-138.2 145.3 0 80.2 61.9 145.3 138.2 145.3 76.2 0 138.1-65.1 138.1-145.3V0H707c0 134.5 103.7 243.5 231.6 243.5v180.3l-1.2 0.1"/></svg>';
  }

  function douyin() {
    app.innerHTML =
      '<div class="dy-behind" inert>' + loginMarkup(false) + "</div>" +
      '<button type="button" class="dy-scrim" id="dyScrim" aria-label="关闭"></button>' +
      '<div class="dy-auth" role="dialog" aria-modal="true" aria-labelledby="dyTitle">' +
        '<header class="dy-nav">' +
          '<button type="button" class="dy-x" id="backDouyin" aria-label="关闭"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
          '<h1 id="dyTitle">抖音授权</h1>' +
        "</header>" +
        '<div class="dy-ask">' +
          '<img class="dy-app" src="' + FACE + '" alt="">' +
          "<p><b>骆王宇私屿</b> 申请使用</p>" +
          '<button type="button" class="dy-detail" id="dyDetail">详情 ›</button>' +
        "</div>" +
        '<p class="dy-scope">你在抖音的头像、昵称</p>' +
        '<p class="dy-note" id="dyNote" hidden>用抖音账号登录。近 3 个月在骆王宇橱窗下的单会直接同步，不用复制订单号。</p>' +
        '<div class="dy-line"></div>' +
        '<p class="dy-label">抖音登录账号</p>' +
        '<div class="dy-account"><span class="dy-avatar" aria-hidden="true"></span><span>阿宁</span></div>' +
        '<div class="dy-foot">' +
          '<label class="dy-agree"><input type="checkbox" id="dyAgree" /><span>已阅读并同意</span> <span class="dy-link">用户协议</span>、<span class="dy-link">隐私政策</span>、<span class="dy-link">运营商条款</span></label>' +
          '<div class="dy-actions">' +
            '<button type="button" class="dy-cancel" id="dyCancel">取消</button>' +
            '<button type="button" class="dy-ok" id="dy">同意授权</button>' +
          "</div>" +
          '<button type="button" class="dy-switch" id="dySwitch">切换抖音号</button>' +
        "</div>" +
      "</div>";
  }

  function quiz() {
    app.innerHTML =
      bar("backToLogin", "骆王宇肤质测试") +
        "<h2>先弄清楚你的皮肤是什么，再谈用什么</h2>" +
        '<p class="sub">先判断干性 / 油性。敏感、痘肌按你的情况选做。大约 3 到 5 分钟。</p>' +
        '<div class="card">' +
          '<label class="field">称呼</label><input class="box" id="qName" value="' + esc(state.info.name) + '" placeholder="如何称呼你" />' +
          '<label class="field">年龄段</label><select class="box" id="qAge">' +
            ageOption("18 岁以下") + ageOption("18–25 岁") + ageOption("26–35 岁") + ageOption("36–45 岁") + ageOption("45 岁以上") +
          "</select>" +
          '<label class="field">性别</label><select class="box" id="qSex">' +
            sexOption("女") + sexOption("男") + sexOption("不便透露") +
          "</select>" +
          '<label class="field">当前在用的产品或主要困扰（选填）</label>' +
          '<textarea class="box" id="qNote" placeholder="例如：只用洁面和防晒；最近换季两颊发红脱皮">' + esc(state.info.note) + "</textarea>" +
          '<button type="button" class="btn" id="seePlan">开始测试</button>' +
          '<p class="fine" id="need"></p>' +
        "</div>";
  }

  function ageOption(v) {
    return '<option' + (state.info.age === v ? " selected" : "") + ">" + v + "</option>";
  }
  function sexOption(v) {
    return '<option' + (state.info.sex === v ? " selected" : "") + ">" + v + "</option>";
  }

  function bank() {
    if (state.qMod === "sens") return SENS;
    if (state.qMod === "acne") return ACNE;
    return BASE;
  }

  function modName() {
    if (state.qMod === "sens") return "进阶 · 敏感肌测试";
    if (state.qMod === "acne") return "进阶 · 痘肌测试";
    return "基础测试 · 干性 / 油性";
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function ask() {
    var list = bank();
    var q = list[state.qIdx];
    var picked = state.ans[q.key];
    var longest = Math.max(BASE.length, SENS.length, ACNE.length);
    var track = Math.round((list.length / longest) * 100);
    var pct = Math.round(((state.qIdx + 1) / list.length) * 100);
    var opts = q.o.map(function (label, i) {
      var on = picked === i ? " on" : "";
      return '<button type="button" class="opt' + on + '" data-i="' + i + '"><span class="k">' + "ABCDE".charAt(i) + "、</span><span>" + esc(label) + "</span></button>";
    }).join("");
    app.innerHTML =
      bar("backAsk", "骆王宇肤质测试") +
      '<div class="q-head"><p><b>问题' + (state.qIdx + 1) + "</b><span>/" + list.length + "</span></p>" +
      '<div class="q-track" style="width:' + track + '%" aria-hidden="true"><i style="width:' + pct + '%"></i></div></div>' +
      '<p class="fine q-mod">' + esc(modName()) + "</p>" +
      (q.g ? '<p class="sub">' + esc(q.g) + "</p>" : "") +
      '<div class="q-card"><p class="qtext"><span class="q-tag">单选</span><span>' + esc(q.t) + "</span></p>" +
      (q.c ? '<p class="fine">' + esc(q.c) + "</p>" : "") +
      '<div class="q-opts">' + opts + "</div></div>";
    window.scrollTo(0, 0);
  }

  function triage() {
    function pick(id, title, hint) {
      var on = state.concerns.indexOf(id) >= 0 ? " on" : "";
      return '<button type="button" class="opt' + on + '" data-c="' + id + '"><span class="box" aria-hidden="true"></span><span>' +
        esc(title) + '<span class="q-hint">' + esc(hint) + "</span></span></button>";
    }
    app.innerHTML =
      bar("backAsk", "骆王宇肤质测试") +
      '<div><p class="step">基础测试完成</p>' +
      "<h2>你是否被下面的皮肤状况困扰？</h2>" +
      '<p class="sub">选中的项目会加做对应的进阶测试。可多选，也可以都不选。</p>' +
      pick("sens", "使用某些化妆品后，皮肤有红肿、刺痒或者脱皮情况出现", "加做敏感肌测试（15 题）") +
      pick("acne", "平时有黑头、白头和粉刺，不定期发炎变成突起的痤疮", "加做痘肌测试（5 题）") +
      '<button type="button" class="btn" id="triageNext">继续</button>' +
      '<button type="button" class="ghost" id="triageSkip">都没有，直接看结果</button></div>';
    window.scrollTo(0, 0);
  }

  function bandName(score, bands) {
    var i;
    for (i = 0; i < bands.length; i++) {
      if (score <= bands[i].hi + 0.5) return bands[i].name;
    }
    return bands[bands.length - 1].name;
  }

  function scored(key, optionCount, table) {
    var idx = state.ans[key];
    if (idx == null || table[idx] == null) idx = Math.min(Math.floor((optionCount - 1) / 2), table.length - 1);
    return table[idx];
  }

  function finishQuiz() {
    var i;
    var base = 0;
    for (i = 0; i < BASE.length; i++) base += scored("b" + i, BASE[i].o.length, SC_BASE);
    var baseName = bandName(base, BANDS_BASE);
    state.oil = baseName === "非常干性" || baseName === "轻度干性" ? "dry" : "oily";
    var sensitive = false;
    var acne = false;
    if (state.concerns.indexOf("sens") >= 0) {
      var sum = 0;
      for (i = 0; i < SENS.length; i++) {
        var w = SENS[i].w;
        var table = w === "S" ? SC_S34 : w === "Q7" ? SC_Q7 : SC_NORMAL;
        sum += scored("s" + i, SENS[i].o.length, table);
      }
      var sensName = bandName(sum, BANDS_SENS);
      sensitive = sensName === "脆弱肌" || sensName === "敏感肌";
    }
    if (state.concerns.indexOf("acne") >= 0) {
      var asum = 0;
      for (i = 0; i < ACNE.length; i++) asum += scored("a" + i, ACNE[i].o.length, SC_ABC);
      acne = bandName(asum, BANDS_ACNE) !== "接近正常皮肤";
    }
    state.trouble = sensitive ? "sensitive" : acne ? "acne" : "rough";
    state.schemeId = pickScheme();
    go("plan");
  }

  function advanceQ() {
    var list = bank();
    if (state.qIdx < list.length - 1) {
      state.qIdx += 1;
      render();
      return;
    }
    if (state.qMod === "base") {
      go("triage");
      return;
    }
    if (state.qMod === "sens" && state.concerns.indexOf("acne") >= 0) {
      state.qMod = "acne";
      state.qIdx = 0;
      render();
      return;
    }
    finishQuiz();
  }

  function backQuestion() {
    qToken += 1;
    state.qMod = "base";
    state.qIdx = 0;
    go("quiz");
  }

  function blocked() {
    app.innerHTML =
      bar("backQuiz", "这套护理不适合继续") +
      '<p class="step">肤质测试</p>' +
      '<div class="blocked"><p>未满 18 岁不进入油糙、油痘、敏痘、干糙、干敏、抗老这六个方案。</p></div>';
  }

  function planSteps(text) {
    return text.split(" → ").map(function (part, i) {
      return "<li><span>" + (i + 1) + "</span><p>" + esc(part) + "</p></li>";
    }).join("");
  }

  function plan() {
    var sc = scheme();
    var chips = sc.chips.map(function (c) { return "<i>" + esc(c) + "</i>"; }).join("");
    app.innerHTML =
      '<div class="result">' +
        '<section class="plan-sum">' +
          '<div class="plan-hero"><span class="plan-face"><svg viewBox="0 0 1024 1024" width="30" height="30" aria-hidden="true"><path fill="currentColor" d="M484.266667 163.584c-159.857778 0-292.266667 129.564444-292.266667 329.016889 0 98.161778 45.681778 188.103111 106.524444 253.866667 61.553778 66.56 134.712889 104.334222 185.742223 104.334222h2.844444c29.468444 0 66.901333-12.572444 106.012445-37.262222 38.798222-24.519111 77.653333-59.960889 109.795555-103.253334a21.333333 21.333333 0 0 1 34.247111 25.429334c-35.157333 47.36-77.852444 86.471111-121.258666 113.891555-43.064889 27.192889-88.433778 43.861333-128.796445 43.861333h-2.844444c-67.925333 0-151.608889-47.217778-217.088-118.044444-66.218667-71.566222-117.845333-171.406222-117.845334-282.823111C149.333333 272.782222 297.756444 120.888889 484.266667 120.888889h2.844444c123.562667 0 231.537778 67.072 289.564445 177.493333a21.333333 21.333333 0 1 1-37.774223 19.882667c-50.915556-96.881778-144.583111-154.709333-251.790222-154.709333h-2.844444z"/><path fill="currentColor" d="M410.737778 660.195556a21.333333 21.333333 0 0 1 29.866666 4.209777c11.491556 15.217778 26.908444 23.438222 42.865778 23.438223 15.928889 0 31.345778-8.192 42.808889-23.381334a21.333333 21.333333 0 0 1 34.076445 25.713778c-18.090667 23.950222-45.368889 40.334222-76.885334 40.334222-31.573333 0-58.823111-16.412444-76.913778-40.419555a21.333333 21.333333 0 0 1 4.181334-29.866667zM798.350222 449.194667c4.551111-3.925333 8.817778-7.594667 12.458667-10.524445 3.384889 2.474667 7.310222 5.575111 11.320889 8.817778a729.514667 729.514667 0 0 1 17.464889 14.648889l1.166222 1.024 0.398222 0.341333a18.488889 18.488889 0 1 0 24.32-27.875555l-0.455111-0.369778-1.251556-1.080889a785.294222 785.294222 0 0 0-18.375111-15.416889 314.709333 314.709333 0 0 0-15.559111-11.946667 85.248 85.248 0 0 0-7.281778-4.721777 35.128889 35.128889 0 0 0-4.380444-2.104889 21.902222 21.902222 0 0 0-9.102222-1.536 22.158222 22.158222 0 0 0-8.647111 2.389333 37.632 37.632 0 0 0-4.067556 2.389333c-2.275556 1.507556-4.721778 3.413333-7.111111 5.290667-4.408889 3.555556-9.756444 8.135111-14.791111 12.458667l-1.109333 0.938666c-4.352 3.754667-8.504889 7.310222-12.060445 10.24a646.428444 646.428444 0 0 1-8.163555-8.078222l-1.336889-1.336889a336.270222 336.270222 0 0 0-14.449778-13.824 72.305778 72.305778 0 0 0-7.338667-5.774222 32.796444 32.796444 0 0 0-4.835555-2.702222 22.471111 22.471111 0 0 0-9.130667-2.019556 23.694222 23.694222 0 0 0-7.822222 1.422223c-1.706667 0.568889-3.271111 1.308444-4.551111 1.991111a88.746667 88.746667 0 0 0-7.992889 4.664889c-5.290667 3.413333-11.320889 7.793778-16.867556 11.975111a711.736889 711.736889 0 0 0-19.541333 15.36l-1.308445 1.052444-0.369777 0.284445-0.113778 0.113777a18.488889 18.488889 0 1 0 23.495111 28.558223l0.085333-0.056889 0.284445-0.284445 1.251555-0.995555a639.573333 639.573333 0 0 1 18.488889-14.506667c4.835556-3.640889 9.614222-7.111111 13.596445-9.756444 3.185778 2.929778 6.940444 6.627556 11.008 10.695111l1.422222 1.422222c4.209778 4.181333 8.675556 8.647111 12.515555 12.145778 2.104889 1.934222 4.465778 3.982222 6.769778 5.632 1.137778 0.824889 2.673778 1.848889 4.437334 2.730666a21.617778 21.617778 0 0 0 9.671111 2.389334c4.494222 0 7.964444-1.564444 9.159111-2.104889 1.649778-0.768 3.185778-1.649778 4.352-2.389334a95.573333 95.573333 0 0 0 7.338666-5.319111c4.892444-3.84 10.695111-8.817778 16.128-13.482666l0.853334-0.768zM810.808889 521.955556c-3.612444 2.929778-7.879111 6.599111-12.458667 10.524444l-0.881778 0.768c-5.404444 4.636444-11.235556 9.642667-16.128 13.454222a94.805333 94.805333 0 0 1-7.338666 5.319111 36.408889 36.408889 0 0 1-4.352 2.417778 22.072889 22.072889 0 0 1-9.159111 2.104889 21.617778 21.617778 0 0 1-9.671111-2.389333 32.483556 32.483556 0 0 1-4.437334-2.730667 79.274667 79.274667 0 0 1-6.769778-5.632c-3.84-3.498667-8.305778-7.964444-12.515555-12.174222l-1.422222-1.422222a373.333333 373.333333 0 0 0-11.008-10.666667c-3.982222 2.645333-8.760889 6.087111-13.568 9.756444a658.545778 658.545778 0 0 0-18.517334 14.506667l-1.223111 0.995556-0.312889 0.284444-0.085333 0.056889a18.488889 18.488889 0 0 1-23.495111-28.558222l0.113778-0.113778 0.369777-0.284445 1.308445-1.080888a670.094222 670.094222 0 0 1 19.541333-15.331556c5.546667-4.181333 11.576889-8.561778 16.867556-11.975111a88.746667 88.746667 0 0 1 7.964444-4.693333c1.308444-0.654222 2.872889-1.393778 4.551111-1.991112a23.694222 23.694222 0 0 1 7.850667-1.422222c4.181333 0 7.452444 1.308444 9.102222 2.048 1.934222 0.853333 3.584 1.848889 4.835556 2.702222 2.56 1.706667 5.12 3.783111 7.395555 5.774223 4.551111 3.982222 9.756444 9.159111 14.421334 13.824l1.336889 1.336889c2.958222 2.958222 5.688889 5.688889 8.163555 8.049777 3.555556-2.929778 7.68-6.456889 12.060445-10.211555l1.109333-0.938667c5.034667-4.352 10.353778-8.903111 14.791111-12.487111 2.389333-1.877333 4.835556-3.754667 7.111111-5.262222a38.115556 38.115556 0 0 1 4.067556-2.389334 22.158222 22.158222 0 0 1 8.675555-2.389333 21.930667 21.930667 0 0 1 9.073778 1.536c1.706667 0.654222 3.185778 1.422222 4.380444 2.104889 2.389333 1.336889 4.920889 3.015111 7.281778 4.693333 4.807111 3.413333 10.410667 7.793778 15.559111 11.946667a757.134222 757.134222 0 0 1 18.375111 15.416889l1.251556 1.080889 0.455111 0.398222a18.488889 18.488889 0 0 1-24.32 27.875556l-0.398222-0.341334-1.137778-1.024a699.733333 699.733333 0 0 0-17.493333-14.648889 329.671111 329.671111 0 0 0-11.320889-8.817777zM798.350222 612.835556c4.551111-3.925333 8.817778-7.594667 12.458667-10.524445 3.384889 2.474667 7.310222 5.575111 11.320889 8.817778a730.481778 730.481778 0 0 1 17.464889 14.648889l1.166222 1.024 0.398222 0.341333a18.488889 18.488889 0 1 0 24.32-27.875555l-0.455111-0.398223-1.251556-1.052444a667.847111 667.847111 0 0 0-18.375111-15.416889 316.472889 316.472889 0 0 0-15.559111-11.946667 85.930667 85.930667 0 0 0-7.281778-4.721777 35.555556 35.555556 0 0 0-4.380444-2.104889 21.930667 21.930667 0 0 0-9.102222-1.536 22.158222 22.158222 0 0 0-8.647111 2.389333 38.115556 38.115556 0 0 0-4.067556 2.389333c-2.275556 1.507556-4.721778 3.413333-7.111111 5.290667-4.408889 3.555556-9.756444 8.135111-14.791111 12.458667l-1.109333 0.938666c-4.352 3.754667-8.504889 7.310222-12.060445 10.211556a646.428444 646.428444 0 0 1-8.163555-8.049778l-1.336889-1.336889a336.270222 336.270222 0 0 0-14.449778-13.824 72.305778 72.305778 0 0 0-7.338667-5.774222 32.796444 32.796444 0 0 0-4.835555-2.702222 22.499556 22.499556 0 0 0-9.130667-2.019556 23.694222 23.694222 0 0 0-7.822222 1.422222c-1.706667 0.568889-3.271111 1.308444-4.551111 1.991112a88.746667 88.746667 0 0 0-7.992889 4.664888c-5.290667 3.413333-11.320889 7.793778-16.867556 11.975112a702.151111 702.151111 0 0 0-19.541333 15.36l-1.308445 1.052444-0.369777 0.284444-0.113778 0.113778a18.488889 18.488889 0 1 0 23.495111 28.558222l0.398222-0.312888 1.223111-1.024a654.421333 654.421333 0 0 1 18.488889-14.506667c4.835556-3.640889 9.614222-7.111111 13.596445-9.756445 3.185778 2.929778 6.940444 6.627556 11.008 10.695112l1.422222 1.422222c4.209778 4.181333 8.675556 8.647111 12.515555 12.145778 2.104889 1.934222 4.465778 3.982222 6.769778 5.632 1.137778 0.824889 2.673778 1.848889 4.437334 2.730666a21.617778 21.617778 0 0 0 9.671111 2.389334c4.494222 0 7.964444-1.564444 9.159111-2.104889 1.649778-0.768 3.185778-1.649778 4.352-2.389334 2.389333-1.536 4.949333-3.413333 7.338666-5.319111 4.892444-3.84 10.695111-8.817778 16.128-13.482666l0.853334-0.768z"/></svg></span><div><p class="plan-kick">你的肤质方案</p><h2 class="plan-name">' + esc(sc.name) + '</h2></div></div>' +
          '<p class="plan-who">' + esc(sc.who) + "</p>" +
          '<div class="plan-note"><p>' + esc(sc.note) + "</p></div>" +
          '<p class="chips">' + chips + "</p>" +
        "</section>" +
        '<p class="plan-label">早晚怎么用</p>' +
        planWhen(sc) +
      "</div>" +
      '<button type="button" class="btn" id="finish">完成</button>' +
      '<button type="button" class="ghost" id="again">重新测试</button>';
  }

  function planWhen(sc) {
    return '<section class="plan-when am">' +
          '<div class="plan-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>' +
          "<div><p class=\"plan-when-t\">早</p><ol class=\"plan-steps\">" + planSteps(sc.am) + "</ol></div>" +
        "</section>" +
        '<section class="plan-when pm">' +
          '<div class="plan-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" transform="translate(14.52 9.41) scale(0.01844) translate(-529.6 -493.8)" d="M529.611373 1023.38565c-146.112965 0-270.826063-51.707812-374.344078-155.225827C51.74928 764.641808 0.041469 639.826318 0.041469 493.815745c0-105.053891 29.693595-202.326012 88.978393-292.22593 59.38719-89.797526 137.000103-155.942569 232.83874-198.63991 6.041111-4.607627 12.184613-3.788493 18.225724 2.252618 7.576986 4.607627 9.931996 11.365479 6.860244 20.580733C322.677735 83.736961 310.493122 142.202626 310.493122 201.589815c0 135.464227 48.328885 251.474031 144.986656 348.131801 96.657771 96.657771 212.667574 144.986656 348.131801 144.986656 74.541162 0 139.252721-11.365479 194.032283-34.19883C1003.684974 655.799424 1009.726084 656.618558 1015.767195 662.659669c7.576986 4.607627 9.931996 11.365479 6.860244 20.580733C983.104241 786.758417 918.802249 869.286132 829.721465 930.925939 740.743072 992.565746 640.706375 1023.38565 529.611373 1023.38565z"/></svg></div>' +
          "<div><p class=\"plan-when-t\">晚</p><ol class=\"plan-steps\">" + planSteps(sc.pm) + "</ol></div>" +
        "</section>";
  }

  function home() {
    var sc = scheme();
    var meta = sc && state.saved
      ? sc.name + (demoOrders().length ? " · 化妆台已同步" : "")
      : "尚未完成自测";
    app.innerHTML =
      bar("toStart", "私屿") +
      '<div class="me"><img class="face" src="' + FACE + '" alt="" /><div><strong>' + esc(state.person || "阿宁") + "</strong><p>" + esc(meta) + '</p></div>' +
      '<button type="button" class="btn sm" id="ask"><svg viewBox="0 0 1024 1024" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M312.459636 881.524364l10.821819 5.329454A423.726545 423.726545 0 0 0 512 930.909091c230.981818 0 418.909091-182.714182 418.909091-407.272727C930.909091 299.077818 742.981818 116.363636 512 116.363636S93.090909 299.077818 93.090909 523.636364c0 86.551273 27.997091 169.518545 80.989091 239.918545l11.310545 15.010909-50.059636 140.241455 177.128727-37.282909zM512 1000.727273c-72.564364 0-142.661818-15.453091-208.546909-45.986909L129.349818 991.418182a58.181818 58.181818 0 0 1-66.746182-76.544l44.544-124.788364C52.200727 710.912 23.272727 619.194182 23.272727 523.636364 23.272727 260.561455 242.525091 46.545455 512 46.545455s488.727273 214.016 488.727273 477.090909S781.474909 1000.727273 512 1000.727273z m-186.181818-477.090909A46.545455 46.545455 0 1 1 232.727273 523.636364 46.545455 46.545455 0 0 1 325.818182 523.636364m232.727273 0A46.545455 46.545455 0 1 1 465.454545 523.636364 46.545455 46.545455 0 0 1 558.545455 523.636364m232.727272 0A46.545455 46.545455 0 1 1 698.181818 523.636364 46.545455 46.545455 0 0 1 791.272727 523.636364"/></svg>问小骆</button></div>' +
      '<nav class="tabs"><button type="button" id="tabA" class="' + (state.tab === "a" ? "on" : "") + '">档案</button>' +
      '<button type="button" id="tabB" class="' + (state.tab === "b" ? "on" : "") + '">化妆台</button></nav>' +
      (state.tab === "a" ? archive(sc) : vanity());
  }

  function demoOrders() {
    return RECENT;
  }

  function archive(sc) {
    var orders = demoOrders();
    var orderHtml = orders.length
      ? orders.map(function (o) {
          var done = o.status === "已完成" ? " done" : "";
          return '<div class="order"><div class="order-main"><div class="thumb"><img src="' + esc(o.img) + '" alt=""></div><div>' +
            '<div class="order-name"><b>' + esc(o.name) + '</b><span class="order-st' + done + '">' + esc(o.status) + "</span></div>" +
            '<p class="fine">' + esc(o.time) + "</p>" +
            '<p class="fine">' + esc(o.id) + "</p></div></div></div>";
        }).join("")
      : '<p>近 3 个月还没有在骆王宇橱窗下单。</p>';
    var body = sc && state.saved
      ? esc(sc.who)
      : "尚未完成自测。";
    var chips = sc && state.saved ? sc.chips.map(function (c) { return "<i>" + esc(c) + "</i>"; }).join("") : "";
    return '<article><p class="kicker">Skin file</p><h2>' + (sc && state.saved ? esc(sc.name) : "尚未完成自测") + "</h2>" +
      "<p>" + body + '</p><p class="chips">' + chips + "</p>" +
      (sc && state.saved ? '<div class="result archive-plan"><p class="plan-label">早晚怎么用</p>' + planWhen(sc) + "</div>" : "") +
      "</article>" +
      "<article><p class=\"kicker\">已购清单</p><h2>近 3 个月订单</h2>" +
      '<p class="fine">' + (orders.length ? "近 3 个月 " + orders.length + " 件，来自骆王宇橱窗。" : "只显示本人、骆王宇橱窗、近 3 个月的订单。") + "</p>" +
      orderHtml + "</article>";
  }

  function vanity() {
    var orders = demoOrders();
    var sc = scheme();
    var overview = '<p class="fine vanity-tip">点一件商品，看具体用法。早晚步骤在「档案」里。</p>';
    if (!orders.length) {
      return overview + "<p>可以自己添加手上已有的商品。添加后，会判断这些产品和当前护肤方案是否匹配。</p>";
    }
    return overview +
      orders.map(function (o) {
        var kit = KITS[o.kit];
        var how = kit
          ? "<p>早：" + esc(kit.am) + "</p><p>晚：" + esc(kit.pm) + "</p>"
          : "<p>暂无这件的用法，可以问小骆。</p>";
        var note = kit
          ? '<div class="kit-note"><img src="' + FACE + '" alt="" /><div><b>骆王宇</b><p>' + esc(kit.voice) + '</p></div></div>'
          : "";
        var act = kit
          ? '<button type="button" class="btn sm" data-listen="' + esc(o.kit) + '"><svg viewBox="0 0 1024 1024" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M918.298667 821.276667l-148.112667-148.112667c14.604-20.906667 26.984667-43.298667 37.013333-67.008667 19.136-45.242 28.838667-93.276667 28.838667-142.769333 0-49.492-9.702667-97.526667-28.838667-142.768667-18.474-43.677333-44.912-82.894667-78.58-116.562666s-72.885333-60.106-116.563333-78.58c-45.242-19.136-93.276-28.838667-142.768-28.838667s-97.526667 9.702667-142.768667 28.838667c-43.677333 18.474-82.894667 44.912-116.562666 78.58s-60.106 72.885333-78.58 116.562666c-19.135333 45.242-28.838 93.276667-28.838 142.768667 0 49.492667 9.702667 97.527333 28.838 142.769333 18.474 43.677333 44.912 82.894667 78.58 116.562 33.668 33.668 72.885333 60.106 116.562666 78.579334 45.242 19.136 93.276667 28.838667 142.768667 28.838666s97.526-9.702667 142.768-28.838666c37.262-15.76 71.273333-37.32 101.366667-64.216667l144.536666 144.536667c8.331333 8.331333 19.250667 12.496667 30.17 12.496666s21.838667-4.165333 30.17-12.496666c16.661333-16.662 16.661333-43.678-0.000666-60.34z m-449.010667-76.474667c-155.173333 0-281.416667-126.242-281.416667-281.416s126.242667-281.416667 281.416667-281.416667 281.416667 126.242667 281.416667 281.416667-126.243333 281.416-281.416667 281.416z"/></svg>听用法</button>'
          : '<button type="button" class="btn sm" data-listen="' + esc(o.kit) + '"><svg viewBox="0 0 1024 1024" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M312.459636 881.524364l10.821819 5.329454A423.726545 423.726545 0 0 0 512 930.909091c230.981818 0 418.909091-182.714182 418.909091-407.272727C930.909091 299.077818 742.981818 116.363636 512 116.363636S93.090909 299.077818 93.090909 523.636364c0 86.551273 27.997091 169.518545 80.989091 239.918545l11.310545 15.010909-50.059636 140.241455 177.128727-37.282909zM512 1000.727273c-72.564364 0-142.661818-15.453091-208.546909-45.986909L129.349818 991.418182a58.181818 58.181818 0 0 1-66.746182-76.544l44.544-124.788364C52.200727 710.912 23.272727 619.194182 23.272727 523.636364 23.272727 260.561455 242.525091 46.545455 512 46.545455s488.727273 214.016 488.727273 477.090909S781.474909 1000.727273 512 1000.727273z m-186.181818-477.090909A46.545455 46.545455 0 1 1 232.727273 523.636364 46.545455 46.545455 0 0 1 325.818182 523.636364m232.727273 0A46.545455 46.545455 0 1 1 465.454545 523.636364 46.545455 46.545455 0 0 1 558.545455 523.636364m232.727272 0A46.545455 46.545455 0 1 1 698.181818 523.636364 46.545455 46.545455 0 0 1 791.272727 523.636364"/></svg>问小骆</button>';
        return '<article class="vanity-card" id="kit-' + esc(o.kit) + '"><div class="vanity-head"><b>' + esc(o.name) + '</b>' + act + '</div><p class="fine">' + esc(o.id) + " · " + esc(o.time) + " · " + esc(o.status) + '</p><div class="vanity-detail">' + how + "</div>" + note + "</article>";
      }).join("");
  }

  function chat() {
    var list = state.chat.map(function (m) {
      if (m.role === "sys") return '<div class="bubble sys">' + esc(m.text) + "</div>";
      if (m.role === "me" && m.sec) {
        return '<div class="msg mine"><div class="msg-body"><button type="button" class="bubble mine voice-msg" style="width:' + Math.min(72 + m.sec * 6, 220) + 'px" aria-label="语音 ' + m.sec + ' 秒">' +
          "<span>" + m.sec + "″</span>" +
          '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path class="vw1" d="M6.5 8.2a2.5 2.5 0 0 1 0 3.6" /><path class="vw2" d="M9.6 5.6a6.2 6.2 0 0 1 0 8.8" /><path class="vw3" d="M12.7 3a9.9 9.9 0 0 1 0 14" /></svg>' +
          '</button><p class="voice-text">' + esc(m.text) + "</p></div></div>";
      }
      if (m.role === "me") return '<div class="msg mine"><div class="bubble mine">' + esc(m.text) + "</div></div>";
      var play = m.voice ? '<button type="button" class="replay" data-play="1" aria-label="播放语音"><svg viewBox="0 0 1024 1024" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M257.493333 322.4l215.573334-133.056c24.981333-15.413333 57.877333-7.914667 73.493333 16.746667 5.301333 8.373333 8.106667 18.048 8.106667 27.914666v555.989334C554.666667 819.093333 530.784 842.666667 501.333333 842.666667c-9.994667 0-19.786667-2.773333-28.266666-8L257.493333 701.6H160c-41.237333 0-74.666667-33.013333-74.666667-73.738667V396.138667c0-40.725333 33.429333-73.738667 74.666667-73.738667h97.493333z m26.133334 58.4a32.298667 32.298667 0 0 1-16.96 4.8H160c-5.888 0-10.666667 4.714667-10.666667 10.538667v231.733333c0 5.813333 4.778667 10.538667 10.666667 10.538667h106.666667c5.994667 0 11.872 1.664 16.96 4.8L490.666667 770.986667V253.013333L283.626667 380.8zM800.906667 829.653333a32.288 32.288 0 0 1-45.248-0.757333 31.317333 31.317333 0 0 1 0.768-44.693333c157.653333-150.464 157.653333-393.962667 0-544.426667a31.317333 31.317333 0 0 1-0.768-44.682667 32.288 32.288 0 0 1 45.248-0.757333c183.68 175.306667 183.68 460.010667 0 635.317333z m-106.901334-126.186666a32.288 32.288 0 0 1-45.248-1.216 31.328 31.328 0 0 1 1.237334-44.672c86.229333-80.608 86.229333-210.56 0-291.178667a31.328 31.328 0 0 1-1.237334-44.672 32.288 32.288 0 0 1 45.248-1.216c112.885333 105.546667 112.885333 277.418667 0 382.965333z"/></svg></button>' : "";
      return '<div class="msg luo"><img class="face" src="' + FACE + '" alt="" /><div class="msg-body"><div class="bubble">' + esc(m.text) + "</div>" + play + "</div></div>";
    }).join("");
    var prompts = ["早晚怎么用", "丝塔芙怎么用", "杏仁酸怎么用"];
    var started = state.chat.some(function (m) { return m.role === "me"; });
    var opener = '<div class="msg luo"><img class="face" src="' + FACE + '" alt="" /><div class="bubble">你好，我是骆王宇。按你测出来的肤质，可以问我已经买过的怎么用，比如早晚步骤、丝塔芙、杏仁酸。想让我看皮肤照片的话，直接发图，我会请人工导师来帮你看。</div></div>';
    var humanIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M848 384h-33.6C806.4 224 675.2 96 512 96s-294.4 128-302.4 288H176c-52.8 0-96 43.2-96 96v64c0 52.8 43.2 96 96 96h32c35.2 0 64-28.8 64-64V400c0-132.8 107.2-240 240-240s240 107.2 240 240v224c0 97.6-67.2 179.2-156.8 201.6-11.2-16-30.4-25.6-51.2-25.6h-64c-35.2 0-64 28.8-64 64s28.8 64 64 64h64c25.6 0 49.6-16 59.2-38.4C720 864 808 763.2 816 640h32c52.8 0 96-43.2 96-96v-64c0-52.8-43.2-96-96-96zM176 576c-17.6 0-32-14.4-32-32v-64c0-17.6 14.4-32 32-32h32v128h-32z m704-32c0 17.6-14.4 32-32 32h-32v-128h32c17.6 0 32 14.4 32 32v64z"/></svg>';
    app.innerHTML =
      '<header class="bar">' + backBtn("backHome") + '<h1 class="bar-title">骆王宇</h1>' +
      '<button type="button" class="bar-human" id="human" aria-label="转人工">' + humanIcon + "</button></header>" +
      '<p class="chat-tag">以科学为依据，用清醒判断让护肤更简单。</p>' +
      '<div id="log" class="' + (started ? "started" : "") + '">' + opener + list + "</div>" +
      '<div class="dock">' + (started ? "" : '<div class="asks">' + prompts.map(function (q) {
        return '<button type="button" class="ask-chip" data-ask="' + esc(q) + '">' + esc(q) + "</button>";
      }).join("") + "</div>") +
      '<div class="composer">' +
        '<textarea id="msg" rows="1" enterkeyhint="send" placeholder="输入消息......"></textarea>' +
        '<button type="button" class="hold-label" id="hold">按住说话</button>' +
        '<button type="button" class="voice" id="voiceMode" aria-label="语音"><img src="assets/composer-voice.svg?v=4" alt="" width="26" height="26"></button>' +
        '<button type="button" class="plus" id="plus" aria-label="发图片"><img src="assets/composer-plus.svg?v=2" alt="" width="26" height="26"></button>' +
        '<input type="file" id="pickImg" accept="image/*" hidden>' +
      "</div></div>" +
      '<div class="talk-ov" id="talkOv" hidden>' +
        '<div class="talk-wave" aria-hidden="true">' + new Array(22).join("<i></i>") + "</div>" +
        '<p class="talk-hint" id="talkHint">上滑取消</p>' +
      "</div>";
  }

  function go(screen) {
    state.screen = screen;
    render();
  }

  function restart() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    state = blank();
    render();
  }

  function canSendCode() {
    var phone = document.getElementById("phone");
    var digits = phone ? phone.value.replace(/\s/g, "") : "";
    return !!(state.agreed && /^1\d{10}$/.test(digits));
  }

  function canSeePlan() {
    var name = document.getElementById("qName");
    if (name) state.info.name = name.value.trim();
    return !!state.info.name;
  }

  function gate(id, ready) {
    var el = document.getElementById(id);
    if (el) el.disabled = !ready;
  }

  function syncGates() {
    var sms = document.getElementById("sms");
    if (sms) {
      if (smsLeft > 0) {
        sms.disabled = true;
        sms.classList.add("wait");
        sms.textContent = smsLeft + "s";
      } else {
        sms.classList.remove("wait");
        sms.disabled = !canSendCode();
        sms.textContent = "获取验证码";
      }
    }
    var code = document.getElementById("smsCode");
    gate("smsNext", !!(state.smsAsked && code && /^\d{4}$/.test(code.value.trim())));
    gate("seePlan", canSeePlan());
    var msg = document.getElementById("msg");
  }

  function bind() {
    var enter = document.getElementById("enter");
    if (enter) enter.onclick = function () { go("login"); };
    var backSplash = document.getElementById("backSplash");
    if (backSplash) backSplash.onclick = function () { go("splash"); };
    var agree = document.getElementById("agree");
    if (agree) agree.onchange = function () {
      state.agreed = agree.checked;
      syncGates();
    };
    var phoneInput = document.getElementById("phone");
    if (phoneInput) phoneInput.addEventListener("input", syncGates);
    var smsCode = document.getElementById("smsCode");
    if (smsCode) smsCode.addEventListener("input", syncGates);
    var qName = document.getElementById("qName");
    if (qName) qName.addEventListener("input", syncGates);
    var msgInput = document.getElementById("msg");
    if (msgInput) msgInput.addEventListener("input", syncGates);

    var dyMark = document.getElementById("dyMark");
    if (dyMark) dyMark.onclick = function () { go("douyin"); };
    var backDouyin = document.getElementById("backDouyin");
    if (backDouyin) backDouyin.onclick = function () { go("login"); };
    var dyScrim = document.getElementById("dyScrim");
    if (dyScrim) dyScrim.onclick = function () { go("login"); };
    var dyCancel = document.getElementById("dyCancel");
    if (dyCancel) dyCancel.onclick = function () { go("login"); };
    var dyDetail = document.getElementById("dyDetail");
    if (dyDetail) dyDetail.onclick = function () {
      var note = document.getElementById("dyNote");
      if (note) note.hidden = !note.hidden;
    };
    var dySwitch = document.getElementById("dySwitch");
    if (dySwitch) dySwitch.onclick = function () { toast("当前只有这一个抖音号"); };
    var dy = document.getElementById("dy");
    if (dy) dy.onclick = function () {
      var box = document.getElementById("dyAgree");
      if (!box || !box.checked) { toast("请先阅读并同意相关协议"); return; }
      state.via = "douyin";
      state.person = "阿宁";
      state.orders = RECENT.slice();
      resetQuiz();
      go("quiz");
    };
    var sms = document.getElementById("sms");
    if (sms) sms.onclick = function () {
      if (!canSendCode() || smsLeft > 0) return;
      state.smsAsked = true;
      var sent = document.getElementById("smsSent");
      if (sent) sent.hidden = false;
      smsLeft = 60;
      syncGates();
      clearInterval(smsTimer);
      smsTimer = setInterval(function () {
        smsLeft -= 1;
        if (smsLeft <= 0) {
          smsLeft = 0;
          clearInterval(smsTimer);
        }
        syncGates();
      }, 1000);
    };
    var smsNext = document.getElementById("smsNext");
    if (smsNext) smsNext.onclick = function () {
      var codeEl = document.getElementById("smsCode");
      var code = codeEl ? codeEl.value.trim() : "";
      if (!state.smsAsked || !/^\d{4}$/.test(code)) return;
      state.via = "phone";
      state.person = "阿宁";
      state.orders = [];
      resetQuiz();
      go("quiz");
    };

    document.querySelectorAll(".opt[data-i]").forEach(function (b) {
      b.onclick = function () {
        var q = bank()[state.qIdx];
        state.ans[q.key] = +b.getAttribute("data-i");
        var token = ++qToken;
        render();
        setTimeout(function () {
          if (token !== qToken) return;
          advanceQ();
        }, 220);
      };
    });
    document.querySelectorAll(".opt[data-c]").forEach(function (b) {
      b.onclick = function () {
        var c = b.getAttribute("data-c");
        var at = state.concerns.indexOf(c);
        if (at >= 0) state.concerns.splice(at, 1);
        else state.concerns.push(c);
        render();
      };
    });
    function readQuizForm() {
      var name = document.getElementById("qName");
      if (!name) return;
      state.info.name = name.value.trim();
      state.info.age = document.getElementById("qAge").value;
      state.info.sex = document.getElementById("qSex").value;
      state.info.note = document.getElementById("qNote").value.trim();
    }

    var see = document.getElementById("seePlan");
    if (see) see.onclick = function () {
      readQuizForm();
      if (!canSeePlan()) return;
      if (state.info.age === "18 岁以下") { go("blocked"); return; }
      state.ans = {};
      state.qIdx = 0;
      state.qMod = "base";
      state.concerns = [];
      go("ask");
    };
    var prevQ = document.getElementById("prevQ");
    if (prevQ) prevQ.onclick = backQuestion;
    var backAsk = document.getElementById("backAsk");
    if (backAsk) backAsk.onclick = backQuestion;
    var triageNext = document.getElementById("triageNext");
    if (triageNext) triageNext.onclick = function () {
      if (state.concerns.indexOf("sens") >= 0) {
        state.qMod = "sens";
        state.qIdx = 0;
        go("ask");
      } else if (state.concerns.indexOf("acne") >= 0) {
        state.qMod = "acne";
        state.qIdx = 0;
        go("ask");
      } else finishQuiz();
    };
    var triageSkip = document.getElementById("triageSkip");
    if (triageSkip) triageSkip.onclick = function () {
      state.concerns = [];
      finishQuiz();
    };
    var backQuiz = document.getElementById("backQuiz");
    if (backQuiz) backQuiz.onclick = function () { go("quiz"); };
    var backToLogin = document.getElementById("backToLogin");
    if (backToLogin) backToLogin.onclick = function () { go("login"); };
    var toStart = document.getElementById("toStart");
    if (toStart) toStart.onclick = restart;
    var finish = document.getElementById("finish");
    if (finish) finish.onclick = function () {
      state.saved = true;
      state.tab = "a";
      save();
      go("home");
    };
    var again = document.getElementById("again");
    if (again) again.onclick = function () {
      resetQuiz();
      go("quiz");
    };
    var tabA = document.getElementById("tabA");
    var tabB = document.getElementById("tabB");
    if (tabA) tabA.onclick = function () { state.tab = "a"; render(); };
    if (tabB) tabB.onclick = function () { state.tab = "b"; render(); };
    var ask = document.getElementById("ask");
    if (ask) ask.onclick = function () { go("chat"); };
    document.querySelectorAll("[data-show]").forEach(function (b) {
      b.onclick = function () {
        state.tab = "b";
        state.focusKit = b.getAttribute("data-show");
        render();
        var node = document.getElementById("kit-" + state.focusKit);
        if (node) {
          node.classList.add("open");
          node.scrollIntoView({ block: "center" });
        }
      };
    });
    document.querySelectorAll(".vanity-card").forEach(function (card) {
      card.onclick = function (e) {
        if (e.target.closest("button")) return;
        card.classList.toggle("open");
      };
    });
    document.querySelectorAll("[data-listen]").forEach(function (b) {
      b.onclick = function () {
        var kit = KITS[b.getAttribute("data-listen")];
        var askText = kit ? kit.name + "怎么用" : "这件怎么用";
        state.chat.push({ role: "me", text: askText });
        state.chat.push({ role: "luo", text: kit ? kit.voice : "暂无这件的用法，可以问小骆。", voice: true });
        go("chat");
      };
    });
    var backHome = document.getElementById("backHome");
    if (backHome) backHome.onclick = function () { go("home"); };
    function askLuo(text) {
      state.chat.push({ role: "me", text: text });
      state.chat.push({ role: "luo", text: replyTo(text), voice: true });
      render();
      var log = document.getElementById("log");
      if (log) log.scrollTop = log.scrollHeight;
    }
    document.querySelectorAll("[data-ask]").forEach(function (b) {
      b.onclick = function () { askLuo(b.getAttribute("data-ask")); };
    });
    function submitMsg() {
      var box = document.getElementById("msg");
      var msg = box ? box.value.trim() : "";
      if (!msg) return;
      askLuo(msg);
    }
    if (msgInput) msgInput.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      submitMsg();
    });
    var plus = document.getElementById("plus");
    var pickImg = document.getElementById("pickImg");
    if (plus && pickImg) {
      plus.onclick = function () { pickImg.click(); };
      pickImg.onchange = function () {
        if (!pickImg.files || !pickImg.files.length) return;
        state.chat.push({ role: "me", text: "（图片）" + pickImg.files[0].name });
        if (onDuty()) state.chat.push({ role: "luo", text: "收到照片。图片我请人工导师来帮你看，导师马上接上这段对话。" });
        else state.chat.push({ role: "luo", text: "收到照片。导师现在不在班，我先帮你留好记录，上班后导师会接着看。" });
        render();
        var log = document.getElementById("log");
        if (log) log.scrollTop = log.scrollHeight;
      };
    }
    var human = document.getElementById("human");
    if (human) human.onclick = function () {
      if (onDuty()) state.chat.push({ role: "sys", text: "已转给护肤导师。导师会接上这段对话。" });
      else state.chat.push({ role: "sys", text: "现在不是上班时间。已经留下记录，到点再接。" });
      render();
    };
    document.querySelectorAll(".voice-msg").forEach(function (b) {
      b.onclick = function () {
        var sec = parseInt(b.textContent, 10) || 1;
        b.classList.add("playing");
        clearTimeout(b._stop);
        b._stop = setTimeout(function () { b.classList.remove("playing"); }, sec * 1000);
      };
    });
    document.querySelectorAll("[data-play]").forEach(function (b) {
      b.onclick = function () {
        audio.currentTime = 0;
        var played = audio.play();
        if (played && played.catch) played.catch(function () { toast("这一句暂时播不了"); });
      };
    });
    var voiceMode = document.getElementById("voiceMode");
    if (voiceMode) voiceMode.onclick = function () {
      var box = voiceMode.closest(".composer");
      var on = box.classList.toggle("talking");
      var icon = voiceMode.querySelector("img");
      icon.src = on ? "assets/composer-keyboard.svg?v=2" : "assets/composer-voice.svg?v=4";
      voiceMode.setAttribute("aria-label", on ? "键盘" : "语音");
    };
    var hold = document.getElementById("hold");
    if (hold) {
      var talk = null;
      var talkOv = document.getElementById("talkOv");
      var talkHint = document.getElementById("talkHint");
      var bars = talkOv.querySelectorAll(".talk-wave i");
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var mode = function (name) {
        talkOv.className = "talk-ov" + (name ? " " + name : "");
      };
      var setTalk = function (cancel) {
        talk.cancel = cancel;
        mode(cancel ? "cancel" : talk.count ? "count" : "");
        hold.textContent = cancel ? "松开 取消" : "松开 发送";
        talkHint.textContent = cancel ? "松开手指，取消发送" : talk.count ? "还可以说 " + talk.left + " 秒" : "上滑取消";
      };
      var wave = function () {
        if (!talk || still) return;
        var mid = (bars.length - 1) / 2;
        bars.forEach(function (bar, i) {
          var edge = 1 - Math.abs(i - mid) / (mid + 1);
          bar.style.height = Math.round(6 + Math.random() * (talk.cancel ? 6 : 42) * edge) + "px";
        });
      };
      var tick = function () {
        var s = Math.floor((Date.now() - talk.at) / 1000);
        if (s >= 50) {
          talk.count = true;
          talk.left = Math.max(1, 60 - s);
          setTalk(talk.cancel);
        }
        if (s >= 59) finish(false);
      };
      var closing = null;
      var close = function (after, delay) {
        closing = setTimeout(function () {
          closing = null;
          talkOv.hidden = true;
          mode("");
          if (after) after();
        }, delay);
      };
      var finish = function (aborted) {
        if (!talk) return;
        var t = talk;
        talk = null;
        clearInterval(t.timer);
        clearInterval(t.waver);
        hold.classList.remove("down");
        hold.textContent = "按住说话";
        bars.forEach(function (bar) { bar.style.height = ""; });
        if (aborted || t.cancel) {
          mode("cancel gone");
          close(null, 180);
          return;
        }
        if (Date.now() - t.at < 1000) {
          mode("short");
          talkHint.textContent = "说话时间太短";
          close(null, 900);
          return;
        }
        var sec = Math.max(1, Math.round((Date.now() - t.at) / 1000));
        mode("send");
        close(function () {
          state.chat.push({ role: "me", text: "这件晚上怎么用", sec: sec });
          state.chat.push({ role: "luo", text: replyTo("晚上怎么用"), voice: true });
          render();
          var log = document.getElementById("log");
          if (log) log.scrollTop = log.scrollHeight;
        }, 240);
      };
      hold.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        if (hold.setPointerCapture) hold.setPointerCapture(e.pointerId);
        if (closing) { clearTimeout(closing); closing = null; mode(""); }
        talk = { at: Date.now(), y: e.clientY, cancel: false, count: false, left: 10 };
        hold.classList.add("down");
        talkOv.hidden = false;
        setTalk(false);
        talk.timer = setInterval(tick, 250);
        talk.waver = setInterval(wave, 120);
        wave();
        if (navigator.vibrate) navigator.vibrate(15);
      });
      hold.addEventListener("pointermove", function (e) {
        if (!talk) return;
        var up = talk.y - e.clientY > 60;
        if (up !== talk.cancel) setTalk(up);
      });
      hold.addEventListener("pointerup", function () { finish(false); });
      hold.addEventListener("pointercancel", function () { finish(true); });
      hold.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    }
    syncGates();
  }

  function resetQuiz() {
    state.oil = "";
    state.trouble = "";
    state.schemeId = state.saved ? state.schemeId : "";
    state.ans = {};
    state.qIdx = 0;
    state.qMod = "base";
    state.concerns = [];
    qToken += 1;
  }

  function fitKeyboard() {
    var vv = window.visualViewport;
    if (!vv) return;
    var covered = window.innerHeight - vv.offsetTop - vv.height;
    if (state.screen === "chat" && covered > 80) {
      app.style.minHeight = "0px";
      app.style.height = Math.round(vv.height) + "px";
      app.style.transform = "translateY(" + Math.round(vv.offsetTop) + "px)";
    } else {
      app.style.minHeight = "";
      app.style.height = "";
      app.style.transform = "";
    }
  }
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", fitKeyboard);
    visualViewport.addEventListener("scroll", fitKeyboard);
  }

  var renderScreen = render;
  render = function () {
    renderScreen();
    fitKeyboard();
  };

  render();
})();
