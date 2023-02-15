"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = __importDefault(require("node-fetch"));
var p_limit_1 = __importDefault(require("p-limit"));
var fs_1 = __importDefault(require("fs"));
require("dotenv/config");
// wrapping the code in an async function
var fetchPlayers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var appId, eventId, frontId, fileName, limit, pageRes, pageCount, urls, i, url, initDataTBP, fetchData, data, pUrls, cUrls, initPlayersData, initClansData, playersData, clansData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!process.env.APP_ID || !process.env.EVENT_ID || !process.env.FRONT_ID)
                    throw new Error("One or more required parameters not specified in .env");
                appId = process.env.APP_ID;
                eventId = process.env.EVENT_ID;
                frontId = process.env.FRONT_ID;
                fileName = process.env.PLAYERS_OUTPUT_FILENAME || "playersOutput";
                limit = (0, p_limit_1.default)(10);
                return [4 /*yield*/, (0, node_fetch_1.default)("https://api.worldoftanks.eu/wot/globalmap/eventaccountratings/?application_id=".concat(appId, "&event_id=").concat(eventId, "&front_id=").concat(frontId, "&fields=rank&limit=100&in_rating=1")).then(function (e) { return e.json(); })];
            case 1:
                pageRes = _a.sent();
                pageCount = pageRes.meta.page_total;
                urls = [];
                for (i = 1; i <= pageCount; i++) {
                    url = "https://api.worldoftanks.eu/wot/globalmap/eventaccountratings/?application_id=".concat(appId, "&event_id=").concat(eventId, "&front_id=").concat(frontId, "&fields=rank%2C+account_id%2C+clan_id%2C+battles%2C+fame_points%2C+fame_points_to_improve_award&page_no=").concat(i, "&limit=100&in_rating=1");
                    urls.push(url);
                }
                initDataTBP = urls.map(function (e) { return limit(function () { return (0, node_fetch_1.default)(e).then(function (r) { return r.json(); }); }); });
                return [4 /*yield*/, Promise.all(initDataTBP)];
            case 2:
                fetchData = _a.sent();
                data = [];
                // for (const page of fetchData) {
                //   data.push(page.data);
                // }
                fetchData.forEach(function (page) {
                    data.push(page.data);
                });
                pUrls = [];
                cUrls = [];
                data.forEach(function (page) {
                    var iterationOfPIDs = [];
                    var iterationOfCIDs = [];
                    page && page.forEach(function (player) {
                        iterationOfPIDs.push(player.account_id);
                        if (iterationOfCIDs.indexOf(player.clan_id) === -1 && player.clan_id) {
                            iterationOfCIDs.push(player.clan_id);
                        }
                    });
                    pUrls.push("https://api.worldoftanks.eu/wot/account/info/?application_id=".concat(appId, "&account_id=").concat(iterationOfPIDs, "&fields=nickname"));
                    cUrls.push("https://api.worldoftanks.eu/wot/clans/info/?application_id=".concat(appId, "&fields=tag%2C+name&clan_id=").concat(iterationOfCIDs));
                });
                initPlayersData = pUrls.map(function (e) { return limit(function () { return (0, node_fetch_1.default)(e).then(function (r) { return r.json(); }); }); });
                initClansData = cUrls.map(function (e) { return limit(function () { return (0, node_fetch_1.default)(e).then(function (r) { return r.json(); }); }); });
                return [4 /*yield*/, Promise.all(initPlayersData)];
            case 3:
                playersData = _a.sent();
                return [4 /*yield*/, Promise.all(initClansData)];
            case 4:
                clansData = _a.sent();
                data.forEach(function (page) {
                    page.forEach(function (player) {
                        if (player.account_id) {
                            var accId = player.account_id.toString();
                            for (var _i = 0, playersData_1 = playersData; _i < playersData_1.length; _i++) {
                                var e = playersData_1[_i];
                                if (e.data[accId]) {
                                    player.nickname = e.data[accId].nickname;
                                }
                            }
                        }
                        if (player.clan_id) {
                            var clanId = player.clan_id.toString();
                            for (var _a = 0, clansData_1 = clansData; _a < clansData_1.length; _a++) {
                                var e = clansData_1[_a];
                                if (e.data[clanId]) {
                                    player.clanname = e.data[clanId].name;
                                    player.tag = e.data[clanId].tag;
                                }
                            }
                        }
                    });
                });
                // write the file out to this direction, under a name given in .env file
                fs_1.default.writeFile("./".concat(fileName, ".json"), JSON.stringify(data), function (err) { if (err)
                    throw err; });
                return [2 /*return*/];
        }
    });
}); };
fetchPlayers();
