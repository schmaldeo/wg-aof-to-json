import fetch from "node-fetch";
import pLimit from "p-limit";
import fs from "fs";
import "dotenv/config";

interface Player {
  rank: number;
  account_id: number;
  clan_id: number;
  battles: number;
  fame_points: number;
  fame_points_to_improve_award: number;
  nickname?: string;
  clanname?: string;
  tag?: string;
}

interface ApiResponse {
  status: string;
  meta: {
    count: number;
    page_total: number;
    page: number;
  };
  data: Player[];
}

interface PlayerApiResponse {
  status: string;
  meta: {
    count: number;
  }
  data: {
    [key: string]: {
      nickname: string;
    }
  }
}

interface ClanApiResponse {
  status: string;
  meta: {
    count: number;
  }
  data: {
    [key: string]: {
      tag: string;
      name: string;
    }
  }
}

// wrapping the code in an async function
const fetchPlayers = async () => {
  if (!process.env.APP_ID || !process.env.EVENT_ID || !process.env.FRONT_ID) throw new Error("One or more required parameters not specified in .env");
  const appId = process.env.APP_ID;
  const eventId = process.env.EVENT_ID;
  const frontId = process.env.FRONT_ID;
  const fileName = process.env.PLAYERS_OUTPUT_FILENAME || "playersOutput";

  // the fastest way to fetch the data from API is to use Promise.all,
  // however Wargaming API will not let you do it because of DDOS protection,
  // therefore you need to limit the amount of requests for the API not to return corrupted data
  const limit = pLimit(10);

  // get the amount of pages
  const pageRes = await fetch(`https://api.worldoftanks.eu/wot/globalmap/eventaccountratings/?application_id=${appId}&event_id=${eventId}&front_id=${frontId}&fields=rank&limit=100&in_rating=1`).then((e) => e.json()) as ApiResponse;
  const pageCount = pageRes.meta.page_total;

  // create URLs to fetch from
  const urls: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const url = `https://api.worldoftanks.eu/wot/globalmap/eventaccountratings/?application_id=${appId}&event_id=${eventId}&front_id=${frontId}&fields=rank%2C+account_id%2C+clan_id%2C+battles%2C+fame_points%2C+fame_points_to_improve_award&page_no=${i}&limit=100&in_rating=1`;
    urls.push(url);
  }

  // fetch data
  const fetchDataPromises = urls.map((e) => limit(() => fetch(e).then((r) => r.json())));
  const fetchData = await Promise.all(fetchDataPromises) as ApiResponse[];

  // put the actual data into an array, ignoring metadata
  const data: Array<Player[]> = [];

  fetchData.forEach((page) => {
    data.push(page.data);
  });

  // making arrays of URLs to fetch nicknames based on account id and clan that account is in
  // (API doesnt provide either)
  const playersUrls: string[] = [];
  const clanUrls: string[] = [];
  data.forEach((page) => {
    const playerIDIteration: number[] = [];
    const clanIDIteration: number[] = [];
    page.forEach((player) => {
      playerIDIteration.push(player.account_id);
      if (clanIDIteration.indexOf(player.clan_id) === -1 && player.clan_id) {
        clanIDIteration.push(player.clan_id);
      }
    });
    playersUrls.push(`https://api.worldoftanks.eu/wot/account/info/?application_id=${appId}&account_id=${playerIDIteration}&fields=nickname`);
    clanUrls.push(`https://api.worldoftanks.eu/wot/clans/info/?application_id=${appId}&fields=tag%2C+name&clan_id=${clanIDIteration}`);
  });

  // fetching nicknames and clans
  const playersDataPromises = playersUrls.map((e) => limit(() => fetch(e).then((r) => r.json())));
  const clansDataPromises = clanUrls.map((e) => limit(() => fetch(e).then((r) => r.json())));

  const playersData = await Promise.all(playersDataPromises) as PlayerApiResponse[];
  const clansData = await Promise.all(clansDataPromises) as ClanApiResponse[];

  data.forEach((page) => {
    page.forEach((player) => {
      if (player.account_id) {
        const accId = player.account_id.toString();
        for (const playerRes of playersData) {
          if (!playerRes.data[accId]) continue;
          player.nickname = playerRes.data[accId].nickname;
        }
      }
      if (player.clan_id) {
        const clanId = player.clan_id.toString();
        for (const clanRes of clansData) {
          if (!clanRes.data[clanId]) continue;
          player.clanname = clanRes.data[clanId].name;
          player.tag = clanRes.data[clanId].tag;
        }
      }
    });
  });

  // write the file out to this direction, under a name given in .env file
  fs.writeFile(`./${fileName}.json`, JSON.stringify(data), (err) => { if (err) throw err; });
};

fetchPlayers();
