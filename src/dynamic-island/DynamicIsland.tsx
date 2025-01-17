"use client";
import { AnimatePresence, motion, Transition, Variant } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

import MusicActivity from "./MusicActivity";
import BrightnessActivity from "./BrightnessActivity";
import VolumeActivity from "./VolumeActivity";
import { Squircle } from "react-ios-corners";
import GooeyFilter from "./Gooey";
import BatteryActivity, { BatterySecondaryActivity } from "./BatteryActivity";

type PlaygroundAction = {
  fn: () => void;
  label: string;
};
export type TypicalActivityProps<T extends Activities> = T & {
  dimensions: DynamicIslandDimensions;
  size: DynamicIslandSizes;
};
export type DynamicIslandSizes = "small" | "ultrawide" | "medium" | "large";
type DynamicIslandDimensions = {
  width: number;
  height: number;
  borderRadius: number;
  paddingInline: number;
  paddingBlock: number;
};
export const sizes: Record<DynamicIslandSizes, DynamicIslandDimensions> = {
  small: {
    width: 120,
    height: 28,
    borderRadius: 64,
    paddingInline: 8,
    paddingBlock: 4,
  },
  ultrawide: {
    width: 200,
    height: 36,
    borderRadius: 64,
    paddingInline: 12,
    paddingBlock: 4,
  },
  medium: {
    width: 240,
    height: 56,
    borderRadius: 64,
    paddingInline: 12,
    paddingBlock: 4,
  },
  large: {
    width: 300,
    height: 160,
    borderRadius: 60,
    paddingInline: 16,
    paddingBlock: 16,
  },
};
export const transitions: Record<"springy" | "gentile", Transition> = {
  springy: {
    duration: 0.1,
    stiffness: 300,
    damping: 30,
    bounce: 0.1,
    mass: 2,
    type: "spring",
  },
  gentile: {
    duration: 0.2,
    stiffness: 50,
    damping: 14,
    bounce: 0.1,
    type: "spring",
  },
};
export const animations: Record<"fadeOut" | "fadeIn", Variant> = {
  fadeOut: {
    opacity: 0,
    scale: 0.5,
    filter: "blur(4px)",
  },
  fadeIn: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
};

function Idle({}: Activities) {
  return <div />;
}

export type IdleActivityProps = { type: "IDLE" };
export type BatteryActivityProps = {
  type: "BATTERY";
  charging: boolean;
  level: number;
};
export type VolumeActivityProps = { type: "VOLUME"; level: number };
export type BrightnessActivityProps = { type: "BRIGHTNESS"; level: number };
export type MusicActivityProps = {
  type: "MUSIC";
  artist: string;
  title: string;
  playback: "playing" | "paused";
  position: number;
  setPosition: (position: number) => void;
  setPlayback: (playback: "playing" | "paused") => void;
  setDuration: (duration: number) => void;
  duration: number;
  audioSrc: string;
};

type Activities =
  | IdleActivityProps
  | BatteryActivityProps
  | VolumeActivityProps
  | BrightnessActivityProps
  | MusicActivityProps;

