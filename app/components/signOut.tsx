import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

export default function SignOut() {
  return (
    <div>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
}