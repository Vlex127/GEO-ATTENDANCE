import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm({
  className,
  ...props
}) {
  return (
    <form className={cn("grid gap-6", className)} {...props}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            placeholder="Email"
            type="email"         
            autoCapitalize="none"
            autoComplete="email"    
            autoCorrect="off"
            required
          />
        </div>  
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect="off"
            required
          />
        </div>
        <div className="grid gap-1">    
            <Label className="sr-only" htmlFor="confirm-password">
                Confirm Password
            </Label>
            <Input
                id="confirm-password"
                placeholder="Confirm Password"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect="off"
                required
            />
        </div>
      </div>
      <Button type="submit">Create Account</Button>
    </form>
  );
}
