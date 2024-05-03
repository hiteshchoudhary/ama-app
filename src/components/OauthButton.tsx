// import { signOut } from "next-auth/react";
import { SignIn, SignOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutBtn(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={SignOut}>
      <Button variant="destructive" {...props}>
        Sign Out
      </Button>
    </form>
    // <Button variant='destructive' onClick={() => signOut()} {...props}>
    //   Sign Out
    // </Button>
  );
}

export function SignInBtn(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={SignIn}>
      <Button {...props}>Sign In with Github</Button>
    </form>
  );
}
