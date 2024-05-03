"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema, usernameValidation } from "@/schemas/signUpSchema";
import { nextAuthClient } from "@/lib/supabase/private";
import { signInSchema } from "@/schemas/signInSchema";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/app/auth";
import { createUser } from "@/db/user";

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
      redirect: false,
      identifier,
      password,
    });
  } catch (error: any) {
    if (error instanceof CredentialsSignin) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            type: "error",
            message: "Invalid credentials",
          };
        default:
          return {
            type: "error",
            message: "Something went wrong",
          };
      }
    } else if (error.code === 'login-with-oauth'){
      return {
        type: "error",
        message: "If you previously login with Github, please login with github."
      };
    } else {
      return {
        type: "error",
        message: "Something went wrong",
      };
    }
  }
}

export async function saveUser(data: z.infer<typeof signUpSchema>) {
  const { username, email, password } = data;
  const { data: user, error } = await nextAuthClient
    .from("users")
    .select("username, isVerified")
    .or(`username.eq.${username},email.eq.${email}`)
    .eq("isVerified", true);

  console.log("user", user);

  if (user?.length !== 0) {
    return {
      type: "error",
      message: "User already exists with this email",
    };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const response = await createUser(username, email, hashedPassword);
  console.log("response", response);
  return response;
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
