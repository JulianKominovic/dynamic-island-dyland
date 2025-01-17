import { Rewind, Pause, Play, FastForward } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";
import {
  animations,
  MusicActivityProps,
  TypicalActivityProps,
} from "./DynamicIsland";
import ysyaImage from "../../static/images/ysy-a.jpg";
import "./music-waves.css";
import Image from "next/image";
import NumberFlow from "@number-flow/react";

function MusicActivity({
  artist,
  audioSrc,
  duration,
  playback,
  position,
  title,
  setPlayback,
  setDuration,
  setPosition,
  size,
}: TypicalActivityProps<MusicActivityProps>) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isBig = size === "large";

  return (
    <motion.section
      initial="fadeOut"
      animate="fadeIn"
      exit="fadeOut"
      variants={animations}
      className="w-full h-full"
    >
      <audio
        ref={audioRef}
        loop
        hidden
        autoPlay
        src={audioSrc}
        onTimeUpdate={(e) => {
          setPosition(e.currentTarget.currentTime);
        }}
        onDurationChange={(e) => {
          setDuration(e.currentTarget.duration);
        }}
        onPlaying={() => {
          setPlayback("playing");
        }}
        onPause={() => {
          setPlayback("paused");
        }}
      />
      <motion.hgroup
        className="flex items-center gap-3"
        style={{
          justifyContent: isBig ? "start" : "space-between",
          marginBlockEnd: isBig ? 16 : 0,
        }}
      >
        <motion.div
          style={{
            height: isBig ? 48 : 20,
            width: isBig ? 56 : 20,
            borderRadius: isBig ? 16 : 8,
          }}
          className="relative flex-shrink-0 transition-all"
        >
          <Image
            className="absolute top-0 left-0 w-full h-full scale-125 blur-md saturate-[6]"
            src={ysyaImage}
            alt={title}
          />
          <Image
            className="relative z-10 w-full h-full rounded-lg"
            src={ysyaImage}
            alt={title}
          />
        </motion.div>
        <AnimatePresence mode="popLayout">
          {isBig ? (
            <motion.div
              initial="fadeOut"
              animate="fadeIn"
              exit="fadeOut"
              variants={animations}
              layout="preserve-aspect"
              className="flex-grow overflow-hidden"
            >
              <motion.p className="text-sm font-bold leading-tight tracking-tight text-left text-white truncate">
                {title}
              </motion.p>
              <motion.span className="block text-xs font-bold leading-tight tracking-tight text-left truncate text-muted-foreground">
                {artist}
              </motion.span>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <motion.div
          className="flex-shrink-0 boxContainer"
          style={
            {
              height: isBig ? 16 : 16,
              opacity: playback === "playing" ? 1 : 0,
              marginInlineStart: isBig ? 12 : 0,
              marginInlineEnd: isBig ? 8 : 0,
              "--boxSize": isBig ? "3px" : "2px",
              "--gutter": isBig ? "3px" : "2px",
            } as any
          }
        >
          <motion.div className="box !bg-muted-foreground box1"></motion.div>
          <motion.div className="box !bg-muted-foreground box2"></motion.div>
          <motion.div className="box !bg-muted-foreground box3"></motion.div>
          <motion.div className="box !bg-muted-foreground box4"></motion.div>
          <motion.div className="box !bg-muted-foreground box5"></motion.div>
        </motion.div>
      </motion.hgroup>
      <AnimatePresence>
        {isBig ? (
          <>
            <motion.hgroup className="flex items-center justify-between gap-4 px-3 mb-2">
              <motion.p className="block text-[10px] font-semibold leading-tight text-left truncate text-muted-foreground tabular-nums">
                <NumberFlow
                  value={Math.floor(position / 60)}
                  format={{ minimumIntegerDigits: 2 }}
                />
                {":"}
                <NumberFlow
                  value={Math.floor(position % 60)}
                  format={{ minimumIntegerDigits: 2 }}
                />
              </motion.p>
              <motion.input
                className="flex-grow h-1 bg-white"
                initial="fadeOut"
                animate="fadeIn"
                exit="fadeOut"
                variants={animations}
                type="range"
                min={0}
                max={duration}
                value={position}
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Number(e.target.value);
                    setPosition(Number(e.target.value));
                  }
                }}
              />
              <motion.p className="block text-[10px] font-semibold leading-tight text-left truncate text-muted-foreground tabular-nums">
                {Math.floor(duration / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor(duration % 60)
                  .toString()
                  .padStart(2, "0")}
              </motion.p>
            </motion.hgroup>
            <motion.hgroup className="flex items-center justify-center gap-2">
              <motion.button
                className="text-2xl flex items-center justify-center rounded-[50%] p-2 transition-colors aspect-square text-white"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                  }
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Rewind fill="currentColor" size={"1em"} />
              </motion.button>
              <motion.button
                className="text-3xl flex items-center justify-center rounded-[50%] p-3 transition-colors aspect-square text-white"
                onClick={() => {
                  if (audioRef.current) {
                    if (playback === "playing") {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play();
                    }
                  }
                }}
              >
                {playback === "playing" ? (
                  <motion.div
                    key="pause-icon"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Pause fill="currentColor" size={"1em"} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play-icon"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Play fill="currentColor" size={"1em"} />
                  </motion.div>
                )}
              </motion.button>
              <motion.button
                className="text-2xl flex items-center justify-center rounded-[50%] p-2 transition-colors aspect-square text-white"
                whileTap={{ scale: 0.9 }}
              >
                <FastForward fill="currentColor" size={"1em"} />
              </motion.button>
            </motion.hgroup>
          </>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

export default MusicActivity;
