import fs from 'fs';
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const fileName = process.env.players_banlist_file_name;

// FILL OUT WITH FILENAMES
const dataBeforeBans = require('.');
const dataAfterBans = require('.');

const data1 = [];
const data2 = [];

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

const bans = data1.filter((e1) => !data2.some((e2) => e1.account_id === e2.account_id));

fs.writeFile(`./${fileName}.json`, JSON.stringify(bans), (err) => { if (err) throw err; });
