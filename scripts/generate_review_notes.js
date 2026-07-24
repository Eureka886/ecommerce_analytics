const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

const B = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: B, bottom: B, left: B, right: B };
const margins = { top: 80, bottom: 80, left: 120, right: 120 };
const FONT = "Microsoft YaHei";
const BLUE = "1F4E79";

function hCell(t, w, c) {
  c = c || BLUE;
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: { fill: c, type: ShadingType.CLEAR }, margins,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: t, bold: true, font: FONT, size: 22, color: "FFFFFF" })]
    })]
  });
}

function tCell(t, w, s) {
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: s ? { fill: "F5F8FB", type: ShadingType.CLEAR } : undefined, margins,
    children: [new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 20 })] })]
  });
}

function h2(t) {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text: t, bold: true, font: FONT, size: 28, color: BLUE })]
  });
}

function h3(t) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: t, bold: true, font: FONT, size: 24, color: "333333" })]
  });
}

function body(t) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: t, font: FONT, size: 20 })]
  });
}

function bullet(t) {
  return new Paragraph({
    spacing: { before: 40, after: 40 }, indent: { left: 480 },
    children: [new TextRun({ text: t, font: FONT, size: 20 })]
  });
}

function highlight(t) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: t, font: FONT, size: 20, bold: true, color: "C0392B" })]
  });
}

function qaTable(rows) {
  var w = [2800, 6560];
  var tableRows = [new TableRow({ children: [hCell("面试官可能问", w[0]), hCell("参考回答", w[1])] })];
  for (var i = 0; i < rows.length; i++) {
    tableRows.push(new TableRow({ children: [tCell(rows[i][0], w[0], i % 2 === 0), tCell(rows[i][1], w[1], i % 2 === 0)] }));
  }
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: w, rows: tableRows });
}

function weekDivider() {
  return new Paragraph({ spacing: { before: 400 }, children: [new Paragraph({})] });
}

// ====== BUILD ALL WEEKS ======

function week1() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "第1周 环境搭建与数据准备", font: FONT, size: 30, bold: true, color: BLUE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 280 },
      children: [new TextRun({ text: "面试复习笔记", font: FONT, size: 20, color: "777777" })]
    }),

    h2("一、本周完成清单"),
    bullet("DuckDB 能查到干净的原始数据表 (4,999,325 行)"),
    bullet("Notebook 里数据探索结果清晰 (行数/分布/时间范围)"),
    bullet("GitHub 上有 2 次初始提交"),
    bullet("项目目录结构完整 (src/ utils/ notebooks/ pages/)"),
    bullet("虚拟环境 + requirements.txt 可复现"),

    h2("二、面试问答: 数据层面"),
    qaTable([
      ["「数据量多大?」", "原始约1亿条行为记录, 本项目抽样了前500万条用于分析探索"],
      ["「数据干净吗? 有什么质量问题?」", "CSV 文件没有表头行, 需要手动指定列名; 时间戳中存在异常值 (1970年与2037年), 需要过滤到核心日期窗口"],
      ["「为什么只用10天的数据?」", "数据集中在 2017年11月24日 至 12月3日 这10天, 其余日期记录极少 (个位数), 没有统计意义"],
    ]),

    h2("三、面试问答: 技术选型"),
    qaTable([
      ["「为什么用 DuckDB 而不用 MySQL?」", "DuckDB 零配置、嵌入式部署, 无需启动服务; OLAP 分析场景下比传统数据库快 10-50 倍; 单文件存储, 方便迁移和备份"],
      ["「500万行 Pandas 能跑, 为什么还要 DuckDB?」", "Pandas 将数据全部载入内存逐行计算, 大数据量下内存瓶颈明显; DuckDB 采用列式存储 + SQL 引擎, 聚合查询只需一行 SQL"],
    ]),

    h2("四、面试问答: 工程习惯"),
    qaTable([
      ["「项目结构为什么这么分?」", "src 放可复用分析模块, utils 放通用工具函数, notebooks 放分析探索过程, pages 放 Streamlit 页面 — 新成员 clone 下来不用问人就能看懂"],
      ["「为什么既有 Jupyter 又有 .py?」", "Jupyter Notebook 记录探索思路 (给面试官看分析过程), .py 模块给 Streamlit Dashboard 调用 (生产环境可复用)"],
    ]),

    h2("五、本周必须掌握的三个技术概念"),
    h3("1. 为什么 pd.read_csv 不指定 names 会出错?"),
    body("淘宝数据集是一个没有表头行的 CSV 文件。Pandas 默认把第一行数据当作列名, 导致列名变成第一条数据的值。"),
    body("正确做法: 手动传入 names 参数指定列名 [user_id, item_id, category_id, behavior_type, timestamp]。"),
    highlight("[关键词] headerless CSV | names 参数 | 数据字典"),

    h3("2. Unix 时间戳 1511544070 代表什么?"),
    body("Unix 时间戳是从 1970-01-01 00:00:00 UTC 起经过的秒数。1511544070 转北京时间 = 2017年11月24日 14:01:10。"),
    body("转换方式: pd.to_datetime(timestamp, unit='s')。异常数据是因为时间戳值偏离正常范围。"),
    highlight("[关键词] Unix timestamp | unit='s' | Epoch 时间"),

    h3("3. DuckDB 和 Pandas 的核心区别"),
    body("Pandas: 将数据完整载入内存, 逐行逐列用 Python 循环计算。优点是灵活、生态成熟; 缺点是数据量超过内存时直接崩溃。"),
    body("DuckDB: 采用列式存储, 将 SQL 语句编译为高效执行计划, 只加载查询涉及的列到内存。优点是大数据量下查询快、内存占用低。"),
    body("两者配合: DuckDB 做聚合查询 (GROUP BY, COUNT), 结果转 DataFrame 后 Pandas/Plotly 做可视化。"),
    highlight("[关键词] 列式存储 | OLAP | SQL 引擎 | 嵌入式数据库"),

    h2("六、本周产出物清单"),
    bullet("data_loader.py — 一键加载+清洗+入库的数据模块"),
    bullet("db.py — DuckDB 查询工具封装"),
    bullet("01_data_exploration.ipynb — 完整的数据探索过程"),
    bullet("requirements.txt — Python 依赖清单"),
    bullet("ecommerce.db — 5,000,000 条清洗后的行为数据"),
    bullet("GitHub: https://github.com/Eureka886/ecommerce_analytics"),
  ];
}

