const { getTargetConfig, getDailyRecords } = require('../../utils/storage');
const { calculatePlan, summarize, getRecoveryPlan, getDayPlan, getTodayKey, formatWan, buildCategoryReportLines } = require('../../utils/targetCalculator');

Page({
  data: { reportText: '' },
  onShow() {
    this.refresh();
  },
  refresh() {
    const config = getTargetConfig();
    const records = getDailyRecords();
    const plan = calculatePlan(config);
    const todayKey = getTodayKey();
    const todayPlan = getDayPlan(plan, todayKey) || { targetWan: 0, type: '未设置' };
    const todayRecord = records[todayKey] || {};
    const todaySales = Number(todayRecord.salesWan || 0);
    const todayTarget = Number(todayPlan.targetWan || 0);
    const monthSummary = summarize(plan, records);
    const todayRate = todayTarget > 0 ? todaySales / todayTarget * 100 : 0;
    const recovery = getRecoveryPlan(plan, records, todayKey);
    const categoryLines = buildCategoryReportLines(todayRecord.categories);
    const periodCategoryLines = buildCategoryReportLines(monthSummary.categories);

    const reportText = [
      `【${config.storeName} 今日销售战报】`,
      `日期：${todayKey}（${todayPlan.type}）`,
      `今日目标：${formatWan(todayTarget)}`,
      `今日完成：${formatWan(todaySales)}`,
      `今日差额：${formatWan(Math.max(todayTarget - todaySales, 0))}`,
      `今日完成率：${todayRate.toFixed(1)}%`,
      '',
      `${plan.periodLabel}目标：${formatWan(monthSummary.targetWan)}`,
      `${plan.periodLabel}累计：${formatWan(monthSummary.actualWan)}`,
      `${plan.periodLabel}完成率：${monthSummary.completionRate.toFixed(1)}%`,
      `行动建议：${recovery.actionText}`,
      categoryLines.length ? `今日品类：${categoryLines.join('；')}` : '',
      periodCategoryLines.length ? `${plan.periodLabel}品类：${periodCategoryLines.join('；')}` : '',
      `黄金克重：${monthSummary.goldGram.toFixed(1)}g`,
      `客单数：${monthSummary.orderCount}`,
      `件数：${monthSummary.pieceCount}`
    ].filter(Boolean).join('\n');

    this.setData({ reportText });
  },
  copyReport() {
    wx.setClipboardData({ data: this.data.reportText });
  }
});
