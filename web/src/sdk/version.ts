/**
 * Centralized gPhone Versioning & Smart Build Information
 */

export const GPHONE_VERSION: string =
  typeof __GPHONE_VERSION__ !== 'undefined' ? __GPHONE_VERSION__ : '1.0.0';

export const GPHONE_BUILD_INFO: string =
  typeof __GPHONE_BUILD_INFO__ !== 'undefined' ? __GPHONE_BUILD_INFO__ : `v${GPHONE_VERSION}-dev`;
