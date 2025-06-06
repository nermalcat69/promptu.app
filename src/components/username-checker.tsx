"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface UsernameCheckerProps {
  username: string;
  onAvailabilityChange: (available: boolean) => void;
}

export function UsernameChecker({ username, onAvailabilityChange }: UsernameCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [debouncedUsername] = useDebounce(username, 500);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setIsAvailable(null);
        onAvailabilityChange(false);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch("/api/user/check-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: debouncedUsername }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAvailable(data.available);
          onAvailabilityChange(data.available);
        } else {
          setIsAvailable(false);
          onAvailabilityChange(false);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setIsAvailable(false);
        onAvailabilityChange(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedUsername, onAvailabilityChange]);

  if (!username || username.length < 3) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isChecking ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : isAvailable === true ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : isAvailable === false ? (
        <XCircle className="h-4 w-4 text-red-500" />
      ) : null}
      
      {!isChecking && isAvailable !== null && (
        <span className={isAvailable ? "text-green-600" : "text-red-600"}>
          {isAvailable ? "Username is available" : "Username is taken"}
        </span>
      )}
    </div>
  );
} 