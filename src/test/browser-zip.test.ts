import { describe, expect, it } from "vitest";
import { createStoreZip } from "@/lib/browser-zip";

describe("browser ZIP writer", () => {
  it("creates a standards-shaped ZIP with UTF-8 file names and multiple entries", () => {
    const zip = createStoreZip([
      { name:"letter-01.png", data:new Uint8Array([1,2,3]) },
      { name:"편지-02.png", data:new Uint8Array([4,5]) },
    ]);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    expect(view.getUint32(0,true)).toBe(0x04034b50);
    expect(new TextDecoder().decode(zip)).toContain("letter-01.png");
    expect(new TextDecoder().decode(zip)).toContain("편지-02.png");
    expect(view.getUint32(zip.byteLength-22,true)).toBe(0x06054b50);
    expect(view.getUint16(zip.byteLength-12,true)).toBe(2);
  });

  it("creates an empty valid archive", () => {
    const zip=createStoreZip([]);
    const view=new DataView(zip.buffer);
    expect(zip.byteLength).toBe(22);
    expect(view.getUint32(0,true)).toBe(0x06054b50);
    expect(view.getUint16(10,true)).toBe(0);
  });
});
