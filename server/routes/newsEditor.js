var express = require("express");
const NewsModel = require("../models/News");
const RateModel = require("../models/Rate");
const LikeModel = require("../models/Like");
const ViewModel = require("../models/View");
var router = express.Router();
const auth = require("../middleware/auth");
const authEditor = require("../middleware/checkEditor");
const { NEWS } = require("../constant");
/* GET users listing. */

// news ( isDelete = false )
router.get("/", async function(req, res, next) {
  try {
    const News = await NewsModel.find({
      isDelete: false,
      status: "undefined"
    })
      .populate("cateNews")
      .populate("createdBy");
    return res.json({
      code: 200,
      err: null,
      data: News
    });
  } catch (err) {
    return res.json({
      code: 400,
      err: err.messege,
      data: null
    });
  }
});

router.get("/:_idNews", authEditor, async function(req, res, next) {
  try {
    const idNews = req.params._idNews;
    const Newss = await NewsModel.find({
      _id: idNews,
      isDelete: false
    }).populate("category");
    const rate = await RateModel.find({ News: idNews, isDelete: false });
    const View = new ViewModel({
      News: idNews,
      user: req.user._id,
      date: date
    });
    const ViewClass = await View.save();
    return res.json({
      code: 200,
      err: null,
      data: Newss,
      rate: rate
    });
  } catch (err) {
    return res.json({
      code: 400,
      err: err.messege,
      data: null
    });
  }
});

// Published
router.put("/:_id", async function(req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const body = req.body;
      const files = req.files;

      if (files) {
        files.file.mv(`${__dirname}/../../client/public/uploads/news/${files.file.name}`);

        const news = {
          title: body.title,
          content: body.content,
          cateNews: body.categoryId,
          status: "published",
          tag: JSON.parse(body.tags),
          articlePicture: files.file.name
        };

        if (news) {
          await NewsModel.findOneAndUpdate({ _id: _id }, news);

          return res.json({
            code: 200,
            message: "Published thành công"
          });
        }
      } else {
        const news = {
          title: body.title,
          content: body.content,
          cateNews: body.categoryId,
          status: "published",
          tag: JSON.parse(body.tags)
        };

        if (news) {
          await NewsModel.findOneAndUpdate({ _id: _id }, news);

          return res.json({
            code: 200,
            message: "Published thành công"
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({
      code: 400,
      message: "Published thất bại",
      err: err,
      data: null
    });
  }
});


router.put("/unpublished/:_id", async function(req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const body = req.body;
      const files = req.files;

      if (files) {
        files.file.mv(`${__dirname}/../../client/public/uploads/news/${files.file.name}`);

        const news = {
          title: body.title,
          content: body.content,
          cateNews: body.categoryId,
          status: "unpublished",
          tag: JSON.parse(body.tags),
          articlePicture: files.file.name
        };

        if (news) {
          await NewsModel.findOneAndUpdate({ _id: _id }, news);

          return res.json({
            code: 200,
            message: "Unpublished thành công"
          });
        }
      } else {
        const news = {
          title: body.title,
          content: body.content,
          cateNews: body.categoryId,
          status: "unpublished",
          tag: JSON.parse(body.tags)
        };

        if (news) {
          await NewsModel.findOneAndUpdate({ _id: _id }, news);

          return res.json({
            code: 200,
            message: "Unpublished thành công"
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({
      code: 400,
      message: "Unpublished thất bại",
      err: err,
      data: null
    });
  }
});


router.delete("/:_id", authEditor, async function(req, res, next) {
  try {
    const _id = req.params._id;
    const proCheck = await NewsModel.findOne({ _id: _id });
    if (proCheck == null) {
      return res.json({
        data: null,
        messege: "Khong co bai viet nay",
        code: 200
      });
    }
    if (proCheck != null) {
      const body = req.body;
      const NewsUpdate = await NewsModel.updateOne(
        { _id: _id },
        { isDelete: true }
      );
      return res.json({ code: 200, message: "da xoa", data: NewsUpdate });
    }
  } catch (err) {
    return res.json({
      code: 400,
      err: err,
      data: null
    });
  }
});

router.delete("/:_id", authEditor, async function(req, res, next) {
  try {
    const _id = req.params._id;
    const proCheck = await NewsModel.findOne({ _id: _id });
    if (proCheck == null) {
      return res.json({
        data: null,
        messege: "Khong co bai viet nay",
        code: 200
      });
    }
    if (proCheck != null) {
      const body = req.body;
      const NewsUpdate = await NewsModel.updateOne(
        { _id: _id },
        { isDelete: true }
      );
      return res.json({ code: 200, message: "da xoa", data: NewsUpdate });
    }
  } catch (err) {
    return res.json({
      code: 400,
      err: err,
      data: null
    });
  }
});
module.exports = router;