
function resolveHostToIp(obj) {
    const ip = obj['ipv4-address'];
    if (ip) {
        return ip;
    }
    return null;
}

function resolveNetworkToIp(obj) {
    const ip = obj['subnet4'];
    const mask = obj['mask-length4'];
    if (ip && mask) {
        return `${ip}/${mask}`;
    }
    return null;
}

function resolveGroupToIp(obj) {
    const members = obj['members'];
    if (members) {
        const memberIps = members.map((member) => resolveObjectToIp(member));
        return memberIps;
    }
    return null;

}

const resolverMap = {
    'host': resolveHostToIp,
    'network': resolveNetworkToIp,
    'group': resolveGroupToIp,
}

function resolveObjectToIp(obj) {
    const resolver = resolverMap[obj.type];
    if (resolver) {
        return resolver(obj);
    }
    return null;
}

export default resolveObjectToIp;