function week2() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "第2周 漏斗分析", font: FONT, size: 30, bold: true, color: BLUE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 280 },
      children: [new TextRun({ text: "面试复习笔记", font: FONT, size: 20, color: "777777" })]
    }),

    h2("一、本周完成清单"),
    bullet("漏斗各阶段PV计算 (pv: 4,474,562 / fav: 145,125 / cart: 279,512 / buy: 100,126)"),
    bullet("Plotly 漏斗图 (四层: 浏览→收藏→加购→下单)"),
    bullet("按日转化率趋势折线图 (10天稳定在2-2.4%)"),
    bullet("Top 5 类目漏斗对比柱状图"),
    bullet("Notebook: 02_funnel_analysis.ipynb"),
    bullet("src/funnel.py 模块 (5个可复用函数)"),

    h2("二、面试问答: 漏斗分析核心概念"),
    qaTable([
      ["「什么是漏斗分析?」", "漏斗分析追踪用户在一系列行为步骤中的转化情况。本项目中定义为 浏览(PV) → 收藏(FAV)/加购(CART) → 下单(BUY), 量化每一步的流失率。"],
      ["「整体转化率多少? 这个数字合理吗?」", "PV→下单 整体转化率 2.24%, 属于电商行业正常水平 (通常 1-5%)。每日转化率稳定在 2-2.4%, 没有异常波动。"],
      ["「为什么收藏比加购少?」", "收藏和加购是并列的中间行为, 不是先后步骤。大部分用户习惯直接加购物车而不点收藏, 所以 cart > fav 是正常的。192% 的 fav→cart 转化率恰好说明 fav 和 cart 不是漏斗的先后层级。"],
      ["「哪个类目表现最好?」", "类目 4145813 在 Top5 中转化率最高 (1.05%), 类目 4756105 流量最大但转化率仅 0.59% — 流量不等于质量。"],
    ]),

    h2("三、面试问答: 技术实现"),
    qaTable([
      ["「漏斗图怎么画的?」", "使用 Plotly go.Funnel, 传入 y=阶段名称, x=阶段数量, 自动计算每层相对上一层的转化率并标注。颜色用四个不同色调区分。"],
      ["「funnel.py 模块怎么设计的?」", "5个函数: calc_funnel() 计算汇总数据 / plot_funnel() 画漏斗图 / daily_trend() 计算每日转化率 / plot_daily_trend() 画趋势线 / category_funnel() 按类目计算漏斗。df 参数可选, 传 None 自动从 DuckDB 读取。"],
      ["「每日转化率怎么算的?」", "按 date 分组, 对每种 behavior_type 计数, 用 unstack() 展开为列, 下单数/浏览数 得到每日转化率。"],
    ]),

    h2("四、本周必须掌握的技术概念"),

    h3("1. 漏斗模型 (Funnel Model)"),
    body("漏斗模型是互联网运营的核心工具。一个标准电商漏斗: 流量 → 商品详情页 → 加购物车 → 提交订单 → 支付成功。"),
    body("本项目中简化为 浏览→收藏/加购→下单 三层四步。关键是理解「每一步的转化率 = 当前步数 / 上一步数 × 100%」。"),
    body("面试常问: \"你们产品的漏斗哪里流失最大? 可能原因是什么? 怎么优化?\" — 这个思路比图表本身更重要。"),
    highlight("[关键词] 转化率 | 流失点 | 用户旅程 | AARRR模型"),

    h3("2. 收藏 vs 加购: 行为差异"),
    body("收藏 (Favorite): 用户标记感兴趣但暂时不买, 类似\"书签\"功能。加购 (Add to Cart): 用户有明确购买意图, 距离下单更近。"),
    body("面试追问: \"如果你发现加购量远大于收藏量, 说明什么?\" — 说明用户决策路径短, 或者平台收藏入口不明显。"),
    body("本项目中 cart(279K) > fav(145K), 符合淘宝用户\"看到就加购\"的行为特征。"),
    highlight("[关键词] 用户行为分析 | 购物路径 | 决策心理"),

    h3("3. Plotly 的 Funnel vs Bar 选择"),
    body("漏斗图 (go.Funnel): 适合展示逐级递减的转化流程, textinfo 可自动标注百分比。缺点是只能展示一条路径。"),
    body("柱状图 (go.Bar): 适合多组对比 (如不同类目的漏斗), 用 barmode='group' 并排显示。"),
    body("两者配合使用: 先看整体漏斗 (宏观), 再看类目对比 (微观), 最后看每日趋势 (时间维度)。"),
    highlight("[关键词] 数据可视化 | 图表选择 | Plotly Express vs Graph Objects"),

    h2("五、本周产出物清单"),
    bullet("src/funnel.py — 漏斗分析模块 (calc_funnel / plot_funnel / daily_trend / plot_daily_trend / category_funnel / plot_category_comparison)"),
    bullet("02_funnel_analysis.ipynb — 漏斗分析完整探索过程"),
    bullet("漏斗图: 浏览(4.47M) → 收藏(145K) → 加购(280K) → 下单(100K)"),
    bullet("关键结论: 整体转化率 2.24%, 日转化率稳定, 类目4145813转化率最高(1.05%)"),
  ];
}

