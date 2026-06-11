const STORAGE_KEY = 'jewelry-store-target-web';

const holidayPresets = {
  2026: [
    '2026-01-01',
    '2026-01-02',
    '2026-01-03',
    '2026-02-15',
    '2026-02-16',
    '2026-02-17',
    '2026-02-18',
    '2026-02-19',
    '2026-02-20',
    '2026-02-21',
    '2026-02-22',
    '2026-02-23',
    '2026-04-04',
    '2026-04-05',
    '2026-04-06',
    '2026-05-01',
    '2026-05-02',
    '2026-05-03',
    '2026-05-04',
    '2026-05-05',
    '2026-06-19',
    '2026-06-20',
    '2026-06-21',
    '2026-09-25',
    '2026-09-26',
    '2026-09-27',
    '2026-10-01',
    '2026-10-02',
    '2026-10-03',
    '2026-10-04',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07'
  ]
};

const holidayNamePresets = {
  2026: {
    '2026-01-01': '元旦',
    '2026-01-02': '元旦',
    '2026-01-03': '元旦',
    '2026-02-15': '春节',
    '2026-02-16': '春节',
    '2026-02-17': '春节',
    '2026-02-18': '春节',
    '2026-02-19': '春节',
    '2026-02-20': '春节',
    '2026-02-21': '春节',
    '2026-02-22': '春节',
    '2026-02-23': '春节',
    '2026-04-04': '清明节',
    '2026-04-05': '清明节',
    '2026-04-06': '清明节',
    '2026-05-01': '劳动节',
    '2026-05-02': '劳动节',
    '2026-05-03': '劳动节',
    '2026-05-04': '劳动节',
    '2026-05-05': '劳动节',
    '2026-06-19': '端午节',
    '2026-06-20': '端午节',
    '2026-06-21': '端午节',
    '2026-09-25': '中秋节',
    '2026-09-26': '中秋节',
    '2026-09-27': '中秋节',
    '2026-10-01': '国庆节',
    '2026-10-02': '国庆节',
    '2026-10-03': '国庆节',
    '2026-10-04': '国庆节',
    '2026-10-05': '国庆节',
    '2026-10-06': '国庆节',
    '2026-10-07': '国庆节'
  }
};

const defaultState = {
  config: {
    storeName: '珠宝黄金门店',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    calcMode: 'month',
    totalTargetWan: 100,
    weeklyTargetWan: 25,
    periodCompletedWan: 0,
    weekStartDate: '',
    weekendRatio: 1.5,
    holidayRatio: 2,
    specialDays: [],
    specialDates: [],
    specialDateNames: {}
  },
  records: {}
};

const reportTemplates = {
  owner: '老板版',
  team: '门店群版',
  short: '简短版'
};

const fields = {
  storeName: document.querySelector('#storeName'),
  targetYear: document.querySelector('#targetYear'),
  targetMonth: document.querySelector('#targetMonth'),
  calcMode: document.querySelector('#calcMode'),
  totalTargetWan: document.querySelector('#totalTargetWan'),
  weeklyTargetWan: document.querySelector('#weeklyTargetWan'),
  periodCompletedWan: document.querySelector('#periodCompletedWan'),
  periodCompletedInputLabel: document.querySelector('#periodCompletedInputLabel'),
  weekStartDate: document.querySelector('#weekStartDate'),
  weekendRatio: document.querySelector('#weekendRatio'),
  holidayRatio: document.querySelector('#holidayRatio'),
  specialDaysText: document.querySelector('#specialDaysText'),
  recordDate: document.querySelector('#recordDate'),
  salesWan: document.querySelector('#salesWan'),
  goldGram: document.querySelector('#goldGram'),
  goldPricePerGram: document.querySelector('#goldPricePerGram'),
  orderCount: document.querySelector('#orderCount'),
  pieceCount: document.querySelector('#pieceCount'),
  goldSalesWan: document.querySelector('#goldSalesWan'),
  goldPieceCount: document.querySelector('#goldPieceCount'),
  kGoldSalesWan: document.querySelector('#kGoldSalesWan'),
  kGoldPieceCount: document.querySelector('#kGoldPieceCount'),
  diamondSalesWan: document.querySelector('#diamondSalesWan'),
  diamondPieceCount: document.querySelector('#diamondPieceCount'),
  otherSalesWan: document.querySelector('#otherSalesWan'),
  otherPieceCount: document.querySelector('#otherPieceCount'),
  note: document.querySelector('#note')
};

