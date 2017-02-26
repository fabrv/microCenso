import { MicroCensoPage } from './app.po';

describe('micro-censo App', () => {
  let page: MicroCensoPage;

  beforeEach(() => {
    page = new MicroCensoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
