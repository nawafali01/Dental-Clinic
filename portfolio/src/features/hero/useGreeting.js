import { useEffect, useState } from "react";

export function useGreeting() {
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hours = new Date().getHours();
    setGreeting(
      hours < 12
        ? "Good morning"
        : hours < 18
        ? "Good afternoon"
        : "Good evening"
    );
  }, []);

  return greeting;
}
