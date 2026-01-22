
import AppGate from "./components/AppGate";
import Dashboard from "./pages/Dashboard";

export default function Home() {
  return (
    <AppGate>
      <Dashboard />
    </AppGate>
  );
}
