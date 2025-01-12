import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { greet } from "./bindings";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";

function App() {
  const [greeting, setGreeting] = useState("");
  return (
    <div className="container">
      <button
        onClick={() => {
          getCurrentWindow().setPosition(new PhysicalPosition(0, -100));
        }}
      >
        POSITION
      </button>
    </div>
  );
}

export default App;
