import fs from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';

if (!process.env.APP_ID || !process.env.EVENT_ID || !process.env.FRONT_ID) throw new Error("One or more required parameters not specified in .env");
const appId = process.env.APP_ID;
const eventId = process.env.EVENT_ID;
const frontId = process.env.FRONT_ID;
const fileName = process.env.CLAN_OUTPUT_FILENAME || "clansOutput";

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
