
import AppGate from "../../components/AppGate";
import LabManagement from "../../pages/LabManagement";

export default function LabAdminPage() {
  return (
    <AppGate>
      <LabManagement />
    </AppGate>
  );
}
