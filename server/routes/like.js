const express = require("express");
const NewsModel = require("../models/News");
const LikeModel = require("../models/Like");
const router = express.Router();

const auth = require("../middleware/auth");
const authAdmin = require("../middleware/checkAdmin");
const authCus = require("../middleware/checkCus");

// Mảng middleware cho việc xác thực admin
const authAdminMiddleware = [auth, authAdmin];

// Mảng middleware cho việc xác thực customer
const authCustomerMiddleware = [auth, authCus];

router.get("/", async function (req, res, next) {
  try {
    // Kiểm tra người dùng và vai trò
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        code: 403,
        message: "Bạn không có quyền truy cập",
        data: null,
      });
    }

    const queryConditions = { isDelete: false };

    if (req.user.role === "customer") {
      queryConditions.createdBy = req.user._id;
    }

    const likes = await LikeModel.find(queryConditions)
      .populate("createdBy")
      .populate("news");

    return res.status(200).json({
      code: 200,
      message: "Thành công",
      data: likes,
    });
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: "Lỗi khi lấy danh sách likes",
      error: err.message,
      data: null,
    });
  }
});

router.get("/", async function (req, res, next) {
  try {
    // Kiểm tra người dùng và vai trò
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        code: 403,
        message: "Bạn không có quyền truy cập",
        data: null,
      });
    }

    const queryConditions = { isDelete: false, createdBy: req.user._id };

    const likes = await LikeModel.find(queryConditions)
      .populate("createdBy")
      .populate("news");

    return res.status(200).json({
      code: 200,
      message: "Thành công",
      data: likes,
    });
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: "Lỗi khi lấy danh sách likes",
      error: err.message,
      data: null,
    });
  }
});

router.post("/:_idNews", async function (req, res, next) {
  try {
    const newsId = req.params._idNews;
    const existingLike = await LikeModel.findOne({ news: newsId, createdBy: req.user._id });

    if (!existingLike) {
      const newLike = new LikeModel({ news: newsId, createdBy: req.user._id });
      const savedLike = await newLike.save();

      const updatedNews = await NewsModel.findOneAndUpdate(
        { _id: newsId },
        { $inc: { countLike: 1 } }
      );

      return res.status(200).json({
        code: 200,
        message: "Like thành công",
        likeCount: updatedNews.countLike,
        data: null
      });
    }

    if (existingLike.isDelete) {
      const restoredLike = await LikeModel.findOneAndUpdate(
        { news: newsId, createdBy: req.user._id },
        { isDelete: false }
      );

      const updatedNews = await NewsModel.findOneAndUpdate(
        { _id: newsId },
        { $inc: { countLike: 1 } }
      );

      return res.status(200).json({
        code: 200,
        message: "Like thành công",
        likeCount: updatedNews.countLike
      });
    } else {
      const likedNews = await NewsModel.findOne({ _id: newsId, isDelete: false });

      return res.status(200).json({
        code: 200,
        message: "Đã like bài này",
        likeCount: likedNews.countLike
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu",
      error: err.message || "Lỗi không xác định",
      data: null
    });
  }
});

router.post("/unlike/:_idNews", async function (req, res, next) {
  try {
    const newsId = req.params._idNews;
    const likeCheck = await LikeModel.findOne({ news: newsId, createdBy: req.user._id });

    if (!likeCheck) {
      const likedNews = await NewsModel.findOne({ _id: newsId, isDelete: false });

      return res.status(200).json({
        code: 200,
        message: "Chưa like bài này",
        likeCount: likedNews.countLike
      });
    } else {
      if (likeCheck.isDelete === false) {
        const unlike = await LikeModel.findOneAndUpdate(
          { news: newsId, createdBy: req.user._id },
          { isDelete: true }
        );

        const updatedNews = await NewsModel.findOneAndUpdate(
          { _id: newsId },
          { $inc: { countLike: -1 } }
        );

        return res.status(200).json({
          code: 200,
          message: "Unlike thành công",
          likeCount: updatedNews.countLike
        });
      } else {
        const likedNews = await NewsModel.findOne({ _id: newsId });

        return res.status(200).json({
          code: 200,
          message: "Chưa like bài này",
          likeCount: likedNews.countLike
        });
      }
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu",
      error: err.message || "Lỗi không xác định",
      data: null
    });
  }
});


module.exports = router;