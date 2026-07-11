"""
漏斗分析模块
功能：PV/Fav/Cart/Buy 各阶段统计 + 漏斗图 + 每日趋势 + 类目对比
"""
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from utils.db import connect


def calc_funnel(df=None) -> pd.DataFrame:
    """计算漏斗各阶段数据，返回汇总 DataFrame"""
    if df is None:
        con = connect()
        df = con.execute("SELECT * FROM behaviors").df()

    behaviors = ['pv', 'fav', 'cart', 'buy']
    labels = ['浏览', '收藏', '加购', '下单']
    counts = [int((df['behavior_type'] == b).sum()) for b in behaviors]

    return pd.DataFrame({'阶段': labels, '行为类型': behaviors, '数量': counts,
                         '占比(%)': [round(c / counts[0] * 100, 2) for c in counts]})


def plot_funnel(df=None):
    """画漏斗图"""
    funnel_df = calc_funnel(df)
    fig = go.Figure(go.Funnel(
        y=funnel_df['阶段'].tolist(),
        x=funnel_df['数量'].tolist(),
        textposition='inside',
        textinfo='value+percent previous',
        textfont=dict(size=16),
        marker={'color': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']}
    ))
    fig.update_layout(title='用户行为漏斗', title_x=0.5, height=500, font=dict(size=14))
    return fig


def daily_trend(df=None) -> pd.DataFrame:
    """计算每日 PV→下单 转化率趋势"""
    if df is None:
        con = connect()
        df = con.execute("SELECT * FROM behaviors").df()
        df['date'] = pd.to_datetime(df['date'])

    daily = df.groupby(['date', 'behavior_type']).size().unstack(fill_value=0)
    daily = daily[['pv', 'fav', 'cart', 'buy']]
    daily.columns = ['浏览', '收藏', '加购', '下单']
    daily['转化率(%)'] = round(daily['下单'] / daily['浏览'] * 100, 2)
    return daily


def plot_daily_trend(df=None):
    """画每日转化率趋势图"""
    daily = daily_trend(df)
    fig = px.line(daily, x=daily.index, y='转化率(%)', markers=True,
                  title='每日 PV→下单 转化率趋势')
    fig.update_layout(title_x=0.5, height=400,
                      xaxis_title='日期', yaxis_title='转化率 (%)')
    fig.update_traces(line=dict(color='#1f77b4', width=2.5), marker=dict(size=8))
    return fig


def category_funnel(df=None, top_n=5):
    """计算 Top N 类目的漏斗数据"""
    if df is None:
        con = connect()
        df = con.execute("SELECT * FROM behaviors").df()

    top_cats = df['category_id'].value_counts().head(top_n).index
    results = []
    for cat in top_cats:
        cat_df = df[df['category_id'] == cat]
        pv = int((cat_df['behavior_type'] == 'pv').sum())
        buy = int((cat_df['behavior_type'] == 'buy').sum())
        fav = int((cat_df['behavior_type'] == 'fav').sum())
        cart = int((cat_df['behavior_type'] == 'cart').sum())
        results.append({
            '类目ID': str(cat), '浏览': pv, '收藏': fav, '加购': cart, '下单': buy,
            'PV→下单转化率': round(buy / pv * 100, 2) if pv > 0 else 0
        })

    return pd.DataFrame(results).sort_values('浏览', ascending=False)


def plot_category_comparison(df=None, top_n=5):
    """画 Top N 类目行为对比柱状图"""
    cat_df = category_funnel(df, top_n)
    fig = go.Figure()
    for col, color in zip(['浏览', '收藏', '加购', '下单'],
                          ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']):
        fig.add_trace(go.Bar(name=col, x=cat_df['类目ID'], y=cat_df[col],
                             marker_color=color))
    fig.update_layout(title=f'Top {top_n} 类目行为分布', title_x=0.5, height=450,
                      xaxis_title='类目ID', yaxis_title='次数', barmode='group')
    return fig


if __name__ == '__main__':
    print("=== 漏斗数据 ===")
    print(calc_funnel().to_string(index=False))
    print("\n=== 每日趋势 ===")
    print(daily_trend().to_string())
    print("\n=== Top 5 类目 ===")
    print(category_funnel().to_string(index=False))
