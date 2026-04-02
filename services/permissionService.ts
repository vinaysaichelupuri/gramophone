import { Platform } from 'react-native';

import { isExpoGoRuntime } from '@/utils/runtime';

export type AudioPermissionState = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface AudioPermissionResult {
  status: AudioPermissionState;
  canAskAgain: boolean;
}

type ReactNativePermissionsModule = typeof import('react-native-permissions');

let cachedPermissionsModule: ReactNativePermissionsModule | null | undefined;

function getPermissionsModule(): ReactNativePermissionsModule | null {
  if (cachedPermissionsModule !== undefined) {
    return cachedPermissionsModule;
  }

  if (isExpoGoRuntime()) {
    cachedPermissionsModule = null;
    return cachedPermissionsModule;
  }

  try {
    const moduleValue = require('react-native-permissions') as ReactNativePermissionsModule;
    cachedPermissionsModule = moduleValue;
  } catch {
    cachedPermissionsModule = null;
  }

  return cachedPermissionsModule;
}

function getAndroidAudioPermission(permissionsModule: ReactNativePermissionsModule) {
  const androidVersion =
    typeof Platform.Version === 'string' ? Number.parseInt(Platform.Version, 10) : Platform.Version;

  if (androidVersion >= 33) {
    return permissionsModule.PERMISSIONS.ANDROID.READ_MEDIA_AUDIO;
  }

  return permissionsModule.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
}

function mapPermissionStatus(
  status: string,
  permissionsModule: ReactNativePermissionsModule
): AudioPermissionState {
  if (status === permissionsModule.RESULTS.GRANTED || status === permissionsModule.RESULTS.LIMITED) {
    return 'granted';
  }

  if (status === permissionsModule.RESULTS.BLOCKED) {
    return 'blocked';
  }

  if (status === permissionsModule.RESULTS.UNAVAILABLE) {
    return 'unavailable';
  }

  return 'denied';
}

export async function requestAudioPermission(): Promise<AudioPermissionResult> {
  if (Platform.OS !== 'android') {
    return { status: 'granted', canAskAgain: false };
  }

  const permissionsModule = getPermissionsModule();
  if (!permissionsModule) {
    return { status: 'unavailable', canAskAgain: false };
  }

  const permission = getAndroidAudioPermission(permissionsModule);
  const currentStatus = await permissionsModule.check(permission);

  if (
    currentStatus === permissionsModule.RESULTS.GRANTED ||
    currentStatus === permissionsModule.RESULTS.LIMITED
  ) {
    return { status: 'granted', canAskAgain: false };
  }

  if (currentStatus === permissionsModule.RESULTS.BLOCKED) {
    return { status: 'blocked', canAskAgain: false };
  }

  const requestedStatus = await permissionsModule.request(permission);
  const mappedStatus = mapPermissionStatus(requestedStatus, permissionsModule);

  return {
    status: mappedStatus,
    canAskAgain: mappedStatus === 'denied',
  };
}

export async function openPermissionSettings(): Promise<void> {
  const permissionsModule = getPermissionsModule();
  if (!permissionsModule) {
    return;
  }

  await permissionsModule.openSettings();
}
