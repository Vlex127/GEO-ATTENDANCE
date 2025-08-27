import { GalleryVerticalEnd } from "lucide-react"
import "../app.css"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div>
               <img src="/lasu.png" alt="Light theme" className="h-5 w-5" />
            </div>
            LASU AMS
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:flex items-center justify-center">
        <img
          src="/lasu.png"
          alt="Image"
          className="dark:brightness-[0.2] dark:grayscale" />
      </div>
    </div>
  );
}
