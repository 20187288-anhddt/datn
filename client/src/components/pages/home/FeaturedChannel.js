import React from "react";

export default function FeaturedChannel() {
  return (
    <React.Fragment>
      <div className="w-100 fanpage">
        <h3 className="mb-3 mt-4 text-red font-weight">Fanpage</h3>
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
        <div className="mt-3">
          <img
            width="100%"
            src="/uploads/banners/YANNews_Banner.png"
            alt="banner"
          /></div>
          
          <div >
          <a target="_blank" href="https://hotelmix.vn/weather/ho-chi-minh-city-18408,19487,33810"><img src="https://w.bookcdn.com/weather/picture/2_18408,19487,33810_1_33_ff1344_228_ffffff_333333_08488D_1_ffffff_333333_0_6.png?scode=70241&domid=1180&anc_id=98561"  alt="booked.net"/></a>
        </div>
        
      </div>
    </React.Fragment>
  );
}
