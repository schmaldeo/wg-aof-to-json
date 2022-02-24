import fs from 'fs';
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const fileName = process.env.clans_banlist_file_name;

// FILL OUT WITH FILENAMES
const dataBeforeBans = require('.');
const dataAfterBans = require('.');

const data1 = [];
const data2 = [];

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

const bans = data1.filter((e1) => !data2.some((e2) => e1.clan_id === e2.clan_id));

fs.writeFile(`./${fileName}.json`, JSON.stringify(bans), (err) => { if (err) throw err; });
