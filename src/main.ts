import repl from 'repl';
import DumbQL from './dumbql';

const dumbQL = new DumbQL();

dumbQL.connectToDatabase('myfirstdumbqldb');

const replCtx = repl.start('dumbQL > ').context;
replCtx.createDatabase = dumbQL.createDatabase;
replCtx.connectToDatabase = dumbQL.connectToDatabase;
replCtx.db = dumbQL.documents;
