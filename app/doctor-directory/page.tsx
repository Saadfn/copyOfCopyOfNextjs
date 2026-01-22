
import AppGate from "../../components/AppGate";
import DoctorDirectory from "../../pages/DoctorDirectory";

export default function DocDirPage() {
  return (
    <AppGate>
      <DoctorDirectory />
    </AppGate>
  );
}
