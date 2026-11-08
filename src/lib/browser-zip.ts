type ZipInputFile = {
  name: string;
  data: Uint8Array;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array) {
  let c = 0xffffffff;
  for (const byte of data) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function writeU16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}
function writeU32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}
function concat(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

/** Minimal UTF-8 ZIP writer using STORE (no compression), for browser-generated PNGs. */
export function createStoreZip(files: ZipInputFile[]) {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let localOffset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.data);

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    writeU32(lv, 0, 0x04034b50);
    writeU16(lv, 4, 20);
    writeU16(lv, 6, 0x0800);
    writeU16(lv, 8, 0);
    writeU16(lv, 10, 0);
    writeU16(lv, 12, 0);
    writeU32(lv, 14, checksum);
    writeU32(lv, 18, file.data.byteLength);
    writeU32(lv, 22, file.data.byteLength);
    writeU16(lv, 26, name.length);
    writeU16(lv, 28, 0);
    local.set(name, 30);
    locals.push(local, file.data);

    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    writeU32(cv, 0, 0x02014b50);
    writeU16(cv, 4, 20);
    writeU16(cv, 6, 20);
    writeU16(cv, 8, 0x0800);
    writeU16(cv, 10, 0);
    writeU16(cv, 12, 0);
    writeU16(cv, 14, 0);
    writeU32(cv, 16, checksum);
    writeU32(cv, 20, file.data.byteLength);
    writeU32(cv, 24, file.data.byteLength);
    writeU16(cv, 28, name.length);
    writeU16(cv, 30, 0);
    writeU16(cv, 32, 0);
    writeU16(cv, 34, 0);
    writeU16(cv, 36, 0);
    writeU32(cv, 38, 0);
    writeU32(cv, 42, localOffset);
    central.set(name, 46);
    centrals.push(central);

    localOffset += local.byteLength + file.data.byteLength;
  }

  const centralOffset = localOffset;
  const centralBytes = concat(centrals);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  writeU32(ev, 0, 0x06054b50);
  writeU16(ev, 4, 0);
  writeU16(ev, 6, 0);
  writeU16(ev, 8, files.length);
  writeU16(ev, 10, files.length);
  writeU32(ev, 12, centralBytes.byteLength);
  writeU32(ev, 16, centralOffset);
  writeU16(ev, 20, 0);

  return concat([...locals, centralBytes, end]);
}