let state = loadState();
let selectedReportTemplate = 'owner';
let selectedMobileTab = 'target';
let activeDateInput = null;
let datePickerViewDate = new Date();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      config: Object.assign({}, defaultState.config, saved && saved.config ? saved.config : {}),
      records: saved && saved.records ? saved.records : {}
    };
  } catch {
    return cloneDefaultState();
  }
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateKey(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function todayKey() {
  const date = new Date();
  return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function addDays(date, offset) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
}

function startOfWeek(date) {
  const weekday = date.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(date, mondayOffset);
}

function dateKeyFromDate(date) {
  return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function getDateInputValue(input) {
  return parseDateKey(input && input.value) || new Date();
}

function openDatePicker(input) {
  activeDateInput = input;
  datePickerViewDate = getDateInputValue(input);
  renderDatePicker();
  document.querySelector('#datePicker').hidden = false;
}

function closeDatePicker() {
  document.querySelector('#datePicker').hidden = true;
  activeDateInput = null;
}

function commitDatePickerValue(dateKey) {
  if (!activeDateInput) return;

  activeDateInput.value = dateKey;
  if (activeDateInput === fields.recordDate) {
    hydrateRecordForm();
    render();
  }
  closeDatePicker();
}

function renderDatePicker() {
  const pickerTitle = document.querySelector('#datePickerTitle');
  const pickerDays = document.querySelector('#datePickerDays');
  const year = datePickerViewDate.getFullYear();
  const month = datePickerViewDate.getMonth() + 1;
  const selectedKey = activeDateInput ? activeDateInput.value : '';
  const today = todayKey();
  const firstDate = new Date(year, month - 1, 1);
  const firstDay = firstDate.getDay();
  const leadingBlankCount = firstDay === 0 ? 6 : firstDay - 1;
  const startDate = addDays(firstDate, -leadingBlankCount);
  const cells = [];

  pickerTitle.textContent = `${year}年${pad(month)}月`;

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(startDate, index);
    const dateKey = dateKeyFromDate(date);
    const isCurrentMonth = date.getMonth() === month - 1;
    const className = [
      'date-picker-day',
      isCurrentMonth ? '' : 'is-muted',
      dateKey === today ? 'is-today' : '',
      dateKey === selectedKey ? 'is-selected' : ''
    ].filter(Boolean).join(' ');

    cells.push(`<button class="${className}" data-date="${dateKey}" type="button">${date.getDate()}</button>`);
  }

  pickerDays.innerHTML = cells.join('');
  pickerDays.querySelectorAll('.date-picker-day').forEach((button) => {
    button.addEventListener('click', () => commitDatePickerValue(button.dataset.date));
  });
}

function formatWan(value) {
  const yuan = Number(value || 0) * 10000;
  const normalized = Number(yuan.toFixed(2));
  return `${normalized.toLocaleString('zh-CN', {
    minimumFractionDigits: Number.isInteger(normalized) ? 0 : 2,
    maximumFractionDigits: 2
  })}元`;
}

function wanToYuan(value) {
  const yuan = Number(value || 0) * 10000;
  if (yuan <= 0) return '';
  const normalized = Number(yuan.toFixed(2));
  return Number.isInteger(normalized) ? String(normalized) : String(normalized);
}

function yuanToWan(value) {
  return Number(value || 0) / 10000;
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
  const result = {};

  Object.entries(defaults).forEach(([key, value]) => {
    const category = categories && categories[key] ? categories[key] : {};
    result[key] = {
      salesWan: Number(category.salesWan || value.salesWan || 0),
      pieceCount: Number(category.pieceCount || value.pieceCount || 0)
    };
  });

  return result;
}

function getCategoryLabel(key) {
  return {
    gold: '黄金',
    kGold: '彩金/K金',
    diamond: '钻石/镶嵌',
    other: '其他'
  }[key] || key;
}

function parseSpecialSchedule(text) {
  const specialDays = [];
  const specialDates = [];

  String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      const parsedDate = parseDateKey(item);
      const day = Number(item);

      if (parsedDate && item.length >= 10) {
        specialDates.push(toDateKey(parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate()));
      } else if (Number.isInteger(day) && day >= 1 && day <= 31) {
        specialDays.push(day);
      }
    });

  return {
    specialDays: Array.from(new Set(specialDays)).sort((a, b) => a - b),
    specialDates: Array.from(new Set(specialDates)).sort()
  };
}

