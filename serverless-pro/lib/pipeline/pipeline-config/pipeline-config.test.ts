import { environments } from './pipeline-config';

// the config is deterministic so we can test this in our code
describe('pipeline-config', () => {
  it('should return the correct config for feature-dev', () => {
    expect(environments.featureDev).toMatchSnapshot();
  });

  it('should return the correct config for staging', () => {
    expect(environments.staging).toMatchSnapshot();
  });

  it('should return the correct config for prod', () => {
    expect(environments.prod).toMatchSnapshot();
  });
});
