
'use client';

import AppGate from "../../components/AppGate";
import PatientProfilePage from "../../pages/PatientProfilePage";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  
  const handleComplete = () => {
    // Rely on router navigation instead of window.location.reload()
    // This allows Next.js to handle the transition smoothly
    router.push('/');
  };

  return (
    <AppGate>
      <PatientProfilePage onComplete={handleComplete} />
    </AppGate>
  );
}
