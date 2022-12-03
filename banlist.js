import fs from 'fs';
import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const fileName = process.env.PLAYERS_BANLIST_OUTPUT_FILENAME || "playersBanlist";

if (!process.env.PATH_TO_PLAYERS_FOR_BANLIST_BEFORE_BANS || !process.env.PATH_TO_PLAYERS_FOR_BANLIST_AFTER_BANS) throw new Error("One or both input paths not specified");
const dataBeforeBans = require(process.env.PATH_TO_PLAYERS_FOR_BANLIST_BEFORE_BANS);
const dataAfterBans = require(process.env.PATH_TO_PLAYERS_FOR_BANLIST_AFTER_BANS);

// initialise arrays
const data1 = [];
const data2 = [];

// push all the players to single array, as by default each page is a different object
for (const page of dataBeforeBans) {
  for (const player of page) {
    data1.push(player);
  }
}
for (const page of dataAfterBans) {
  for (const player of page) {
    data2.push(player);
  }
}

// find which entries exist in the first file but dont in the second one based on account_id (so if someone changes nickname after the campaign, but before the bans are given out, they will still be included in the banlist) basically giving the information of who got banned
const bans = data1.filter((e1) => !data2.some((e2) => e1.account_id === e2.account_id));

// make a JSON string the results and write them down to a file
fs.writeFile(`./${fileName}.json`, JSON.stringify(bans), (err) => { if (err) throw err; });
