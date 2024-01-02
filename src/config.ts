import { load } from "https://deno.land/std@0.210.0/dotenv/mod.ts";

const env = await load();

const config = {
    cpserver: env.CPSERVER,
    cptenant: env.CPTENANT,
    cpapikey: env.CPAPIKEY,
}

export default config;