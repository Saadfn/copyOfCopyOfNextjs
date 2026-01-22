
import AppGate from "../../components/AppGate";
import BillingList from "../../pages/BillingList";

export default function BillingPage() {
  return (
    <AppGate>
      <BillingList />
    </AppGate>
  );
}
