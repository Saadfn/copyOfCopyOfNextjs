
import AppGate from "../../components/AppGate";
import DoctorOverrideRequest from "../../pages/DoctorOverrideRequest";

export default function DrAvailPage() {
  return (
    <AppGate>
      <DoctorOverrideRequest />
    </AppGate>
  );
}
