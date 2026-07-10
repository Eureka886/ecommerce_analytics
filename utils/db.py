"""
DuckDB 查询工具模块
封装常用查询操作，供各分析模块和 Streamlit 页面调用
"""
import duckdb
import pandas as pd
import os

DB_PATH = "data/processed/ecommerce.db"


def connect() -> duckdb.DuckDBPyConnection:
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"数据库不存在: {DB_PATH}，请先运行 src/data_loader.py")
    return duckdb.connect(DB_PATH)


def query(sql: str) -> pd.DataFrame:
    """执行 SQL 查询，返回 DataFrame"""
    con = connect()
    result = con.execute(sql).df()
    con.close()
    return result


def get_date_range():
    """获取数据的时间范围"""
    return query("SELECT MIN(timestamp) as start, MAX(timestamp) as end FROM behaviors")


def get_total_users():
    """获取总用户数"""
    return query("SELECT COUNT(DISTINCT user_id) as total FROM behaviors").iloc[0, 0]


def get_total_items():
    """获取总商品数"""
    return query("SELECT COUNT(DISTINCT item_id) as total FROM behaviors").iloc[0, 0]


def get_total_categories():
    """获取总类目数"""
    return query("SELECT COUNT(DISTINCT category_id) as total FROM behaviors").iloc[0, 0]


def get_behavior_counts():
    """获取各行为类型的数量"""
    return query("""
        SELECT behavior_type, COUNT(*) as count
        FROM behaviors
        GROUP BY behavior_type
        ORDER BY count DESC
    """)


def get_daily_counts():
    """获取每日行为统计"""
    return query("""
        SELECT date, behavior_type, COUNT(*) as count
        FROM behaviors
        GROUP BY date, behavior_type
        ORDER BY date, behavior_type
    """)
