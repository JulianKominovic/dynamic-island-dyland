import { useContext } from "react";
import { BrightnessChangeActivity, DynamicbarContext } from "../context";
import { SunIcon } from "lucide-react";
import { motion } from "motion/react";
function BrightnessActivity() {
  const { activity } = useContext(DynamicbarContext);

  const { old, updated } = activity as BrightnessChangeActivity;
  console.log(old, updated);
  return (
    <motion.section className="flex items-center justify-between w-full h-full">
      <SunIcon
        fill="currentColor"
        className="fill-neutral-400 stroke-neutral-200"
        size={20}
      />
      <motion.div className="w-12 h-1.5 overflow-hidden rounded-full bg-neutral-500">
        <motion.span
          className="block h-full bg-white rounded-full"
          initial={{
            width: `${old}%`,
          }}
          animate={{
            width: `${updated}%`,
          }}
        ></motion.span>
      </motion.div>
    </motion.section>
  );
}

export default BrightnessActivity;
