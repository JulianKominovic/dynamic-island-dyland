const { St, Clutter, GLib } = imports.gi;
const Main = imports.ui.main;

let dynamicIsland;

function enable() {
  dynamicIsland = new St.Widget({
    style_class: "dynamic-island",
    reactive: true,
    width: 300,
    height: 100,
    x: 500,
    y: 50,
    layout_manager: new Clutter.BinLayout(),
  });

  Main.uiGroup.add_child(dynamicIsland);

  // Abrir tu app Tauri
  const appPath =
    "/bin/sh -c 'cd ~/dynamic-island-dyland/ && pnpm run tauri dev'";
  GLib.spawn_async(null, [appPath], null, GLib.SpawnFlags.SEARCH_PATH, null);

  //   // Opcional: Enviar la posición de la Dynamic Island a tu app Tauri
  //   const [x, y] = dynamicIsland.get_transformed_position();
  //   sendPositionToTauri(x, y);
}

function disable() {
  if (dynamicIsland) {
    dynamicIsland.destroy();
    dynamicIsland = null;
  }
}
