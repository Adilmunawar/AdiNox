
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const PinSetup = () => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const { setupPin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setupPin(pin);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Set Up PIN</CardTitle>
        <CardDescription className="text-center">
          Create a PIN to secure your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="block text-sm font-medium">
                Enter PIN
              </label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="bg-muted"
                placeholder="Enter your PIN"
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPin" className="block text-sm font-medium">
                Confirm PIN
              </label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="bg-muted"
                placeholder="Confirm your PIN"
                maxLength={8}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Set PIN
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Your PIN will be stored locally on this device.
      </CardFooter>
    </Card>
  );
};

export default PinSetup;
