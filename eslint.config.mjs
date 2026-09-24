import {defineConfig,globalIgnores} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
 ...nextVitals,
 ...nextTypescript,
 {
  rules:{
   "@typescript-eslint/no-explicit-any":"off",
   "@typescript-eslint/no-unused-vars":"off",
   "@next/next/no-img-element":"off",
   "@next/next/no-html-link-for-pages":"off",
   "@next/next/no-before-interactive-script-outside-document":"off",
   "react-hooks/set-state-in-effect":"off",
   "react-hooks/purity":"off",
   "react-hooks/exhaustive-deps":"off",
   "prefer-rest-params":"off",
   "prefer-const":"off",
  }
 },
 globalIgnores([".next/**","coverage/**","next-env.d.ts"]),
]);
