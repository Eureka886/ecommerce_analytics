const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber
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
    shading: s ? { fill: "F5F8FB", type: ShadingType.CLEAR } : undefined,
    margins,
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

var headerTitle = "电商数据分析项目 | 第1周复习笔记";

var CHECK_LIST = [
  "DuckDB 能查到干净的原始数据表 (4,999,325 行)",
  "Notebook 里数据探索结果清晰 (行数/分布/时间范围)",
  "GitHub 上有 2 次初始提交",
  "项目目录结构完整 (src/ utils/ notebooks/ pages/)",
  "虚拟环境 + requirements.txt 可复现",
];

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
          children: [new TextRun({ text: headerTitle, font: FONT, size: 18, color: "AAAAAA" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: FONT, size: 18, color: "AAAAAA" }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "AAAAAA" })
          ]
        })]
      })
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "电商用户行为全流程分析平台", font: FONT, size: 34, bold: true, color: BLUE })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 360 },
        children: [new TextRun({ text: "第1周 环境搭建与数据准备 | 面试复习笔记", font: FONT, size: 22, color: "777777" })]
      }),

      // Section 1
      h2("一、本周完成清单"),
      bullet("DuckDB 能查到干净的原始数据表 (4,999,325 行)"),
      bullet("Notebook 里数据探索结果清晰 (行数/分布/时间范围)"),
      bullet("GitHub 上有 2 次初始提交"),
      bullet("项目目录结构完整 (src/ utils/ notebooks/ pages/)"),
      bullet("虚拟环境 + requirements.txt 可复现"),

      // Section 2 - Data
      h2("二、面试问答: 数据层面"),
      qaTable([
        ["数据量多大?", "原始约1亿条行为记录, 本项目抽样了前500万条用于分析探索"],
        ["数据干净吗? 有什么质量问题?", "CSV 文件没有表头行, 需要手动指定列名; 时间戳中存在异常值 (1970年与2037年), 需要过滤到核心日期窗口"],
        ["为什么只用10天的数据?", "数据集中在 2017年11月24日 至 12月3日 这10天, 其余日期记录极少 (个位数), 没有统计意义"],
      ]),

      // Section 3 - Tech
      h2("三、面试问答: 技术选型"),
      qaTable([
        ["为什么用 DuckDB 而不用 MySQL?", "DuckDB 零配置、嵌入式部署, 无需启动服务; OLAP 分析场景下比传统数据库快 10-50 倍; 单文件存储, 方便迁移和备份"],
        ["500万行 Pandas 能跑, 为什么还要 DuckDB?", "Pandas 将数据全部载入内存逐行计算, 大数据量下内存瓶颈明显; DuckDB 采用列式存储 + SQL 引擎, 聚合查询只需一行 SQL"],
      ]),

      // Section 4 - Engineering
      h2("四、面试问答: 工程习惯"),
      qaTable([
        ["项目结构为什么这么分?", "src 放可复用分析模块, utils 放通用工具函数, notebooks 放分析探索过程, pages 放 Streamlit 页面 -- 新成员 clone 下来不用问人就能看懂"],
        ["为什么既有 Jupyter 又有 .py?", "Jupyter Notebook 记录探索思路 (给面试官看分析过程), .py 模块给 Streamlit Dashboard 调用 (生产环境可复用)"],
      ]),

      // Section 5 - Core Concepts
      h2("五、本周必须掌握的三个技术概念"),

      h3("1. 为什么 pd.read_csv 不指定 names 会出错?"),
      body("淘宝数据集是一个没有表头行的 CSV 文件。Pandas 默认把第一行数据当作列名, 导致列名变成第一条数据的值。"),
      body("正确做法: 手动传入 names 参数指定列名 [user_id, item_id, category_id, behavior_type, timestamp]。"),
      highlight("[关键词] headerless CSV | names 参数 | 数据字典"),

      h3("2. Unix 时间戳 1511544070 代表什么?"),
      body("Unix 时间戳是从 1970-01-01 00:00:00 UTC 起经过的秒数。1511544070 转北京时间 = 2017年11月24日 14:01:10。"),
      body("转换方式: pd.to_datetime(timestamp, unit='s')。异常数据 (1970年/2037年) 是因为时间戳值偏离正常范围。"),
      highlight("[关键词] Unix timestamp | unit='s' | Epoch 时间"),

      h3("3. DuckDB 和 Pandas 的核心区别"),
      body("Pandas: 将数据完整载入内存, 逐行逐列用 Python 循环计算。优点是灵活、生态成熟; 缺点是数据量超过内存时直接崩溃。"),
      body("DuckDB: 采用列式存储, 将 SQL 语句编译为高效执行计划, 只加载查询涉及的列到内存。优点是大数据量下查询快、内存占用低。"),
      body("两者配合: DuckDB 做聚合查询 (GROUP BY, COUNT), 结果转 DataFrame 后 Pandas/Plotly 做可视化。"),
      highlight("[关键词] 列式存储 | OLAP | SQL 引擎 | 嵌入式数据库"),

      // Section 6
      h2("六、本周产出物清单"),
      bullet("data_loader.py -- 一键加载+清洗+入库的数据模块"),
      bullet("db.py -- DuckDB 查询工具封装"),
      bullet("01_data_exploration.ipynb -- 完整的数据探索过程"),
      bullet("requirements.txt -- Python 依赖清单"),
      bullet("ecommerce.db -- 5,000,000 条清洗后的行为数据"),
      bullet("GitHub: https://github.com/Eureka886/ecommerce_analytics"),

      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "-- 第1周完结 --", font: FONT, size: 20, color: "AAAAAA", italics: true })]
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(function(buf) {
  var out = "C:/Users/24805/Desktop/第1周复习笔记_环境搭建与数据准备.docx";
  fs.writeFileSync(out, buf);
  console.log("Done: " + out);
});
