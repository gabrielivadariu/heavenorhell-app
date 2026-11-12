const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(fs.readFileSync('src/services/revenuecat.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

function setup(env = {}) {
  const pkg = { identifier: '$rc_monthly', product: { identifier: 'store.monthly', priceString: '24,99 lei', subscriptionPeriod: 'P1M' } };
  const info = { entitlements: { active: { premium: {} } } };
  const state = { configureCount: 0, bought: null, offerings: { current: { identifier: 'default', availablePackages: [pkg] }, all: {} } };
  const sdk = {
    setLogLevel: async () => {},
    configure: () => { state.configureCount++; },
    isConfigured: async () => true,
    getAppUserID: async () => "test-user",
    logIn: async () => ({customerInfo: info}),
    getOfferings: async () => state.offerings,
    purchasePackage: async (value) => { state.bought = value; return { customerInfo: info }; },
    restorePurchases: async () => info,
    getCustomerInfo: async () => info,
    invalidateCustomerInfoCache: async () => {}
  };
  const errors = { NETWORK_ERROR: '10', OFFLINE_CONNECTION_ERROR: '35', PAYMENT_PENDING_ERROR: '20', PURCHASE_NOT_ALLOWED_ERROR: '3', CONFIGURATION_ERROR: '23', INVALID_CREDENTIALS_ERROR: '11' };
  const context = {
    exports: {}, __DEV__: false,
    console: { warn: () => {} },
    process: { env: { EXPO_PUBLIC_REVENUECAT_API_KEY: 'appl_test', ...env } },
    require: (name) => {
      if (name === './installation') return {getInstallation: async () => ({id:'test-user',token:'test-token'})};
      if (name === 'react-native') return { Platform: { OS: 'ios' } };
      if (name.includes('async-storage')) return { __esModule: true, default: { getItem: async () => 'test-user' } };
      if (name === 'react-native-purchases') return { __esModule: true, default: sdk, LOG_LEVEL: { DEBUG: 'debug', WARN: 'warn' }, PURCHASES_ERROR_CODE: errors };
      throw new Error(`Unexpected dependency ${name}`);
    }
  };
  vm.runInNewContext(source, context);
  return { api: context.exports, sdk, state, pkg, info };
}

test('concurrent initialization configures the SDK once', async () => {
  const { api, state } = setup();
  await Promise.all([api.initRevenueCat(), api.initRevenueCat(), api.fetchPackageDetails()]);
  assert.equal(state.configureCount, 1);
});

test('loads localized price and ISO duration, purchases the displayed package', async () => {
  const { api, state, pkg } = setup();
  const { details } = await api.fetchPackageDetails();
  assert.equal(details.price, '24,99 lei');
  assert.equal(details.period, 'month');
  assert.equal(details.periodCount, 1);
  // A dashboard change after displaying a price must not change the purchase.
  state.offerings.current.availablePackages = [];
  assert.equal((await api.purchasePremium()).success, true);
  assert.equal(state.bought, pkg);
});

test('honors an explicit offering instead of using current', async () => {
  const { api, state, pkg } = setup({ EXPO_PUBLIC_REVENUECAT_OFFERING_ID: 'special' });
  state.offerings.current.availablePackages = [];
  state.offerings.all.special = { identifier: 'special', availablePackages: [pkg] };
  assert.ok((await api.fetchPackageDetails()).details);
});

test('does not silently substitute a different package or pinned product', async () => {
  const { api, state } = setup({ EXPO_PUBLIC_REVENUECAT_PRODUCT_ID: 'another.product' });
  assert.equal((await api.fetchPackageDetails()).reason, 'unavailable');
  assert.equal((await api.purchasePremium()).success, false);
  assert.equal(state.bought, null);
});

test('failed reload invalidates the previously purchasable package', async () => {
  const { api, sdk, state } = setup();
  await api.fetchPackageDetails();
  sdk.getOfferings = async () => { throw { code: '10' }; };
  assert.equal((await api.fetchPackageDetails()).reason, 'network');
  assert.equal((await api.purchasePremium()).reason, 'unavailable');
  assert.equal(state.bought, null);
});

test('cancelled purchases produce no error; pending payments stay inactive', async () => {
  const { api, sdk } = setup();
  await api.fetchPackageDetails();
  sdk.purchasePackage = async () => { throw { userCancelled: true }; };
  assert.equal((await api.purchasePremium()).reason, undefined);
  sdk.purchasePackage = async () => { throw { code: '20' }; };
  const pending = await api.purchasePremium();
  assert.equal(pending.success, false);
  assert.equal(pending.reason, 'pending');
});

test('completed store transaction without entitlement is not treated as Premium', async () => {
  const { api, info } = setup();
  await api.fetchPackageDetails();
  info.entitlements.active = {};
  assert.equal((await api.purchasePremium()).reason, 'notActivated');
  assert.equal((await api.restorePurchases()).reason, 'nothingToRestore');
  assert.equal(await api.checkPremiumStatus(), false);
});

test('missing SDK key prevents any store purchase', async () => {
  const { api, state } = setup({ EXPO_PUBLIC_REVENUECAT_API_KEY: '' });
  assert.equal((await api.fetchPackageDetails()).reason, 'unavailable');
  assert.equal((await api.purchasePremium()).success, false);
  assert.equal(state.configureCount, 0);
});
