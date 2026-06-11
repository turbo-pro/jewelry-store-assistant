function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateKey(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatWan(value) {
  const safe = Number(value || 0);
  return `${safe.toFixed(2)}万`;
}

function getDefaultCategories() {
  return {
    gold: { salesWan: 0, pieceCount: 0 },
    kGold: { salesWan: 0, pieceCount: 0 },
    diamond: { salesWan: 0, pieceCount: 0 },
    other: { salesWan: 0, pieceCount: 0 }
  };
}

function normalizeCategories(categories) {
  const defaults = getDefaultCategories();
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      {
        salesWan: Number(categories?.[key]?.salesWan || value.salesWan || 0),
        pieceCount: Number(categories?.[key]?.pieceCount || value.pieceCount || 0)
      }
    ])
  );
}

function getCategoryLabel(key) {
  return {
    gold: '黄金',
    kGold: '彩金/K金',
    diamond: '钻石/镶嵌',
    other: '其他'
  }[key] || key;
}

function getTodayKey() {
  const today = new Date();
  return toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function addDays(date, offset) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
}

function getWeekStart(date) {
  const weekday = date.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(date, mondayOffset);
}

function buildPlanDays(startDate, dayCount, specialDays, specialDates, specialDateNames, weekendRatio, holidayRatio) {
  const days = [];
  let weightedUnits = 0;

  for (let index = 0; index < dayCount; index += 1) {
    const date = addDays(startDate, index);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const dateKey = toDateKey(year, month, day);
    const isSpecial = specialDates.has(dateKey) || specialDays.has(day);
    const specialName = specialDateNames[dateKey] || '';
    const type = isSpecial ? specialName || '活动日' : isWeekend ? '周末' : '工作日';
    const ratio = isSpecial ? holidayRatio : isWeekend ? weekendRatio : 1;
    weightedUnits += ratio;
    days.push({
      day,
      dateKey,
      weekday,
      type,
      specialName,
      ratio
    });
  }

  return { days, weightedUnits };
}

function calculatePlan(config) {
  const year = Number(config.year);
  const month = Number(config.month);
  const calcMode = config.calcMode === 'week' ? 'week' : 'month';
  const totalTargetWan = calcMode === 'week'
    ? Number(config.weeklyTargetWan || 0)
    : Number(config.totalTargetWan || 0);
  const weekendRatio = Number(config.weekendRatio || 1);
  const holidayRatio = Number(config.holidayRatio || 1);
  const specialDays = new Set((config.specialDays || []).map(Number));
  const specialDates = new Set(config.specialDates || []);
  const specialDateNames = config.specialDateNames || {};
  const monthStart = new Date(year, month - 1, 1);
  const weekStart = parseDateKey(config.weekStartDate) || getWeekStart(new Date());
  const startDate = calcMode === 'week' ? weekStart : monthStart;
  const dayCount = calcMode === 'week' ? 7 : new Date(year, month, 0).getDate();
  const { days, weightedUnits } = buildPlanDays(startDate, dayCount, specialDays, specialDates, specialDateNames, weekendRatio, holidayRatio);

  const baseTargetWan = weightedUnits > 0 ? totalTargetWan / weightedUnits : 0;
  const plannedDays = days.map((item) => ({
    ...item,
    targetWan: Number((baseTargetWan * item.ratio).toFixed(4))
  }));

  return {
    year,
    month,
    calcMode,
    periodLabel: calcMode === 'week' ? '本周' : '本月',
    periodTargetLabel: calcMode === 'week' ? '周目标' : '月目标',
    periodGapLabel: calcMode === 'week' ? '周差额' : '月差额',
    totalTargetWan,
    days: plannedDays,
    baseTargetWan,
    weightedUnits
  };
}

function summarize(plan, records) {
  const monthRecords = plan.days.map((day) => records[day.dateKey] || {});
  const actualWan = monthRecords.reduce((sum, record) => sum + Number(record.salesWan || 0), 0);
  const goldGram = monthRecords.reduce((sum, record) => sum + Number(record.goldGram || 0), 0);
  const orderCount = monthRecords.reduce((sum, record) => sum + Number(record.orderCount || 0), 0);
  const pieceCount = monthRecords.reduce((sum, record) => sum + Number(record.pieceCount || 0), 0);
  const categories = monthRecords.reduce((result, record) => {
    const recordCategories = normalizeCategories(record.categories);
    Object.entries(recordCategories).forEach(([key, value]) => {
      result[key].salesWan += Number(value.salesWan || 0);
      result[key].pieceCount += Number(value.pieceCount || 0);
    });
    return result;
  }, getDefaultCategories());
  const targetWan = Number(plan.totalTargetWan || 0);
  const gapWan = Math.max(targetWan - actualWan, 0);
  const completionRate = targetWan > 0 ? actualWan / targetWan * 100 : 0;

  return {
    targetWan,
    actualWan,
    gapWan,
    completionRate,
    goldGram,
    orderCount,
    pieceCount,
    categories,
    avgOrderWan: orderCount > 0 ? actualWan / orderCount : 0
  };
}

