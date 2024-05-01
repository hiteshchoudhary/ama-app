"use client"

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
    return (
      <Button variant='destructive' onClick={() => signOut()} {...props}>
        Sign Out
      </Button>
    );
  }
  