function formatSpecialSchedule(config) {
  return (config.specialDays || []).concat(config.specialDates || []).join(',');
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
    const ratio = isSpecial ? holidayRatio : isWeekend ? weekendRatio : 1;
    const type = isSpecial ? specialName || '活动日' : isWeekend ? '周末' : '工作日';
    weightedUnits += ratio;
    days.push({ day, weekday, ratio, type, isWeekend, isSpecial, specialName, dateKey });
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
  const weekStart = startOfWeek(parseDateKey(config.weekStartDate) || new Date());
  const startDate = calcMode === 'week' ? weekStart : monthStart;
  const dayCount = calcMode === 'week' ? 7 : new Date(year, month, 0).getDate();
  const { days, weightedUnits } = buildPlanDays(startDate, dayCount, specialDays, specialDates, specialDateNames, weekendRatio, holidayRatio);

  const baseTargetWan = weightedUnits ? totalTargetWan / weightedUnits : 0;
  const endDate = days.length ? parseDateKey(days[days.length - 1].dateKey) : startDate;

  return {
    storeName: config.storeName,
    year: config.year,
    month: config.month,
    calcMode,
    weeklyTargetWan: config.weeklyTargetWan,
    periodCompletedWan: Number(config.periodCompletedWan || 0),
    weekendRatio,
    holidayRatio,
    specialDays: config.specialDays || [],
    specialDates: config.specialDates || [],
    specialDateNames,
    totalTargetWan,
    periodLabel: calcMode === 'week' ? '本周' : '本月',
    periodTargetLabel: calcMode === 'week' ? '周目标' : '月目标',
    periodGapLabel: calcMode === 'week' ? '周差额' : '月差额',
    periodDateLabel: calcMode === 'week'
      ? `${toDateKey(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate())} 至 ${toDateKey(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate())}`
      : `${year}-${pad(month)}`,
    days: days.map((day) => Object.assign({}, day, { targetWan: Number((baseTargetWan * day.ratio).toFixed(4)) }))
  };
}

function summarize(plan) {
  const recordActualWan = plan.days.reduce((sum, day) => sum + Number((state.records[day.dateKey] || {}).salesWan || 0), 0);
  const actualWan = Math.max(recordActualWan, Number(plan.periodCompletedWan || 0));
  const goldGram = plan.days.reduce((sum, day) => sum + Number((state.records[day.dateKey] || {}).goldGram || 0), 0);
  const orderCount = plan.days.reduce((sum, day) => sum + Number((state.records[day.dateKey] || {}).orderCount || 0), 0);
  const pieceCount = plan.days.reduce((sum, day) => sum + Number((state.records[day.dateKey] || {}).pieceCount || 0), 0);
  const categories = plan.days.reduce((result, day) => {
    const recordCategories = normalizeCategories((state.records[day.dateKey] || {}).categories);
    Object.entries(recordCategories).forEach(([key, value]) => {
      result[key].salesWan += Number(value.salesWan || 0);
      result[key].pieceCount += Number(value.pieceCount || 0);
    });
    return result;
  }, getDefaultCategories());
  const targetWan = Number(plan.totalTargetWan || 0);

  return {
    targetWan,
    actualWan,
    goldGram,
    orderCount,
    pieceCount,
    gapWan: Math.max(targetWan - actualWan, 0),
    completionRate: targetWan ? actualWan / targetWan * 100 : 0,
    categories
  };
}

