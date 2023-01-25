import dotenv from "dotenv";
import bunyan from "bunyan";

dotenv.config();

class Config {
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;

  public CLIENT_URL: string | undefined;

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: "debug" });
  }

  public validationConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} undefined`);
      }
    }
  }
}

export const config: Config = new Config();
