const mongoose = require("mongoose");
require("mongoose-double")(mongoose);
const moment = require("moment");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const { NEWS } = require("../constant");
const { truncate } = require("fs");

let timedate = moment().format();

const schema = new Schema({
  title: {
    type: String,
    unique: true
  },
  content: String,
  cateNews: { type: ObjectId, ref: "CateNews" },
  subCateNews : { type: ObjectId, ref: "subCateNews" },
  createdBy: { type: ObjectId, ref: "User" },
  articlePicture: { type: String },
  countLike: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  avengeRating: {
    type: mongoose.Schema.Types.Double,
    default: 0
  },
  view: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: NEWS.STATUS.PUBLISH
  },
  count: Number,
  isDelete: {
    type: Boolean,
    default: false
  },
  dateCreate: {
    type: Date,
    default: () => moment(Date.now())
    .add(7, "hour")
    .format("YYYY-MM-DD HH:mm:ss Z")
  },
  tag: { type: Array, default: null },
  sapo: String,
  originalLink: String,
  source: String
});
schema.index({title: "text"})
const NewsModel = mongoose.model("News", schema);

module.exports = NewsModel;