function getEstimateMetrics(plan, referenceDateKey) {
  const dateKey = referenceDateKey || todayKey();
  const dayGoldPricePerGram = Number((state.records[dateKey] || {}).goldPricePerGram || 0);
  const periodRecords = plan.days
    .filter((day) => day.dateKey <= dateKey)
    .map((day) => state.records[day.dateKey] || {});
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

function getRecoveryPlan(plan, summary, referenceDateKey) {
  const dateKey = referenceDateKey || todayKey();
  const remainingDays = plan.days.filter((day) => day.dateKey >= dateKey);
  const remainingTargetWan = Math.max(Number(plan.totalTargetWan || 0) - Number(summary.actualWan || 0), 0);
  const todayPlan = plan.days.find((day) => day.dateKey === dateKey) || plan.days[0];
  const todayAdjustedTargetWan = todayPlan ? Number(todayPlan.targetWan || 0) : 0;
  const estimate = getEstimateMetrics(plan, dateKey);
  const suggestedOrderCount = todayAdjustedTargetWan > 0 && estimate.avgOrderWan > 0
    ? Math.ceil(todayAdjustedTargetWan / estimate.avgOrderWan)
    : null;
  const suggestedGoldGram = todayAdjustedTargetWan > 0 && estimate.goldPricePerGram > 0
    ? Math.ceil(todayAdjustedTargetWan * 10000 / estimate.goldPricePerGram)
    : null;
  const suggestionParts = [];
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
      ? `剩余${remainingDays.length}天还差${formatWan(remainingTargetWan)}，今日按计划目标${formatWan(todayAdjustedTargetWan)}推进，${suggestionParts.join('，')}，重点跟进${focusCategory}和高意向复购客户。`
      : `${plan.periodLabel}目标已达成，今日重点保持成交质量和复购跟进。`
  };
}

function hydrateForm() {
  const { config } = state;
  fields.storeName.value = config.storeName;
  fields.targetYear.value = config.year;
  fields.targetMonth.value = config.month;
  fields.calcMode.value = config.calcMode || 'month';
  fields.totalTargetWan.value = wanToYuan(config.totalTargetWan);
  fields.weeklyTargetWan.value = wanToYuan(config.weeklyTargetWan);
  fields.periodCompletedWan.value = wanToYuan(config.periodCompletedWan);
  fields.periodCompletedInputLabel.textContent = fields.calcMode.value === 'week' ? '本周已完成（元）' : '本月已完成（元）';
  fields.weekStartDate.value = dateKeyFromDate(startOfWeek(parseDateKey(config.weekStartDate) || new Date()));
  fields.weekendRatio.value = config.weekendRatio;
  fields.holidayRatio.value = config.holidayRatio;
  fields.specialDaysText.value = formatSpecialSchedule(config);
  document.querySelector('.config-panel').dataset.mode = fields.calcMode.value;

  if (!fields.recordDate.value) {
    fields.recordDate.value = todayKey();
  }
  hydrateRecordForm();
}

