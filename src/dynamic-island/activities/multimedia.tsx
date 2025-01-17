import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useContext, useEffect } from "react";
import { DynamicbarContext, MultimediaChangeActivity } from "../context";
import { convertFileSrc } from "@tauri-apps/api/core";
import clsx from "clsx";

type Props = {};

function Wrapper({ children, className }: any) {
  return (
    <motion.section
      layout
      className={clsx(
        "flex items-center justify-between w-full h-full py-1",
        className
      )}
    >
      {children}
    </motion.section>
  );
}
// function Idle() {
//   const { activity } = useContext(DynamicbarContext);
//   const { metadata } = activity as MultimediaChangeActivity;
//   return (
//     <Wrapper>
//       <motion.img
//         layoutId="multimedia-cover"
//         className="w-5 h-5 rounded-md"
//         src={convertFileSrc(metadata.cover_url.replace("file://", ""))}
//       ></motion.img>

//       <motion.div
//         layoutId="multimedia-waves"
//         className="music-waves-container !h-3"
//       >
//         <motion.div className="!bg-neutral-200 rounded-full box box1"></motion.div>
//         <motion.div className="!bg-neutral-200 rounded-full box box2"></motion.div>
//         <motion.div className="!bg-neutral-200 rounded-full box box3"></motion.div>
//         <motion.div className="!bg-neutral-200 rounded-full box box4"></motion.div>
//         <motion.div className="!bg-neutral-200 rounded-full box box5"></motion.div>
//       </motion.div>
//     </Wrapper>
//   );
// }
// function Hovering() {
//   const { activity } = useContext(DynamicbarContext);
//   const { metadata, mute, playing, position, type, volume } =
//     activity as MultimediaChangeActivity;
//   return (
//     <motion.section
//       className="p-1"
//       initial={{ filter: "blur(0px)" }}
//       animate={{ filter: "blur(0px)" }}
//       transition={{ duration: 0.5 }}
//     >
//       <motion.div className="h-20">
//         <Wrapper>
//           <motion.img
//             layoutId="multimedia-cover"
//             className="w-16 h-16 aspect-square rounded-2xl"
//             src={convertFileSrc(metadata.cover_url.replace("file://", ""))}
//           ></motion.img>

//           <motion.div
//             layoutId="multimedia-waves"
//             className="!h-6 music-waves-container"
//           >
//             <motion.div className="!bg-neutral-200 rounded-full box box1"></motion.div>
//             <motion.div className="!bg-neutral-200 rounded-full box box2"></motion.div>
//             <motion.div className="!bg-neutral-200 rounded-full box box3"></motion.div>
//             <motion.div className="!bg-neutral-200 rounded-full box box4"></motion.div>
//             <motion.div className="!bg-neutral-200 rounded-full box box5"></motion.div>
//           </motion.div>
//         </Wrapper>
//       </motion.div>
//     </motion.section>
//   );
// }
function MultimediaActivity({}: Props) {
  const { hovering } = useContext(DynamicbarContext);
  const { activity } = useContext(DynamicbarContext);
  const { metadata } = activity as MultimediaChangeActivity;
  const blurControl = useAnimation();
  useEffect(() => {
    blurControl
      .start(
        {
          filter: "blur(8px)",
          scale: 0.9,
        },
        { ease: "easeIn", duration: 0.1 }
      )
      .finally(() => {
        blurControl.start(
          {
            filter: "blur(0px)",
            scale: 1,
          },
          { ease: "easeOut", duration: 0.3 }
        );
      });
  }, [hovering, blurControl]);
  // if (hovering) return <Hovering />;
  // return <Idle />;
  return (
    <motion.section
      layout
      className={clsx("flex justify-between items-center")}
      style={{
        height: hovering ? 64 : 24,
        padding: 0,
      }}
    >
      <motion.div className="flex gap-4 " layout>
        <motion.img
          layoutId="multimedia-cover"
          className=""
          animate={blurControl}
          style={{
            width: hovering ? 48 : 20,
            height: hovering ? 48 : 20,
            borderRadius: hovering ? 16 : 6,
          }}
          src={convertFileSrc(metadata.cover_url.replace("file://", ""))}
        ></motion.img>
        <AnimatePresence>
          {hovering ? (
            <motion.hgroup
              className="flex flex-col items-start justify-center "
              initial={{ opacity: 0, filter: "blur(8px)", scale: 0.9 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(8px)", scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                layoutId="multimedia-title"
                className="text-sm font-semibold truncate max-w-[20ch] text-ellipsis"
              >
                {metadata.title}
              </motion.h1>
              <motion.h2
                layoutId="multimedia-artist"
                className="text-xs font-light truncate max-w-[20ch] text-ellipsis"
              >
                {metadata.artists.join(", ")}
              </motion.h2>
            </motion.hgroup>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div
        layoutId="multimedia-waves"
        className="flex-shrink-0 music-waves-container"
        style={{
          height: 16,
        }}
        animate={blurControl}
      >
        <motion.div className="!bg-neutral-200 rounded-full box box1"></motion.div>
        <motion.div className="!bg-neutral-200 rounded-full box box2"></motion.div>
        <motion.div className="!bg-neutral-200 rounded-full box box3"></motion.div>
        <motion.div className="!bg-neutral-200 rounded-full box box4"></motion.div>
        <motion.div className="!bg-neutral-200 rounded-full box box5"></motion.div>
      </motion.div>
    </motion.section>
  );
}

export default MultimediaActivity;
