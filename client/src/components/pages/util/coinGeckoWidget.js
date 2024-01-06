import React, { useEffect, useState } from "react";
import axios from "axios";

const CoinGeckoWidget = () => {
  const [coinData, setCoinData] = useState([]);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,eos,ethereum,litecoin,ripple,binancecoin,venus-ltc,lunar-2,solana,adapad,dogecoin&vs_currencies=vnd"
        );

        setCoinData(response.data);
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error);
      }
    };

    fetchCoinData();
  }, []);

  return (
    <div>
      {Object.keys(coinData).map((coinId) => (
        <div key={coinId}>
          {coinId}: {coinData[coinId].vnd}
        </div>
      ))}
    </div>
  );
};

export default CoinGeckoWidget;
