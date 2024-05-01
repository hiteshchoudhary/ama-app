"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema, usernameValidation } from "@/schemas/signUpSchema";
import { nextAuthClient } from "@/lib/supabase/private";
import { signInSchema } from "@/schemas/signInSchema";
import { loginUser } from "@/db/user";
import { AuthError } from "next-auth";
import { signIn } from "@/app/auth";

export async function login(data: z.infer<typeof signInSchema>) {

  const validateFields = signInSchema.safeParse(data);
  if (!validateFields.success) {
    return {
      type: "error",
      errors: validateFields.error.flatten().fieldErrors,
      message: "Invalid fields",
    };
  }

  const { identifier, password } = validateFields.data;

  try {
    await signIn("credentials", {
      identifier,
      password,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }

    throw error;
  }

  const user = await loginUser(identifier, password);

  if (!user) {
    return {
      type: "error",
      message: "Invalid credentials",
    };
  }

}



export async function saveUser(data: z.infer<typeof signUpSchema>) {
  const { username, email, password } = data
  const { data:user, error } = await nextAuthClient
  .from("users")
  .select("username, isVerified")
  .or(`username.eq.${username},email.eq.${email}`)
  .eq("isVerified", true)

  console.log("user", user)

  if (user?.length !== 0) {
    return {
      type: "error",
      message: "User already exists with this email",
    };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);

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
    if (data.length === 0) {
      return {
        type: "success",
        message: "Username is unique",
      };
    } else {
      return {
        type: "error",
        message: "Username is already taken.",
      };
    }
  } catch (error) {
    console.error("Error checking username:", error);
    return {
      type: "error",
      message: "An error occurred while checking the username.",
    };
  }
}
