"""
数据加载与预处理模块
负责：读取原始CSV → 清洗 → 存入DuckDB → 返回DataFrame
"""
import pandas as pd
import duckdb
import os

RAW_PATH = "data/raw/UserBehavior.csv"
DB_PATH = "data/processed/ecommerce.db"
COLUMNS = ["user_id", "item_id", "category_id", "behavior_type", "timestamp"]


def load_and_clean(nrows: int = 5_000_000) -> pd.DataFrame:
    """读取原始数据，清洗并返回 DataFrame"""
    df = pd.read_csv(RAW_PATH, names=COLUMNS, nrows=nrows)

    # 时间戳转换
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s")

    # 过滤异常时间，保留核心日期范围
    df = df[(df["timestamp"] >= "2017-11-24") & (df["timestamp"] <= "2017-12-04")]

    # 去重
    df = df.drop_duplicates()

    # 提取辅助字段
    df["date"] = df["timestamp"].dt.date
    df["hour"] = df["timestamp"].dt.hour

    return df


def save_to_db(df: pd.DataFrame) -> duckdb.DuckDBPyConnection:
    """将清洗后的数据存入 DuckDB"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    con = duckdb.connect(DB_PATH)
    con.execute("DROP TABLE IF EXISTS behaviors")
    con.execute("CREATE TABLE behaviors AS SELECT * FROM df")
    return con


def get_db():
    """获取 DuckDB 连接（数据必须已创建）"""
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"数据库不存在，请先运行 save_to_db()。路径: {DB_PATH}")
    return duckdb.connect(DB_PATH)


def prepare_data(nrows: int = 5_000_000) -> duckdb.DuckDBPyConnection:
    """一键执行：加载 + 清洗 + 入库"""
    print(f"[1/3] 读取数据（前 {nrows:,} 行）...")
    df = load_and_clean(nrows)
    print(f"[2/3] 清洗完成：{len(df):,} 行, {df['user_id'].nunique():,} 用户")
    print(f"[3/3] 存入 DuckDB...")
    con = save_to_db(df)
    row_count = con.execute("SELECT COUNT(*) FROM behaviors").fetchone()[0]
    print(f"完成 ✅ 数据库共有 {row_count:,} 条记录")
    return con


if __name__ == "__main__":
    prepare_data()
