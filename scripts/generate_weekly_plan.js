const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

// ── helpers ──────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

const headerCell = (text, width, fill = "1F4E79") =>
  new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 22, color: "FFFFFF" })] })],
  });

const textCell = (text, width, shade = false) =>
  new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { fill: "F2F7FB", type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 20 })] })],
  });

const weeklyTitle = (text) =>
  new Paragraph({ spacing: { before: 360, after: 160 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 28, color: "1F4E79" })] });

const sectionIntro = (text) =>
  new Paragraph({ spacing: { before: 80, after: 200 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 20, color: "555555", italics: true })] });

// ── week data ─────────────────────────────────────────────

const weeks = [
  {
    title: "第1周：环境搭建 + 数据准备",
    intro: "预计耗时 15-20 小时",
    tasks: [
      ["1.1 创建GitHub仓库", "在GitHub创建 ecommerce_analytics 公开仓库，clone到本地 D:\\projects\\ecommerce_analytics\\", "本地文件夹能 git push 到 GitHub"],
      ["1.2 搭建Python环境", "创建虚拟环境 venv，安装依赖：pandas, numpy, duckdb, plotly, streamlit, mlxtend, jupyter，生成 requirements.txt", "在终端输入 streamlit hello 能正常弹出页面"],
      ["1.3 下载数据集", "从阿里天池或Kaggle下载淘宝用户行为数据集，放入 data/raw/", "data/raw/ 文件夹里能看到 .csv 文件，大小在 500MB 以上"],
      ["1.4 数据清洗", "处理缺失值、重复值、时间戳格式转换、异常值过滤，将清洗后的数据存入 DuckDB", "Jupyter Notebook 里运行清洗代码无报错，DuckDB 能查到清洗后的表"],
      ["1.5 数据探索", "在 Notebook 里完成：数据量统计、各行为类型分布、用户/商品/类目去重计数、时间范围确认、抽样策略确定", "产出 notebooks/01_data_exploration.ipynb，包含至少5个统计结果和注释说明"],
      ["1.6 项目骨架搭建", "创建 README.md（先写标题+项目简介）、src/、notebooks/、utils/ 目录结构", "目录结构跟设计文档一致，git commit 推上 GitHub"],
    ],
    check: "本周检查清单：能用 DuckDB 查到干净的原始数据表，Notebook 里数据探索结果清晰，GitHub 上有初始提交。",
  },
  {
    title: "第2周：漏斗分析",
    intro: "预计耗时 15-20 小时",
    tasks: [
      ["2.1 计算漏斗各阶段PV", "统计 pv、fav、cart、buy 四种行为的总次数，计算相邻阶段转化率", "输出：pv总数、fav总数、cart总数、buy总数，以及三个转化率百分比"],
      ["2.2 整体漏斗图", "用 Plotly go.Funnel 画出四层漏斗，标签显示数量和转化率", "漏斗图分层正确、数字标注清晰、配色统一"],
      ["2.3 按日漏斗趋势", "按天统计各行为PV和转化率，用折线图画出每日转化率变化", "折线图能看出转化率波动规律，至少覆盖30天数据"],
      ["2.4 按类目漏斗对比", "选取Top 5类目，分别画漏斗图对比转化率差异", "能从图中看出哪些类目转化率高/低，写2-3行文字解读"],
      ["2.5 漏斗分析Notebook", "把分析过程整理到 notebooks/02_funnel_analysis.ipynb，每一步加Markdown说明", "Notebook 从头到尾能一次性跑通，每个图表下方有分析结论"],
      ["2.6 封装漏斗模块", "核心逻辑抽取到 src/funnel.py，写成可复用函数", "src/funnel.py 至少包含3个函数：calc_funnel(), plot_funnel(), daily_trend()"],
    ],
    check: "本周检查清单：运行 src/funnel.py 主函数能输出漏斗图和趋势图，Notebook 完整可运行。",
  },
  {
    title: "第3周：RFM用户分层",
    intro: "预计耗时 15-20 小时",
    tasks: [
      ["3.1 计算R/F/M值", "按用户统计：R=最近购买距最后一天天数；F=购买次数；M=购买商品种类×购买次数", "每个用户有R/F/M三个数值，无空值、无异常值"],
      ["3.2 给每个维度打分", "按中位数将R/F/M各分高/低两组（R越低越好，F/M越高越好），生成8种用户类型标签", "8种类型的用户数量之和 = 总用户数"],
      ["3.3 RFM散点气泡图", "X轴=R，Y轴=F，气泡大小=M，颜色=用户类型，用Plotly画", "图中能直观看到不同颜色（类型）的用户分布规律"],
      ["3.4 分层占比饼图", "统计8种用户类型的人数和占比，画饼图", "饼图标签清晰，附百分比"],
      ["3.5 用户画像对比", "挑出重要价值用户和一般挽留用户，对比他们偏好的Top10商品类目", "能看出两类用户的品类偏好差异，写2-3行解读"],
      ["3.6 封装RFM模块", "核心逻辑抽取到 src/rfm.py", "至少包含3个函数：calc_rfm(), assign_segments(), plot_rfm()"],
      ["3.7 RFM Notebook", "整理过程和结论到 notebooks/03_rfm_analysis.ipynb", "一次性跑通，每个图表下方有结论"],
    ],
    check: "本周检查清单：运行 src/rfm.py 能输出用户分层结果和图表，Notebook 完整可运行。",
  },
  {
    title: "第4周：购物篮分析",
    intro: "预计耗时 15-20 小时",
    tasks: [
      ["4.1 构建事务数据", "按用户+时间段定义一次购物会话，把每个会话内购买的商品列表提取为事务", "事务总数 > 10000，每个事务是商品ID列表"],
      ["4.2 数据编码", "把事务列表转为 one-hot 矩阵", "得到 0/1 矩阵，列数=商品总数，行数=事务总数"],
      ["4.3 Apriori挖掘频繁项集", "用 mlxtend.apriori 找频繁项集，min_support 设为合适值（如0.005）", "输出至少50个频繁项集"],
      ["4.4 提取关联规则", "用 mlxtend.association_rules 计算置信度、提升度，筛选 Lift>1 且 Confidence>0.2", "输出至少20条有意义的规则"],
      ["4.5 关联规则可视化", "Top20规则用表格展示；Top10画散点图（X=Support, Y=Confidence, 颜色=Lift, 悬停=规则内容）", "图表信息完整，能从图中找出最强规则"],
      ["4.6 封装关联模块", "核心逻辑抽取到 src/association.py", "至少包含3个函数"],
      ["4.7 关联分析 Notebook", "notebooks/04_market_basket.ipynb", "一次性跑通，结论清晰"],
    ],
    check: "本周检查清单：运行 src/association.py 能输出关联规则表，至少有10条 Lift>1.5 的有效规则。",
  },
  {
    title: "第5周：留存分析 + Dashboard框架",
    intro: "预计耗时 18-22 小时",
    tasks: [
      ["5.1 计算留存指标", "按用户首次活跃日期划分同期群，计算D1/D3/D7/D14/D30留存率", "至少5个同期群，每个群有5个留存数据点"],
      ["5.2 同期群热力图", "用 Plotly Heatmap 画留存矩阵（行=同期群，列=第N天，颜色=留存率）", "热力图颜色从深到浅对应留存率高低，轴标签清晰"],
      ["5.3 整体留存曲线", "画一条聚合留存曲线（横轴=天数，纵轴=留存率）", "曲线连续下降，标明D1/D7/D30具体数值"],
      ["5.4 留存vs流失用户对比", "对比两类用户的首日行为特征（浏览数、购买数、类目多样性）", "表格+柱状图，写2-3行解读"],
      ["5.5 封装留存模块", "核心逻辑抽取到 src/retention.py", "至少包含3个函数"],
      ["5.6 保留 Notebook", "notebooks/05_retention_analysis.ipynb", "一次性跑通"],
      ["5.7 搭建Dashboard框架", "创建 app.py 主入口 + pages/ 下5个子页面，放占位文字，确保导航和页面切换正常", "streamlit run app.py 能打开，左侧导航5个页面可点击切换"],
    ],
    check: "本周检查清单：运行 src/retention.py 输出留存热力图；streamlit run app.py 能运行，5个页面导航正常。",
  },
  {
    title: "第6周：Dashboard完善 + 文档 + 收尾",
    intro: "预计耗时 18-22 小时",
    tasks: [
      ["6.1 概览页", "KPI卡片（总用户数、总PV、整体转化率、人均购买）+ 趋势折线图", "页面打开即看到4个数字卡片和1张趋势图"],
      ["6.2 漏斗分析页", "嵌入漏斗图、日期筛选器、类目选择器、每日趋势图", "切换筛选器后图表联动更新"],
      ["6.3 RFM分层页", "嵌入散点气泡图、分层饼图、用户画像对比", "页面内容完整展示"],
      ["6.4 关联规则页", "嵌入规则表格（可排序）、筛选滑块（最小Lift/Confidence）、散点图", "拖动滑块后表格和图表同步更新"],
      ["6.5 留存分析页", "嵌入热力图、留存曲线、同期群选择器", "切换同期群后图表更新"],
      ["6.6 完善README", "项目简介、技术栈、截图×5（每个Dashboard页面一张）、如何运行、关键发现", "完全没看过项目的人看完README能理解做什么、怎么跑起来"],
      ["6.7 写分析报告", "在 report/analysis_report.md 中写一份800-1500字的分析报告，包含核心发现和业务建议", "报告包含：背景、数据概况、4个模块各2-3条关键发现、3条可执行的业务建议"],
      ["6.8 最终检查 & 发布", "全部Notebook从头跑通、全部代码无报错、所有更改push到GitHub、仓库设为Public", "GitHub仓库首页显示完整README，新人clone下来能跑通"],
    ],
    check: "本周检查清单：streamlit run app.py 所有页面有数据有图表，README有截图，GitHub仓库公开可访问。",
  },
];

