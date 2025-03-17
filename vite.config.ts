import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pages用のベースパスを設定
  // HashRouterを使用する場合、ベースURLは単純な相対パスでよい
  const base = process.env.GITHUB_PAGES ? "/go-cheat-sheet-garden/" : "./";
  
  return {
    base,
    define: {
      'import.meta.env.GITHUB_PAGES': JSON.stringify(process.env.GITHUB_PAGES)
    },
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});