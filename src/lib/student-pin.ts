/** Student-facing PIN validation. The prefix preserves the existing K-Move
 * Auth password format; it does not increase the entropy of a four-digit PIN.
 */
export const isStudentPin = (pin: string) => pin.length === 4 && /^[0-9]{4}$/.test(pin);
export const normalizePinInput = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 4);
export function studentPinPassword(pin: string): string {
  if (!isStudentPin(pin)) throw new Error("auth/invalid-pin");
  return `Kmove:${pin}`;
}
