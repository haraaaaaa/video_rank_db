
import mysql from 'mysql';
import { dbconfig }from "./config/env_db";
import { logger } from './log/winston';

const connection = mysql.createConnection(dbconfig);

export function addVideos (videos:Video[]): Promise<void> {
    return new Promise(function (resolve, reject) {
        logger.info('[ACCESS] addVideos');
        const rankedDate = new Date();
        videos.forEach(video => {
            logger.info(video);
            const videoId = video.videoId;
            const title = video.title;
            const channelTitle = video.channelTitle;
            const publishedAt = new Date(video.publishedAt);
            const tag = video.tags? (video.tags).toString() : '';
            const categoryId = video.categoryId;
            const ranking = video.ranking;
            const platform = video.platform;
            logger.info('[ACCESS] addVideos - sqlVideo');
            const sqlVideo = 
            `INSERT IGNORE INTO 
            video (videoId, title, channelTitle, publishedAt, tag, categoryId, platform)
            VALUES (?,?,?,?,?,?,?);`;
            connection.query(sqlVideo, [videoId, title, channelTitle, publishedAt, tag, categoryId, platform ], (error, rows) => {
                if (error) {
                    logger.error(`[ERROR] addVideos - sqlVideo ${error}`);
                    reject();
                };
            });
            logger.info('[SUCCESS] addVideos - sqlVideo');
            logger.info('[ACCESS] addVideos - sqlRanking');
            const sqlRanking = 
                `INSERT INTO ranking (videoId, ranking, rankedDate, platform) VALUES (?,?,?,?);`;
            connection.query(sqlRanking, [videoId, ranking, rankedDate, platform],(error, rows) => {
                if (error) {
                    logger.error('[ERROR] addVideos - sqlRanking' + error);
                    reject();
                };
            });
            logger.info('[SUCCESS] addVideos - sqlRanking');
        });
        logger.info('[SUCCESS] addVideos');
        resolve();
    });
};

export function getRankings (date:string, platform:string): Promise<Map<string, number>> {
    return new Promise(function (resolve, reject) {
        logger.info('[ACCESS] getRankings');        
        const sqlRanking = 
        `SELECT videoId, ranking FROM ranking WHERE DATE(rankedDate)=DATE("${date}") AND platform=${platform};`; 
        connection.query(sqlRanking,(error, rows) => {
            const rankingMap = new Map<string, number>();
            if (error) {
                logger.error('[ERROR] getRankings '+error);
                reject();
            };            
            const rawRankings:{ videoId:string, ranking:number }[] = rows;
            rawRankings.forEach(rawRanking => {
                rankingMap.set(rawRanking.videoId, rawRanking.ranking); 
            });
            logger.info('[SUCCESS] getRankings');
            resolve(rankingMap);
        });
    });
};


export function getVideos (rankingMap:Map<string, number>): Promise<Video[]> {
    return new Promise(function (resolve, reject) {
        logger.info('[ACCESS] getVideos');
        const videoIds:string[] = Array.from(rankingMap.keys());
        const condition = '"'+videoIds.join('","')+'"';
        const sqlVideo = 
        `SELECT videoId, title, channelTitle, publishedAt, tag, categoryId, platform FROM video WHERE videoId IN (${condition});`;
        connection.query(sqlVideo, (error, rows) => {
            if (error) {
                logger.error(`[ERROR] getVideos - sqlVideo ${error}`);
                reject();
            };
            const rawVideos:RawVideo[] = rows;
            const videos:Video[] = [];
            rawVideos.forEach( rawVideo => {
               const rank =  rankingMap.get(rawVideo.videoId);
               const video: Video = {
                    publishedAt: rawVideo.publishedAt,
                    title: rawVideo.title,
                    channelTitle: rawVideo.channelTitle,
                    tags: rawVideo.tag.split(','),
                    categoryId: rawVideo.categoryId,
                    ranking: rank!,
                    videoId: rawVideo.videoId,
                    platform: rawVideo.platform,
               }
               videos.push(video);
            });
            logger.info('[SUCCESS] getVideos');
            resolve(videos);
        });
    });
};