function hydrateRecordForm() {
  const record = state.records[fields.recordDate.value] || {};
  const categories = normalizeCategories(record.categories);
  fields.salesWan.value = record.salesWan == null ? '' : wanToYuan(record.salesWan);
  fields.goldGram.value = record.goldGram == null ? '' : record.goldGram;
  fields.goldPricePerGram.value = record.goldPricePerGram == null ? '' : record.goldPricePerGram;
  fields.orderCount.value = record.orderCount == null ? '' : record.orderCount;
  fields.pieceCount.value = record.pieceCount == null ? '' : record.pieceCount;
  fields.goldSalesWan.value = wanToYuan(categories.gold.salesWan);
  fields.goldPieceCount.value = categories.gold.pieceCount || '';
  fields.kGoldSalesWan.value = wanToYuan(categories.kGold.salesWan);
  fields.kGoldPieceCount.value = categories.kGold.pieceCount || '';
  fields.diamondSalesWan.value = wanToYuan(categories.diamond.salesWan);
  fields.diamondPieceCount.value = categories.diamond.pieceCount || '';
  fields.otherSalesWan.value = wanToYuan(categories.other.salesWan);
  fields.otherPieceCount.value = categories.other.pieceCount || '';
  fields.note.value = record.note == null ? '' : record.note;
}

function saveConfigFromForm() {
  const specialSchedule = parseSpecialSchedule(fields.specialDaysText.value);
  const existingNames = state.config.specialDateNames || {};
  const specialDateNames = {};
  (specialSchedule.specialDates || []).forEach((dateKey) => {
    if (existingNames[dateKey]) {
      specialDateNames[dateKey] = existingNames[dateKey];
    }
  });

  state.config = {
    storeName: fields.storeName.value.trim() || '珠宝黄金门店',
    year: Number(fields.targetYear.value || new Date().getFullYear()),
    month: Math.min(Math.max(Number(fields.targetMonth.value || 1), 1), 12),
    calcMode: fields.calcMode.value === 'week' ? 'week' : 'month',
    totalTargetWan: yuanToWan(fields.totalTargetWan.value),
    weeklyTargetWan: yuanToWan(fields.weeklyTargetWan.value),
    periodCompletedWan: Number(state.config.periodCompletedWan || 0),
    weekStartDate: dateKeyFromDate(startOfWeek(parseDateKey(fields.weekStartDate.value) || new Date())),
    weekendRatio: Number(fields.weekendRatio.value || 1),
    holidayRatio: Number(fields.holidayRatio.value || 1),
    specialDays: specialSchedule.specialDays,
    specialDates: specialSchedule.specialDates,
    specialDateNames
  };
  saveState();
  render();
}

function loadHolidayPreset() {
  const year = Number(fields.targetYear.value || state.config.year);
  const preset = holidayPresets[year];

  if (!preset) {
    window.alert(`暂未内置 ${year} 年法定节假日，请手动添加活动日。`);
    return;
  }

  const current = parseSpecialSchedule(fields.specialDaysText.value);
  const mergedDates = Array.from(new Set((current.specialDates || []).concat(preset))).sort();
  state.config.specialDateNames = Object.assign({}, state.config.specialDateNames || {}, holidayNamePresets[year] || {});
  fields.specialDaysText.value = (current.specialDays || []).concat(mergedDates).join(',');
  saveConfigFromForm();
}

function saveRecordFromForm() {
  const dateKey = fields.recordDate.value;
  if (!dateKey) return;

  state.config.periodCompletedWan = yuanToWan(fields.periodCompletedWan.value);
  state.records[dateKey] = {
    salesWan: yuanToWan(fields.salesWan.value),
    goldGram: Number(fields.goldGram.value || 0),
    goldPricePerGram: Number(fields.goldPricePerGram.value || 0),
    orderCount: Number(fields.orderCount.value || 0),
    pieceCount: Number(fields.pieceCount.value || 0),
    categories: normalizeCategories({
      gold: {
        salesWan: yuanToWan(fields.goldSalesWan.value),
        pieceCount: fields.goldPieceCount.value
      },
      kGold: {
        salesWan: yuanToWan(fields.kGoldSalesWan.value),
        pieceCount: fields.kGoldPieceCount.value
      },
      diamond: {
        salesWan: yuanToWan(fields.diamondSalesWan.value),
        pieceCount: fields.diamondPieceCount.value
      },
      other: {
        salesWan: yuanToWan(fields.otherSalesWan.value),
        pieceCount: fields.otherPieceCount.value
      }
    }),
    note: fields.note.value.trim(),
    updatedAt: Date.now()
  };
  saveState();
  render();
}

