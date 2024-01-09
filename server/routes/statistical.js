const express = require("express");
const cron = require("node-cron");
const ViewModel = require("../models/View");
const StatisticModel = require("../models/Statistical");
const NewsModel = require("../models/News");
const CateNewsModel = require("../models/CateNews");
const logger = require("../utils/logger")
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
        error: "Thiếu thông tin cần thiết.",
      })&& logger.warn({status:400, message: "Thiếu thông tin cần thiết",data: req.body, error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
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
      })&& logger.info({status:200, message:"Tin tức đã được xem trong ngày",data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
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
      })&& logger.info({status:200, message:"Thêm lượt xem cho tin tức thành công.",data: saveNewsViews, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi thêm lượt xem cho tin tức.",
      error: error.message || "Lỗi không xác định",
      data: null,
    })&& logger.error({status:500, message:"Đã xảy ra lỗi khi thêm lượt xem cho tin tức.",error, data: saveNewsViews, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});;
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
    })&& logger.info({status:200, message:"Lấy tin tức đã xem trong ngày thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy tin tức đã xem trong ngày",
      error: error.message || "Lỗi không xác định",
      data: null,
    })&& logger.error({status:500, message:"Đã xảy ra lỗi khi lấy tin tức đã xem trong ngày", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
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
    })&& logger.info({status:200, message:"Lấy tin tức đã xem trong tháng thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy tin tức đã xem trong tháng",
      error: err.message || "Lỗi không xác định",
      data: null,
    }) && logger.error({status:500, message:"Đã xảy ra lỗi khi lấy tin tức đã xem trong tháng", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers,  stack: error.stack})
  }
});


router.get("/newsByMonth", async (req, res) => {
  try {
    const month = req.query.month;

    // Determine the start and end of the selected month
    const startMonth = new Date(
      moment(month).startOf("month").format("YYYY-MM-DD")
    );

    const endMonth = new Date(
      moment(startMonth).endOf("month").format("YYYY-MM-DD")
    );

    // Fetch news articles within the specified month, sorted by view count
    const newsByMonth = await NewsModel.find({
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
      message: "Successfully retrieved published news articles for the month",
      data: newsByMonth,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Error occurred while fetching published news articles for the month",
      error: err.message || "Unknown error",
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

// router.get("/articleCountBySource", async (req, res) => {
//   try {
//     // Get start and end dates from the request query parameters
//     const startDate = new Date(req.query.startDate);
//     const endDate = new Date(req.query.endDate);

//     const articleCountBySource = await NewsModel.aggregate([
//       {
//         $match: {
//           isDelete: false,
//           dateCreate: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$source",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           source: "$_id",
//           count: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       code: 200,
//       message: "Lấy số lượng bài viết theo nguồn thành công",
//       data: articleCountBySource,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       code: 500,
//       message: "Đã xảy ra lỗi khi lấy số lượng bài viết theo nguồn",
//       error: error.message || "Lỗi không xác định",
//       data: null,
//     });
//   }
// });

router.get("/articleCountBySource", async (req, res) => {
  try {
    const articleCountBySource = await NewsModel.aggregate([
      {
        $match: {
          isDelete: false,
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
      .limit(100) // Limit the result to the top 10 articles

    res.status(200).json({
      code: 200,
      message: "Lấy danh sách bài viết có lượt xem cao nhất thành công",
      data: topMostViewed,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách bài viết có lượt xem cao nhất",
      error: error.message || "Lỗi không xác định",
      data: null,
    });
  }
});


router.get("/channels/follows", async (req, res) => {
  try {
    const { channelId } = req.query;
    const Users = await UsersModel.find({
      isDelete: false,
      role: "journalist",
      _id: channelId
    });

    if (Users) {
      return res.json({
        code: 200,
        err: null,
        data: Users
      });
    }
  } catch (error) {
    return res.json({
      code: 400,
      err: error
    });
  }
});


// journalist

router.get("/channels/follows", async (req, res) => {
  try {
    const { channelId } = req.query;
    const Users = await UsersModel.find({
      isDelete: false,
      role: "journalist",
      _id: channelId
    });

    if (Users) {
      return res.json({
        code: 200,
        err: null,
        data: Users
      });
    }
  } catch (error) {
    return res.json({
      code: 400,
      err: error
    });
  }
});

// top 5 bai viet
router.get("/channels/bestNews", async (req, res) => {
  try {
    const { channelId } = req.query;
    const Users = await NewsModel.find({
      isDelete: false,
      createdBy: channelId
    }).limit(5).sort({ view: -1 });

    if (Users) {
      return res.json({
        code: 200,
        err: null,
        data: Users
      });
    }
  } catch (error) {
    return res.json({
      code: 400,
      err: error
    });
  }
});

router.get("/viewsOfMonthByChannel", async (req, res) => {
  try {
    const { month, channelId } = req.query;
    console.log(month, channelId);

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
 
    const viewToMonth = await ViewModel.find({
        isDelete: false,
        date: {
          $gte: startMonth,
          $lte: endMonth
        },
        createdBy: channelId
      }).sort({
        view: -1
      })
      .populate("createdBy");

    return res.json({
      data: viewToMonth
    });
  } catch (err) {
    console.log(err);
    return res.json({
      code: 400,
      err: err.messege,
      data: null
    });
  }
});

module.exports = router;
