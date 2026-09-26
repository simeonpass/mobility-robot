import {afterEach, expect, it, vi} from 'vitest';

afterEach(() => {vi.unstubAllGlobals(); vi.resetModules();});

it('queues Google commands in its documented Arguments format, only initializes once', async () => {
  const dataLayer: IArguments[] = [];
  vi.stubGlobal('window', {dataLayer});
  const {initGa4} = await import('./analytics');
  initGa4('G-TEST');
  initGa4('G-TEST');
  expect(dataLayer).toHaveLength(2);
  expect(Object.prototype.toString.call(dataLayer[0])).toBe('[object Arguments]');
  expect(Array.from(dataLayer[1])).toEqual(['config', 'G-TEST', {send_page_view: false}]);
});
