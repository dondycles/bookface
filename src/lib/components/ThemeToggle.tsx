import { MoonIcon, SunIcon } from "lucide-react";
import { cn } from "../utils";
import { Button } from "./ui/button";

export default function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    if (
      document.documentElement.classList.contains("dark") ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
  }

  return (
    <Button
      className={cn("flex justify-start gap-2 px-0 has-[>svg]:px-2", className)}
      variant="ghost"
      type="button"
      onClick={toggleTheme}
    >
      <SunIcon className="size-4 dark:hidden" />
      <MoonIcon className="size-4 hidden dark:block" />
      <p className="font-normal">Theme Mode</p>
    </Button>
  );
}
