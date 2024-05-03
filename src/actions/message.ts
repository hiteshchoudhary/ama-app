"use server";
import { User } from "next-auth";
import { auth } from "@/app/auth";
import supabase from "@/lib/supabase/private";

export async function getMessages() {
  const session = await auth();
  const _user: User = session?.user;

  if (!session || !_user) {
    return {
      type: "error",
      message: "Not authenticated",
    };
  }

  const userId = _user.id;

  // fetch all messages from the database
  const { data, error } = await supabase
    .from("Message")
    .select("*")
    .eq("user_id", userId)
    .order("createdAt", { ascending: false });

  console.log("data", data);
  if (error) {
    return {
      type: "error",
      message: error.message,
    };
  }

  return {
    type: "success",
    messages: data,
  };
}
