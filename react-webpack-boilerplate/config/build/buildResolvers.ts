import { BuildOptions } from "./types/config";
import webpack from "webpack";

export function buildResolvers(options: BuildOptions): webpack.ResolveOptions {
    return {
        extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
        alias: {
            "@": options.paths.src,
        },
    };
}
