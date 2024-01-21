import React, { useEffect } from "react";

const GiaNgoaiTe = () => {
  useEffect(() => {
    const iframe = document.getElementById("embed-table");

    if (iframe && iframe.contentWindow) {
      const scrollableElement = iframe.contentDocument.getElementById("embed-table");

      if (scrollableElement) {
        // Cuộn đến phần tử "embed-table" trong iframe với hiệu ứng mượt
        scrollableElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  return (
    <React.Fragment>
      {/* <iframe
        title="Tỷ giá ngoại tệ"
        style={{ border: "none", width: "95%", height: "480px" }}
        src="https://tygiado.com/nhung-ngoai-te/"
      ></iframe> */}

<iframe class="contain-exchange-rate" style={{ border: "none", width: "95%", height: "480px" }} src="https://online.topi.vn/embed/ty-gia-usd-vnd"></iframe>
    </React.Fragment>
  );
};

export default GiaNgoaiTe;