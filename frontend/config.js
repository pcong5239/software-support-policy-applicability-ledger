export const DEFAULT_CONFIG = Object.freeze({
  network: "studionet",
  contractAddress: "",
  sdkVersion: "1.1.8",
});

export const NETWORKS = Object.freeze({
  localnet: "localnet",
  studionet: "studionet",
  testnetBradbury: "testnetBradbury",
});

export const EXPLORERS = Object.freeze({
  localnet: "http://localhost:8080",
  studionet: "https://explorer-studio.genlayer.com",
  testnetBradbury: "https://explorer-bradbury.genlayer.com",
});
