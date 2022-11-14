import repl from 'repl';
import * as dumbQL from './dumbql';

repl.start('dumbQL > ').context.dumbQL = dumbQL;