function DynamicIslandPlayground() {
  const [size, setSize] = useState<DynamicIslandSizes>("small");
  const [activity, setActivity] = useState<Activities>({ type: "IDLE" });
  const [isHovered, setIsHovered] = useState(false);
  const [secondaryActivity, setSecondaryActivity] = useState<Activities>({
    type: "IDLE",
  });
  const timerRef = useRef<any>(null);
  const dimensions = sizes[size];

  useEffect(() => {
    switch (activity.type) {
      case "MUSIC":
        if (isHovered) setSize("large");
        else setSize("small");
        break;
      default:
        setSize(size);
        break;
    }
  }, [size, activity, isHovered, secondaryActivity]);

  function getPlaygroundActions(): PlaygroundAction[] {
    switch (activity.type) {
      case "BRIGHTNESS":
        return [
          {
            fn: () => {
              setActivity((prev: any) => ({
                type: "BRIGHTNESS",
                level: Math.max(0, prev.level - 5),
              }));
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "-5%",
          },
          {
            fn: () => {
              setActivity((prev: any) => ({
                type: "BRIGHTNESS",
                level: Math.min(100, prev.level + 5),
              }));
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "+5%",
          },
        ];
      case "BATTERY":
        return [
          {
            fn: () => {
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              setActivity((prev: any) => ({
                type: "BATTERY",
                ...prev,
                level: Math.max(0, prev.level - 5),
              }));
              setSecondaryActivity((prev: any) => ({
                type: "BATTERY",
                ...prev,
                level: Math.max(0, prev.level - 5),
              }));

              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "Discharge",
          },
          {
            fn: () => {
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              setActivity((prev: any) => ({
                type: "BATTERY",
                ...prev,
                level: Math.max(0, prev.level + 5),
              }));
              setSecondaryActivity((prev: any) => ({
                type: "BATTERY",
                ...prev,
                level: Math.max(0, prev.level + 5),
              }));
              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "Charge",
          },

          {
            fn: () => {
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              setActivity((prev: any) => ({
                type: "BATTERY",
                ...prev,
                charging: !prev.charging,
              }));
              setSecondaryActivity((prev: any) => ({
                type: "BATTERY",
                ...prev,
                charging: !prev.charging,
              }));

              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "Toggle charging " + (activity.charging ? "on" : "off"),
          },
        ];
      case "VOLUME":
        return [
          {
            fn: () => {
              setActivity((prev: any) => ({
                type: "VOLUME",
                level: Math.max(0, prev.level - 5),
              }));
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "-5%",
          },
          {
            fn: () => {
              setActivity((prev: any) => ({
                type: "VOLUME",
                level: Math.min(100, prev.level + 5),
              }));
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                setSize("small");
              }, 3000);
            },
            label: "+5%",
          },
        ];
      default:
        return [];
    }
  }

  return (
    <>
      <div className="w-full max-w-screen-sm p-0 py-4 mt-8 mb-8 bg-white rounded-lg shadow-none sm:p-8 h-72">
        <div className="relative mx-auto w-fit">
          <Squircle
            className="relative z-10 overflow-hidden bg-black"
            radius={sizes[size].borderRadius}
            style={{
              borderRadius:
                size === "small" || size === "ultrawide"
                  ? sizes["small"].borderRadius
                  : 0,
            }}
          >
            <motion.div
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="w-0 h-0 transition duration-300 ease-in-out bg-black"
              style={{
                paddingInline: sizes[size].paddingInline,
                paddingBlock: sizes[size].paddingBlock,
              }}
              initial={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }}
              animate={{
                width: sizes[size].width,
                height: sizes[size].height,
                opacity: 1,
                filter: "blur(0px)",
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.1,
                },
              }}
              exit={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }}
            >
              <AnimatePresence>
                {activity.type === "IDLE" ? (
                  <Idle key={"idle-activity"} {...activity} />
                ) : activity.type === "MUSIC" ? (
                  <MusicActivity
                    key={"music-activity"}
                    size={size}
                    dimensions={dimensions}
                    {...activity}
                  />
                ) : activity.type === "BRIGHTNESS" ? (
                  <BrightnessActivity
                    key={"brightness-activity"}
                    size={size}
                    dimensions={dimensions}
                    {...activity}
                  />
                ) : activity.type === "VOLUME" ? (
                  <VolumeActivity
                    key={"volume-activity"}
                    size={size}
                    dimensions={dimensions}
                    {...activity}
                  />
                ) : activity.type === "BATTERY" ? (
                  <BatteryActivity
                    key={"battery-activity"}
                    size={size}
                    dimensions={dimensions}
                    {...activity}
                  />
                ) : null}
              </AnimatePresence>
            </motion.div>
          </Squircle>
          <div
            className="absolute top-0 left-0 w-full h-full bg-black rounded-full"
            style={{
              filter: "url(#goo-effect)",
              opacity: secondaryActivity.type === "IDLE" ? 0 : 1,
            }}
            key={"secondary-activity-gooey-filter"}
          >
            <AnimatePresence>
              {secondaryActivity.type === "IDLE" || size !== "small" ? null : (
                <motion.div
                  key="secondary-activity-gooey"
                  className="bg-black rounded-[50%] overflow-hidden absolute right-0 -top-1.5"
                  initial={{
                    scale: 0,
                    scaleY: 0,
                    scaleX: 2,
                    x: -4,
                    transformOrigin: "right",
                  }}
                  animate={{
                    scale: 1,
                    scaleY: 1,
                    scaleX: 1,
                    x: 46,
                    height: sizes["small"].height + 12,
                    width: sizes["small"].height + 12,
                    transformOrigin: "right",
                  }}
                  exit={{
                    scale: 0,
                    scaleY: 0,
                    scaleX: 2,
                    x: -4,
                    transformOrigin: "right",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                    bounce: 0.2,
                    mass: 2,
                  }}
                >
                  <motion.div
                    key="secondary-activity-container"
                    style={{
                      padding: 6,
                    }}
                    className="w-full h-full relative rounded-[50%]"
                  >
                    {secondaryActivity.type === "BATTERY" ? (
                      <BatterySecondaryActivity
                        key={"battery-secondary-activity"}
                        size={size}
                        dimensions={dimensions}
                        {...secondaryActivity}
                      />
                    ) : null}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <ul className="flex flex-wrap justify-center gap-2 mx-auto mt-8 mb-4">
          {getPlaygroundActions().map((action) => (
            <li key={action.label + "action"}>
              <Button variant={"ghost"} onClick={action.fn}>
                {action.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-wrap gap-2 mb-4">
        <li>
          <Button onClick={() => setActivity({ type: "IDLE" })}>Idle</Button>
        </li>
        <li>
          <Button
            onClick={() =>
              setActivity({
                type: "MUSIC",
                artist: "Ysy A, SPONSOR DIOS",
                title: "A Por Todo",
                playback: "playing",
                position: 0,
                setPlayback: (playback) =>
                  setActivity((prev) => ({ ...prev, playback })),
                setDuration: (duration) =>
                  setActivity((prev) => ({ ...prev, duration })),
                setPosition: (position) =>
                  setActivity((prev) => ({ ...prev, position })),
                duration: 1,
                audioSrc: "/sound/a-por-todo-ysya.mp3",
              })
            }
          >
            Music
          </Button>
        </li>
        <li>
          <Button
            onClick={() => {
              setActivity({ type: "BRIGHTNESS", level: 30 });
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => setSize("small"), 3000);
            }}
          >
            Brightness
          </Button>
        </li>
        <li>
          <Button
            onClick={() => {
              setActivity({ type: "VOLUME", level: 30 });
              setSize("ultrawide");
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => setSize("small"), 3000);
            }}
          >
            Volume
          </Button>
        </li>
        <li>
          <Button
            onClick={() => {
              setActivity({ type: "BATTERY", charging: false, level: 50 });
              setSecondaryActivity({
                type: "BATTERY",
                charging: false,
                level: 50,
              });
            }}
          >
            Battery
          </Button>
        </li>
      </ul>
      <ul className="flex flex-wrap gap-2 mb-16">
        {Object.keys(sizes).map((key) => (
          <li key={key + "size"}>
            <Button
              variant={size === key ? "soft" : "ghost"}
              onClick={() => {
                setActivity({ type: "IDLE" });
                setSize(key as DynamicIslandSizes);
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          </li>
        ))}
      </ul>
      {/*  IMPORTANT FOR GOOEY EFFECT */}
      <GooeyFilter />
    </>
  );
}

export default DynamicIslandPlayground;
