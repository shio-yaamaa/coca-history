import * as yargs from 'yargs';

import { getAllHistories } from './coca-request';
import { outputCsv } from './output-csv';

const argv = yargs.argv;

const main = async () => {
  if (argv.email && argv.password) {
    try {
      const histories = await getAllHistories({
        email: argv.email as string,
        password: argv.password as string,
      });
      outputCsv('output/coca-history.csv', histories, {
        sort: 'ASC',
        withIndex: false,
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    console.error('Provide your email and password as command line arguments');
  }
}

main();