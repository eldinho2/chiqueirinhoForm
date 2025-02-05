import crypto from "crypto"

export function generateHash(data: any): string {
  const content = JSON.stringify(data)
  return crypto.createHash("md5").update(content).digest("hex")
}
