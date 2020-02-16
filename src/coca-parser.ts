import * as jsdom from 'jsdom';

import { relativeToAbsoluteDate } from './date';
import { History } from './history';

export type Dom = jsdom.JSDOM;

const historyPropToColumnTitle = new Map<keyof History, string>([
  ['index', 'HELP'],
  ['corpus', 'CORPUS'],
  ['word', 'WORD(S)'],
  ['section', 'SECTION'],
  ['type', 'TYPE'],
  ['date', 'WHEN'],
]);

export const bodyToDom = (body: string): Dom => new jsdom.JSDOM(body);

// The "MORE" button is is in the 4th table in the page
export const getMoreButtonLink = (dom: Dom): string | null => {
  const moreTable = Array.from(dom.window.document.querySelectorAll('table'))[3];
  if (!moreTable) return null;
  const moreButton = moreTable.querySelector('a');
  if (!moreButton || !moreButton.href || moreButton.href.length === 0) return null;
  return moreButton.href;
};

const mapHistoryPropToColumnIndex = (titleRow: HTMLTableRowElement): Map<keyof History, number> => {
  const columnTitles = Array.from(titleRow.querySelectorAll('td')).map(td => td.textContent);
  return new Map<keyof History, number>(
    Array.from(historyPropToColumnTitle.entries()).map(([historyProp, columnTitle]) => {
      const columnIndex = columnTitles.findIndex(title => title.includes(columnTitle));
      return [historyProp, columnIndex];
    })
  );
};

const getTdTextContents = (row: HTMLTableRowElement, historyPropToColumnIndex: Map<keyof History, number>): Map<keyof History, string> => {
  const tds = Array.from(row.querySelectorAll('td'));
  return new Map<keyof History, string>(
    Array.from(historyPropToColumnIndex.entries()).map(([historyProp, columnIndex]) => {
      return [historyProp, tds[columnIndex].textContent.trim()];
    })
  );
};

// Each row in the 3rd table in the page represents a history entry
export const getHistoriesInPage = (dom: Dom): History[] => {
  const historyTable = Array.from(dom.window.document.querySelectorAll('table'))[2];
  const titleRow = historyTable.querySelector('tr');
  const historyPropToColumnIndex = mapHistoryPropToColumnIndex(titleRow);
  const rows = Array.from(historyTable.querySelectorAll('tr')).slice(1);
  return rows.map(row => {
    const tdTextContents = getTdTextContents(row, historyPropToColumnIndex);
    return {
      index: parseInt(tdTextContents.get('index')),
      corpus: tdTextContents.get('corpus'),
      word: tdTextContents.get('word'),
      section: tdTextContents.get('section'),
      type: tdTextContents.get('type'),
      date: relativeToAbsoluteDate(tdTextContents.get('date')),
    };
  });
};