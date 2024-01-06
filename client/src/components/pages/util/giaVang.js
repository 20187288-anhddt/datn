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
      <iframe
      title="Gía vàng"
        style={{ border: "none", width: "100%", height: "800px" }}
        src="https://tygiado.com/nhung-gia-vang/"
      ></iframe>
    </div>
  );
}
