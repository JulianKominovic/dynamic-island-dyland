import DynamicIsland from "./dynamic-island/old";
import DynamicbarProvider from "./dynamic-island/old/context";
function App() {
  return (
    <DynamicbarProvider>
      <main className="h-screen pt-0.5 overflow-hidden">
        <DynamicIsland></DynamicIsland>
      </main>
    </DynamicbarProvider>
  );
}

export default App;
