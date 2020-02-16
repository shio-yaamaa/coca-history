import * as path from 'path';
import * as fs from 'fs-extra';
import { format } from '@fast-csv/format';

import { History } from './history';
import { formatDate } from './date';

interface OutputOptions {
  sort: 'ASC' | 'DESC';
  withIndex: boolean;
}

const sortedHeaders: (keyof History)[] = [
  'index',
  'date',
  'corpus',
  'word',
  'section',
  'type',
];

export const outputCsv = (filePath: string, histories: History[], options: OutputOptions) => {
  const sortedHistories = options.sort === 'ASC' ? histories.reverse() : histories;
  const headers = sortedHeaders.filter(header => header != 'index' || options.withIndex);

  const fileAbsolutePath = path.resolve(process.cwd(), filePath);
  fs.ensureFileSync(fileAbsolutePath);
  const stream = format({ headers });
  stream.pipe(fs.createWriteStream(fileAbsolutePath));
  for (const history of sortedHistories) {
    stream.write(headers.map(header => {
      return header === 'date' ? formatDate(history[header]) : history[header];
    }));
  }
  stream.end();
};