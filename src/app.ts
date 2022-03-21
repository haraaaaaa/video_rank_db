import express from 'express';
import { addVideos, getVideos, getRankings } from './db';
import { logger } from './log/winston';

const app = express();

 app.use(express.json());
 app.use(express.urlencoded({extended:true}));

app.post('/addVideos', async (req, res) => {
  logger.info('POST /addVideos');
  const videos:Video[] = req.body.videos;
  logger.info(videos[0]);
  await addVideos(videos);
  res.send();
});

app.get('/getVideos', async (req, res) => {
  logger.info('GET /getVideos');
  const date = req.query.date as string;
  const platform = req.query.platform as string;
  const rankings:Map<string, number> = await getRankings(date, platform);
  const videos:Video[] = await getVideos(rankings);
  res.send(videos);
});

app.listen(8080, () => {
  logger.info('db server started!');
});
