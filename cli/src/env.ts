import { cleanEnv, str } from "envalid";
import { Address } from "viem";

export const env = cleanEnv(process.env, {
  OWNER: str<Address>(),
  PLAYER1: str<Address>(),
  PLAYER2: str<Address>(),
});
