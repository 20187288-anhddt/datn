const mongoose = require('mongoose');

const cateNewsSchema = new mongoose.Schema({
  parentCateNews: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CateNews',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

cateNewsSchema.set('toObject', { virtuals: true });
cateNewsSchema.set('toJSON', { virtuals: true });

// Định nghĩa một thuộc tính ảo cho trường parentCateNewsName
cateNewsSchema.virtual('parentCateNewsName', {
  ref: 'CateNews', // Tham chiếu đến mô hình 'CateNews'
  localField: 'parentCateNews', // Trường trong mô hình hiện tại
  foreignField: '_id', // Trường trong mô hình được tham chiếu
  justOne: true,
});

const CateNews = mongoose.model('CateNews', cateNewsSchema);

module.exports = CateNews;