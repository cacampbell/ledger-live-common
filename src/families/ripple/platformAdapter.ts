import { RippleTransaction as PlatformTransaction } from "@ledgerhq/live-app-sdk";
import { Transaction } from "./types";

export const CAN_EDIT_FEES = true;

export const areFeesProvided = (tx: PlatformTransaction): boolean => !!tx.fee;

export const convertToLiveTransaction = (
  tx: PlatformTransaction
): Partial<Transaction> => {
  return tx;
};
