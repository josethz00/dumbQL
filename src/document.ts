import fs from 'fs';
import { DB } from './db';

export default class Document {
  /**
   *
   * @param name - document name
   */
  constructor(private name: string) {}

  /**
   * Function that inserts a document into the database.
   * @param param0 - document name and document data
   */
  public insertIntoDocument({ data }: { data: Record<string, unknown> }) {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[this.name];

    if (!doc) {
      throw new Error(`Document ${this.name} does not exist.`);
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

    db.documents[this.name] = doc;
    fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

    console.log(`Inserted data into document ${this.name}`);
  }

  /**
   * Selects data from a document.
   * @param param0 - document name and query (where clause)
   * @returns
   */
  public selectFromDocument({ where }: { where: Record<string, unknown> }) {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[this.name];
    const docData = doc.data || [];

    if (!doc) {
      throw new Error(`Document ${this.name} does not exist.`);
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
      console.log(`Selected data from document ${this.name}`);
      return;
    }

    console.table(docData);
    console.log(`Selected data from document ${this.name}`);
  }

  /**
   * Function that deletes data from a document.
   * @param param0 - document name and query (where clause)
   * @returns {void}
   */
  public deleteFromDocument({
    where,
  }: {
    where: Record<string, unknown>;
  }): void {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[this.name];
    const docData = doc.data || [];

    if (!doc) {
      throw new Error(`Document ${this.name} does not exist.`);
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
      db.documents[this.name] = doc;
      fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

      console.log(`Deleted data from document ${this.name}`);
      return;
    }

    doc.data = []; // if there is no where clause, delete all data (BE CAREFUL!)
    db.documents[this.name] = doc;
    fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

    console.log(`Deleted data from document ${this.name}`);
  }

  /**
   * Function that updates data in a document.
   * @param param0 - document name, query (where clause) and data to update
   * @returns {void}
   */
  public updateDocument({
    where,
    newData,
  }: {
    where: Record<string, unknown>;
    newData: Record<string, unknown>;
  }): void {
    const db = JSON.parse(
      fs.readFileSync(DB.DATABASE_PATH, {
        encoding: 'utf-8',
      }),
    );
    const doc = db.documents[this.name];
    const docData = doc.data || [];

    if (!doc) {
      throw new Error(`Document ${this.name} does not exist.`);
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
      db.documents[this.name] = doc;
      fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

      console.log(`Updated data from document ${this.name}`);
      return;
    }

    throw new Error('No where clause provided.');
  }
}
