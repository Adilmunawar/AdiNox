
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const PinEntry = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { verifyPin } = useAuth();
  const pinLength = 4;
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on component mount
    if (pinInputRefs.current[0]) {
      pinInputRefs.current[0].focus();
    }
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste operation
      const pastedValue = value;
      const newPin = pin.split("");
      
      for (let i = 0; i < Math.min(pastedValue.length, pinLength - index); i++) {
        if (/^\d$/.test(pastedValue[i])) {
          newPin[index + i] = pastedValue[i];
        }
      }
      
      setPin(newPin.join("").slice(0, pinLength));
      
      // Focus the appropriate input
      const nextIndex = Math.min(index + pastedValue.length, pinLength - 1);
      if (pinInputRefs.current[nextIndex]) {
        pinInputRefs.current[nextIndex].focus();
      }
      
      return;
    }

    if (/^\d$/.test(value) || value === "") {
      const newPin = pin.split("");
      newPin[index] = value;
      setPin(newPin.join(""));
      
      // Move focus to the next input if a digit was entered
      if (value !== "" && index < pinLength - 1) {
        if (pinInputRefs.current[index + 1]) {
          pinInputRefs.current[index + 1].focus();
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      // Move focus to the previous input on backspace if current is empty
      if (pinInputRefs.current[index - 1]) {
        pinInputRefs.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length < pinLength) {
      setError(`Please enter all ${pinLength} digits`);
      return;
    }

    const success = verifyPin(pin);
    if (!success) {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      // Focus the first input again
      if (pinInputRefs.current[0]) {
        pinInputRefs.current[0].focus();
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Enter PIN</CardTitle>
        <CardDescription className="text-center">
          Please enter your PIN to access the app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-4 my-8">
            {Array.from({ length: pinLength }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (pinInputRefs.current[index] = el)}
                type="password"
                inputMode="numeric"
                value={pin[index] || ""}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="pin-input"
                maxLength={index === 0 ? pinLength : 1} // Allow pasting into first input only
              />
            ))}
          </div>
          {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Unlock
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PinEntry;
