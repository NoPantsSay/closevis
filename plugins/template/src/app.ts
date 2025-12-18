import type { Plugin } from "@shared/plugin"
import { Plane } from "./plane";
import { Setting } from "./settings";
import { name, version, author, description } from '../package.json';

export default {
    name,
    version,
    author,
    description,
    plane: Plane,
    setting: Setting
} satisfies Plugin;