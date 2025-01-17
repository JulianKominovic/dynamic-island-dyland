import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { listen } from "@tauri-apps/api/event";
import CONSTANTS from "../../constants";

import { invoke } from "@tauri-apps/api/core";

export type BrightnessChangeActivity = {
  type: "BRIGHTNESS_CHANGE";
  updated: number;
  old: number;
};
export type MultimediaChangeActivity = {
  type: "MULTIMEDIA_CHANGE";
  metadata: {
    title: string;
    artists: string[];
    album: string;
    year: number;
    genre: string;
    duration: number;
    cover_url: string;
  };
  volume: number;
  mute: boolean;
  playing: boolean;
  position: number;
};
type DynamicBarSettingsContextType = {
  hovering: boolean;
  size: "sm" | "md" | "lg";
  activity: BrightnessChangeActivity | MultimediaChangeActivity | undefined;
};

export const DynamicbarContext =
  React.createContext<DynamicBarSettingsContextType>({
    hovering: false,
    size: "md",
    activity: undefined,
  });

const ACTIVITY_TIMEOUT = 3000;

let oldBrightness = 0;
/**
 * The lower the number the higher the priority
 */
const ActivitiesPriorities: Record<
  NonNullable<DynamicBarSettingsContextType["activity"]>["type"],
  number
> = {
  BRIGHTNESS_CHANGE: 1,
  MULTIMEDIA_CHANGE: 2,
};

const DynamicbarProvider = ({ children }: any) => {
  const [hovering, setHovering] = React.useState(false);
  const timer = useRef<number | null>(null);
  const [activity, _setActivity] =
    useState<DynamicBarSettingsContextType["activity"]>(undefined);
  const size: DynamicBarSettingsContextType["size"] = useMemo(() => {
    let s: DynamicBarSettingsContextType["size"] = "sm";
    if (activity) {
      switch (activity.type) {
        case "BRIGHTNESS_CHANGE":
          s = "md";
          break;
        case "MULTIMEDIA_CHANGE":
          s = hovering ? "lg" : "sm";
          break;
        default:
          s = "sm";
      }
    }

    return s;
  }, [activity, hovering]);

  const setActivity = useCallback(
    (newActivity: DynamicBarSettingsContextType["activity"]) => {
      if (newActivity === undefined) {
        return _setActivity(undefined);
      }
      if (!activity) {
        return _setActivity(newActivity);
      }
      if (
        ActivitiesPriorities[newActivity.type] <
        ActivitiesPriorities[activity.type]
      ) {
        console.log("New activity has higher priority");
        return _setActivity(newActivity);
      }
    },
    []
  );

  function handleMouseOver() {
    setHovering(true);
  }
  function handleMouseOut() {
    setHovering(false);
  }
  function startResetTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setActivity(undefined);
    }, ACTIVITY_TIMEOUT) as any;
  }
  function handleBrightnessChange({
    payload: brightness,
  }: {
    payload: number;
  }) {
    setActivity({
      type: "BRIGHTNESS_CHANGE",
      updated: brightness,
      old: oldBrightness,
    });
    oldBrightness = brightness;
    startResetTimer();
  }
  function handleMultimediaChange({
    payload,
  }: {
    payload: Omit<MultimediaChangeActivity, "type">;
  }) {
    if (payload.playing) {
      setActivity({
        type: "MULTIMEDIA_CHANGE",
        ...payload,
      });
    }
    if (!payload.playing && activity?.type === "MULTIMEDIA_CHANGE") {
      setActivity(undefined);
    }
  }
  useEffect(() => {
    requestAnimationFrame(() => {
      invoke("update_window_size", { size }).catch(console.error);
    });
  }, [size]);
  useEffect(() => {
    const unlistedBrightnessChanges = listen(
      "brightness-changed",
      handleBrightnessChange
    );
    const unlistedMultimediaChanges = listen(
      "multimedia-changed",
      handleMultimediaChange
    );

    return () => {
      unlistedBrightnessChanges.then((clean) => clean());
      unlistedMultimediaChanges.then((clean) => clean());
    };
  }, [handleBrightnessChange, handleMultimediaChange]);
  React.useEffect(() => {
    // In Linux the mouseover and mouseout events are not triggered correctly due to the window manager

    if (CONSTANTS.OS_TYPE === "linux") {
      const unlistenMouseEnter = listen("mouse-enter", handleMouseOver);
      const unlistenMouseLeave = listen("mouse-leave", handleMouseOut);
      return () => {
        unlistenMouseEnter.then((clean) => clean());
        unlistenMouseLeave.then((clean) => clean());
      };
    }

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <DynamicbarContext.Provider
      value={{
        hovering,
        size,
        activity,
      }}
    >
      {children}
    </DynamicbarContext.Provider>
  );
};

export default DynamicbarProvider;
