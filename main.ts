import config from "./src/config.ts";
import { CheckPointClient } from "./src/checkpoint.ts";

console.log("Hello World!")

console.dir(config);

async function main() {
    const cp = new CheckPointClient(config.cpserver, config.cptenant, config.cpapikey);
    await cp.login();

    const rules = await cp.showAccessRulebase('NSG Network');
    console.log(rules);
}

await main();