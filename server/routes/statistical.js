const express = require("express");
const cron = require("node-cron");
const ViewModel = require("../models/View");
const StatisticModel = require("../models/Statistical");
const NewsModel = require("../models/News");
const CateNewsModel = require("../models/CateNews");

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

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

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


router.get('/postOfDay', async (req, res) => {
  try {
    // Truy vấn để đếm số lượng ngày tạo là hôm nay
    const postCountOfDay = await NewsModel.aggregate([
      {
        $match: {
          isDelete: false,
          dateCreate: { $gte: startOfDay, $lte: endOfDay },
        },
      },
    ]);

    res.status(200).json({
      code: 200,
      message: "Lấy số lượng tin tức đã tạo trong ngày thành công",
      data: { postCountOfDay },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy số lượng tin tức đã tạo trong ngày",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});

const startOfWeek = moment().startOf('isoWeek').toDate();
const endOfWeek = moment().endOf('isoWeek').toDate();

router.get("/postOfWeek", async (req, res) => {
  try {
    const postOfWeek = await NewsModel.aggregate([
      {
        $match: {
          isDelete: false,
          dateCreate: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 }, // Đếm tổng số bài viết
          posts: { $push: "$$ROOT" }, // Đưa toàn bộ thông tin các bài viết vào mảng
        },
      },
      {
        $project: {
          _id: 0, // Loại bỏ trường _id
          totalPosts: 1,
          posts: 1,
        },
      },
    ]);

    res.status(200).json({
      code: 200,
      message: "Lấy số lượng bài viết trong tuần thành công",
      data: postOfWeek[0], // Vì $group trả về một mảng, nên lấy phần tử đầu tiên
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy số lượng lượt xem trong tuần",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.get("/viewsByCategory", async (req, res) => {
  try {
    const viewsByCategory = await NewsModel.aggregate([
      {
        $lookup: {
          from: "catenews", // MongoDB collection name (lowercase)
          localField: "cateNews",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $match: {
          isDelete: false,
        },
      },
      {
        $group: {
          _id: "$category.name",
          totalViews: { $sum: "$view" }, // Assuming view is the field representing views in the News schema
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalViews: 1,
        },
      },
    ]);

    res.status(200).json({
      code: 200,
      message: "Lấy số lượng lượt xem theo thể loại bài viết thành công",
      data: viewsByCategory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy số lượng lượt xem theo thể loại bài viết",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});


router.get("/articleCountByCategory", async (req, res) => {
  try {
    const articleCountByCategory = await NewsModel.aggregate([
      {
        $lookup: {
          from: "catenews", // MongoDB collection name (lowercase)
          localField: "cateNews",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $match: {
          isDelete: false,
        },
      },
      {
        $group: {
          _id: "$category.name",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      code: 200,
      message: "Lấy số lượng bài viết theo thể loại thành công",
      data: articleCountByCategory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy số lượng bài viết theo thể loại",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.get("/articleCountByAuthor", async (req, res) => {
  try {
    const articleCountByAuthor = await NewsModel.aggregate([
      {
        $lookup: {
          from: "users", // MongoDB collection name (lowercase)
          localField: "createdBy",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $match: {
          isDelete: false,
        },
      },
      {
        $group: {
          _id: "$author.username", // Assuming the author's username is unique
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          author: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      code: 200,
      message: "Lấy số lượng bài viết theo tác giả thành công",
      data: articleCountByAuthor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy số lượng bài viết theo tác giả",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.get("/articleCountBySource", async (req, res) => {
  try {
    // Get start and end dates from the request query parameters
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const articleCountBySource = await NewsModel.aggregate([
      {
        $match: {
          isDelete: false,
          dateCreate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      code: 200,
      message: "Lấy số lượng bài viết theo nguồn thành công",
      data: articleCountBySource,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy số lượng bài viết theo nguồn",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.get("/topMostViewed", async (req, res) => {
  try {
    const topMostViewed = await NewsModel
      .find({ isDelete: false }) // Exclude deleted articles
      .sort({ view: -1 }) // Sort by view count in descending order
      .limit(20) // Limit the result to the top 10 articles

    res.status(200).json({
      code: 200,
      message: "Lấy danh sách 20 bài viết có lượt xem cao nhất thành công",
      data: topMostViewed,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách 20 bài viết có lượt xem cao nhất",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});



module.exports = router;
