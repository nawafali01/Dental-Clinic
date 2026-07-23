import { useEffect, useState } from "react";

export function useGreeting() {
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return greeting;
}
