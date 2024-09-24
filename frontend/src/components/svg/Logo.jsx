import React from "react";

export default function Logo({ style }) {
  return (
    <div
      style={{
        maxWidth: "60px",
        maxHeight: "60px",
        overflow: "hidden",
        ...style,
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 92 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.32871 1.81909H26.3194L57.3865 45.802L45.2227 62.5228L26.3194 89.785H0.51123L33.4076 45.802L2.32871 1.81909Z"
          fill="white"
        />
        <path
          d="M64.4872 0L48.8569 22.9002L61.9428 41.075L91.0224 0H64.4872Z"
          fill="white"
        />
        <path
          d="M63.8434 90L48.2131 67.0998L61.299 48.925L90.3786 90H63.8434Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
