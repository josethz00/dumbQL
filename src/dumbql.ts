import fs from 'fs';
import path from 'path';
import { DB } from './db';

export default class DumbQL {
  /**
   * A dumb query language for JSON files.
   * @param param0 - database name
   */
  public createDatabase({ dbName }: { dbName: string }) {
    DB.DATABASE_NAME = dbName;
    DB.DATABASE_PATH = path.join(DB.DATABASE_PATH, `${DB.DATABASE_NAME}.json`);

    if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'data'));
    }
    fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify({ documents: {} }));

    console.log(`Created database ${dbName} at ${DB.DATABASE_PATH}`);
  }

  /**
   * Connects to a database.
   * @param dbName - database name
   * @returns {{documents: string[]}} - array of documents in the database
   */
  public connectToDatabase(dbName: string): {
    documents: string[];
  } {
    DB.DATABASE_NAME = dbName;
    DB.DATABASE_PATH = path.join(DB.DATABASE_PATH, `${DB.DATABASE_NAME}.json`);

    if (!fs.existsSync(DB.DATABASE_PATH)) {
      throw new Error(`Database ${dbName} does not exist.`);
    }

    const docs = Object.keys(
      JSON.parse(
        fs.readFileSync(DB.DATABASE_PATH, {
          encoding: 'utf-8',
        }),
      ).documents,
    );

    return {
      documents: docs,
    };
  }

  /**
   * Deletes a database.
   */
  public deleteDatabase(dbName: string) {
    DB.DATABASE_NAME = dbName;
    DB.DATABASE_PATH = path.join(DB.DATABASE_PATH, `${DB.DATABASE_NAME}.json`);

    if (!fs.existsSync(DB.DATABASE_PATH)) {
      throw new Error(`Database ${dbName} does not exist.`);
    }

    fs.unlinkSync(DB.DATABASE_PATH);
    console.log(`Deleted database ${dbName}`);
  }
}
