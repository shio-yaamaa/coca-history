import * as querystring from 'querystring';
import got from 'got';
import * as tough from 'tough-cookie';

import { History } from './history';
import { Dom, bodyToDom, getMoreButtonLink, getHistoriesInPage } from './coca-parser';

const baseUrl = 'https://www.english-corpora.org/coca/';
const topUrl = baseUrl;
const loginUrl = `${baseUrl}login.asp`;
const historyUrl = `${baseUrl}history.asp`;

interface UserCredentials {
  email: string;
  password: string;
}

export const getAllHistories = async (credentials: UserCredentials): Promise<History[]> => {
  const cookieJar = await prepareCookieJar();
  await login(credentials, cookieJar);
  const historyPages = await fetchHistoryPages(cookieJar);
  return historyPages
    .map(page => getHistoriesInPage(page))
    .reduce((previous, current) => previous.concat(current));
};

const prepareCookieJar = async (): Promise<tough.CookieJar> => {
  const cookieJar = new tough.CookieJar();
  await got(topUrl, { cookieJar });
  return cookieJar;
};

const login = async (credentials: UserCredentials, cookieJar: tough.CookieJar) => {
  const queryParams = querystring.stringify({
    email: credentials.email,
    password: credentials.password,
    B1: 'Log in',
    e: '',
  });
  await got(`${loginUrl}?${queryParams}`, { cookieJar });
};

// The link to next page is specified as href of the "MORE" button,
// which exists even in the last and subsequent nonexistent pages.
// This function detects the last page by an empty "ID" query param in the href,
// and returns null.
const nextHistoryPageUrl = (dom: Dom): string | null => {
  const moreButtonLink = getMoreButtonLink(dom);
  const queryParams = querystring.parse(moreButtonLink.split('?')[1]);
  const isLastPage = queryParams['ID'].length === 0;
  return isLastPage ? null : (topUrl + moreButtonLink);
};

const fetchHistoryPages = async (cookieJar: tough.CookieJar): Promise<Dom[]> => {
  const pages: Dom[] = [];
  let nextPageUrl = historyUrl;
  do {
    const response = await got(nextPageUrl, { cookieJar });
    pages.push(bodyToDom(response.body));
  } while (nextPageUrl = nextHistoryPageUrl(pages[pages.length - 1]));
  return pages;
};