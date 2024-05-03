import { AuthError, User } from "next-auth";
import { nextAuthClient } from "@/lib/supabase/private";
import { auth } from "@/app/auth";
import bcrypt from "bcryptjs";

class InvalidTypeError extends AuthError {
  code = "login-with-oauth";
}

export const findUserByEmail = async (email: string) => {
  const { data } = await nextAuthClient
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  return data;
};

export const getUserEmail = async (username: string) => {
  const { data } = await nextAuthClient
    .from("users")
    .select("email")
    .eq("username", username)
    .single();
  return data ? data.email : null;
};

export const findUserById = async (id: string) => {
  const { data } = await nextAuthClient
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  return data;
};

export const findUserByUsername = async (username: string) => {
  const { data } = await nextAuthClient
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
  return data;
};

export const loginUser = async (identifier: string, password: string) => {
  // check if user is sign up with oauth
  const { data: user } = await nextAuthClient
    .from("users")
    .select("*")
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .is("password", null)
    .single();

  if (user) {
    throw new InvalidTypeError();
  }

  const { data } = await nextAuthClient
    .from("users")
    .select("*")
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .single();

  if (!data) {
    return null;
  }
  const isValid = await bcrypt.compare(password, data.password);
  if (!isValid) {
    return null;
  }
  return data;
};

export const createUser = async (
  username: string,
  email: string,
  password: string
) => {
  const { error } = await nextAuthClient
    .from("users")
    .insert([{ username, email, password }]);
  if (error) {
    return {
      type: "error",
      message: "Failed to create user",
    };
  } else {
    return {
      type: "success",
      message: "User created successfully",
    };
  }
};

export const changeAcceptMessages = async (isAcceptingMessages: boolean) => {
  const session = await auth();
  const _user: User = session?.user;

  if (!session || !_user) {
    return {
      type: "error",
      message: "Not authenticated",
    };
  }

  const userId = _user.id;

  const { data, error } = await nextAuthClient
    .from("users")
    .update({ isAcceptingMessages: isAcceptingMessages })
    .eq("id", userId);

  if (error) {
    return {
      type: "error",
      message: "Failed to update user",
    };
  } else {
    return {
      type: "success",
      message: "Setting updated successfully",
    };
  }
};
