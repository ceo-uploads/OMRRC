import React from "react";

interface UnrealStudioLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const UnrealStudioLogo: React.FC<UnrealStudioLogoProps> = ({
  className = "",
  size = 20,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-1.5 shrink-0 select-none ${className}`}>
      <svg
        viewBox="280 60 270 320"
        style={{ width: `${size}px`, height: `${size * (310 / 270)}px` }}
        className="shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {/* Outer Boundary Shadow / Ring */}
          <polygon
            points="301.26,141.99 415.02,72.24 527.98,141.99 414.62,216.44"
            style={{ stroke: "rgba(0,0,0,0.18)", strokeMiterlimit: 10, fill: "none", strokeWidth: 12 }}
          />
          {/* Inner black Accent */}
          <polygon
            points="361.3,141.59 414.62,109.46 469.53,141.59 415.41,175.29"
            style={{ fill: "#000000" }}
          />
          {/* Left Main Segment (Blue) */}
          <polygon
            points="297.84,146.56 332.07,165.89 332.07,195.67 415.41,251.05 415.41,290.23 297.84,216.04"
            style={{ fill: "#29ABE2", stroke: "#009DE2", strokeWidth: 2, strokeMiterlimit: 10 }}
          />
          {/* Right Main Segment (Dark Blue) */}
          <polygon
            points="532.99,146.56 498.76,165.89 498.76,195.67 415.41,251.05 415.41,290.23 532.99,216.04"
            style={{ fill: "#0071BC", stroke: "#007BBC", strokeWidth: 2, strokeMiterlimit: 10 }}
          />
          {/* Left Lower Segment */}
          <polygon
            points="297.84,221.79 331.02,240.6 331.02,267.25 415.41,322.1 415.41,361.29 297.84,291.54"
            style={{ fill: "#29ABE2", stroke: "#009DE2", strokeWidth: 2, strokeMiterlimit: 10 }}
          />
          {/* Right Lower Segment */}
          <polygon
            points="532.99,221.79 498.49,242.69 498.49,270.38 415.41,322.1 415.41,361.29 532.99,291.54"
            style={{ fill: "#0071BC", stroke: "#007BBC", strokeWidth: 2, strokeMiterlimit: 10 }}
          />
        </g>
      </svg>
      {showText && (
        <span className="font-extrabold text-[11px] tracking-tight text-slate-800">
          Unreal <span className="text-[#0071BC]">Studio</span>
        </span>
      )}
    </div>
  );
};
