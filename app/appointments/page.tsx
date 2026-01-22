
import AppGate from "../../components/AppGate";
import AppointmentList from "../../pages/AppointmentList";

export default function AppointmentsPage() {
  return (
    <AppGate>
      <AppointmentList />
    </AppGate>
  );
}