// ====== WEEK 3 ======

function week3() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "第3周 RFM用户分层", font: FONT, size: 30, bold: true, color: BLUE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 280 },
      children: [new TextRun({ text: "面试复习笔记", font: FONT, size: 20, color: "777777" })]
    }),

    h2("一、本周完成清单"),
    bullet("RFM三值计算: R=最近购买距今天数, F=购买次数, M=购买商品种类数 (nunique)"),
    bullet("按中位数打分: R<=2天=1分, F>=2次=1分, M>=2种=1分"),
    bullet("8种用户类型划分: 三个分数拼标签 → map字典 → 实际出现6种"),
    bullet("RFM散点气泡图 + 分层占比饼图"),
    bullet("重要价值用户 vs 一般挽留用户 Top10类目对比 (7/10重合)"),
    bullet("Notebook: 03_rfm_analysis.ipynb"),
    bullet("src/rfm.py 模块 (calc_rfm / get_segment_counts / plot_rfm_scatter / plot_rfm_pie)"),

    h2("二、面试问答: RFM核心概念"),
    qaTable([
      ["「什么是RFM? 为什么用它?」", "R=最近一次购买(越小越好), F=购买频率(越高越好), M=消费金额(无金额,用nunique商品种类替代)。三维各打分, 2³=8种类型, 支持针对性运营: 重要价值用户重点维护, 一般挽留用户发优惠券激活。"],
      ["「你们有6种类型, 缺了2种?」", "缺了重要保持(101)和一般保持(001), 需要F_score=0且M_score=1, 即买得少但种类多。数据集里无此模式, 不是代码Bug, 是真实分布。有金额后可能缓解。"],
      ["「你们没有金额, M怎么算的?」", "使用nunique(item_id)购买商品种类数替代总消费金额。局限性: 买一个高价商品(如手机)会被低估。业务有真实金额时替换即可, RFM框架不变。"],
      ["「重要价值 vs 一般挽留用户有什么区别?」", "Top10品类高度重合(7/10), 说明买的东西差不多。区别在频率和数量: 重要价值用户单类目购买量是挽留用户的7-10倍。策略: 对挽留用户发品类优惠券。"],
    ]),

    h2("三、面试问答: 技术实现"),
    qaTable([
      ["「agg三个值怎么同时算的?」", "buy_df.groupby('user_id').agg(last_date=('date','max'), F=('item_id','count'), M=('item_id','nunique'))。一次agg同时算三个指标, 生成新的DataFrame。"],
      ["「为什么用merge不用直接赋值?」", "buy_df(100,126行)和rfm(33,286行)行数不同, 直接赋值索引不对齐会错位。merge(on='user_id')按主键精确匹配, 等价SQL INNER JOIN。"],
      ["「散点图四维信息怎么看?」", "X轴R(左=好), Y轴F(上=好), 气泡大小=M, 颜色=用户类型。左上大泡泡 = 三好用户(重要价值), 右下小泡泡 = 需挽留用户。"],
    ]),

    h2("四、本周必须掌握的技术概念"),
    h3("1. RFM模型三段论"),
    body("① 算R/F/M三值 (groupby agg: count/nunique/max) → ② 按中位数切分打分 (注意R方向与F/M相反) → ③ 拼三维标签映射用户名 (map字典)。"),
    body("这是数据分析最常用的用户分层框架, 面试几乎必问。讲得清楚这三步 = 你做过真正的用户分析。"),
    highlight("[关键词] RFM | 用户分层 | 精细化运营 | 中位数切分"),

    h3("2. merge = SQL JOIN"),
    body("merge(on='user_id') 等价于 SQL INNER JOIN ON user_id。how='inner'只保留两边都有的行; how='left'保留左表全部; how='outer'保留全部。"),
    body("经典场景: 购买记录表 + 用户分层表 → 给每条购买记录打上用户类型标签, 然后对比不同用户群的品类偏好。"),
    highlight("[关键词] merge | JOIN | how=inner/left/outer | on"),

    h3("3. 数据局限性要主动承认"),
    body("本项目三个已知限制: ① 数据是2017年的(不影响方法论演示); ② M用购买种类代替金额(有真实金额替换即可); ③ 类目ID是脱敏数字(真实业务有映射表关联成中文名)。"),
    body("面试主动说限制 = 你思考过数据的边界 = 比90%候选人强。不是所有分析都完美, 关键是你知道哪里不完美。"),
    highlight("[关键词] 数据局限性 | 主动承认 | 方法论 vs 具体数字"),

    h2("五、本周产出物清单"),
    bullet("src/rfm.py — RFM模块 (calc_rfm / get_segment_counts / plot_rfm_scatter / plot_rfm_pie)"),
    bullet("03_rfm_analysis.ipynb — RFM分析完整探索过程"),
    bullet("关键结论: 33,286人有购买行为; 重要价值用户占42.8%(14,234人); 一般挽留用户21.0%(6,999人)"),
    bullet("散点气泡图 + 分层饼图 + Top10类目对比"),
  ];
}

// ====== BUILD DOCUMENT ======

var sections = week1().concat(week2()).concat(week3());

var doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "电商数据分析项目 | 面试复习笔记", font: FONT, size: 18, color: "AAAAAA" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "第 ", font: FONT, size: 18, color: "AAAAAA" }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "AAAAAA" }),
            new TextRun({ text: " 页", font: FONT, size: 18, color: "AAAAAA" })
          ]
        })]
      })
    },
    children: [
      // Cover title
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "电商用户行为全流程分析平台", font: FONT, size: 34, bold: true, color: BLUE })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "面试复习笔记 (第1-3周)", font: FONT, size: 22, color: "777777" })]
      }),
    ].concat(sections),
  }],
});

Packer.toBuffer(doc).then(function(buf) {
  var out = "C:/Users/24805/Desktop/电商项目面试复习笔记.docx";
  fs.writeFileSync(out, buf);
  console.log("Done: " + out);
});
