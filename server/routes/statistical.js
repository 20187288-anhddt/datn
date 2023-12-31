const express = require("express");
const cron = require("node-cron");
const ViewModel = require("../models/View");
const StatisticModel = require("../models/Statistical");

const moment = require("moment");
let timedate = moment().format();
const router = express.Router();

function getToday(){
  return new Date(
    moment(timedate)
    .utc()
    .startOf("day")
    .toDate()
  );
}

function getEndDay(){
  return endDay = new Date(
    moment(getToday())
    .utc()
    .endOf("day")
    .toDate()
  );
}

// Endpoint để thêm lượt xem cho tin tức trong ngày
router.post("/news", async (req, res) => {
  try {
    const { id, createdBy } = req.body;

    if (!id || !createdBy) {
      // Nếu thiếu thông tin cần thiết, trả về lỗi
      return res.status(400).json({
        code: 400,
        err: "Thiếu thông tin cần thiết.",
      });
    }

    // Kiểm tra xem tin tức đã được xem trong ngày chưa
    const existingView = await ViewModel.findOne({
      news: id,
      createdBy: createdBy,
      createdAt: { $gte: getToday(), $lt: getEndDay() },
    });

    if (existingView) {
      // Nếu đã xem rồi, trả về thông báo
      return res.status(200).json({
        code: 200,
        message: "Tin tức đã được xem trong ngày.",
        data: existingView,
      });
    }

    // Nếu chưa xem, tạo một bản ghi mới
    const newsViews = new ViewModel({
      news: id,
      createdBy: createdBy,
    });

    // Lưu bản ghi mới
    const saveNewsViews = await newsViews.save();

    if (saveNewsViews) {
      return res.status(200).json({
        code: 200,
        message: "Thêm lượt xem cho tin tức thành công.",
        data: newsViews,
      });
    }
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi thêm lượt xem cho tin tức.",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});


// Endpoint để lấy tin tức đã xem trong ngày để thống kê
router.get('/viewsOfDay', async (req, res) => {
  try {
    // Lấy tin tức đã xem trong ngày
    const news = await ViewModel.find({
      isDelete: false,
      createdAt: { $gte: getToday(), $lte: getEndDay() },
    });

    res.status(200).json({
      code: 200,
      message: "Lấy tin tức đã xem trong ngày thành công",
      data: news,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy tin tức đã xem trong ngày",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});
router.get("/viewsOfMonth", async (req, res) => {
  try {
    const month = req.query.month;

    // Xác định thời điểm bắt đầu và kết thúc của tháng được chọn
    const startMonth = new Date(
      moment(month)
        .startOf("month")
        .format("YYYY-MM-DD")
    );

    const endMonth = new Date(
      moment(startMonth)
        .endOf("month")
        .format("YYYY-MM-DD")
    );

    // Lấy tin tức đã xem trong tháng và sắp xếp theo số lần xem giảm dần
    const viewToMonth = await ViewModel.find({
      isDelete: false,
      date: {
        $gte: startMonth,
        $lte: endMonth,
      },
    })
      .sort({ view: -1 })
      .populate("createdBy");

    return res.status(200).json({
      code: 200,
      message: "Lấy tin tức đã xem trong tháng thành công",
      data: viewToMonth,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy tin tức đã xem trong tháng",
      error: err.message || "Lỗi không xác định",
      data: null,
    });
  }
});

module.exports = router;
