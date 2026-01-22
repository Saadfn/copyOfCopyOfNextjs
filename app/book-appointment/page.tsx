
import AppGate from "../../components/AppGate";
import PatientAppointmentForm from "../../pages/PatientAppointmentForm";

export default function BookAppPage() {
  return (
    <AppGate>
      <PatientAppointmentForm />
    </AppGate>
  );
}
