import { signIn } from "@/auth";

export function ResendSignInBtn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("resend", formData, { redirectTo: "/dashboard" })
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Signin with Resend</button>
    </form>
  )
}