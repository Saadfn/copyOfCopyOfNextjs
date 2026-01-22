
import AppGate from "../../components/AppGate";
import DatabaseManager from "../../pages/DatabaseManager";

export default function DbPage() {
  return (
    <AppGate>
      <DatabaseManager />
    </AppGate>
  );
}
