# 电商用户行为全流程分析平台 — 设计文档

## 1. 项目概述

**项目名称**：E-Commerce User Behavior Analytics Platform  
**一句话定位**：从海量用户行为日志中构建完整的数据分析体系，回答"用户怎么来、怎么用、怎么走、怎么留"，输出可交互的 Streamlit 仪表板。

**核心目标**：
- 掌握互联网数据分析师的核心工作流（取数 → 清洗 → 建模 → 可视化 → 输出洞察）
- 产出 1 个可交互 Web Dashboard + 1 份分析报告（PDF/PPT）+ Jupyter Notebook 分析日志
- 项目代码托管 GitHub，README 详尽，可直接作为简历项目展示

**目标岗位**：互联网/电商行业数据分析师（实习/校招）

---

## 2. 数据来源

**主数据源**：阿里天池 Taobao User Behavior Dataset
- 约 1 亿条记录，本项目取 500万-1000万条作为分析样本
- 字段：`user_id`, `item_id`, `category_id`, `behavior_type` (pv/buy/cart/fav), `timestamp`
- 覆盖时间：约 1 个自然月（足够构建漏斗分析和同期群分析）

**备选数据源**（如果阿里天池不可访问）：
- Kaggle: E-Commerce Behavior Data from Multi-Category Store
- Kaggle: RetailRocket E-Commerce Dataset

**数据结构示例**：
```
user_id | item_id   | category_id | behavior_type | timestamp
100010  | 4801426   | 4756105     | pv            | 2023-11-25 08:23:14
100010  | 4801426   | 4756105     | fav           | 2023-11-25 08:24:02
100010  | 4801426   | 4756105     | cart          | 2023-11-25 08:24:58
100010  | 4801426   | 4756105     | buy           | 2023-11-25 08:30:47
100011  | 1089273   | 2355072     | pv            | 2023-11-25 09:01:33
```

---

## 3. 技术栈

| 层 | 技术 | 理由 |
|----|------|------|
| 数据处理 | Pandas + NumPy | 已具备经验，生态成熟 |
| SQL 查询 | DuckDB | 轻量嵌入式 OLAP，百万级数据秒出，支持标准 SQL |
| 关联规则 | mlxtend (Apriori) | 购物篮分析专用库 |
| 可视化 | Plotly Express | 交互式图表，支持悬停/缩放/导出 |
| Dashboard | Streamlit | 纯 Python 写前端，部署简单 |
| 环境管理 | venv + requirements.txt | 可复现 |
| 版本控制 | Git + GitHub | 项目展示 |
| 文档 | Markdown (README) + Jupyter Notebook | 分析过程可追溯 |

**不含机器学习/深度学习框架**：本案聚焦"数据分析师"核心技能，不涉及预测建模。

---

## 4. 分析模块设计

本项目围绕四个核心分析模块展开，每个模块对应一个数据分析师面试高频考点。

### 4.1 流量漏斗分析（Funnel Analysis）

**回答什么问题**：用户从进店到下单，每一步流失了多少？

**业务指标**：
- 浏览 → 收藏/加购 转化率
- 加购 → 下单 转化率
- 整体 PV → Buy 转化率
- 按天/按小时维度的漏斗趋势

**技术实现**：
- 使用 Pandas `groupby + count` 计算各行为类型 PV
- 用 Plotly 绘制漏斗图（`go.Funnel`）
- 提供时间筛选器，支持任意时间段查看

**交付物**：
- 整体漏斗图（一张）
- 按日漏斗趋势折线图（一张）
- 按商品类目漏斗 TOP10/N 筛选对比

### 4.2 用户分层分析（RFM 模型）

**回答什么问题**：哪些用户是高价值用户？怎么对用户分群运营？

**RFM 指标定义**：
| 维度 | 含义 | 计算方式 |
|------|------|----------|
| R (Recency) | 最近一次购买距今天数 | `max_date - last_buy_date` |
| F (Frequency) | 购买次数 | `count(buy)` |
| M (Monetary) | 消费金额 | 数据集中无金额字段：用**购买商品数 × 购买次数**作为替代指标 |

