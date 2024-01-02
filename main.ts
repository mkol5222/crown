import config from "./src/config.ts";
import { CheckPointClient } from "./src/checkpoint.ts";

import { AccessRulebase } from "./src/rulebase.ts";
import  resolveObjectToIp  from "./src/objectip.ts";
import resolveService from "./src/services.ts";
import resolveRuleLocationInNsg from "./src/ruleloc.ts";

console.log("Hello World!")

console.dir(config);

async function main() {
    const cp = new CheckPointClient(config.cpserver, config.cptenant, config.cpapikey);
    await cp.login();

    const rules = await cp.showAccessRulebase('NSG Network');
    console.log(rules);

    const rulebase = new AccessRulebase(rules);
    console.log(rulebase.getObjects());
    console.log(rulebase.getRules());
    console.log(rulebase.getObjectByUid('97aeb369-9aea-11d5-bd16-0090272ccb30'));

    console.log(rulebase.getObjectByNameAndType('Drop', 'RulebaseAction'));

    console.log(rulebase.getObjectByNameAndType('hostA', 'host'));
    console.log(rulebase.getObjectByNameAndType('networkA', 'network'));

    const objs = [
        rulebase.getObjectByNameAndType('hostA', 'host'), 
        rulebase.getObjectByNameAndType('networkA', 'network'),
        rulebase.getObjectByNameAndType('groupA', 'group')
    ];
    for (const obj of objs) {
        console.log(resolveObjectToIp(obj));
    }

    const services = [
        rulebase.getObjectByNameAndType('domain-udp', 'service-udp'), 
        rulebase.getObjectByNameAndType('ssh', 'service-tcp'),
        rulebase.getObjectByNameAndType('ntp', 'service-group') 
    ]
    for (const service of services) {
        //console.log(service);
        if (service)
            console.log(resolveService(service));
    }
    //console.log(services);

    const flatRulebase = rulebase.getFlatRules();
    for (const rule of flatRulebase) {
        console.log(rule.uid, rule.name, rule.type, resolveRuleLocationInNsg(rule, rulebase));
    }
}

await main();