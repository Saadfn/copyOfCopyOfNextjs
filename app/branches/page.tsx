
import AppGate from "../../components/AppGate";
import BranchManagement from "../../pages/BranchManagement";

export default function BranchPage() {
  return (
    <AppGate>
      <BranchManagement />
    </AppGate>
  );
}
