import { migrateStrongholdSnapshotV2ToV3 } from "@iota/sdk";

const v2Path = "./wallet.stronghold";
const v3Path = "./wallet.stronghold";

migrateStrongholdSnapshotV2ToV3(
  v2Path,
  "new_pass",
  "wallet.rs",
  100,
  v3Path,
  "new_pass"
);
