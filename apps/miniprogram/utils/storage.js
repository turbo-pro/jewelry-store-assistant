const DEFAULT_CONFIG = {
  storeName: '珠宝黄金门店',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  calcMode: 'month',
  totalTargetWan: 100,
  weeklyTargetWan: 25,
  weekStartDate: '',
  weekendRatio: 1.5,
  holidayRatio: 2,
  specialDays: [],
  specialDates: [],
  specialDateNames: {}
};

function getTargetConfig() {
  return wx.getStorageSync('targetConfig') || DEFAULT_CONFIG;
}

function saveTargetConfig(config) {
  wx.setStorageSync('targetConfig', { ...DEFAULT_CONFIG, ...config });
}

function getDailyRecords() {
  return wx.getStorageSync('dailyRecords') || {};
}

function saveDailyRecord(dateKey, record) {
  const records = getDailyRecords();
  records[dateKey] = { ...records[dateKey], ...record, updatedAt: Date.now() };
  wx.setStorageSync('dailyRecords', records);
}

module.exports = {
  DEFAULT_CONFIG,
  getTargetConfig,
  saveTargetConfig,
  getDailyRecords,
  saveDailyRecord
};
