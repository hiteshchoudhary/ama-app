import { nextAuthClient } from "@/lib/supabase/private";
import bcrypt from "bcryptjs";

export const findUserByEmail = async (email: string) => {
  const { data } = await nextAuthClient.from("users").select("*").eq("email", email).single();
  return data;
};

export const findUserById = async (id: string) => {
  const { data } = await nextAuthClient.from("users").select("*").eq("id", id).single();
  return data;
};

export const findUserByUsername = async (username: string) => {
  const { data } = await nextAuthClient.from("users").select("*").eq("username", username).single();
  return data;
};

export const loginUser = async (identifier: string, password: string) => {
    const {data} = await nextAuthClient.from("users").select("*")
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .single();

    if (!data) {
        return null;
    }
    console.log("data", data)
    console.log()
    const isValid = await bcrypt.compare(password, data.password);
    console.log("isValid", isValid)
    if (!isValid) {
      return null;
    }
    return data;
}