**分层策略**：
- 每个维度按中位数分为"高/低"两组
- 得出 8 种用户类型（如"重要价值用户"、"一般挽留用户"等）
- 使用 Plotly 绘制 RFM 散点气泡图 + 分层饼图

**说明**：由于数据集中无金额字段，Monetary 使用替代方案。若使用 Kaggle 数据集有金额，则直接使用。

**交付物**：
- RFM 分层用户画像表
- 各层用户占比饼图
- 高价值用户 vs 流失用户的品类偏好对比

### 4.3 购物篮分析（Market Basket Analysis）

**回答什么问题**：哪些商品经常被一起购买？怎么做捆绑推荐？

**核心技术**：Apriori 关联规则算法

**关键指标**：
- Support（支持度）：同时购买 A 和 B 的交易占比
- Confidence（置信度）：买了 A 的人中有多少也买了 B
- Lift（提升度）：买 A 对买 B 概率的提升倍数（>1 才有意义）

**技术实现**：
- 构建事务矩阵（每个 user 在一个 session 内购买的商品集合）
- 使用 `mlxtend.frequent_patterns.apriori` 找频繁项集
- 使用 `mlxtend.frequent_patterns.association_rules` 挖掘规则
- 筛选 Lift > 1.5, Confidence > 0.3 的强关联规则

**交付物**：
- Top 20 强关联规则表格
- 关联规则网络图（Plotly 散点连线图）

### 4.4 留存分析（Retention / Cohort Analysis）

**回答什么问题**：用户来了之后还会回来吗？第几天流失最严重？

**留存指标**：
- Day 1 / Day 3 / Day 7 / Day 14 / Day 30 留存率
- 同期群热力图（每周获取的用户在后续各周的留存率）

**技术实现**：
- 定义活跃行为（至少有一次 pv/buy/cart/fav）
- 按用户首次活跃周划分同期群
- 计算每周期群在后续每周的留存比例
- 用 Plotly `go.Heatmap` 绘制同期群热力图

**交付物**：
- 同期群留存热力图
- 整体留存曲线（D1/D3/D7/D14/D30）
- 高留存用户 vs 流失用户的行为特征对比

---

## 5. Dashboard 设计（Streamlit）

### 5.1 页面结构

```
┌─────────────────────────────────────────────┐
│  📊 电商用户行为全流程分析平台                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │概览  │ │漏斗  │ │RFM  │ │关联  │ ┌─────┐  │
│  │      │ │分析  │ │分层  │ │规则  │ │留存  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
├─────────────────────────────────────────────┤
│  全局筛选器：日期范围 | 类目 | 行为类型       │
├─────────────────────────────────────────────┤
│                                             │
│    [当前页面的图表和指标卡片]                  │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.2 各页面内容

| 页面 | 内容 |
|------|------|
| **概览** | 核心 KPI 卡片（总用户数、总 PV、整体转化率、人均购买次数）+ 趋势总览 |
| **漏斗分析** | 漏斗图 + 按日趋势 + 按类目漏斗对比 |
| **RFM 分层** | RFM 散点气泡图 + 分层占比 + 用户画像摘要 |
| **关联规则** | 规则表格 + 提升度排序 + 网络图 |
| **留存分析** | 同期群热力图 + 留存曲线 + 行为对比 |

### 5.3 配色与设计

- 主色：`#1f77b4`（蓝），辅色：`#ff7f0e`（橙，用于警示指标）
- 所有图表统一 Plotly 主题 `plotly_white`
- KPI 卡片用 `st.metric`，增长/下降用红绿色箭头

---

## 6. 项目文件结构

