const { getDailyRecords, saveDailyRecord } = require('../../utils/storage');
const { getTodayKey } = require('../../utils/targetCalculator');

Page({
  data: {
    dateKey: '',
    salesWan: '',
    goldGram: '',
    goldPricePerGram: '',
    orderCount: '',
    pieceCount: '',
    goldSalesWan: '',
    goldPieceCount: '',
    kGoldSalesWan: '',
    kGoldPieceCount: '',
    diamondSalesWan: '',
    diamondPieceCount: '',
    otherSalesWan: '',
    otherPieceCount: '',
    note: ''
  },
  onShow() {
    const dateKey = getTodayKey();
    const record = getDailyRecords()[dateKey] || {};
    const categories = record.categories || {};
    this.setData({
      dateKey,
      ...record,
      goldSalesWan: categories.gold?.salesWan || '',
      goldPieceCount: categories.gold?.pieceCount || '',
      kGoldSalesWan: categories.kGold?.salesWan || '',
      kGoldPieceCount: categories.kGold?.pieceCount || '',
      diamondSalesWan: categories.diamond?.salesWan || '',
      diamondPieceCount: categories.diamond?.pieceCount || '',
      otherSalesWan: categories.other?.salesWan || '',
      otherPieceCount: categories.other?.pieceCount || ''
    });
  },
  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
  },
  save() {
    const {
      dateKey,
      salesWan,
      goldGram,
      goldPricePerGram,
      orderCount,
      pieceCount,
      goldSalesWan,
      goldPieceCount,
      kGoldSalesWan,
      kGoldPieceCount,
      diamondSalesWan,
      diamondPieceCount,
      otherSalesWan,
      otherPieceCount,
      note
    } = this.data;
    saveDailyRecord(dateKey, {
      salesWan: Number(salesWan || 0),
      goldGram: Number(goldGram || 0),
      goldPricePerGram: Number(goldPricePerGram || 0),
      orderCount: Number(orderCount || 0),
      pieceCount: Number(pieceCount || 0),
      categories: {
        gold: {
          salesWan: Number(goldSalesWan || 0),
          pieceCount: Number(goldPieceCount || 0)
        },
        kGold: {
          salesWan: Number(kGoldSalesWan || 0),
          pieceCount: Number(kGoldPieceCount || 0)
        },
        diamond: {
          salesWan: Number(diamondSalesWan || 0),
          pieceCount: Number(diamondPieceCount || 0)
        },
        other: {
          salesWan: Number(otherSalesWan || 0),
          pieceCount: Number(otherPieceCount || 0)
        }
      },
      note: note || ''
    });
    wx.showToast({ title: '已保存', icon: 'success' });
  }
});
