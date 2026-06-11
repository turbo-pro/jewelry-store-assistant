const { getTargetConfig, getDailyRecords } = require('../../utils/storage');
const { calculatePlan, summarize, getRecoveryPlan, getDayPlan, getTodayKey, formatWan, buildCategoryReportLines } = require('../../utils/targetCalculator');

Page({
  data: {},
  onShow() {
    this.refresh();
  },
  refresh() {
    const config = getTargetConfig();
    const records = getDailyRecords();
    const plan = calculatePlan(config);
    const todayKey = getTodayKey();
    const todayPlan = getDayPlan(plan, todayKey);
    const todayRecord = records[todayKey] || {};
    const todayActual = Number(todayRecord.salesWan || 0);
    const todayTarget = Number(todayPlan ? todayPlan.targetWan : 0);
    const todayGoldPrice = Number(todayRecord.goldPricePerGram || 0);
    const monthSummary = summarize(plan, records);
    const recovery = getRecoveryPlan(plan, records, todayKey);
    const categoryText = buildCategoryReportLines(monthSummary.categories).join('；');

    this.setData({
      storeName: config.storeName,
      todayLabel: todayKey,
      todayPlan: todayPlan || { type: '未设置' },
      todayTargetText: formatWan(todayTarget),
      todayActualText: formatWan(todayActual),
      todayGapText: formatWan(Math.max(todayTarget - todayActual, 0)),
      todayRateText: todayTarget > 0 ? `${(todayActual / todayTarget * 100).toFixed(1)}%` : '0%',
      periodLabel: plan.periodLabel,
      periodTargetLabel: plan.periodTargetLabel,
      periodGapLabel: plan.periodGapLabel,
      periodTargetText: formatWan(monthSummary.targetWan),
      periodActualText: formatWan(monthSummary.actualWan),
      periodGapText: formatWan(monthSummary.gapWan),
      periodRateText: `${monthSummary.completionRate.toFixed(1)}%`,
      categoryText,
      adjustedTargetText: formatWan(recovery.todayAdjustedTargetWan),
      remainingTargetText: formatWan(recovery.remainingTargetWan),
      suggestedOrderText: recovery.suggestedOrderCount === null ? '--' : `${recovery.suggestedOrderCount}单`,
      focusCategoryText: recovery.focusCategory,
      todayGoldPriceText: todayGoldPrice > 0 ? `${todayGoldPrice.toFixed(0)}元/g` : '--',
      estimateText: recovery.estimateSourceLabel === '数据不足'
        ? '估算口径：本周期缺少订单数，暂不估算成交单数；黄金克重仅作为金价口径参考。'
        : `估算口径：${recovery.estimateSourceLabel}，客单价约${formatWan(recovery.avgOrderWan)}，克价约${recovery.goldPricePerGram.toFixed(0)}元/g。`,
      actionText: recovery.actionText
    });
  },
  goRecord() {
    wx.switchTab({ url: '/pages/record/index' });
  }
});