function renderSummary(plan, summary) {
  const today = todayKey();
  const todayPlan = plan.days.find((day) => day.dateKey === today) || plan.days[0];
  const recovery = getRecoveryPlan(plan, summary, today);
  const targetResultHint = document.querySelector('#targetResultHint');
  const todayTargetWan = todayPlan ? todayPlan.targetWan : 0;

  document.querySelector('#heroRateLabel').textContent = `${plan.periodLabel}完成率`;
  document.querySelector('#heroRate').textContent = `${summary.completionRate.toFixed(1)}%`;
  document.querySelector('#periodTargetLabel').textContent = plan.periodTargetLabel;
  document.querySelector('#periodGapLabel').textContent = plan.periodGapLabel;
  document.querySelector('#periodTarget').textContent = formatWan(summary.targetWan);
  document.querySelector('#periodActual').textContent = formatWan(summary.actualWan);
  document.querySelector('#periodGap').textContent = formatWan(summary.gapWan);
  document.querySelector('#todayTarget').textContent = formatWan(todayTargetWan);
  document.querySelector('#calendarTitle').textContent = `${plan.periodLabel}每日目标`;
  document.querySelector('#todayAdjustedTarget').textContent = formatWan(recovery.todayAdjustedTargetWan);
  document.querySelector('#remainingTarget').textContent = formatWan(recovery.remainingTargetWan);
  document.querySelector('#suggestedOrders').textContent = recovery.suggestedOrderCount === null ? '--' : `${recovery.suggestedOrderCount}单`;
  document.querySelector('#focusCategory').textContent = recovery.focusCategory;
  document.querySelector('#currentGoldPrice').textContent = Number((state.records[today] || {}).goldPricePerGram || 0) > 0
    ? `${Number(state.records[today].goldPricePerGram).toFixed(0)}元/g`
    : '--';
  document.querySelector('#estimateText').textContent = recovery.estimateSourceLabel === '数据不足'
    ? '估算口径：本周期缺少订单数，暂不估算成交单数；黄金克重仅作为金价口径参考。'
    : `估算口径：${recovery.estimateSourceLabel}，客单价约${formatWan(recovery.avgOrderWan)}，克价约${recovery.goldPricePerGram.toFixed(0)}元/g。`;
  document.querySelector('#actionText').textContent = recovery.actionText;

  if (targetResultHint) {
    targetResultHint.textContent = `已按${plan.periodDateLabel} ${formatWan(summary.targetWan)}目标拆分，今日目标 ${formatWan(todayTargetWan)}。`;
  }
}

