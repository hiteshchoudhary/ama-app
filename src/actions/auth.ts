"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema, usernameValidation } from "@/schemas/signUpSchema";
import { nextAuthClient } from "@/lib/supabase/private";
import { signInSchema } from "@/schemas/signInSchema";
import { CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/app/auth";
import { createUser, findUserByUsername, getUserEmail } from "@/db/user";

export async function SignIn() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function SignOut() {
  await signOut();
}

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
    } else if (error.code === "login-with-oauth") {
      return {
        type: "error",
        message:
          "If you previously login with Github, please login with github.",
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

  if (error) {
    return {
      type: "error",
      message: "Database Error: Failed to check user.",
    };
  }

  if (user?.length !== 0) {
    return {
      type: "error",
      message: "User already exists with this email",
    };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const response = await createUser(username, email, hashedPassword);
  if (response.type === "error") {
    return response;
  }
  let token = Math.floor(100000 + Math.random() * 900000).toString();
  let expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15);

  // save token to the verifyCode table
  const { error: verificationError } = await nextAuthClient
    .from("verification_tokens")
    .upsert([{ identifier: username, token, expires }]);

  if (verificationError) {
    return {
      type: "error",
      message: "Database Error: Failed to send verification token.",
    };
  }

  const emailResponse = await sendVerificationEmail(email, username, token);

  if (!emailResponse.success) {
    return {
      type: "error",
      message: "Failed to send verification email",
    };
  }

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

export async function verifyCode(username: string, code: string) {
  const { data, error: verificationError } = await nextAuthClient
    .from("verification_tokens")
    .select("*")
    .eq("identifier", username)
    .single();
  if (!data) {
    return {
      type: "error",
      message: "User not found",
    };
  }
  if (verificationError) {
    return {
      type: "error",
      message: "Database Error: Failed to check user.",
    };
  }

  // check the code and
  if (data.token !== code) {
    return {
      type: "error",
      message: "Invalid code",
    };
  }

  // expiration time
  if (new Date(data.expires) < new Date()) {
    return {
      type: "error",
      message: "Code expired",
    };
  }

  // update the user
  const { error } = await nextAuthClient
    .from("users")
    .update({
      isVerified: true,
      emailVerified: new Date(),
      isAcceptingMessages: true,
    })
    .eq("username", username);

  if (error) {
    return {
      type: "error",
      message: "Database Error: Failed to verify user.",
    };
  }

  return {
    type: "success",
    message: "Email verified",
  };
}

export async function resendCode(username: string) {
  let token = Math.floor(100000 + Math.random() * 900000).toString();
  let expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15);

  // update the user
  const { error } = await nextAuthClient
    .from("verification_tokens")
    .update({
      token,
      expires,
    })
    .eq("identifier", username);

  if (error) {
    return {
      type: "error",
      message: "Database Error: Failed to resend code.",
    };
  }

  const email = await getUserEmail(username);
  if (!email) {
    return {
      type: "error",
      message: "User not found",
    };
  }

  const emailResponse = await sendVerificationEmail(email, username, token);

  if (!emailResponse.success) {
    return {
      type: "error",
      message: "Failed to send verification email",
    };
  }

  return {
    type: "success",
    message: "Code resent",
  };
}
