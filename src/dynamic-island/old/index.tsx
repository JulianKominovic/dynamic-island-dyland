import { motion, useAnimation, useMotionValue, Variants } from "motion/react";
import { useContext, useEffect, useRef } from "react";
import { DynamicbarContext } from "../context";
import Activities from "../activities";

const SIZES = {
  sm: {
    h: 24,
    w: 160,
  },
  md: {
    h: 40,
    w: 320,
  },
  lg: {
    h: 160,
    w: 320,
  },
};

const DynamicIsland = () => {
  const { size, hovering } = useContext(DynamicbarContext);
  const { h, w } = SIZES[size];
  const controls = useAnimation();
  useEffect(() => {
    controls.start(hovering ? "hovering" : size);
    controls
      .start(
        {
          filter: "blur(2px)",
        },
        { ease: "easeInOut", duration: 0.1 }
      )
      .finally(() => {
        controls.start(
          {
            filter: "blur(0px)",
          },
          { ease: "easeInOut", duration: 0.1 }
        );
      });
  }, [hovering, size, controls]);

  const variants: Variants = {
    hovering: {
      // height: h * 1.25,
      // width: w * 1.1,
      height: h,
      width: w,
      scale: size === "sm" ? 1.1 : 1.03,
      // boxShadow:
      // "rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
      borderRadius: size === "sm" ? 16 : size === "md" ? 24 : 32,
      y: size === "sm" ? 4 : 8,
      boxShadow: "0px 0px 12px 0px rgb(0,0,0,0.4)",
    },
    sm: {
      height: h,
      width: w,
      scale: 1,
      y: 0,
      boxShadow: "0px 0px 0px 0px rgb(0,0,0,0)",
      borderRadius: 12,
    },
    md: {
      height: h,
      width: w,
      scale: 1,
      y: 8,
      boxShadow: "0px 0px 12px 0px rgb(0,0,0,0.6)",
      borderRadius: 24,
    },
    lg: {
      height: h,
      width: w,
      scale: 1,
      y: 16,
      boxShadow: "0px 0px 12px 0px rgb(0,0,0,0.6)",
      borderRadius: 32,
    },
  };

  return (
    <motion.div
      className="px-3 mx-auto overflow-hidden bg-black"
      initial={size}
      variants={variants}
      animate={controls}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        bounce: 0.1,
        duration: 1,
      }}
    >
      <Activities />
    </motion.div>
  );
};

export default DynamicIsland;
