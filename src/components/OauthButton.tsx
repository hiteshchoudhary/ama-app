// import { signOut } from "next-auth/react";
import { signOut } from "@/app/auth";
import { Button } from "@/components/ui/button";

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button variant="destructive" {...props}>
        Sign Out
      </Button>
    </form>
    // <Button variant='destructive' onClick={() => signOut()} {...props}>
    //   Sign Out
    // </Button>
  );
}
