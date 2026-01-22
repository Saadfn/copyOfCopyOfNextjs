
import AppGate from "../../components/AppGate";
import MedicineManagement from "../../pages/MedicineManagement";

export default function MedicineCatalogPage() {
  return (
    <AppGate>
      <MedicineManagement />
    </AppGate>
  );
}
