# wg-aof-to-json

A set of small scripts that can be used to fetch [World of Tanks Alley of Fame](https://worldoftanks.eu/en/clanwars/rating/alley/#wot&aof_front=we_2023_bg&aof_rating=clans&aof_filter=all&aof_page=0&aof_size=25) and export the result to JSON files.

## Disclaimer

With Wargaming introducing silent breaking API changes overnight, considering there's still no proper documentation for it, I decided to stop developing these scripts any further. It just isn't worth my time. I can't spend my time on API that returns undefined behaviour in an unpredictable manner. It forced me to introduce the limit of parallel queries when i first made the script I used that slowed it down a lot, we were on to some pages randomly returning 504 HTTP errors on day 2 of the Iron Age campaign, we've come to the point where i'd just had enough of this and i can't be bothered to develop workarounds for a tragic API solution.  
If you wanted to try the scripts yourself, as of 17.02.2023 clans script works just fine, while players fail if there is an undefined page (which at this point there is every time I run it). While that could also be checked for, and these pages just skipped, I think it's better if it just throws an error, because otherwise you would be ending up with partially corrupted data which would be pretty useless anyway.

## Prerequisites

[Node.js](https://nodejs.org/en/)

## Usage

1. Run `npm i` in the terminal in project's directory.
1. Fill the `.env` file out.
1. Run whichever script you want using `node <name of the file>`, e.g. `node players.js` to fetch players AoF
