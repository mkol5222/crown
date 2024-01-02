
function resolveServiceTcp(obj) {

    const port = obj['port'];
    if (typeof port === 'string') {
        return { proto: 'tcp', port };
    }
    return null;
}

function resolveServiceUdp(obj) {
    const port = obj['port'];
    if (typeof port === 'string') {
        return { proto: 'udp', port };
    }
    return null;
}

function resolveServiceGroup(obj) {
    const members = obj['members'];
    if (members) {
        const memberServices = members.map((member) => resolveService(member));
        return memberServices;
    }
    return null;
}


const resolverMap = {
    'service-tcp': resolveServiceTcp,
    'service-udp': resolveServiceUdp    ,
    'service-group': resolveServiceGroup,
}

function resolveService(obj) {
    const resolver = resolverMap[obj.type];
    if (resolver) {
        return resolver(obj);
    }
    return null;
}

export default resolveService;