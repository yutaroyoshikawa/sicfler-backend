/* eslint-disable @typescript-eslint/no-non-null-assertion */
import crypto from "crypto";

const ALGORITHM = process.env.CRYPTO_ALGORITHM!;
const BUFFER_KEY = process.env.ENCRYPTION_BUFFER!;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export const generateHash = (text: string): string => {
  const iv = Buffer.from(BUFFER_KEY);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  const encryptBuffer = cipher.update(text);
  const encrypted = Buffer.concat([encryptBuffer, cipher.final()]);

  return encrypted.toString("hex");
};
