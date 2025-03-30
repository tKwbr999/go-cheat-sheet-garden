import { useEffect, useState, useRef } from "react"; // useRef を追加
import Header from "@/components/Header";
import CheatSheetSection from "@/components/CheatSheetSection"; // 後で使う
import SectionLoader from '@/components/SectionLoader';
import GoLogo from "@/components/GoLogo";
import { ArrowUp } from "lucide-react";
// bundled-cheatsheet-data のインポートを削除
// import bundledCheatSheetData from "@/data/bundled-cheatsheet-data";
import TableOfContents from "@/components/TableOfContents";
import { useVirtualizer } from "@tanstack/react-virtual"; // 追加
import type { CheatSheetSection as CheatSheetSectionType } from "@/data/types"; // 型をインポート

// マニフェストファイルの型定義 (仮)
interface SectionManifestItem {
  id: string;
  title: string;
}

const Index = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sectionsManifest, setSectionsManifest] = useState<SectionManifestItem[]>([]); // マニフェストデータ用 state
  const [loadingManifest, setLoadingManifest] = useState(true); // ローディング状態
  const [errorManifest, setErrorManifest] = useState<string | null>(null); // エラー状態

  // スクロールコンテナ用の ref
  const parentRef = useRef<HTMLDivElement>(null);

  // マニフェストファイルのフェッチ
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        setLoadingManifest(true);
        setErrorManifest(null);
        const response = await fetch('/data/sections-manifest.json'); // public ディレクトリからのパス
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SectionManifestItem[] = await response.json();
        setSectionsManifest(data);
      } catch (e) {
        console.error("Failed to fetch sections manifest:", e);
        setErrorManifest("チートシートの目次を読み込めませんでした。");
      } finally {
        setLoadingManifest(false);
      }
    };
    fetchManifest();
  }, []);

  // 仮想化の設定
  const rowVirtualizer = useVirtualizer({
    count: sectionsManifest.length, // セクションの数
    getScrollElement: () => parentRef.current, // スクロール要素
    estimateSize: () => 500, // より現実的な初期推定値に変更
    overscan: 5, // 表示領域外に事前にレンダリングするアイテム数
    // measureElement は要素の ref に渡す
  });

  // スクロールボタンの表示制御 (変更なし)
  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) { // スクロール要素を基準にする
        const offset = parentRef.current.scrollTop;
        setShowScrollButton(offset > 500);
      }
    };
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, []); // parentRef.current が変わることはないので依存配列は空

  const scrollToTop = () => {
    parentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-background min-h-screen flex flex-col"> {/* flex-col を追加 */}
      <Header />

      {/* Main content section with Table of Contents */}
      {/* スクロールコンテナとして機能させるため overflow-auto と高さを設定 */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <section className="pt-8 pb-16"> {/* Headerの高さを考慮してpt調整 */}
          <div className="container mx-auto max-w-10xl flex gap-4">
            {/* Table of Contents Sidebar */}
            {/* 目次にはマニフェストデータを渡す */}
            <TableOfContents sections={sectionsManifest} className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)]" /> {/* sticky と高さを追加 */}
            {/* Main Content Area */}
            <main className="flex-1">
              {/* 仮想化リストのコンテナ */}
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {loadingManifest && <div>目次を読み込み中...</div>}
                {errorManifest && <div className="text-red-500">{errorManifest}</div>}
                {/* 仮想化されたアイテムのレンダリング */}
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const sectionInfo = sectionsManifest[virtualItem.index];
                  if (!sectionInfo) return null; // 念のためチェック

                  return (
                    <div
                      key={sectionInfo.id}
                      // measureElement が参照できるように ref を設定
                      ref={rowVirtualizer.measureElement}
                      // data-index を設定 (measureElement の推奨)
                      data-index={virtualItem.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        // height は measureElement が計測するので不要になる場合があるが、
                        // 初期レンダリングや推定のために残すか、削除するかは挙動を見て判断。
                        // ここでは一旦残す。
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      id={sectionInfo.id} // アンカーリンク用ID
                    >
                      {/* SectionLoader に measureRef と index を渡す */}
                      <SectionLoader sectionId={sectionInfo.id} measureRef={rowVirtualizer.measureElement} index={virtualItem.index} />
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-secondary py-12 border-t border-border mt-auto"> {/* mt-auto を追加 */}
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <GoLogo size={28} className="mr-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Go Cheatsheet © {new Date().getFullYear()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Go is an open source programming language supported by Google
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-gradient-primary text-primary-foreground p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          showScrollButton
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

export default Index;
