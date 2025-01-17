import React from "react";
import {
  animations,
  BrightnessActivityProps,
  TypicalActivityProps,
} from "./DynamicIsland";
import { AnimatePresence, motion } from "motion/react";
import { Sun } from "lucide-react";

function BrightnessActivity({
  level,
  size,
}: TypicalActivityProps<BrightnessActivityProps>) {
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
            <Sun size={"1em"} fill="currentColor" className="ml-2" />
            <motion.div className="w-16 overflow-hidden h-1.5 rounded-full bg-muted-foreground">
              <motion.div
                className="w-full h-full origin-left bg-white rounded-full"
                initial={{
                  scaleX: 0.1,
                }}
                animate={{
                  scaleX: level / 100,
                }}
              ></motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default BrightnessActivity;
