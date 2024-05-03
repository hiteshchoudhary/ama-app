"use server";
import { User } from "next-auth";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { auth } from "@/app/auth";
import supabase from "@/lib/supabase/private";
import { findUserByUsername } from "@/db/user";

export async function getMessages() {
  const session = await auth();
  const _user: User = session?.user;

  const userId = _user.id;

  // fetch all messages from the database
  const { data, error } = await supabase
    .from("Message")
    .select("*")
    .eq("user_id", userId)
    .order("createdAt", { ascending: false });

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

export async function sendMessage(username: string, content: string) {
  const data = await findUserByUsername(username);

  if (!data) {
    return {
      type: "error",
      message: "User not found",
    };
  }

  const userId = data.id;

  if (!data.isAcceptingMessages) {
    return {
      type: "error",
      message: `${data.username} are not accepting messages`,
    };
  }

  // save new message
  const { error } = await supabase
    .from("Message")
    .insert([{ user_id: userId, content }]);

  if (error) {
    return {
      type: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    type: "success",
    message: "Message sent successfully",
  };
}

export async function deleteMessage(messageId: string) {
  const session = await auth();
  const _user: User = session?.user;

  const userId = _user.id;

  const { error } = await supabase
    .from("Message")
    .delete()
    .eq("id", messageId)
    .eq("user_id", userId);

  if (error) {
    return {
      type: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    type: "success",
    message: "Message deleted successfully",
  };
}
