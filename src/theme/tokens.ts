import { Platform } from "react-native";

export const palette = {
  background: "#0B0E12", surface: "#15191F", elevated: "#1D232A",
  border: "#2C3035", text: "#F5F0E7", muted: "#AAA8A5",
  gold: "#E9C68B", ivory: "#FAE8C4", ember: "#E49B83", violet: "#BDAFD9"
};
export const serif = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });
export const portalArt = require("../../assets/sanctuary-portal.jpg");
export const personaColors = { god: palette.gold, devil: palette.ember, council: palette.violet };
