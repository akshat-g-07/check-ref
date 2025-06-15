"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { verifyAdminCode } from "@/app/actions/auth";

export default function AuthForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setError("");

    const result = await verifyAdminCode(formData);

    if (result?.error) {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 border border-border rounded-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Admin Access</h1>
        <p className="text-gray-300 mt-2">Enter the admin code to continue</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-gray-200">
            Admin Code
          </Label>
          <Input
            id="code"
            name="code"
            type="password"
            required
            placeholder="Enter admin code"
            disabled={loading}
            className="bg-gray-700 border-border placeholder-gray-400 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 text-center">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full text-white bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
