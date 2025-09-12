import React from "react";
import "./PiSymbol.css";

const PiSymbol = ({ size = 24, glow = true }) => {
  return (
    <span
      className={`pi-symbol ${glow ? "glow" : ""}`}
      style={{
        fontSize: size,
        color: 'inherit',
        fontFamily: 'Segoe UI, sans-serif'
      }}
    >
      ℼ
    </span>
  );
};

export default PiSymbol;