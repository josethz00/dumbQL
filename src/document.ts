import fs from 'fs';
import { DB } from './db';

export default class Document {
  /**
   *
   * @param name - document name
   */
  constructor(private name: string) {}

  /**
   * Function that creates a document in the database.
   * @param param0 - document name and document schema (format)
   */
  public createDocument({
    docName,
    schema,
  }: {
    docName: string;
    schema: Record<
      string,
      {
        type: string;
        required?: boolean;
      }
    >;
  }) {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    db.documents[docName] = { schema };
    fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

    console.log(
      `Created document ${docName} in database "${DB.DATABASE_NAME}"`,
    );
  }

  /**
   * Function that inserts a document into the database.
   * @param param0 - document name and document data
   */
  public insertIntoDocument({
    docName,
    data,
  }: {
    docName: string;
    data: Record<string, unknown>;
  }) {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[docName];

    if (!doc) {
      throw new Error(`Document ${docName} does not exist.`);
    }

    const docData = doc.data || [];

    const docDataKeys = Object.keys(data);
    docDataKeys.forEach((key) => {
      if (!DB.ALLOWED_TYPES.includes(typeof data[key])) {
        throw new Error(
          `Type of ${key} is not allowed. Allowed types are ${DB.ALLOWED_TYPES.join(
            ', ',
          )}`,
        );
      }
    });

    docData.push({
      _id: docData.length + 1 || 1,
      ...data,
    });
    doc.data = docData;

    db.documents[docName] = doc;
    fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

    console.log(`Inserted data into document ${docName}`);
  }

  /**
   * Selects data from a document.
   * @param param0 - document name and query (where clause)
   * @returns
   */
  public selectFromDocument({
    docName,
    where,
  }: {
    docName: string;
    where: Record<string, unknown>;
  }) {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[docName];
    const docData = doc.data || [];

    if (!doc) {
      throw new Error(`Document ${docName} does not exist.`);
    }

    if (where) {
      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);

      const filteredData = docData.filter((data: { [x: string]: unknown }) => {
        return whereKeys.every((key, index) => {
          return data[key] === whereValues[index];
        });
      });

      console.table(filteredData);
      console.log(`Selected data from document ${docName}`);
      return;
    }

    console.table(docData);
    console.log(`Selected data from document ${docName}`);
  }

  /**
   * Function that deletes data from a document.
   * @param param0 - document name and query (where clause)
   * @returns {void}
   */
  public deleteFromDocument({
    docName,
    where,
  }: {
    docName: string;
    where: Record<string, unknown>;
  }): void {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[docName];
    const docData = doc.data || [];

    if (!doc) {
      throw new Error(`Document ${docName} does not exist.`);
    }

    if (where) {
      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);

      const filteredData = docData.filter((data: { [x: string]: unknown }) => {
        return whereKeys.every((key, index) => {
          return data[key] === whereValues[index];
        });
      });

      filteredData.forEach((data: { _id: number }) => {
        docData.splice(data._id - 1, 1); // _id -1 because array index starts at 0, but the _id count starts at 1
        // this will delete all the data that matches the where clause
      });

      doc.data = docData; // docData is now the remaining data that wasn't deleted
      db.documents[docName] = doc;
      fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

      console.log(`Deleted data from document ${docName}`);
      return;
    }

    doc.data = []; // if there is no where clause, delete all data (BE CAREFUL!)
    db.documents[docName] = doc;
    fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

    console.log(`Deleted data from document ${docName}`);
  }

  /**
   * Function that updates data in a document.
   * @param param0 - document name, query (where clause) and data to update
   * @returns {void}
   */
  public updateDocument({
    docName,
    where,
    newData,
  }: {
    docName: string;
    where: Record<string, unknown>;
    newData: Record<string, unknown>;
  }): void {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[docName];
    const docData = doc.data || [];

    if (!doc) {
      throw new Error(`Document ${docName} does not exist.`);
    }

    if (where) {
      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);

      const filteredData = docData.filter((data: { [x: string]: unknown }) => {
        return whereKeys.every((key, index) => {
          return data[key] === whereValues[index];
        });
      });

      filteredData.forEach((data: { _id: number }) => {
        const docDataIndex = data._id - 1;
        const updatedData = { ...docData[docDataIndex], ...newData };
        docData.splice(docDataIndex, 1, updatedData);
      });

      doc.data = docData;
      db.documents[docName] = doc;
      fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

      console.log(`Updated data from document ${docName}`);
      return;
    }

    throw new Error('No where clause provided.');
  }
}
