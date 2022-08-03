import fs from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';

const appId = process.env.app_id;
const eventId = process.env.event_id;
const frontId = process.env.front_id;
const fileName = process.env.clan_file_name;

// function fetchUntilUndef is basically a loop that fetches data from each page until API doesnt return valid data (page doesnt exist)

// initialise i thats going to be used as a page number
let i = 1;
// make an array to push fetched data into
const fetchData = [];
// wrap the code in an async function
const fetchUntilUndef = async () => {
  // fetch data
  const res = await fetch(`https://api.worldoftanks.eu/wot/globalmap/eventrating/?application_id=${appId}&event_id=${eventId}&front_id=${frontId}&limit=100&page_no=${i}&fields=rank%2C+name%2C+tag%2C+fame_points_to_improve_award%2C+task_fame_points%2C+total_fame_points%2C+battle_fame_points%2C+clan_id`).then(x => x.json());
  // check if data in this iteration are valid, if so - push them to the fetchData array, if they arent, make a JSON string of the fetchData array and write it to a file
  if (res.data.length !== 0) {
    fetchData.push(res.data);
    i += 1;
    fetchUntilUndef();
  } else {
    fs.writeFile(`./${fileName}.json`, JSON.stringify(fetchData), (err) => { if (err) throw err; });
  }
};

fetchUntilUndef();
