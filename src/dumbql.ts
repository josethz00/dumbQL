import fs from 'fs';
import path from 'path';
import { DB } from './db';
import Document from './document';

export default class DumbQL {
  public documents: Record<string, Document> = {};

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
   */
  public connectToDatabase(dbName: string) {
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
    docs.forEach((doc) => {
      this.documents[doc] = new Document(doc);
    });
  }
}
