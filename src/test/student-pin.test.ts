import { describe, expect, it } from "vitest";
import { isStudentPin, normalizePinInput, studentPinPassword, TEMPORARY_STUDENT_PIN, isTemporaryStudentPin, requiresTemporaryPinVerification } from "@/lib/student-pin";

describe("student PIN", () => {
  it("accepts exactly four ASCII digits including leading zeroes", () => {
    for (const pin of ["0000", "0123", "9876"]) {
      expect(isStudentPin(pin)).toBe(true);
      expect(studentPinPassword(pin)).toBe("Kmove:" + pin);
    }
  });
  it("rejects empty, short, long and non-numeric PINs", () => {
    for (const pin of ["", "123", "12345", "abcd", "12a3", "１２３４", "1234\n"]) {
      expect(isStudentPin(pin)).toBe(false);
      expect(() => studentPinPassword(pin)).toThrow("auth/invalid-pin");
    }
  });
  it("normalizes input without dropping leading zeroes", () => {
    expect(normalizePinInput("0a1-234")).toBe("0123");
  });
});

describe("temporary PIN onboarding", () => {
  it("uses 1234 only as the public activation code", () => {
    expect(TEMPORARY_STUDENT_PIN).toBe("1234");
    expect(isTemporaryStudentPin("1234")).toBe(true);
    expect(isTemporaryStudentPin("0123")).toBe(false);
  });
  it("offers email verification only after invalid legacy credentials with the temporary code", () => {
    expect(requiresTemporaryPinVerification("1234", "invalid_credentials")).toBe(true);
    expect(requiresTemporaryPinVerification("2345", "invalid_credentials")).toBe(false);
    expect(requiresTemporaryPinVerification("1234", "over_request_rate_limit")).toBe(false);
    expect(requiresTemporaryPinVerification("1234", undefined)).toBe(false);
  });
});
