const express = require("express");
const router = express.Router();

// Models
const ProhibitedWordsModel = require("../models/ProhibitedWords");
const CommentModel = require("../models/Comment");

router.get("/allComments", async (req, res) => {
  try {
    const allComments = await CommentModel.find({}).populate("createdBy");
    allComments.reverse();
    if (allComments) {
      return res.json({
        code: 200,
        data: allComments,
      });
    }
  } catch (error) {
    console.error("Error fetching tất cả bình luận:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

router.get("/prohibitedWords", async (req, res) => {
  try {
    const prohibitedWords = await ProhibitedWordsModel.find({});

    if (prohibitedWords) {
      return res.json({
        code: 200,
        data: prohibitedWords,
      });
    }
  } catch (error) {
    console.error("Error fetching prohibited words:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const newsId = req.params.id;
    let { page = 1, limit = 5 } = req.query;

    // Calculate the number of comments to skip based on the page and limit
    const skip = (page - 1) * limit;

    const commentsOfNews = await CommentModel.find({ news: newsId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 })
      .populate("createdBy");

    if (commentsOfNews.length === 0) {
      return res.json({
        code: 404,
        message: "Không có bình luận nào cho tin tức này.",
      });
    }

    return res.json({
      code: 200,
      data: commentsOfNews,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Check từ ngữ cấm
    const prohibitedWords = await ProhibitedWordsModel.find({});
    const words = prohibitedWords[0]?.words || [];
    const content = body.content;

    if (words.length > 0 && content) {
      const regex = new RegExp(words.join("|"), "gi");
      const result = content.replace(regex, (match) =>
        "*".repeat(match.length)
      );

      const comment = new CommentModel({
        news: body.newsId,
        createdBy: body.userId,
        content: result,
      });

      const saveComment = await comment.save();
      const commentsOfNews = await CommentModel.find({ news: body.newsId })
        .limit(5)
        .sort({ date: -1 })
        .populate("createdBy");

      return res.json({
        code: 200,
        data: commentsOfNews,
      });
    }
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal error server",
      error: error.message,
    });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const _id = req.params.id; // Use req.params.id for parameters in the path
    const newsId = req.query.newsId;

    console.log(_id);
    const commentExist = await CommentModel.findOne({ _id: _id });

    if (commentExist) {
      const commentDelete = await CommentModel.findOneAndDelete({ _id: _id });

      if (commentDelete !== null) {
        const CommentsOfNews = await CommentModel.find({ news: newsId })
          .limit(5)
          .sort({ date: -1 })
          .populate("createdBy");

        if (CommentsOfNews) {
          res.json({
            code: 200,
            message: "Xóa thành công",
            data: CommentsOfNews,
          });
        } else {
          res.json({
            code: 200,
            message: "Xóa thành công, không có bình luận nào khác",
            data: [],
          });
        }
      } else {
        res.json({
          code: 400,
          message: "Không thể xóa bình luận",
        });
      }
    } else {
      res.json({
        code: 400,
        message: "Bình luận không tồn tại",
      });
    }
  } catch (err) {
    console.error("Lỗi khi xóa bình luận:", err);
    return res.json({
      code: 500,
      message: "Lỗi máy chủ",
      err: err,
    });
  }
});


router.put("/prohibitedWords", async (req, res) => {
  try {
    const body = req.body;
    const wordToAdd = body.word.trim().toLowerCase(); // Chuyển đổi về chữ thường và loại bỏ khoảng trắng đầu cuối.

    const existingWords = await ProhibitedWordsModel.findOne({});
    const currentWords = existingWords ? existingWords.words : [];

    // Kiểm tra xem từ đã tồn tại hay chưa
    if (currentWords.includes(wordToAdd)) {
      return res.status(400).json({
        code: 400,
        message: "Từ đã tồn tại trong danh sách từ cấm.",
      });
    }

    // Thêm từ mới vào danh sách và cập nhật trong database
    const updatedWords = [...currentWords, wordToAdd];
    await ProhibitedWordsModel.findOneAndUpdate(
      { _id: "620facc2a52b136a9ddd5f8f" },
      { words: updatedWords }
    );

    return res.json({
      code: 200,
      message: "Thêm từ cấm thành công",
    });
  } catch (error) {
    console.error("Error adding prohibited word:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
