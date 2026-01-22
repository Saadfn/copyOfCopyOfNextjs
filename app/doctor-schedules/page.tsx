
import AppGate from "../../components/AppGate";
import DoctorScheduleManager from "../../pages/DoctorScheduleManager";

export default function DrSchedPage() {
  return (
    <AppGate>
      <DoctorScheduleManager />
    </AppGate>
  );
}
