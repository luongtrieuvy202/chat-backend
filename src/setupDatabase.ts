import Logger from 'bunyan';
import mongoose from 'mongoose';
import { config } from './config';
import { redisConnection } from './shared/services/redis/redis.connection';

const log: Logger = config.createLogger('database');

export default () => {
  const connect = () => {
    mongoose
      .connect('mongodb://127.0.0.1:27017/chattapp')
      .then(() => {
        log.info('successfully connected to the database');
        redisConnection.connect();
      })
      .catch((error) => {
        log.error(error);
        process.exit(1);
      });
  };

  connect();

  mongoose.connection.on('disconnected', connect);
};
