import fs from 'fs';
import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const fileName = process.env.CLANS_BANLIST_OUTPUT_FILENAME || "clansBanlist";

if (!process.env.PATH_TO_CLANS_FOR_BANLIST_BEFORE_BANS || !process.env.PATH_TO_CLANS_FOR_BANLIST_AFTER_BANS) throw new Error("One or both input paths not specified");
const dataBeforeBans = require(process.env.PATH_TO_CLANS_FOR_BANLIST_BEFORE_BANS);
const dataAfterBans = require(process.env.PATH_TO_CLANS_FOR_BANLIST_AFTER_BANS);

// initialise arrays
const data1 = [];
const data2 = [];

// push all the clans to single array, as by default each page is a different object
for (const page of dataBeforeBans) {
  for (const clan of page) {
    data1.push(clan);
  }
}
for (const page of dataAfterBans) {
  for (const clan of page) {
    data2.push(clan);
  }
}

// find out which entries exist in the first file but dont in the second one basically giving the information of which clans got banned
const bans = data1.filter((e1) => !data2.some((e2) => e1.clan_id === e2.clan_id));

// make a JSON string the results and write them down to a file
fs.writeFile(`./${fileName}.json`, JSON.stringify(bans), (err) => { if (err) throw err; });
