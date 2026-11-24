import { describe, expect, it } from "vitest";
import { isStudentPin, normalizePinInput, studentPinPassword } from "@/lib/student-pin";

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