function renderCalendar(plan) {
  const calendar = document.querySelector('#calendar');
  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
  const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const firstPlanDate = parseDateKey(plan.days[0] ? plan.days[0].dateKey : '') || new Date(plan.year, plan.month - 1, 1);
  const firstDay = firstPlanDate.getDay();
  const leadingBlankCount = firstDay === 0 ? 6 : firstDay - 1;
  const cells = weekdays.map((weekday) => `<div class="weekday">${weekday}</div>`);
  const currentToday = todayKey();

  for (let index = 0; index < leadingBlankCount; index += 1) {
    cells.push('<div class="day-card empty"></div>');
  }

  for (const day of plan.days) {
    const record = state.records[day.dateKey] || {};
    const actualWan = Number(record.salesWan || 0);
    const rate = day.targetWan ? actualWan / day.targetWan * 100 : 0;
    const status = actualWan <= 0 ? '' : rate >= 100 ? 'good' : 'bad';
    const weekdayLabel = weekdayLabels[day.weekday] || '';
    const dayMeta = [weekdayLabel, day.type].filter(Boolean).join(' · ');
    const className = [
      'day-card',
      day.isSpecial ? 'special' : '',
      !day.isSpecial && day.isWeekend ? 'weekend' : '',
      day.dateKey === currentToday ? 'today' : ''
    ].filter(Boolean).join(' ');

    cells.push(`
      <button class="${className}" data-date="${day.dateKey}" type="button">
        <div class="day-top">
          <div class="day-number">${day.day}</div>
          <div class="day-type">${dayMeta}</div>
        </div>
        <div class="day-target">
          目标
          <strong>${formatWan(day.targetWan)}</strong>
        </div>
        <div class="day-progress ${status}">
          已完成 ${formatWan(actualWan)} · ${rate.toFixed(0)}%
        </div>
      </button>
    `);
  }

  calendar.innerHTML = cells.join('');
  calendar.querySelectorAll('.day-card[data-date]').forEach((button) => {
    button.addEventListener('click', () => {
      fields.recordDate.value = button.dataset.date;
      hydrateRecordForm();
      document.querySelector('#salesWan').focus();
    });
  });
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

function getReportSummary(plan, summary) {
  const actualWan = Math.max(Number(summary.actualWan || 0), Number(plan.periodCompletedWan || 0));
  const targetWan = Number(summary.targetWan || 0);

  return Object.assign({}, summary, {
    actualWan,
    gapWan: Math.max(targetWan - actualWan, 0),
    completionRate: targetWan ? actualWan / targetWan * 100 : 0
  });
}

function buildReport(plan, summary, templateType) {
  const dateKey = fields.recordDate.value || todayKey();
  const dayPlan = plan.days.find((day) => day.dateKey === dateKey) || plan.days[0];
  const record = state.records[dateKey] || {};
  const salesWan = Number(record.salesWan || 0);
  const targetWan = Number(dayPlan ? dayPlan.targetWan : 0);
  const todayRate = targetWan ? salesWan / targetWan * 100 : 0;
  const reportSummary = getReportSummary(plan, summary);
  const recovery = getRecoveryPlan(plan, reportSummary, dateKey);
  const categoryLines = buildCategoryReportLines(record.categories);
  const periodCategoryLines = buildCategoryReportLines(summary.categories);

  if (templateType === 'short') {
    return [
      `【${state.config.storeName}简报】${dateKey}`,
      `今日：${formatWan(salesWan)} / ${formatWan(targetWan)}，完成率${todayRate.toFixed(1)}%`,
      `${plan.periodLabel}：${formatWan(reportSummary.actualWan)} / ${formatWan(reportSummary.targetWan)}，${reportSummary.completionRate.toFixed(1)}%`,
      recovery.actionText
    ].join('\n');
  }

  if (templateType === 'team') {
    return [
      `【${state.config.storeName} 今日冲刺】`,
      `${dateKey} · ${(dayPlan && dayPlan.type) || '未设置'}`,
      `今日目标 ${formatWan(targetWan)}，已完成 ${formatWan(salesWan)}，还差 ${formatWan(Math.max(targetWan - salesWan, 0))}`,
      categoryLines.length ? `品类：${categoryLines.join('；')}` : '',
      recovery.actionText,
      `大家重点跟进老客复购、换新需求和高意向试戴客户。`
    ].filter(Boolean).join('\n');
  }

  return [
    `【${state.config.storeName} 销售战报】`,
    `日期：${dateKey}（${(dayPlan && dayPlan.type) || '未设置'}）`,
    `今日目标：${formatWan(targetWan)}`,
    `今日完成：${formatWan(salesWan)}`,
    `今日差额：${formatWan(Math.max(targetWan - salesWan, 0))}`,
    `今日完成率：${todayRate.toFixed(1)}%`,
    '',
    `${plan.periodLabel}目标：${formatWan(reportSummary.targetWan)}`,
    `${plan.periodLabel}累计：${formatWan(reportSummary.actualWan)}`,
    `${plan.periodLabel}差额：${formatWan(reportSummary.gapWan)}`,
    `${plan.periodLabel}完成率：${reportSummary.completionRate.toFixed(1)}%`,
    `行动建议：${recovery.actionText}`,
    categoryLines.length ? `今日品类：${categoryLines.join('；')}` : '',
    periodCategoryLines.length ? `${plan.periodLabel}品类：${periodCategoryLines.join('；')}` : '',
    `黄金克重：${summary.goldGram.toFixed(1)}g`,
    `客单数：${summary.orderCount}`,
    `件数：${summary.pieceCount}`,
    record.note ? `备注：${record.note}` : ''
  ].filter(Boolean).join('\n');
}

function renderReport(plan, summary) {
  document.querySelector('#reportText').textContent = buildReport(plan, summary, selectedReportTemplate);
}

function switchMobileTab(tabName) {
  selectedMobileTab = ['target', 'record', 'report'].includes(tabName) ? tabName : 'target';
  document.body.dataset.mobileTab = selectedMobileTab;
  document.querySelectorAll('.mobile-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.mobileTab === selectedMobileTab);
  });
}

