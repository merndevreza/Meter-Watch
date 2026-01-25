import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResendSignInBtn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("resend", formData, { redirectTo: "/" })
      }}
    >
      <FieldGroup className="gap-1">
        <Field> 
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
        </Field>
        <Field>
          <Button type="submit">Signin with Magic Link</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}