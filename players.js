import fetch from 'node-fetch';
import pLimit from 'p-limit';
import fs from 'fs';
import 'dotenv/config';

// wrapping the code in an async function
const fetchPlayers = async () => {
  const appId = process.env.app_id;
  const eventId = process.env.event_id;
  const frontId = process.env.front_id;
  const fileName = process.env.player_file_name;

  // the fastest way to fetch the data from API is to use Promise.all, however Wargaming API will not let you do it because of DDOS protection, therefore you need to limit the amount of requests for the API not to return corrupted data
  const limit = pLimit(10);

  // get the amount of pages
  const pageRes = await fetch(`https://api.worldoftanks.eu/wot/globalmap/eventaccountratings/?application_id=${appId}&event_id=${eventId}&front_id=${frontId}&fields=rank&limit=100&in_rating=1`).then((e) => e.json());
  const pageCount = pageRes.meta.page_total;

  // create URLs to fetch from
  const urls = [];
  for (let i = 1; i <= pageCount; i++) {
    const url = `https://api.worldoftanks.eu/wot/globalmap/eventaccountratings/?application_id=${appId}&event_id=${eventId}&front_id=${frontId}&fields=rank%2C+account_id%2C+clan_id%2C+battles%2C+fame_points%2C+fame_points_to_improve_award&page_no=${i}&limit=100&in_rating=1`;
    urls.push(url);
  }

  // fetch data
  const initDataTBP = urls.map((e) => limit(() => fetch(e).then((r) => r.json())));
  const fetchData = await Promise.all(initDataTBP);

  // put the actual data into an array, ignoring metadata
  const data = [];
  for (const page of fetchData) {
    data.push(page.data);
  }

  // making arrays of URLs to fetch nicknames based on account id and clan that account is in (API doesnt provide either)
  const pUrls = [];
  const cUrls = [];
  for (const page of data) {
    const iterationOfPIDs = [];
    const iterationOfCIDs = [];
    for (const player of page) {
      iterationOfPIDs.push(player.account_id);
      if (iterationOfCIDs.indexOf(player.clan_id) === -1 && player.clan_id) {
        iterationOfCIDs.push(player.clan_id);
      }
    }
    pUrls.push(`https://api.worldoftanks.eu/wot/account/info/?application_id=${appId}&account_id=${iterationOfPIDs}&fields=nickname`);
    cUrls.push(`https://api.worldoftanks.eu/wot/clans/info/?application_id=${appId}&fields=tag%2C+name&clan_id=${iterationOfCIDs}`);
  }

  // fetching nicknames and clans
  const initPlayersData = pUrls.map((e) => limit(() => fetch(e).then((r) => r.json())));
  const initClansData = cUrls.map((e) => limit(() => fetch(e).then((r) => r.json())));

  const playersData = await Promise.all(initPlayersData);
  const clansData = await Promise.all(initClansData);

  // loop through data array
  for (const page of data) {
    // loop through each page of data
    for (const player of page) {
      // check for corrupted data
      if (player.account_id) {
        // convert account id to string (int by default), then add a nickname to that account's object
        const accId = player.account_id.toString();
        for (const e of playersData) {
          if (e.data[accId]) {
            player.nickname = e.data[accId].nickname;
          }
        }
      }
      if (player.clan_id) {
        // convert clan id to string (int by default), then add clan name and tag to that account's object
        const clanId = player.clan_id.toString();
        for (const e of clansData) {
          if (e.data[clanId]) {
            player.clanname = e.data[clanId].name;
            player.tag = e.data[clanId].tag;
          }
        }
      }
    }
  }

  // write the file out to this direction, under a name given in .env file
  fs.writeFile(`./${fileName}.json`, JSON.stringify(data), (err) => { if (err) throw err; });
};

fetchPlayers();
