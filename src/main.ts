import repl from 'repl';
import fs from 'fs';

import DumbQL from './dumbql';
import Document from './document';
import { IDatabase } from './dbTypes';

const dumbQL = new DumbQL();

const { documents } = dumbQL.connectToDatabase('myfirstdumbqldb');

fs.writeFileSync(
  'src/dbTypes.ts',
  `import Document from './document';\n\nexport interface IDatabase {\n${documents
    .map((doc) => `  ${doc}: Document;\n`)
    .join('\n')}}\n`,
);

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
