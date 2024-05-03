import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { User } from "next-auth";
import { auth } from "@/app/auth";
import { SignOutBtn } from "./OauthButton";

export default async function Navbar() {
  const session = await auth();
  const user: User = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="/" className="text-xl font-bold mb-4 md:mb-0">
          True Feedback
        </a>
        {session ? (
          <div className="flex flex-row items-center gap-4">
            <span className="mr-4">Welcome, {user.username || user.email}</span>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full md:w-auto text-black">
                Dashboard
              </Button>
            </Link>
            <SignOutBtn className="w-full md:w-auto text-black" />
          </div>
        ) : (
          <Link href="/sign-in">
            <Button
              className="w-full md:w-auto bg-slate-100 text-black"
              variant={"outline"}
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
