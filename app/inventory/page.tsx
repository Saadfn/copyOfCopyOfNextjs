
import AppGate from "../../components/AppGate";
import InventoryManagement from "../../pages/InventoryManagement";

export default function InventoryPage() {
  return (
    <AppGate>
      <InventoryManagement />
    </AppGate>
  );
}
