import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'com.raize.stockanalyzer',
  appPath: 'app',
  appResourcesPath: '../../tools/assets/App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    minSdkVersion: 23,
    targetSdkVersion: 33,
    maxSdkVersion: 33,
    generatesSignedApk: true,
    keystorePath: "raize.keystore",
    keystorePassword: "raize123",
    keystoreAlias: "raize",
    keystoreAliasPassword: "raize123"
  }
} as NativeScriptConfig;