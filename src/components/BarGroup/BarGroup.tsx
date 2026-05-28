import React from "react";
import "./BarGroup.css";

type BarGroupProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const BarGroup = ({
  label,
  value,
  className,
  onMouseEnter,
  onMouseLeave,
}: BarGroupProps) => (
  <div
    className={`bar-group ${className || ""}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <span className="bar-label">{label}</span>
    <span className="bar-value">{value}</span>
  </div>
);

export default BarGroup;
