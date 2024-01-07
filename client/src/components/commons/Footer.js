import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { hanldeUrlPretty } from "../mixin/UrlPretty";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Footer() {
  const appState = useSelector(state => state);

  const getLatest = React.useMemo(() => {
    if (appState.news.latest) {
      return appState.news.latest;
    }
  }, [appState.news.latest]);

  let latest = [];

  if (getLatest) {
    latest = getLatest.slice(0, 6);
  }

  const getFeatured = React.useMemo(() => {
    if (appState.news.data) {
      return appState.news.data;
    }
  }, [appState.news.data]);

  let featured = [];

  if (getFeatured) {
    featured = getFeatured.slice(0, 6);
  }

  const getOther = React.useMemo(() => {
    if (appState.news.other) {
      return appState.news.other;
    }
  }, [appState.news.other]);

  let other = [];

  if (getOther) {
    other = getOther.slice(0, 6);
  }
  const images = [
    'bao-anh-viet-nam.gif',
    'Lecourrie.jpg',
    'Logo__VLLF_in-Website__01.gif',
    'Zing_News.svg',
    'TienPhong-Logo.jpg',
    'skds.svg',
    'vnevne.jpg',
    'logo-NXBTT.jpg',
    'LogoBADTMN.jpg',
    'logoBG.png',
    'thong-tan-xa-viet-nam.gif',
    'truyen-hinh-thong-tan.jpg',
    'viet-nam-news.gif',
    'viet-nam-plus.gif',
    'bao-anh-viet-nam.gif',
    'Lecourrie.jpg',
    'Logo__VLLF_in-Website__01.gif',
    'logo-NXBTT.jpg',
    'LogoBADTMN.jpg',
    'logoBG.png',
    'thong-tan-xa-viet-nam.gif',
    'truyen-hinh-thong-tan.jpg',
    'viet-nam-news.gif',
    'viet-nam-plus.gif',
    // Add more images as needed
  ];
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 10,
    // slidesToScroll: auto,
    autoplay: true, // Enable autoplay
    autoplaySpeed: 0, // Set to 0 for continuous autoplay
    cssEase: 'linear', // Ensures continuous scrolling
  };



  return (
    <footer className="page-footer font-small indigo bg-dark text-white mt-7">
      {/* Footer Links */}
      <div className="container text-md-left">
        {/* Grid row */}
        <div className="row">
          {/* Grid column */}
            <h5 className="font-weight-bold text-uppercase mt-3 mb-4">CÁC ĐƠN VỊ ĐỐI TÁC THÔNG TIN CỦA BK NEWS</h5>
            <br></br>
            <ul>

            </ul>
          {/* Grid column */}
          <hr className="clearfix w-100 d-md-none" />
          {/* Grid column */}
        </div>
        {/* Grid row */}
      </div>
     
      <Slider {...sliderSettings}>
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={`/uploads/newspaper/${image}`}
              alt={`Image ${index + 1}`}
              style={{ maxWidth: '94px', maxHeight: '67px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </Slider>
     <hr />
      <div className="container">
        <div className="row">
        <div className="col-md-6 mx-auto">
  <div className="d-flex align-items-center"> {/* Use flex container for image and information */}
    <div className="mr-3"> {/* Adjust margin as needed */}
      <Link to="/"> <img
        src="/Logo-news.png"
        alt="Your Image Alt Text"
        style={{ width: '150px', height: 'auto' }}  
      /></Link>
    </div>
    <div>
      <h5 className="font-weight-bold text-uppercase mt-3 mb-4">Tạp chí điện tử Bk News</h5>
      <ul>
        <li className="list-style-none bg-dark border-0">
          <p><span className="font-weight-bold">Địa chỉ: </span>01 Đại Cồ Việt, Q.Hai Bà Trưng, Hà Nội</p>
        </li>
        <li className="list-style-none bg-dark border-0">
          <p><span className="font-weight-bold">Hotline: </span>0987142661</p>
        </li>
        <li className="list-style-none bg-dark border-0">
          <p><span className="font-weight-bold">Liên hệ: </span>tienanhbghd@gmail.com</p>
        </li>
      </ul>
    </div>
  </div>
</div>

          <div className="col-md-4 mx-auto mt-3 mb-4">

            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fdhbkhanoi%2F&tabs=timeline&width=340&height=130&small_header=false&adapt_container_width=false&hide_cover=false&show_facepile=true&appId"
              width="100%"
              height={130}
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder={0}
              allow="encrypted-media"
              title="fanpage"
            />
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div style={{ background: "#435165" }} className="footer-copyright text-center py-3 text-white">
        © {moment().format("YYYY")} Copyright:
        <a href="https://fb.com/dodanhtienanh" target="_blank">
          {" "}
         Toàn bộ bản quyền thuộc Đỗ Danh Tiến Anh.
        </a>
      </div>
    </footer>
  );
}
