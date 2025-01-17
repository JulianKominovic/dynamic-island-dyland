import React from "react";
import "./radial-progress.css";
import clsx from "clsx";
type Props = {
  children?: React.ReactNode;
  progress: number;
  size: number;
} & React.HTMLAttributes<HTMLDivElement>;

function RadialProgress({
  children,
  progress,
  size,
  className,
  style,
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      style={
        {
          ...style,
          left: "2px",
          "--value": progress,
          "--size": size - 4 + "px",
        } as any
      }
      className={clsx("radial-progress", className)}
    >
      {children}
    </div>
  );
}

export default RadialProgress;
