import React from "react";
import {
  animations,
  TypicalActivityProps,
  VolumeActivityProps,
} from "./DynamicIsland";
import { AnimatePresence, motion } from "motion/react";
import { Volume, Volume1, Volume2, VolumeOff } from "lucide-react";

function VolumeActivity({
  level,
  size,
}: TypicalActivityProps<VolumeActivityProps>) {
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
            {level > 70 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                key="volume2"
              >
                <Volume2 size={"1em"} fill="currentColor" className="ml-2" />
              </motion.div>
            ) : level > 35 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                key="volume1"
              >
                <Volume1 size={"1em"} fill="currentColor" className="ml-2" />
              </motion.div>
            ) : level > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                key="volume"
              >
                <Volume size={"1em"} fill="currentColor" className="ml-2" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: 35 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: -35 }}
                key="volume-off"
              >
                <VolumeOff size={"1em"} fill="currentColor" className="ml-2" />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              key={"sound-bar-level"}
              className="w-16 overflow-hidden h-1.5 rounded-full bg-muted-foreground"
            >
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

export default VolumeActivity;
