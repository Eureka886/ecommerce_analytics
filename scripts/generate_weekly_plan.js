const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

const B = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: B, bottom: B, left: B, right: B };
const cm = { top: 30, bottom: 30, left: 80, right: 80 }; // tighter cell padding
const F = "Microsoft YaHei";

const hCell = (t, w) =>
  new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: "1F4E79", type: ShadingType.CLEAR }, margins: cm,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, font: F, size: 18, color: "FFFFFF" })] })] });

const tCell = (t, w, shade) =>
  new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: shade ? { fill: "F5F8FB", type: ShadingType.CLEAR } : undefined, margins: cm,
    children: [new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: t, font: F, size: 17 })] })] });

const weeks = [
  { title: "第1周: 环境搭建 + 数据准备", intro: "15-20h", tasks: [
    ["1.1 创建GitHub仓库", "在GitHub创建 ecommerce_analytics 公开仓库, clone到本地", "本地文件夹能 git push 到 GitHub"],
    ["1.2 搭建Python环境", "虚拟环境 venv, 安装 pandas/numpy/duckdb/plotly/streamlit/mlxtend/jupyter, 生成 requirements.txt", "终端输入 streamlit hello 能正常弹出页面"],
    ["1.3 下载数据集", "从阿里天池或Kaggle下载淘宝用户行为数据集, 放入 data/raw/", "data/raw/ 能看到 .csv 文件, 大小在 500MB 以上"],
    ["1.4 数据清洗", "处理缺失值/重复值/时间戳转换/异常值过滤, 存入 DuckDB", "Jupyter Notebook 运行无报错, DuckDB 能查到清洗后的表"],
    ["1.5 数据探索", "数据量统计/行为分布/去重计数/时间范围/抽样策略", "产出 01_data_exploration.ipynb, 含至少5个统计结果和注释"],
    ["1.6 项目骨架搭建", "创建 README.md, src/, notebooks/, utils/ 目录结构", "目录结构跟设计文档一致, git commit 推上 GitHub"],
  ], check: "本周检查: DuckDB 能查到干净数据, Notebook 探索结果清晰, GitHub 有初始提交。" },
  { title: "第2周: 漏斗分析", intro: "15-20h", tasks: [
    ["2.1 计算漏斗各阶段PV", "统计 pv/fav/cart/buy 总次数, 计算相邻转化率", "输出四种行为数量和三个转化率百分比"],
    ["2.2 整体漏斗图", "用 Plotly go.Funnel 画四层漏斗, 标签显示数量和转化率", "漏斗图分层正确/数字清晰/配色统一"],
    ["2.3 按日漏斗趋势", "按天统计各行为PV和转化率, 折线图展示每日变化", "折线图能看出波动规律, 至少覆盖10天数据"],
    ["2.4 按类目漏斗对比", "选取Top 5类目, 分别画漏斗图对比转化率差异", "能看出高/低转化率类目, 写2-3行解读"],
    ["2.5 漏斗分析Notebook", "分析过程整理到 02_funnel_analysis.ipynb, 加Markdown说明", "Notebook 从头到尾一次性跑通, 每图下方有结论"],
    ["2.6 封装漏斗模块", "核心逻辑抽取到 src/funnel.py, 写成可复用函数", "至少3个函数: calc_funnel(), plot_funnel(), daily_trend()"],
  ], check: "本周检查: 运行 src/funnel.py 输出漏斗图和趋势图, Notebook 完整可运行。" },
  { title: "第3周: RFM用户分层", intro: "15-20h", tasks: [
    ["3.1 计算R/F/M值", "R=最近购买距最后天天数; F=购买次数; M=购买商品种类x购买次数", "每个用户有R/F/M三个值, 无空值无异常"],
    ["3.2 给维度打分分层", "按中位数将R/F/M分高/低两组, 生成8种用户类型标签", "8种类型用户数之和 = 总用户数"],
    ["3.3 RFM散点气泡图", "X=R, Y=F, 气泡大小=M, 颜色=用户类型", "图中能直观看到不同颜色类型的用户分布"],
    ["3.4 分层占比饼图", "统计8种用户类型的人数和占比, 画饼图", "饼图标签清晰, 附百分比"],
    ["3.5 用户画像对比", "对比重要价值用户 vs 一般挽留用户的Top10商品类目偏好", "看出品类偏好差异, 写2-3行解读"],
    ["3.6 封装RFM模块", "核心逻辑抽取到 src/rfm.py", "至少3个函数: calc_rfm(), assign_segments(), plot_rfm()"],
    ["3.7 RFM Notebook", "整理到 03_rfm_analysis.ipynb", "一次性跑通, 每个图表下方有结论"],
  ], check: "本周检查: 运行 src/rfm.py 输出用户分层结果和图表, Notebook 完整可运行。" },
  { title: "第4周: 购物篮分析", intro: "15-20h", tasks: [
    ["4.1 构建事务数据", "按用户+时间段定义购物会话, 提取每个会话的购买商品列表", "事务总数 > 10000, 每个事务为商品ID列表"],
    ["4.2 数据编码", "事务列表转为 one-hot 矩阵", "得到 0/1 矩阵, 列数=商品数, 行数=事务数"],
    ["4.3 Apriori频繁项集", "用 mlxtend.apriori, min_support=0.005", "输出至少50个频繁项集"],
    ["4.4 提取关联规则", "用 association_rules, 筛选 Lift>1 且 Confidence>0.2", "输出至少20条有意义的规则"],
    ["4.5 关联规则可视化", "Top20规则表格 + Top10散点图 (X=Support,Y=Confidence,颜色=Lift)", "图表信息完整, 能找出最强规则"],
    ["4.6 封装关联模块", "核心逻辑抽取到 src/association.py", "至少3个函数"],
    ["4.7 关联分析Notebook", "notebooks/04_market_basket.ipynb", "一次性跑通, 结论清晰"],
  ], check: "本周检查: 运行 src/association.py 输出规则表, 至少10条 Lift>1.5 的有效规则。" },
  { title: "第5周: 留存分析 + Dashboard框架", intro: "18-22h", tasks: [
    ["5.1 计算留存指标", "按首次活跃日期划分同期群, 计算D1/D3/D7/D14/D30留存率", "至少5个同期群, 每群5个留存数据点"],
    ["5.2 同期群热力图", "用 Plotly Heatmap (行=同期群, 列=第N天, 颜色=留存率)", "颜色深浅对应留存率高低, 轴标签清晰"],
    ["5.3 整体留存曲线", "聚合留存曲线 (横轴=天数, 纵轴=留存率)", "曲线连续下降, 标明D1/D7/D30数值"],
    ["5.4 留存vs流失对比", "对比两类用户首日行为 (浏览数/购买数/类目多样性)", "表格+柱状图, 写2-3行解读"],
    ["5.5 封装留存模块", "核心逻辑抽取到 src/retention.py", "至少3个函数"],
    ["5.6 留存Notebook", "notebooks/05_retention_analysis.ipynb", "一次性跑通"],
    ["5.7 Dashboard框架", "创建 app.py + pages/ 下5个子页面, 占位文字, 确保导航正常", "streamlit run app.py 能打开, 左侧5个页面可切换"],
  ], check: "本周检查: src/retention.py 输出留存热力图; streamlit run app.py 能运行, 5页面导航正常。" },
  { title: "第6周: Dashboard完善 + 文档 + 收尾", intro: "18-22h", tasks: [
    ["6.1 概览页", "KPI卡片 (总用户/总PV/转化率/人均购买) + 趋势折线图", "页面打开即看到4个数字卡片+1张趋势图"],
    ["6.2 漏斗分析页", "漏斗图 + 日期筛选器 + 类目选择器 + 每日趋势图", "切换筛选器后图表联动更新"],
    ["6.3 RFM分层页", "散点气泡图 + 分层饼图 + 用户画像对比", "页面内容完整展示"],
    ["6.4 关联规则页", "规则表格(可排序) + Lift/Confidence滑块 + 散点图", "拖动滑块后表格和图表同步更新"],
    ["6.5 留存分析页", "热力图 + 留存曲线 + 同期群选择器", "切换同期群后图表更新"],
    ["6.6 完善README", "项目简介/技术栈/截图x5/如何运行/关键发现", "没看过项目的人看完能理解做什么、怎么跑"],
    ["6.7 写分析报告", "report/analysis_report.md, 800-1500字, 核心发现+业务建议", "含背景/数据概况/4模块各2-3条发现/3条业务建议"],
    ["6.8 最终检查发布", "全部Notebook跑通, 代码无报错, push到GitHub, 仓库Public", "GitHub首页完整README, 新人clone下来能跑通"],
  ], check: "本周检查: streamlit run app.py 所有页面有数据有图表, README有截图, GitHub公开可访问。" },
];

