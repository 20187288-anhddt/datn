const express = require("express");
const NewsModel = require("../models/News");
const RateModel = require("../models/Rate");
const router = express.Router();
const auth = require("../middleware/auth");
const authCus = require("../middleware/checkCus");

router.get("/", auth, async function (req, res, next) {
  try {
    const rates = await RateModel.find({ isDelete: false })
      .populate("createdBy")
      .populate("news");

    return res.status(200).json({
      code: 200,
      message: "Lấy danh sách đánh giá thành công",
      data: rates,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách đánh giá",
      error: err.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.post("/news/:_idNews", async function (req, res, next) {
  try {
    const idNews = req.params._idNews;
    const comment = req.body.comment;
    const score = req.body.score;

    // Validation
    if (!comment || !score || score < 1 || score > 5) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu không hợp lệ. Vui lòng cung cấp cả bình luận và điểm (1-5) hợp lệ.",
        data: null,
      });
    }

    // Check if the news exists
    const newsCheck = await NewsModel.findOne({
      _id: idNews,
      isDelete: false,
    });

    if (!newsCheck) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy bài viết.",
        data: null,
      });
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create a new rate
      const Rate = new RateModel({
        news: idNews,
        comment: comment,
        score: score,
        createdBy: req.user._id,
      });

      const savedRate = await Rate.save();

      // Find all rates for the news
      const allRates = await RateModel.find({ news: idNews });

      // Calculate average rating
      const scoreRates = allRates.map((rate) => rate.score);
      const average = scoreRates.reduce((a, b) => a + b, 0) / scoreRates.length;

      // Update the news with the new rating information
      const updatedNews = await NewsModel.findOneAndUpdate(
        { _id: idNews },
        { $inc: { ratingCount: 1 }, averageRating: average },
        { session: session, new: true }
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        code: 200,
        message: "Đánh giá thành công",
        data: savedRate,
        avgRate: average,
      });
    } catch (err) {
      // Rollback the transaction in case of an error
      await session.abortTransaction();
      session.endSession();

      throw err; // Re-throw the error for the outer catch block to handle
    }
  } catch (err) {
    // Handle errors from the outer catch block
    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đánh giá",
      error: err.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.put("/:_idRate", auth, async function (req, res, next) {
  try {
    const idRate = req.params._idRate;
    const score = req.body.score;
    const comment = req.body.comment;

    // Validation
    if (!comment || !score || score < 1 || score > 5) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu không hợp lệ. Vui lòng cung cấp cả bình luận và điểm (1-5) hợp lệ.",
        data: null,
      });
    }

    // Check if the rate exists
    const checkRate = await RateModel.findOne({ _id: idRate });

    if (!checkRate) {
      return res.status(404).json({
        code: 404,
        message: "Đánh giá không tồn tại.",
        data: null,
      });
    }

    // Check if the user is the creator of the rate
    if (checkRate.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        code: 403,
        message: "Từ chối quyền. Bạn không phải là người tạo ra đánh giá này.",
        data: null,
      });
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the rate
      const rateUpdate = await RateModel.findOneAndUpdate(
        { _id: idRate },
        { comment: comment, score: score },
        { new: true, session: session }
      );

      // Find all rates for the news
      const rated = await RateModel.find({ news: checkRate.news });

      // Calculate average rating
      const scoreRate = rated.map((rate) => rate.score);
      const average = scoreRate.reduce((a, b) => a + b, 0) / scoreRate.length;

      // Update the news with the new rating information
      const rateNews = await NewsModel.findOneAndUpdate(
        { _id: checkRate.news },
        { $inc: { ratingCount: 1 }, averageRating: average },
        { session: session }
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        code: 200,
        data: rateUpdate,
        message: "Cập nhật đánh giá thành công",
        avg: average,
      });
    } catch (err) {
      // Rollback the transaction in case of an error
      await session.abortTransaction();
      session.endSession();

      throw err; // Re-throw the error for the outer catch block to handle
    }
  } catch (err) {
    // Handle errors from the outer catch block
    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi cập nhật đánh giá",
      error: err.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.delete("/:_idRate", auth, async function (req, res, next) {
  try {
    const idRate = req.params._idRate;

    // Validation
    if (!idRate) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu không hợp lệ. Vui lòng cung cấp một ID đánh giá hợp lệ.",
        data: null,
      });
    }

    // Check if the rate exists and is not deleted
    const rateCheck = await RateModel.findOne({ _id: idRate, isDelete: false });

    if (!rateCheck) {
      return res.status(404).json({
        code: 404,
        message: "Đánh giá không tồn tại hoặc đã bị xóa.",
        data: null,
      });
    }

    // Check if the user has the permission to delete the rate
    if (
      rateCheck.createdBy.toString() === req.user._id.toString() ||
      req.user.role === "admin"
    ) {
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Soft-delete the rate
        const rateUpdate = await RateModel.findByIdAndUpdate(
          idRate,
          { isDelete: true },
          { new: true, session: session }
        );

        // Find all rates for the news
        const rated = await RateModel.find({ news: rateCheck.news, isDelete: false });

        // Calculate average rating
        const average =
          rated.reduce((total, rate) => total + rate.score, 0) / rated.length;

        // Update the news with the new rating information
        const rateNews = await NewsModel.findByIdAndUpdate(
          rateCheck.news,
          { $inc: { ratingCount: -1 }, averageRating: average },
          { session: session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          code: 200,
          message: "Xóa đánh giá thành công",
          data: rateUpdate,
          avgRate: average,
        });
      } catch (err) {
        // Rollback the transaction in case of an error
        await session.abortTransaction();
        session.endSession();

        throw err; // Re-throw the error for the outer catch block to handle
      }
    } else {
      return res.status(403).json({
        code: 403,
        message: "Từ chối quyền. Bạn không có quyền xóa đánh giá này.",
        data: null,
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi xóa đánh giá",
      error: err.message || "Lỗi không xác định",
      data: null,
    });
  }
});

router.get("/:_idRate", auth, async function(req, res, next) {
  try {
    const idRate = req.params._idRate;

    // Validation
    if (!idRate) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu không hợp lệ. Vui lòng cung cấp một ID đánh giá hợp lệ.",
        data: null,
      });
    }

    const rate = await RateModel.findOne({ _id: idRate, isDelete: false })
      .populate("createdBy")
      .populate("news");

    if (!rate) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy đánh giá hoặc đánh giá đã bị xóa.",
        data: null,
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Lấy đánh giá thành công",
      data: rate,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy đánh giá",
      error: err.message || "Lỗi không xác định",
      data: null,
    });
  }
});

module.exports = router;
