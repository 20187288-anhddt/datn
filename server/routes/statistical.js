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


// ADD tin tuc trong ngay de thong ke thoi diem nguoi dung xem tin
router.post("/news", async (req, res) => {
  try {
    const { id, createdBy } = req.body;
    if (id) {
      const newsViews = new ViewModel({
        news: id,
        createdBy: createdBy
      });

      const saveNewsViews = await newsViews.save();

      if (saveNewsViews) {
        return res.json({
          code: 200,
          err: null,
          data: newsViews
        });
      }
    }

  } catch (error) {
    return res.json({
      code: 400,
      err: error
    });
  }
});

// GET tin tuc trong ngay de thong ke thoi diem nguoi dung xem tin
router.get('/viewsOfDay', async (req, res) => {
  try {
    const news = await ViewModel.find({
      isDelete: false,
      date: {
        $gte: getToday(),
        $lte: getEndDay()
      }
    });

    res.json({
      code: 200,
      data: news
    })
  } catch (e) {
    res.json({
      code: 400,
      message: e
    })
  }
});

router.get("/viewsOfMonth", async (req, res) => {
  try {
    const month = req.query.month;
    console.log(month);

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
        }
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
