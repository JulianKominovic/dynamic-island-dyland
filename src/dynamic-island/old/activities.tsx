import { useContext } from "react";
import BrightnessActivity from "./activities/brightness";
import { DynamicbarContext } from "./context";
import MultimediaActivity from "./activities/multimedia";

function Activities() {
  const { activity } = useContext(DynamicbarContext);
  if (!activity) return null;
  switch (activity.type) {
    case "BRIGHTNESS_CHANGE":
      return <BrightnessActivity />;
    case "MULTIMEDIA_CHANGE":
      return <MultimediaActivity />;
    default:
      return null;
  }
}

export default Activities;
