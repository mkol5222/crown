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
}