// ── table builder ─────────────────────────────────────────
const COL_WIDTHS = [1600, 3980, 3780]; // total = 9360 (US Letter content width)
const buildWeekTable = (tasks) =>
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: COL_WIDTHS,
    rows: [
      new TableRow({
        children: [
          headerCell("任务", COL_WIDTHS[0]),
          headerCell("具体做什么", COL_WIDTHS[1]),
          headerCell("怎么才算完成（检查标准）", COL_WIDTHS[2]),
        ],
      }),
      ...tasks.map((row, i) =>
        new TableRow({
          children: row.map((cell, j) => textCell(cell, COL_WIDTHS[j], i % 2 === 0)),
        })
      ),
    ],
  });

// ── document ──────────────────────────────────────────────
const colW = [3600, 5760]; // overview table
const overviewRows = [
  ["第1周", "环境搭建 + 数据准备"],
  ["第2周", "漏斗分析"],
  ["第3周", "RFM用户分层"],
  ["第4周", "购物篮分析"],
  ["第5周", "留存分析 + Dashboard框架"],
  ["第6周", "Dashboard完善 + 文档 + 收尾"],
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
  },
  sections: [
    // ── cover / title page ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "电商用户行为全流程分析平台 · 每周任务计划", font: "Microsoft YaHei", size: 18, color: "999999" })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 18, color: "999999" }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 18, color: "999999" })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({ spacing: { before: 3600 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "电商用户行为全流程分析平台", font: "Microsoft YaHei", size: 44, bold: true, color: "1F4E79" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "每周任务计划书", font: "Microsoft YaHei", size: 36, color: "333333" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "暑假项目 · 6周 · 数据分析师方向", font: "Microsoft YaHei", size: 24, color: "777777" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 2800 }, children: [new TextRun({ text: "2026年7月", font: "Microsoft YaHei", size: 22, color: "999999" })] }),

        // overview table on cover
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "总览", font: "Microsoft YaHei", size: 28, bold: true, color: "1F4E79" })] }),
        new Table({
          width: { size: 6500, type: WidthType.DXA },
          columnWidths: [1500, 5000],
          rows: [
            new TableRow({ children: [headerCell("周次", 1500), headerCell("主题", 5000)] }),
            ...overviewRows.map((r, i) =>
              new TableRow({
                children: [
                  textCell(r[0], 1500, i % 2 === 0),
                  textCell(r[1], 5000, i % 2 === 0),
                ],
              })
            ),
          ],
        }),

        new Paragraph({ spacing: { before: 1200 }, children: [new TextRun({ text: "提交要求：每周至少 2 次 Git 提交，格式：feat: 完成XXX模块 / docs: 更新README / fix: 修复XXX问题", font: "Microsoft YaHei", size: 20, color: "888888" })] }),
      ],
    },

    // ── detail pages ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1200, bottom: 1200, left: 1200 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } },
              children: [new TextRun({ text: "电商用户行为全流程分析平台 · 每周任务计划", font: "Microsoft YaHei", size: 18, color: "999999" })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 18, color: "999999" }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 18, color: "999999" })],
            }),
          ],
        }),
      },
      children: weeks.flatMap((w) => [
        weeklyTitle(w.title),
        sectionIntro(w.intro),
        buildWeekTable(w.tasks),
        new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: w.check, font: "Microsoft YaHei", size: 20, bold: true, color: "C00000" })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ]),
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("D:/projects/ecommerce_analytics/docs/每周任务计划.docx", buffer);
  console.log("Done: D:/projects/ecommerce_analytics/docs/每周任务计划.docx");
});
