import repl from 'repl';
import fs from 'fs';

import DumbQL from './dumbql';
import Document from './document';
import { IDatabase } from './dbTypes';

const dumbQL = new DumbQL();

const replCtx = repl.start('dumbQL > ').context;
replCtx.createDatabase = dumbQL.createDatabase;
replCtx.connectToDatabase = dumbQL.connectToDatabase;

const { documents } = dumbQL.connectToDatabase('myfirstdumbqldb');

fs.writeFileSync(
  'src/dbTypes.ts',
  `import Document from './document';\n\nexport interface IDatabase {\n${documents
    .map((doc) => `  ${doc}: Document;`)
    .join('\n')}\n}\n`,
);

if (documents.length === 0) {
  // this is to prevent the script from crashing if there are no documents in the database
  // and consequently IDatabase is an empty object type
  console.log('No documents found.');
  process.exit(0);
}

const db: IDatabase = documents.reduce((acc, doc) => {
  acc[doc as keyof IDatabase] = new Document(doc);
  return acc;
}, {} as IDatabase);

replCtx.db = db;
