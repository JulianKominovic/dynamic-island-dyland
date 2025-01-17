import React from "react";
import {
  animations,
  BatteryActivityProps,
  TypicalActivityProps,
} from "./DynamicIsland";
import { AnimatePresence, motion } from "motion/react";
import RadialProgress from "./RadialProgress";
import NumberFlow from "@number-flow/react";

function BatteryActivity({
  size,
  charging,
  level,
}: TypicalActivityProps<BatteryActivityProps>) {
  return (
    <motion.section
      initial="fadeOut"
      animate="fadeIn"
      exit="fadeOut"
      variants={animations}
      className="flex items-center justify-between w-full h-full gap-3 text-lg text-white"
    >
      <AnimatePresence>
        {size === "small" ? null : (
          <>
            <motion.p
              initial="fadeOut"
              animate="fadeIn"
              exit="fadeOut"
              variants={animations}
              className="text-xs"
            >
              {charging
                ? "Charging"
                : level < 20
                ? "Low battery"
                : "Discharging"}
            </motion.p>
            <motion.div
              initial="fadeOut"
              animate="fadeIn"
              exit="fadeOut"
              variants={animations}
              className="flex items-center gap-1 text-2xl transition-colors"
              style={{
                color:
                  level > 80
                    ? "lime"
                    : level > 60
                    ? "lawngreen"
                    : level > 40
                    ? "yellow"
                    : level > 20
                    ? "orange"
                    : "red",
              }}
            >
              <NumberFlow
                value={level / 100}
                format={{
                  style: "percent",
                  roundingMode: "trunc",
                }}
                className="text-sm font-semibold tabular-nums"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  className="transition-[width] duration-500"
                  width={(level / 100) * 16}
                  height="10"
                  x="2"
                  y="7"
                  rx="2"
                  ry="2"
                ></rect>
                <rect
                  width="16"
                  opacity="0.4"
                  height="10"
                  x="2"
                  y="7"
                  rx="2"
                  ry="2"
                ></rect>
                <line x1="22" x2="22" y1="11" y2="13"></line>
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export function BatterySecondaryActivity({
  level,
}: TypicalActivityProps<BatteryActivityProps>) {
  const color =
    level > 80
      ? "lime"
      : level > 60
      ? "lawngreen"
      : level > 40
      ? "yellow"
      : level > 20
      ? "orange"
      : "red";
  return (
    <RadialProgress
      size={28}
      progress={level}
      style={{
        color,
      }}
      className="flex items-center justify-center text-xs font-semibold tabular-nums"
    >
      <NumberFlow value={level} />
    </RadialProgress>
  );
}

export default BatteryActivity;
