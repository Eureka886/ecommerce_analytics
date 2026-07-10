# E-Commerce User Behavior Analytics Platform

电商用户行为全流程分析平台 — 从海量用户行为日志中构建完整的数据分析体系。

## 项目简介

本项目以电商用户行为数据为基础，覆盖数据分析师核心技能：漏斗分析、RFM 用户分层、购物篮分析（关联规则）、同期群留存分析，最终输出一个可交互的 Streamlit 仪表板。

## 分析模块

- **漏斗分析** — 浏览→收藏→加购→下单，各环节转化率与趋势
- **RFM 用户分层** — 基于最近购买/购买频次/消费力将用户分为 8 种类型
- **购物篮分析** — Apriori 关联规则，挖掘"买了A也会买B"的商品组合
- **留存分析** — 同期群热力图，D1/D3/D7/D14/D30 留存率对比

## 技术栈

Python · Pandas · DuckDB · Plotly · Streamlit · mlxtend · Jupyter Notebook

## 数据来源

阿里天池 Taobao User Behavior Dataset（~1亿条，本项目抽样 500万-1000万条）

## 项目结构

```
ecommerce_analytics/
├── data/
│   ├── raw/          # 原始数据（不计入版本控制）
│   └── processed/    # 清洗后的中间数据
├── notebooks/        # Jupyter 分析日志
├── src/              # 核心分析模块
├── pages/            # Streamlit 子页面
├── utils/            # 工具函数
├── report/           # 分析报告
└── app.py            # Streamlit 主入口
```

## 如何运行

```bash
# 1. 克隆仓库
git clone https://github.com/Eureka886/ecommerce_analytics.git
cd ecommerce_analytics

# 2. 创建虚拟环境 & 安装依赖
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. 启动仪表板
streamlit run app.py
```

## 关键发现

> 待补充（第6周完成分析后更新）

## 作者

- 刘易隽
- 2026年暑假
