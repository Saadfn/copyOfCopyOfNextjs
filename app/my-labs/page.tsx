
import AppGate from "../../components/AppGate";
import PatientLabTests from "../../pages/PatientLabTests";

export default function MyLabsPage() {
  return (
    <AppGate>
      <PatientLabTests />
    </AppGate>
  );
}
