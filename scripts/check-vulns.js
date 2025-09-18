import { readFileSync } from "fs";

const report = JSON.parse(readFileSync("audit.json", "utf-8"));
const vulns = report.metadata?.vulnerabilities || {};
const high = vulns.high || 0;
const critical = vulns.critical || 0;

console.log("Vulnerabilities:", vulns);

if (high + critical > 0) {
  console.error(`Found ${high} high and ${critical} critical vulnerabilities`);
  process.exit(1);
} else {
  console.log("No high or critical vulnerabilities found");
}