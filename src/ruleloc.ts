// determine rule location in NSG

// HOW
// Name of rule: 100_Inbound, 201_Outbound - determines NSG rule priority and direction

// Install ON: Network Group Object - determines NSG name, resource group, and subscription

    // nsg_freetext - Network Group Object
    //     nsgname_objname- Network Group Object member - optional - would use parent group derived name if not present
    //     rg_rgname - Network Group Object member
    //     sub_uid- Network Group Object member - optional

    // eg. NSG with Azure ID: /subscriptions/f4ad5e85-ec75-4321-8854-ed7eb611f61d/resourceGroups/rg-test-nsg101/providers/Microsoft.Network/networkSecurityGroups/Default
    //     NSG name: Default
    //     RG name: rg-test-nsg101
    //     Sub ID: f4ad5e85-ec75-4321-8854-ed7eb611f61d

// nsg_test101_Default with members: nsgname_Default, rg_rg-test-nsg101, sub_f4ad5e85-ec75-4321-8854-ed7eb611f61d

function isNsgInstallTarget(obj) {
    return obj.name.startsWith('nsg_') && obj.type === 'group';
}

function getInstallTargetData(members, prefix) {
    const memberObj = members.find((member) => (member.name.startsWith(prefix) && member.type === 'group'));
    const memberName = memberObj?.name;
    const data = getDataFromName(memberName);
    return data;
}

function getDataFromName(name) {
    const nameParts = name.split('_');
    const data = nameParts[1];
    return data;
}

function resolveRuleLocationInNsg(rule, rulebase) {

   // console.log('rule', rule);

    const ruleName = rule.name;
    const ruleNameParts = ruleName.split('_');
    const rulePriority = ruleNameParts[0];
    const ruleDirection = ruleNameParts[1];

    const installOn = rule['install-on'];

    for (const installOnObj of installOn) {
        const obj = rulebase.getObjectByUid(installOnObj);
        if (isNsgInstallTarget(obj)) {
            console.log('installOn', obj.name, obj.type);

            const members = obj['members'];
            const rgName = getInstallTargetData(members, 'rg_');
            const subId = getInstallTargetData(members, 'sub_');
            const nsgName = getInstallTargetData(members, 'nsgname_');
            const targetName = getDataFromName(obj.name);
    

            console.log({
                rulePriority,
                ruleDirection,
                rgName,
                subId,
                nsgName,
                targetName
            })
        }
    }
 }

 export default resolveRuleLocationInNsg;