import { useEffect, useState, useRef } from "react"; // useRef を追加 (HEAD)
import Header from "@/components/Header";
// CheatSheetSection は SectionLoader 内で使われるのでここでは不要かも
// import CheatSheetSection from "@/components/CheatSheetSection";
import SectionLoader from "@/components/SectionLoader";
import GoLogo from "@/components/GoLogo";
import { ArrowUp } from "lucide-react";
// bundled-cheatsheet-data のインポートを削除 (HEAD)
import TableOfContents from "@/components/TableOfContents";
import { useVirtualizer } from "@tanstack/react-virtual"; // 追加 (HEAD)
// 型インポートは SectionLoader 内で使われるのでここでは不要かも
// import type { CheatSheetSection as CheatSheetSectionType } from "@/data/types";

// マニフェストファイルの型定義 (HEAD)
interface SectionManifestItem {
  id: string;
  title: string;
}

const Index = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sectionsManifest, setSectionsManifest] = useState<
    SectionManifestItem[]
  >([]); // マニフェストデータ用 state (HEAD)
  const [loadingManifest, setLoadingManifest] = useState(true); // ローディング状態 (HEAD)
  const [errorManifest, setErrorManifest] = useState<string | null>(null); // エラー状態 (HEAD)

  // スクロールコンテナ用の ref (HEAD)
  const parentRef = useRef<HTMLDivElement>(null);

  // マニフェストファイルのフェッチ (HEAD)
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        setLoadingManifest(true);
        setErrorManifest(null);
        const response = await fetch(`${import.meta.env.BASE_URL}data/sections-manifest.json`);
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

  // 仮想化の設定 (HEAD)
  const rowVirtualizer = useVirtualizer({
    count: sectionsManifest.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500, // レビューコメント対応後の値
    overscan: 5,
  });

  // スクロールボタンの表示制御 (HEAD - parentRef 基準)
  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) {
        const offset = parentRef.current.scrollTop;
        setShowScrollButton(offset > 500);
      }
    };
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // scrollToTop (HEAD - parentRef 基準)
  const scrollToTop = () => {
    parentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {" "}
      {/* flex-col を追加 (HEAD) */}
      <Header />
      {/* Main content section with Table of Contents */}
      {/* pt-20 はヘッダー分 */}
      <section className="flex-1 pt-20 pb-16"> {/* flex と overflow-hidden を削除 */}
        {/* Table of Contents Sidebar - fixed positioning */}
        <TableOfContents
          sections={sectionsManifest}
          className="hidden lg:block fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] overflow-y-auto border-r border-border" /* fixed, left-0, w-64, border-r を追加 */
        />
        {/* Main Content Area - スクロールコンテナ */}
        {/* container を削除し、main に直接 padding と margin を適用 */}
        <main ref={parentRef} className="flex-1 overflow-auto lg:ml-64 px-4 md:px-6"> {/* lg:ml-64 と padding を追加 */}
            {/* 仮想化リストのコンテナ (HEAD) */}
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {loadingManifest && <div>目次を読み込み中...</div>}
              {errorManifest && (
                <div className="text-red-500">{errorManifest}</div>
              )}
              {/* 仮想化されたアイテムのレンダリング (HEAD) */}
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const sectionInfo = sectionsManifest[virtualItem.index];
                if (!sectionInfo) return null;

                return (
                  <div
                    key={sectionInfo.id}
                    ref={rowVirtualizer.measureElement} // レビューコメント対応
                    data-index={virtualItem.index} // レビューコメント対応
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    id={sectionInfo.id}
                  >
                    {/* SectionLoader を使用 (HEAD), props 渡し修正済み */}
                    <SectionLoader
                      sectionId={sectionInfo.id}
                      measureRef={rowVirtualizer.measureElement}
                      index={virtualItem.index}
                    />
                  </div>
                );
              })}
            </div>
          </main>
        {/* この div は section の子要素である必要があった */}
        {/* </div> */} {/* この div は不要 */}
      </section>
      {/* Footer */}
      {/* mt-auto を追加 (HEAD) */}
      <footer className="bg-secondary py-12 border-t border-border mt-auto">
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
      {/* onClick は parentRef を使う (HEAD) */}
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
