import Constants from 'expo-constants';

export function isExpoGoRuntime(): boolean {
  const appOwnership = Constants.appOwnership;
  const executionEnvironment = Constants.executionEnvironment;

  return appOwnership === 'expo' || executionEnvironment === 'storeClient';
}
