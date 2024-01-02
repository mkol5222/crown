import resolveRuleLocationInNsg from "./ruleloc.ts";
import resolveService from "./services.ts";
import resolveObjectToIp from "./objectip.ts";
export class AccessRulebase {
  constructor(
    private readonly rulebase: JSON,
  ) {}

  public getObjects() {
    return this.rulebase["objects-dictionary"];
  }

  public getObjectByUid(uid: string) {
    return this.rulebase["objects-dictionary"].find((obj: any) =>
      obj.uid === uid
    );
  }

  public getObjectByNameAndType(name: string, type: string) {
    return this.rulebase["objects-dictionary"].find((
      obj: any,
    ) => ((obj.name === name) && (obj.type === type)));
  }

  public getRules() {
    return this.rulebase["rulebase"];
  }

  public getFlatRules() {
    const flatRules = [];
    for (const rule of this.rulebase["rulebase"]) {
      if (rule.type === "access-rule") {
        flatRules.push(rule);
      }
      if (rule.type === "access-section") {
        const sectionRules = rule["rulebase"];
        for (const sectionRule of sectionRules) {
          flatRules.push(sectionRule);
        }
      }
    }
    return flatRules;
  }

  public getRuleNsgDataIps(ruleObject: any, objects) {
    const resolvedObjects = objects.map((objectUid: string) =>
      this.getObjectByUid(objectUid)
    );
    const resolvedIps = resolvedObjects.map((object: any) =>
      resolveObjectToIp(object)
    );
    return resolvedIps?.flat();
  }

  public getRuleNsgDataSource(ruleObject: any) {
    return this.getRuleNsgDataIps(ruleObject, ruleObject.source);
  }

  public getRuleNsgDataDestination(ruleObject: any) {
    return this.getRuleNsgDataIps(ruleObject, ruleObject.destination);
  }

  // Allow / Deny
  public getRuleNsgDataAccess(ruleObject: any) {
    const actionObj = this.getObjectByUid(ruleObject.action);
    // console.log(ruleObject.action, actionObj.name);

    if (actionObj.name === "Accept") {
      return "Allow";
    }
    if (actionObj.name === "Drop") {
      return "Deny";
    }
    return "Deny";
  }

  public getRuleNsgData(ruleUid) {
    const rule = this.getFlatRules().find((rule) => rule.uid === ruleUid);

    const installOn = resolveRuleLocationInNsg(rule, this);

    //console.log('src', rule.source)
    const sourceIps = this.getRuleNsgDataSource(rule);
    //console.log("dst", sourceIps);

    //console.log('dst', rule.destination)
    const destinationIps = this.getRuleNsgDataDestination(rule);
    //console.log("dst", destinationIps);

    const services = rule.service.map((serviceUid: string) =>
      this.getObjectByUid(serviceUid)
    );
    const resolvedServices = services.map((service: any) =>
      resolveService(service)
    ).flat();

    const servicesGrouppedByProto = Object.groupBy(
      resolvedServices,
      ({ proto }) => proto,
    );
    const allProtocols = Object.keys(servicesGrouppedByProto);
    const allPorts = Array.from(
      new Set(
        Object.values(servicesGrouppedByProto).map((services) =>
          services.map(({ port }) => port).flat()
        ).flat(),
      ),
    );

    if (allProtocols.length !== 1) {
      console.error(
        "Expected exactly one protocol per rule",
        servicesGrouppedByProto,
        rule.uid,
        rule.name,
      );
      Deno.exit(1);
    }

    //console.log("svc", rule.service, resolvedServices);
    //console.log(allProtocols, allPorts);
    //console.log('rule', rule)

    const ruleData = [];
    for (const installTarget of installOn) {
      // name

      // access, priority, direction

      // source_address_prefix, source_address_prefixes
      // source_port_range, source_port_ranges

      // destination_address_prefix, destination_address_prefixes
      // destination_port_range, destination_port_ranges

      //

      let source_address_prefix = sourceIps.length === 1 ? sourceIps[0] : "";
      let source_address_prefixes = sourceIps.length > 1 ? sourceIps : [];

      let destination_address_prefix = destinationIps.length === 1
        ? destinationIps[0]
        : "";
      let destination_address_prefixes = destinationIps.length > 1
        ? destinationIps
        : [];

      let source_port_range = "*";
      let source_port_ranges = [];

      let destination_port_range = allPorts.length === 1 ? allPorts[0] : "";
      let destination_port_ranges = allPorts.length > 1 ? allPorts : [];

      const nsgRuleName = rule.comments
        ? rule.comments
        : `${installTarget.subId}_${installTarget.rgName}_${installTarget.nsgName}_${rule.name}`;
      //console.log(rule)

      ruleData.push({
        access: this.getRuleNsgDataAccess(rule),
        source_address_prefix,
        source_address_prefixes,
        destination_address_prefix,
        destination_address_prefixes,
        destination_port_range,
        destination_port_ranges,
        protocol: allProtocols[0],
        name: nsgRuleName,
        ...installTarget,
      });
    }
    return ruleData;
  }
}
