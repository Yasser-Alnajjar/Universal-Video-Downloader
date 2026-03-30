"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "system") {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else if (theme === "dark") {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  return (
    <html
      className={isDark ? "dark" : ""}
      style={{ colorScheme: isDark ? "dark" : "light" }}
    >
      <body>
        <div
          className={`flex min-h-screen flex-col items-center justify-center p-8 text-center`}
        >
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-lg">
            The resource you’re looking for isn’t available.
          </p>
          <Button onClick={() => router.back()}>Back</Button>
        </div>
      </body>
    </html>
  );
}
