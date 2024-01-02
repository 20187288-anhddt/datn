const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const subCateNewsSchema = new Schema({
    name: String,
    parentCateNews: { 
        type: Schema.Types.ObjectId,
        ref: "CateNews",
        required: true, 
    }, // Tham chiếu đến CateNews
    createdBy: { type: ObjectId, ref: 'User' },
    isDelete: {
        type: Boolean,
        default: false
    }
});

const subCateNewsModel = mongoose.model('subCateNews', subCateNewsSchema);

module.exports = { subCateNewsModel };
