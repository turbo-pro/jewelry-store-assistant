const { getTargetConfig, saveTargetConfig } = require('../../utils/storage');
const { toDateKey, getTodayKey } = require('../../utils/targetCalculator');

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

function formatDateKey(date) {
  return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

Page({
  data: {
    storeName: '',
    year: '',
    month: '',
    calcMode: 'month',
    totalTargetWan: '',
    weeklyTargetWan: '',
    weekStartDate: '',
    weekendRatio: '',
    holidayRatio: '',
    specialDays: [],
    specialDates: [],
    specialDateNames: {},
    days: []
  },
  onShow() {
    const config = getTargetConfig();
    this.setData({ ...config }, () => this.refreshDays());
  },
  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value }, () => {
      if (field === 'year' || field === 'month') this.refreshDays();
    });
  },
  onModeChange(event) {
    const calcMode = event.detail.value ? 'week' : 'month';
    const fallbackWeekStart = formatDateKey(startOfWeek(parseDateKey(getTodayKey())));
    this.setData({
      calcMode,
      weekStartDate: this.data.weekStartDate || fallbackWeekStart
    }, () => this.refreshDays());
  },
  onWeekStartChange(event) {
    this.setData({ weekStartDate: event.detail.value }, () => this.refreshDays());
  },
  refreshDays() {
    const year = Number(this.data.year);
    const month = Number(this.data.month);
    const specialSet = new Set((this.data.specialDays || []).map(Number));
    const specialDateSet = new Set(this.data.specialDates || []);
    const specialDateNames = this.data.specialDateNames || {};
    let days;

    if (this.data.calcMode === 'week') {
      const startDate = parseDateKey(this.data.weekStartDate) || startOfWeek(parseDateKey(getTodayKey()));
      days = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(startDate, index);
        const day = date.getDate();
        const dateKey = formatDateKey(date);
        return {
          day,
          dateKey,
          label: specialDateNames[dateKey] || `${date.getMonth() + 1}/${day}`,
          subLabel: specialDateNames[dateKey] ? `${date.getMonth() + 1}/${day}` : '',
          active: specialDateSet.has(dateKey) || specialSet.has(day)
        };
      });
    } else {
      const maxDay = new Date(year, month, 0).getDate() || 31;
      days = Array.from({ length: maxDay }, (_, index) => {
        const day = index + 1;
        const dateKey = toDateKey(year, month, day);
        return {
          day,
          dateKey,
          label: specialDateNames[dateKey] || String(day),
          subLabel: specialDateNames[dateKey] ? String(day) : '',
          active: specialDateSet.has(dateKey) || specialSet.has(day)
        };
      });
    }

    this.setData({ days });
  },
  toggleDay(event) {
    const day = Number(event.currentTarget.dataset.day);
    const dateKey = event.currentTarget.dataset.key;
    const specialSet = new Set((this.data.specialDays || []).map(Number));
    const specialDateSet = new Set(this.data.specialDates || []);
    const specialDateNames = { ...(this.data.specialDateNames || {}) };

    if (this.data.calcMode === 'week' && dateKey) {
      if (specialDateSet.has(dateKey)) {
        specialDateSet.delete(dateKey);
        delete specialDateNames[dateKey];
      } else {
        specialDateSet.add(dateKey);
      }
    } else if (specialSet.has(day)) {
      specialSet.delete(day);
    } else {
      specialSet.add(day);
    }

    this.setData({
      specialDays: Array.from(specialSet).sort((a, b) => a - b),
      specialDates: Array.from(specialDateSet).sort(),
      specialDateNames
    }, () => this.refreshDays());
  },
  loadHolidayPreset() {
    const year = Number(this.data.year);
    const preset = holidayPresets[year];

    if (!preset) {
      wx.showToast({ title: '暂无该年节假日', icon: 'none' });
      return;
    }

    const specialDateSet = new Set([...(this.data.specialDates || []), ...preset]);
    this.setData({
      specialDates: Array.from(specialDateSet).sort(),
      specialDateNames: {
        ...(this.data.specialDateNames || {}),
        ...(holidayNamePresets[year] || {})
      }
    }, () => this.refreshDays());
    wx.showToast({ title: '已加载节假日', icon: 'success' });
  },
  save() {
    saveTargetConfig({
      storeName: this.data.storeName || '珠宝黄金门店',
      year: Number(this.data.year),
      month: Number(this.data.month),
      calcMode: this.data.calcMode === 'week' ? 'week' : 'month',
      totalTargetWan: Number(this.data.totalTargetWan || 0),
      weeklyTargetWan: Number(this.data.weeklyTargetWan || 0),
      weekStartDate: this.data.weekStartDate || '',
      weekendRatio: Number(this.data.weekendRatio || 1),
      holidayRatio: Number(this.data.holidayRatio || 1),
      specialDays: this.data.specialDays || [],
      specialDates: this.data.specialDates || [],
      specialDateNames: this.data.specialDateNames || {}
    });
    wx.showToast({ title: '已保存', icon: 'success' });
  }
});
