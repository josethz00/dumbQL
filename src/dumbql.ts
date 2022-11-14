import fs from 'fs';
import path from 'path';

/**
 * Returns the path to the dumbql file.
 * @returns {string} The path to the dumbql.json file
 */
const getDbName = (): string => {
  if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    return '';
  }
  return fs.readdirSync(path.join(__dirname, '..', 'data'))[0];
};

const DB = {
  DATABASE_NAME: getDbName(),
  DATABASE_PATH: ((): string => {
    if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
      return path.join(__dirname, '..', 'data');
    }
    return path.join(__dirname, '..', 'data', getDbName());
  })(),
};

const allowedTypes = ['string', 'number', 'boolean', 'object', 'array'];

/**
 * A dumb query language for JSON files.
 * @param param0 - database name
 */
export const createDatabase = ({ dbName }: { dbName: string }) => {
  DB.DATABASE_NAME = dbName;
  DB.DATABASE_PATH = path.join(DB.DATABASE_PATH, `${DB.DATABASE_NAME}.json`);

  if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'));
  }
  fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify({ documents: {} }));

  console.log(`Created database ${dbName} at ${DB.DATABASE_PATH}`);
};

/**
 * Function that creates a document in the database.
 * @param param0 - document name and document schema (format)
 */
export const createDocument = ({
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
}) => {
  const db = JSON.parse(
    fs.readFileSync(DB.DATABASE_PATH, {
      encoding: 'utf-8',
    }),
  );
  db.documents[docName] = { schema };
  fs.writeFileSync(DB.DATABASE_PATH, JSON.stringify(db));

  console.log(`Created document ${docName} in database "${DB.DATABASE_NAME}"`);
};

/**
 * Function that inserts a document into the database.
 * @param param0 - document name and document data
 */
export const insertIntoDocument = ({
  docName,
  data,
}: {
  docName: string;
  data: Record<string, unknown>;
}) => {
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
    if (!allowedTypes.includes(typeof data[key])) {
      throw new Error(
        `Type of ${key} is not allowed. Allowed types are ${allowedTypes.join(
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
};

/**
 * Selects data from a document.
 * @param param0 - document name and query (where clause)
 * @returns
 */
export const selectFromDocument = ({
  docName,
  where,
}: {
  docName: string;
  where: Record<string, unknown>;
}) => {
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
    throw new Error('Where clause not implemented yet.');
  }

  console.table(docData);
  console.log(`Selected data from document ${docName}`);
};