function buildCategoryReportLines(categories) {
  return Object.entries(normalizeCategories(categories))
    .filter(([, value]) => Number(value.salesWan || 0) > 0 || Number(value.pieceCount || 0) > 0)
    .map(([key, value]) => `${getCategoryLabel(key)}：${formatWan(value.salesWan)} / ${Number(value.pieceCount || 0)}件`);
}

function getFocusCategory(categories) {
  const entries = Object.entries(normalizeCategories(categories))
    .filter(([, value]) => Number(value.salesWan || 0) > 0)
    .sort(([, a], [, b]) => Number(b.salesWan || 0) - Number(a.salesWan || 0));

  return entries.length ? getCategoryLabel(entries[0][0]) : '高意向客';
}

function getEstimateMetrics(plan, records, referenceDateKey) {
  const dateKey = referenceDateKey || getTodayKey();
  const dayGoldPricePerGram = Number(records[dateKey]?.goldPricePerGram || 0);
  const periodRecords = plan.days
    .filter((day) => day.dateKey <= dateKey)
    .map((day) => records[day.dateKey] || {});
  const actualWan = periodRecords.reduce((sum, record) => sum + Number(record.salesWan || 0), 0);
  const orderCount = periodRecords.reduce((sum, record) => sum + Number(record.orderCount || 0), 0);
  const goldGram = periodRecords.reduce((sum, record) => sum + Number(record.goldGram || 0), 0);
  const avgOrderWan = orderCount > 0 ? actualWan / orderCount : 0;
  const periodGoldPricePerGram = goldGram > 0 ? actualWan * 10000 / goldGram : 0;
  const goldPricePerGram = dayGoldPricePerGram || periodGoldPricePerGram;
  const goldSourceLabel = dayGoldPricePerGram > 0 ? '今日门店金价' : periodGoldPricePerGram > 0 ? '本周期销售克价' : '';
  const sourceParts = [];
  if (avgOrderWan > 0) sourceParts.push('本周期客单价');
  if (goldSourceLabel) sourceParts.push(goldSourceLabel);

  return {
    avgOrderWan,
    goldPricePerGram,
    sourceLabel: sourceParts.length ? sourceParts.join('、') : '数据不足'
  };
}

function getRecoveryPlan(plan, records, referenceDateKey) {
  const dateKey = referenceDateKey || getTodayKey();
  const actualWan = plan.days.reduce((sum, day) => sum + Number(records[day.dateKey]?.salesWan || 0), 0);
  const remainingDays = plan.days.filter((day) => day.dateKey >= dateKey);
  const weightedUnits = remainingDays.reduce((sum, day) => sum + Number(day.ratio || 1), 0);
  const remainingTargetWan = Math.max(Number(plan.totalTargetWan || 0) - actualWan, 0);
  const todayPlan = getDayPlan(plan, dateKey);
  const todayAdjustedTargetWan = weightedUnits > 0 && todayPlan
    ? remainingTargetWan / weightedUnits * Number(todayPlan.ratio || 1)
    : 0;
  const estimate = getEstimateMetrics(plan, records, dateKey);
  const suggestedOrderCount = todayAdjustedTargetWan > 0 && estimate.avgOrderWan > 0
    ? Math.ceil(todayAdjustedTargetWan / estimate.avgOrderWan)
    : null;
  const suggestedGoldGram = todayAdjustedTargetWan > 0 && estimate.goldPricePerGram > 0
    ? Math.ceil(todayAdjustedTargetWan * 10000 / estimate.goldPricePerGram)
    : null;
  const suggestionParts = [];
  const summary = summarize(plan, records);
  const focusCategory = getFocusCategory(summary.categories);

  if (suggestedOrderCount !== null) suggestionParts.push(`约${suggestedOrderCount}单`);
  else suggestionParts.push('客单价不足，暂不估算成交单数');

  return {
    dateKey,
    remainingDaysCount: remainingDays.length,
    remainingTargetWan,
    todayAdjustedTargetWan,
    suggestedOrderCount,
    suggestedGoldGram,
    focusCategory,
    avgOrderWan: estimate.avgOrderWan,
    goldPricePerGram: estimate.goldPricePerGram,
    estimateSourceLabel: estimate.sourceLabel,
    actionText: remainingTargetWan > 0
      ? `剩余${remainingDays.length}天还差${formatWan(remainingTargetWan)}，今日建议冲刺${formatWan(todayAdjustedTargetWan)}，${suggestionParts.join('，')}，重点跟进${focusCategory}和高意向复购客户。`
      : `${plan.periodLabel}目标已达成，今日重点保持成交质量和复购跟进。`
  };
}

function getDayPlan(plan, dateKey) {
  return plan.days.find((day) => day.dateKey === dateKey) || plan.days[0];
}

module.exports = {
  calculatePlan,
  calculateMonthPlan: calculatePlan,
  summarize,
  getRecoveryPlan,
  getDayPlan,
  getTodayKey,
  toDateKey,
  formatWan,
  buildCategoryReportLines
};
