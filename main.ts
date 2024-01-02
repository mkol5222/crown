import config from "./src/config.ts";
import { CheckPointClient } from "./src/checkpoint.ts";

import { AccessRulebase } from "./src/rulebase.ts";
import resolveObjectToIp from "./src/objectip.ts";
import resolveService from "./src/services.ts";
import resolveRuleLocationInNsg from "./src/ruleloc.ts";

// console.log("Hello World!")
// console.dir(config);

async function main() {
  const cp = new CheckPointClient(
    config.cpserver,
    config.cptenant,
    config.cpapikey,
  );
  await cp.login();

  const rules = await cp.showAccessRulebase("NSG Network");
  // console.log(rules);

  const rulebase = new AccessRulebase(rules);
  // console.log(rulebase.getObjects());
  // console.log(rulebase.getRules());

  // console.log(rulebase.getObjectByUid('97aeb369-9aea-11d5-bd16-0090272ccb30'));

  // console.log(rulebase.getObjectByNameAndType('Drop', 'RulebaseAction'));

  // console.log(rulebase.getObjectByNameAndType('hostA', 'host'));
  // console.log(rulebase.getObjectByNameAndType('networkA', 'network'));

  // const objs = [
  //     rulebase.getObjectByNameAndType('hostA', 'host'),
  //     rulebase.getObjectByNameAndType('networkA', 'network'),
  //     rulebase.getObjectByNameAndType('groupA', 'group')
  // ];
  // for (const obj of objs) {
  //     console.log(resolveObjectToIp(obj));
  // }

  // const services = [
  //     rulebase.getObjectByNameAndType('domain-udp', 'service-udp'),
  //     rulebase.getObjectByNameAndType('ssh', 'service-tcp'),
  //     rulebase.getObjectByNameAndType('ntp', 'service-group')
  // ]
  // for (const service of services) {
  //     //console.log(service);
  //     if (service)
  //         console.log(resolveService(service));
  // }
  //console.log(services);

  const flatRulebase = rulebase.getFlatRules();

  const nsgRules = [];

  for (const rule of flatRulebase) {
    if (!rule.enabled) continue;
    //console.log(rule.enabled, rule.uid, rule.name, rule.type, resolveRuleLocationInNsg(rule, rulebase));

    const ruleData = rulebase.getRuleNsgData(rule.uid);
    // console.log(ruleData);
    nsgRules.push(ruleData);
  }
  const nsgRulesFlat = nsgRules.flat();
  //console.log(nsgRulesFlat);
  const nsgRulesGroupByTarget = Object.groupBy(
    nsgRulesFlat,
    (rule) => `${rule.subId}/${rule.rgName}/${rule.nsgName}`,
  );
  const groupData = Object.entries(nsgRulesGroupByTarget);
  //console.log(groupData);

  for (const [target, rules] of groupData) {
    console.error(target);
    const ruleEntries = rules.map((rule) => {
        // console.log(rule.destination_port_range, rule.destination_port_ranges);
      return {
        "name": rule.name,
        "description": "",
        "priority": rule.priority,
        "direction": rule.direction,
        "access": rule.access,
        "protocol": rule.protocol,
        "source_port_range": "*",
        "source_port_ranges": [],
        "destination_port_range": rule.destination_port_range,
        "destination_port_ranges": rule.destination_port_ranges,
        "source_address_prefix": rule.source_address_prefix,
        "source_address_prefixes": rule.source_address_prefixes,
        "destination_address_prefix": rule.destination_address_prefix,
        "destination_address_prefixes": rule.destination_address_prefixes,
        "destination_application_security_group_ids": [],
        "source_application_security_group_ids": [],
      };
    });
    // console.log(JSON.stringify(ruleEntries, null, 2));
    const nsg = {
      "resource": {
        "azurerm_network_security_group": {
          "example-nsg-2": {
            "name": "example-cpnsg2",
            "location": "${azurerm_resource_group.example.location}",
            "resource_group_name": "${azurerm_resource_group.example.name}",
            "security_rule": ruleEntries,
          },
        },
      },
    };
    console.log(JSON.stringify(nsg, null, 2));
  }
}

await main();
