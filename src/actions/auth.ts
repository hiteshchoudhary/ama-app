"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema, usernameValidation } from "@/schemas/signUpSchema";
import { nextAuthClient } from "@/lib/supabase/private";

export async function saveUser() {
  // const hashedPassword = await bcrypt.hash(password, 10);
}

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});
export async function checkUniqueEmail(username: string) {
  const validatedFields = UsernameQuerySchema.safeParse({
    username: username,
  });

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid username",
    };
  }

  try {
    const { data, error } = await nextAuthClient
      .from("users")
      .select("username")
      .eq("username", validatedFields.data.username);
    if (error) {
      console.log("Error", error);
      return {
        type: "error",
        message: "Database Error: Failed to check username.",
      };
    }
    if(data[0].username){

    }
  } catch (error) {
    console.error("Error checking username:", error);
    return {
      type: "error",
      message: "An error occurred while checking the username.",
    };
  }
}