```
ecommerce_analytics/
├── README.md                  # 项目门面：背景、截图、技术栈、如何运行、关键发现
├── requirements.txt           # Python 依赖
├── data/
│   ├── raw/                   # 原始数据（gitignore）
│   │   └── UserBehavior.csv
│   └── processed/             # 清洗后的中间数据
│       ├── funnel_data.pkl
│       ├── rfm_data.pkl
│       └── cohort_data.pkl
├── notebooks/
│   ├── 01_data_exploration.ipynb    # 数据探索与清洗过程
│   ├── 02_funnel_analysis.ipynb     # 漏斗分析过程
│   ├── 03_rfm_analysis.ipynb        # RFM分层过程
│   ├── 04_market_basket.ipynb       # 购物篮分析过程
│   └── 05_retention_analysis.ipynb  # 留存分析过程
├── src/
│   ├── __init__.py
│   ├── data_loader.py         # 数据加载与预处理
│   ├── funnel.py              # 漏斗分析逻辑
│   ├── rfm.py                 # RFM 分层逻辑
│   ├── association.py         # 购物篮分析逻辑
│   └── retention.py           # 留存分析逻辑
├── app.py                     # Streamlit 主入口
├── pages/                     # Streamlit 各页面
│   ├── 01_overview.py
│   ├── 02_funnel.py
│   ├── 03_rfm.py
│   ├── 04_association.py
│   └── 05_retention.py
├── utils/
│   ├── __init__.py
│   ├── charts.py              # 图表模板（统一风格）
│   └── db.py                  # DuckDB 查询封装
└── report/
    └── analysis_report.md     # 文字分析报告（结论+建议）
```

---

## 7. 开发计划（6周）

| 周次 | 任务 | 产出 |
|------|------|------|
| **第1周** | 环境搭建 + 数据获取/清洗 | GitHub仓库建好，数据加载到DuckDB，完成数据探索Notebook |
| **第2周** | 漏斗分析模块 | 漏斗图+趋势图，`src/funnel.py`，Notebook #2 |
| **第3周** | RFM分层模块 | RFM散点图+分层饼图，`src/rfm.py`，Notebook #3 |
| **第4周** | 购物篮分析模块 | 关联规则表格+网络图，`src/association.py`，Notebook #4 |
| **第5周** | 留存分析模块 + Streamlit Dashboard 搭建 | 留存热力图，`src/retention.py`，Notebook #5，Dashboard框架 |
| **第6周** | Dashboard 完善 + README + 分析报告 + 部署上线 | 所有页面接入数据，生成分析报告，截图，README 打磨 |

---

## 8. 最终交付物清单

| 交付物 | 用途 | 形式 |
|--------|------|------|
| GitHub 仓库 | 简历链接 | 公开仓库，含完整代码 |
| Streamlit Dashboard | 面试演示 | 本地运行 / 部署到 Streamlit Cloud |
| Jupyter Notebook ×5 | 面试追问时展示分析过程 | 仓库内 |
| README.md | 面试官第一印象 | 仓库首页，含截图和关键发现 |
| analysis_report.md | 文字版洞察（可导出PDF） | `report/` 目录下 |

---

## 9. 风险评估与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 阿里天池数据集无法下载 | 项目无法启动 | 准备 Kaggle E-Commerce Behavior Data 作为备选 |
| 数据量太大（1亿条），本地跑不动 | 分析耗时过长 | 抽样 500万-1000万条；使用 DuckDB 做预聚合 |
| 数据集中无金额字段 | RFM 的 M 维度缺失 | 使用购买商品数 × 购买次数作为替代，并在文档中说明局限性 |
| Streamlit Cloud 部署失败 | 无法在线演示 | 本地运行 + 录屏 GIF 替代，GIF 放入 README |

---

## 10. 关键成功标准

完成本项目后，你应该能够**流畅回答以下面试问题**：

1. "说一下你项目里漏斗分析的思路？"→ 漏斗分析模块
2. "怎么对用户做分层运营？"→ RFM 模块
3. "怎么做商品推荐？关联规则和协同过滤的区别？"→ 购物篮分析模块
4. "怎么衡量用户留存？同期群分析是什么？"→ 留存分析模块
5. "你的数据量多大？怎么处理大数据量查询？"→ DuckDB + 抽样策略
6. "这个项目的业务价值是什么？给了什么建议？"→ analysis_report.md
