
import AppGate from "../../components/AppGate";
import PatientList from "../../pages/PatientList";

export default function PatientsListPage() {
  return (
    <AppGate>
      <PatientList />
    </AppGate>
  );
}
