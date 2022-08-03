import fs from 'fs';
import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const fileName = process.env.clans_banlist_file_name;

// FILL OUT WITH FILENAMES
const dataBeforeBans = require('./clans.json');
const dataAfterBans = require('./clanafterbans.json');

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
