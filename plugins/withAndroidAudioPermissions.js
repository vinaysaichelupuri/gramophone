const { withAndroidManifest } = require('@expo/config-plugins');

function ensurePermission(usesPermissions, permissionName, maxSdkVersion) {
  const existingPermission = usesPermissions.find(
    (permission) => permission?.$?.['android:name'] === permissionName
  );

  if (existingPermission) {
    if (maxSdkVersion) {
      existingPermission.$['android:maxSdkVersion'] = String(maxSdkVersion);
    }
    return;
  }

  const nextPermission = {
    $: {
      'android:name': permissionName,
    },
  };

  if (maxSdkVersion) {
    nextPermission.$['android:maxSdkVersion'] = String(maxSdkVersion);
  }

  usesPermissions.push(nextPermission);
}

module.exports = function withAndroidAudioPermissions(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults.manifest;
    const usesPermissions = manifest['uses-permission'] ?? [];

    ensurePermission(usesPermissions, 'android.permission.READ_MEDIA_AUDIO');
    ensurePermission(usesPermissions, 'android.permission.READ_EXTERNAL_STORAGE', 32);
    ensurePermission(usesPermissions, 'android.permission.FOREGROUND_SERVICE');
    ensurePermission(usesPermissions, 'android.permission.FOREGROUND_SERVICE_AUDIO_PLAYBACK');
    ensurePermission(usesPermissions, 'android.permission.WAKE_LOCK');

    manifest['uses-permission'] = usesPermissions;
    return configWithManifest;
  });
};
