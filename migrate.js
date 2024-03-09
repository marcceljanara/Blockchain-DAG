import { migrateStrongholdSnapshotV2ToV3 } from "@iota/sdk";
// require("dotenv").config({ path: ".env" });

const v2Path = "./wallet.stronghold";
const v3Path = "./wallet.stronghold";

migrateStrongholdSnapshotV2ToV3(
  v2Path,
  "pass",
  "wallet.rs",
  100,
  v3Path,
  "new_pass"
);
