import resolveRuleLocationInNsg from "./ruleloc.ts";
import resolveService from "./services.ts";
import  resolveObjectToIp  from "./objectip.ts";
export class AccessRulebase {

    constructor(
        private readonly rulebase: JSON
    ) { }

    public getObjects() {
        return this.rulebase['objects-dictionary'];
    }

    public getObjectByUid(uid: string) {
        return this.rulebase['objects-dictionary'].find((obj: any) => obj.uid === uid);
    }

    public getObjectByNameAndType(name: string, type: string) {
        return this.rulebase['objects-dictionary'].find((obj: any) => ((obj.name === name) && (obj.type === type)));
    }


    public getRules() {
        return this.rulebase['rulebase'];
    }

    public getFlatRules() {
        const flatRules = [];
        for (const rule of this.rulebase['rulebase']) {
            

            if (rule.type === 'access-rule') {
                flatRules.push(rule);
            }
            if (rule.type === 'access-section') {
                const sectionRules = rule['rulebase'];
                for (const sectionRule of sectionRules) {
                    flatRules.push(sectionRule);
                }
            }
        }
        return flatRules;
    }

    public getRuleNsgDataIps(ruleObject: any, objects) {
        const resolvedObjects = objects.map((objectUid: string) => this.getObjectByUid(objectUid));
        const resolvedIps = resolvedObjects.map((object: any) => resolveObjectToIp(object));
        return resolvedIps;
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

        if (actionObj.name === 'Accept') {
            return 'Allow';
        }
        if (actionObj.name === 'Drop') {
            return 'Deny';
        }
        return 'Deny';
    }

    public getRuleNsgData(ruleUid) {
        const rule = this.getFlatRules().find((rule) => rule.uid === ruleUid);

        const installOn = resolveRuleLocationInNsg(rule, this);

        console.log('src', rule.source)
        const sourceIps = this.getRuleNsgDataSource(rule);
        console.log('dst', sourceIps);

        console.log('dst', rule.destination)
        const destinationIps = this.getRuleNsgDataDestination(rule);
        console.log('dst', destinationIps);

        const services = rule.service.map((serviceUid: string) => this.getObjectByUid(serviceUid));
        const resolvedServices = services.map((service: any) => resolveService(service));
        console.log('svc', rule.service, resolvedServices);
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
         ruleData.push({
            access: this.getRuleNsgDataAccess(rule),   
            ...installTarget });
        }
        return ruleData;
    }
}