const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Potrzebne do Expo Go
// FIXME: usunąć przy przejściu na development build.

const topicStub = path.resolve(
  __dirname,
  "src/notifications/expoGoTopicStub.js",
);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "./TopicSubscriptionModule" &&
    context.originModulePath.includes("expo-notifications")
  ) {
    return { type: "sourceFile", filePath: topicStub };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = withNativeWind(config, { input: "./global.css" });
