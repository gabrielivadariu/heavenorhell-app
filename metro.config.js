const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const config = getDefaultConfig(__dirname);
const previous = config.resolver.blockList;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Native projects and backend are not mobile JavaScript sources. Excluding them
// also prevents Metro from downloading cloud-backed native build assets.
config.resolver.blockList = [
  ...(Array.isArray(previous) ? previous : previous ? [previous] : []),
  /(?:^|\/)node_modules\.backup-[^/]+(?:\/|$)/,
  ...['ios', 'android', 'backend', 'heavenorhell', '.sixth', '.expo', '.git', '.release-backup-sdk51'].map(folder =>
    new RegExp('^' + escape(path.join(__dirname, folder)) + '(/|$)')
  )
];
module.exports = config;
