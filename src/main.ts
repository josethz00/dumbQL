import repl from 'repl';
import DumbQL from './dumbql';
import Document from './document';

const dumbQL = new DumbQL();

const documents = dumbQL.connectToDatabase('myfirstdumbqldb');

const db: {
  [key: typeof documents[number]]: Document;
} = documents.reduce(
  (
    acc: {
      [key: typeof documents[number]]: Document;
    },
    docName: string,
  ) => {
    acc[docName] = new Document(docName);
    return acc;
  },
  {},
);

const replCtx = repl.start('dumbQL > ').context;
replCtx.createDatabase = dumbQL.createDatabase;
replCtx.connectToDatabase = dumbQL.connectToDatabase;
replCtx.db = db;
