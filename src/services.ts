
function resolveServiceTcp(obj) {
    console.log(obj);
    return null;
}

function resolveServiceUdp(obj) {
    console.log(obj);
    return null;
}

function resolveServiceGroup(obj) {
    console.log(obj);
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