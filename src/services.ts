function resolveServiceTcp(obj) {
  const port = obj["port"];
  if (typeof port === "string") {
    return { proto: "Tcp", port };
  }
  return null;
}

function resolveServiceUdp(obj) {
  const port = obj["port"];
  if (typeof port === "string") {
    return { proto: "Udp", port };
  }
  return null;
}

function resolveServiceGroup(obj) {
  const members = obj["members"];
  if (members) {
    const memberServices = members.map((member) => resolveService(member));
    return memberServices;
  }
  return null;
}

function resolveCpmiAnyObject(obj) {
  return { proto: "*", port: "*" };
}

const resolverMap = {
  "service-tcp": resolveServiceTcp,
  "service-udp": resolveServiceUdp,
  "service-group": resolveServiceGroup,
  "CpmiAnyObject": resolveCpmiAnyObject,
};

function resolveService(obj) {
  const resolver = resolverMap[obj.type];
  if (resolver) {
    return resolver(obj);
  }
  console.error("No resolver for service type", obj.type);
  return null;
}

export default resolveService;