const COL = [1200, 4100, 4060]; // total = 9360
const buildTable = (tasks) =>
  new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: COL, rows: [
    new TableRow({ children: [hCell("任务", COL[0]), hCell("具体做什么", COL[1]), hCell("怎么才算完成", COL[2])] }),
    ...tasks.map((r, i) => new TableRow({ children: r.map((c, j) => tCell(c, COL[j], i % 2 === 0)) })),
  ]});

const doc = new Document({
  styles: { default: { document: { run: { font: F, size: 20 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 800, right: 1000, bottom: 800, left: 1000 } } },
    children: [
      // Compact title
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "电商用户行为全流程分析平台 - 每周任务计划", font: F, size: 30, bold: true, color: "1F4E79" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "暑假6周 | 数据分析师方向 | 每周至少2次Git提交 feat: 完成XXX模块", font: F, size: 18, color: "888888" })] }),

      ...weeks.flatMap((w, wi) => [
        // Week title - compact
        new Paragraph({ spacing: { before: 200, after: 30 }, children: [
          new TextRun({ text: w.title, font: F, size: 22, bold: true, color: "1F4E79" }),
          new TextRun({ text: `  (${w.intro})`, font: F, size: 18, color: "888888", italics: true }),
        ]}),
        buildTable(w.tasks),
        new Paragraph({ spacing: { before: 40, after: wi < 5 ? 60 : 20 }, children: [new TextRun({ text: w.check, font: F, size: 17, bold: true, color: "C00000" })] }),
        // Only page break between weeks 3 and 4 to avoid orphan tables
        ...(wi === 2 ? [new Paragraph({ children: [] })] : []),
      ]),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/projects/ecommerce_analytics/docs/每周任务计划.docx", buf);
  console.log("Done: 每周任务计划.docx (compact version)");
});
