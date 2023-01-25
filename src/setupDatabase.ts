import Logger from "bunyan";
import mongoose from "mongoose";
import { config } from "./config";

const log: Logger = config.createLogger("database");

export default () => {
  const connect = () => {
    mongoose
      .connect("mongodb://127.0.0.1:27017/chattapp")
      .then(() => {
        log.info("successfully connected to the database");
      })
      .catch((error) => {
        log.error(error);
        process.exit(1);
      });
  };

  connect();

  mongoose.connection.on("disconnected", connect);
};
