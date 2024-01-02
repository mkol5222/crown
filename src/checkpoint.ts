export class CheckPointClient {
  #cpsid: string;

  constructor(
    private readonly cpserver: string,
    private readonly cptenant: string,
    private readonly cpapikey: string,
  ) {}

  public async login() {
    console.error("Logging in to Check Point...");

    const cpCreds = this.cpapikey
      ? {
        "api-key": this.cpapikey,
      }
      : {
        "user": this.cpuser,
        "password": this.cppassword,
      };

    const urlBase = `https://${this.cpserver}/${this.cptenant}/web_api/`;
    const loginUrl = `${urlBase}login`;
    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...cpCreds,
      }),
    });

    const loginResponseJson = await loginResponse.json();

    //console.log("Login response:", loginResponseJson);
    this.#cpsid = loginResponseJson.sid;
  }

  public async showAccessRulebase(packageName: string = "Standard") {
    const sid = this.#cpsid;
    if (sid) {
      // fetch access rulebase
      const urlBase = `https://${this.cpserver}/${this.cptenant}/web_api/`;
      const showAccessRulebaseUrl = `${urlBase}show-access-rulebase`;
      const showAccessRulebaseResponse = await fetch(showAccessRulebaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-chkp-sid": sid,
        },
        body: JSON.stringify({
          "name": packageName,
          "show-as-ranges": false,
          "use-object-dictionary": true,
          "details-level": "full",
          "dereference-group-members": true,
        }),
      });
      const rulebase = await showAccessRulebaseResponse.json();

      // console.log('rulebase', rulebase);
      if (rulebase.code) {
        console.error("Failed to load rulebase", rulebase.message);
        return null;
      }

      return rulebase;
      //   const { objectsByUid, objectsByTypeAndName } = processLoadedRulebase(rulebase);
      //   return { rulebase, objectsByUid, objectsByTypeAndName };
      // console.log(accessRulebase);
    } else {
      console.error("Failed to login to Security Management", cpserver);
    }
    return null;
  }
}
