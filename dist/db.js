"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideos = exports.getRankings = exports.addVideos = void 0;
const mysql_1 = __importDefault(require("mysql"));
const env_db_1 = require("./config/env_db");
const winston_1 = require("./log/winston");
const connection = mysql_1.default.createConnection(env_db_1.dbconfig);
function addVideos(videos) {
    return new Promise(function (resolve, reject) {
        winston_1.logger.info('[ACCESS] addVideos');
        const rankedDate = new Date();
        videos.forEach(video => {
            winston_1.logger.info(video);
            const videoId = video.videoId;
            const title = video.title;
            const channelTitle = video.channelTitle;
            const publishedAt = new Date(video.publishedAt);
            const tag = video.tags ? (video.tags).toString() : '';
            const categoryId = video.categoryId;
            const ranking = video.ranking;
            const platform = video.platform;
            winston_1.logger.info('[ACCESS] addVideos - sqlVideo');
            const sqlVideo = `INSERT IGNORE INTO 
            video (videoId, title, channelTitle, publishedAt, tag, categoryId, platform)
            VALUES (?,?,?,?,?,?,?);`;
            connection.query(sqlVideo, [videoId, title, channelTitle, publishedAt, tag, categoryId, platform], (error, rows) => {
                if (error) {
                    winston_1.logger.error(`[ERROR] addVideos - sqlVideo ${error}`);
                    reject();
                }
                ;
            });
            winston_1.logger.info('[SUCCESS] addVideos - sqlVideo');
            winston_1.logger.info('[ACCESS] addVideos - sqlRanking');
            const sqlRanking = `INSERT INTO ranking (videoId, ranking, rankedDate, platform) VALUES (?,?,?,?);`;
            connection.query(sqlRanking, [videoId, ranking, rankedDate, platform], (error, rows) => {
                if (error) {
                    winston_1.logger.error('[ERROR] addVideos - sqlRanking' + error);
                    reject();
                }
                ;
            });
            winston_1.logger.info('[SUCCESS] addVideos - sqlRanking');
        });
        winston_1.logger.info('[SUCCESS] addVideos');
        resolve();
    });
}
exports.addVideos = addVideos;
;
function getRankings(date, platform) {
    return new Promise(function (resolve, reject) {
        winston_1.logger.info('[ACCESS] getRankings');
        const sqlRanking = `SELECT videoId, ranking FROM ranking WHERE DATE(rankedDate)=DATE("${date}") AND platform=${platform};`;
        connection.query(sqlRanking, (error, rows) => {
            const rankingMap = new Map();
            if (error) {
                winston_1.logger.error('[ERROR] getRankings ' + error);
                reject();
            }
            ;
            const rawRankings = rows;
            rawRankings.forEach(rawRanking => {
                rankingMap.set(rawRanking.videoId, rawRanking.ranking);
            });
            winston_1.logger.info('[SUCCESS] getRankings');
            resolve(rankingMap);
        });
    });
}
exports.getRankings = getRankings;
;
function getVideos(rankingMap) {
    return new Promise(function (resolve, reject) {
        winston_1.logger.info('[ACCESS] getVideos');
        const videoIds = Array.from(rankingMap.keys());
        const condition = '"' + videoIds.join('","') + '"';
        const sqlVideo = `SELECT videoId, title, channelTitle, publishedAt, tag, categoryId, platform FROM video WHERE videoId IN (${condition});`;
        connection.query(sqlVideo, (error, rows) => {
            if (error) {
                winston_1.logger.error(`[ERROR] getVideos - sqlVideo ${error}`);
                reject();
            }
            ;
            const rawVideos = rows;
            const videos = [];
            rawVideos.forEach(rawVideo => {
                const rank = rankingMap.get(rawVideo.videoId);
                const video = {
                    publishedAt: rawVideo.publishedAt,
                    title: rawVideo.title,
                    channelTitle: rawVideo.channelTitle,
                    tags: rawVideo.tag.split(','),
                    categoryId: rawVideo.categoryId,
                    ranking: rank,
                    videoId: rawVideo.videoId,
                    platform: rawVideo.platform,
                };
                videos.push(video);
            });
            winston_1.logger.info('[SUCCESS] getVideos');
            resolve(videos);
        });
    });
}
exports.getVideos = getVideos;
;
