import { DecamelPipe } from './decamel.pipe';

describe('DecamelPipe', () => {
  it('create an instance', () => {
    const pipe = new DecamelPipe();
    expect(pipe).toBeTruthy();
  });
});
