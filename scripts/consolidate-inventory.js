import fs from "fs";

const inv  = JSON.parse(fs.readFileSync("./analysis/ctas7_inventory_snapshot.json"));
const boot = JSON.parse(fs.readFileSync("./analysis/ctas7_bootstrap_validation.json"));
const conf = JSON.parse(fs.readFileSync("./analysis/ctas7_config_validation.json"));

const consolidated = {
  timestamp: new Date().toISOString(),
  summary: {
    nodes: inv.length,
    layer2: boot.layer2_status,
    throughput_gbps: boot.throughput_gbps,
    config_ok: conf.valid
  },
  details: { inv, boot, conf }
};

fs.writeFileSync("./analysis/ctas7_full_validation.json", JSON.stringify(consolidated, null, 2));
console.log("✅ Consolidated validation written to analysis/ctas7_full_validation.json");