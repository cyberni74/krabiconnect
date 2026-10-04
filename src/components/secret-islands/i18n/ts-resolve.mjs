// Node resolve hook so extract.ts can import project files that use extensionless imports.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (specifier.startsWith(".") && !/\\.[cm]?[jt]sx?$/.test(specifier)) return next(specifier + ".ts", context);
    throw err;
  }
}`),
  import.meta.url,
);
