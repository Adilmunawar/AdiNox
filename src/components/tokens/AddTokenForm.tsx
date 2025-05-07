
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTokens } from "@/context/TokenContext";
import { Plus } from "lucide-react";

const AddTokenForm = () => {
  const { addToken } = useTokens();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    secret: "",
    period: 30,
    digits: 6,
    algorithm: "SHA1",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: name === "period" || name === "digits" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.secret) {
      return;
    }

    addToken({
      name: formData.name,
      issuer: formData.issuer || formData.name,
      secret: formData.secret.replace(/\s/g, ""),
      period: formData.period,
      digits: formData.digits,
      algorithm: formData.algorithm,
    });

    // Reset form and close dialog
    setFormData({
      name: "",
      issuer: "",
      secret: "",
      period: 30,
      digits: 6,
      algorithm: "SHA1",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Add Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Add New Token</DialogTitle>
          <DialogDescription>
            Enter the details for your new authentication token.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Account
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="username@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issuer" className="text-right">
                Issuer
              </Label>
              <Input
                id="issuer"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Google, GitHub, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secret" className="text-right">
                Secret Key
              </Label>
              <Input
                id="secret"
                name="secret"
                value={formData.secret}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Base32 secret key"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="algorithm" className="text-right">
                Algorithm
              </Label>
              <Select
                value={formData.algorithm}
                onValueChange={(value) => handleSelectChange("algorithm", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA1">SHA1</SelectItem>
                  <SelectItem value="SHA256">SHA256</SelectItem>
                  <SelectItem value="SHA512">SHA512</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Period
              </Label>
              <Select
                value={formData.period.toString()}
                onValueChange={(value) => handleSelectChange("period", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="digits" className="text-right">
                Digits
              </Label>
              <Select
                value={formData.digits.toString()}
                onValueChange={(value) => handleSelectChange("digits", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Digits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 digits</SelectItem>
                  <SelectItem value="8">8 digits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Token</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTokenForm;
