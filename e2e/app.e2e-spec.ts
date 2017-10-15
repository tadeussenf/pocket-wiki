import { PocketPage } from './app.po';

describe('pocket App', () => {
  let page: PocketPage;

  beforeEach(() => {
    page = new PocketPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
