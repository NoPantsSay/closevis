import type { Plugin } from "@shared/plugin";
import { author, description, name, version } from "../package.json";
import { Plane } from "./plane";
import { Setting } from "./settings";

export default {
  name,
  version,
  author,
  description,
  plane: Plane,
  setting: Setting,
} satisfies Plugin;
