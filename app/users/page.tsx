
import AppGate from "../../components/AppGate";
import UserManagement from "../../pages/UserManagement";

export default function UsersPage() {
  return (
    <AppGate>
      <UserManagement />
    </AppGate>
  );
}
