"""
RFM 用户分层模块
功能：计算 R/F/M → 打分 → 划分8种用户类型 → 可视化
"""
import pandas as pd
import plotly.express as px
from utils.db import connect


def calc_rfm(df=None):
    """计算每个用户的 R/F/M 值，返回 DataFrame"""
    if df is None:
        con = connect()
        df = con.execute("SELECT * FROM behaviors").df()
        df['date'] = pd.to_datetime(df['date'])

    buy_df = df[df['behavior_type'] == 'buy']
    today = df['date'].max()

    rfm = buy_df.groupby('user_id').agg(
        last_date=('date', 'max'),
        F=('item_id', 'count'),
        M=('item_id', 'nunique')
    )
    rfm['R'] = (today - rfm['last_date']).dt.days
    rfm = rfm.drop(columns=['last_date'])

    # 打分
    rfm['R_score'] = (rfm['R'] <= rfm['R'].median()).astype(int)
    rfm['F_score'] = (rfm['F'] >= rfm['F'].median()).astype(int)
    rfm['M_score'] = (rfm['M'] >= rfm['M'].median()).astype(int)

    # 分类
    rfm['segment'] = (
        rfm['R_score'].astype(str)
        + rfm['F_score'].astype(str)
        + rfm['M_score'].astype(str)
    )

    SEGMENT_NAMES = {
        '111': '重要价值用户', '110': '重要发展用户',
        '101': '重要保持用户', '100': '重要挽留用户',
        '011': '一般价值用户', '010': '一般发展用户',
        '001': '一般保持用户', '000': '一般挽留用户',
    }
    rfm['用户类型'] = rfm['segment'].map(SEGMENT_NAMES)

    return rfm


def get_segment_counts(rfm=None):
    """返回各用户类型人数统计"""
    if rfm is None:
        rfm = calc_rfm()
    counts = rfm['用户类型'].value_counts().reset_index()
    counts.columns = ['用户类型', '人数']
    return counts


def plot_rfm_scatter(rfm=None):
    """RFM 散点气泡图"""
    if rfm is None:
        rfm = calc_rfm()
    fig = px.scatter(rfm, x='R', y='F', size='M', color='用户类型',
                     title='RFM 用户分层 (X=最近购买天数, Y=购买次数, 气泡大小=购买种类)',
                     hover_data=['M'])
    fig.update_layout(title_x=0.5, height=500)
    return fig


def plot_rfm_pie(rfm=None):
    """用户分层占比饼图"""
    counts = get_segment_counts(rfm)
    fig = px.pie(counts, values='人数', names='用户类型', title='用户分层占比')
    fig.update_traces(textinfo='percent+label')
    fig.update_layout(title_x=0.5)
    return fig


if __name__ == '__main__':
    rfm = calc_rfm()
    print("=== RFM 用户分层 ===")
    print(rfm.head().to_string())
    print("\n=== 各类型人数 ===")
    print(get_segment_counts(rfm).to_string(index=False))
