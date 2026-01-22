
import AppGate from "../../components/AppGate";
import RoomManagement from "../../pages/RoomManagement";

export default function RoomsPage() {
  return (
    <AppGate>
      <RoomManagement />
    </AppGate>
  );
}
