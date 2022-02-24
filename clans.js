import fs from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';

const appId = process.env.app_id;
const eventId = process.env.event_id;
const frontId = process.env.front_id;
const fileName = process.env.clan_file_name;

let i = 1;
const fetchData = [];
const fetchUntilUndef = async () => {
  const res = await fetch(`https://api.worldoftanks.eu/wot/globalmap/eventrating/?application_id=${appId}&event_id=${eventId}&front_id=${frontId}&limit=100&page_no=${i}&fields=rank%2C+name%2C+tag%2C+fame_points_to_improve_award%2C+task_fame_points%2C+total_fame_points%2C+battle_fame_points%2C+clan_id`);
  const json = await res.json();
  if (json.data.length !== 0) {
    fetchData.push(json.data);
    i += 1;
    fetchUntilUndef();
  } else {
    fs.writeFile(`./${fileName}.json`, JSON.stringify(fetchData), (err) => { if (err) throw err; });
  }
};
fetchUntilUndef();