function render() {
  hydrateForm();
  const plan = calculatePlan(state.config);
  const summary = summarize(plan);
  renderSummary(plan, summary);
  renderCalendar(plan);
  renderReport(plan, summary);
  switchMobileTab(selectedMobileTab);
}

document.querySelector('#saveConfigBtn').addEventListener('click', saveConfigFromForm);
document.querySelector('#loadHolidayBtn').addEventListener('click', loadHolidayPreset);
document.querySelector('#saveRecordBtn').addEventListener('click', saveRecordFromForm);
document.querySelector('#calcMode').addEventListener('change', saveConfigFromForm);
document.querySelectorAll('.template-tab').forEach((button) => {
  button.addEventListener('click', () => {
    selectedReportTemplate = reportTemplates[button.dataset.template] ? button.dataset.template : 'owner';
    document.querySelectorAll('.template-tab').forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});
document.querySelector('#recordDate').addEventListener('change', () => {
  hydrateRecordForm();
  render();
});
document.querySelectorAll('.mobile-tab').forEach((button) => {
  button.addEventListener('click', () => {
    switchMobileTab(button.dataset.mobileTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
document.querySelectorAll('.date-picker-input').forEach((input) => {
  input.addEventListener('click', () => openDatePicker(input));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDatePicker(input);
    }
  });
});
document.querySelector('#datePicker').addEventListener('click', (event) => {
  if (event.target.id === 'datePicker') {
    closeDatePicker();
  }
});
document.querySelector('#datePickerPrev').addEventListener('click', () => {
  datePickerViewDate = new Date(datePickerViewDate.getFullYear(), datePickerViewDate.getMonth() - 1, 1);
  renderDatePicker();
});
document.querySelector('#datePickerNext').addEventListener('click', () => {
  datePickerViewDate = new Date(datePickerViewDate.getFullYear(), datePickerViewDate.getMonth() + 1, 1);
  renderDatePicker();
});
document.querySelector('#datePickerToday').addEventListener('click', () => {
  commitDatePickerValue(todayKey());
});
document.querySelector('#datePickerClear').addEventListener('click', () => {
  commitDatePickerValue('');
});
document.querySelector('#copyReportBtn').addEventListener('click', () => {
  const text = document.querySelector('#reportText').textContent;
  const copyButton = document.querySelector('#copyReportBtn');
  const copyPromise = navigator.clipboard && navigator.clipboard.writeText
    ? navigator.clipboard.writeText(text)
    : Promise.reject(new Error('clipboard unavailable'));

  copyPromise
    .then(() => {
      copyButton.textContent = '已复制';
    })
    .catch(() => {
      copyButton.textContent = '长按战报复制';
    });

  setTimeout(() => {
    copyButton.textContent = '复制战报';
  }, 1200);
});

try {
  render();
} catch (error) {
  const report = document.querySelector('#reportText');
  if (report) {
    report.textContent = `页面渲染异常，请刷新后重试。\n${error && error.message ? error.message : error}`;
  }
}
