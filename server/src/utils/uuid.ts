import { v4 as uuidv4 } from "uuid"

export function generateInviteCode() {
  return uuidv4().replace(/-/, "").substring(0, 8)
}
