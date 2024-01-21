import React, { useEffect, useState } from "react";

export default function GiaVang() {
  const [isDivVisible, setIsDivVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Thay đổi giá trị 100 bằng giá trị nơi bạn muốn hiển thị div
      if (scrollPosition > 0) {
        setIsDivVisible(true);
      } else {
        setIsDivVisible(false);
      }
    };

    // Gắn sự kiện cuộn
    window.addEventListener("scroll", handleScroll);

    // Xóa sự kiện cuộn khi component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div style={{ display: isDivVisible ? 'block' : 'none' }}>
      {/* <iframe
      title="Gía vàng"
        style={{ border: "none", width: "100%", height: "800px" }}
        src="https://tygiado.com/nhung-gia-vang/"
      ></iframe> */}

<iframe
      width="100%"
      height="735px"
      frameBorder="0"
      style={{ overflow: "hidden",marginBottom: "20px" }}
      allowTransparency="true"
      src="https://tygiadola.net/giavangfull/dat-gia-vang/widgets"
      border="0"
      scrolling="no"
    ></iframe>
    <div></div>
    <span></span>
<h4 className="mb-3 text-red font-weight">Chứng khoán</h4>
<iframe
      src="https://widget.dnse.com.vn/index-widget?theme=light&amp;indexes=VNINDEX%2CVN30%2CHNX30%2CHNX%2CUPCOM&amp;utm_source=banggia.dnse.com.vn&amp;utm_medium=widget"
      style={{ width: "100%", height: "380px", border: "none" }}
    ></iframe>
              <div className="mt-3 mb-4">
          <img
            width="100%"
            src="/uploads/banners/banner_giai_thuong_sach_quoc_gia.jpg"
            alt="banner"
          /></div>
    </div>
  );
}
