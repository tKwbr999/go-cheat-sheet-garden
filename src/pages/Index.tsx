import { useEffect, useState } from "react";
import Header from "@/components/Header";
import CheatSheetSection from "@/components/CheatSheetSection";
import GoLogo from "@/components/GoLogo";
import { ArrowUp } from "lucide-react";
// bundled-cheatsheet-data から直接インポート
import bundledCheatSheetData from "@/data/bundled-cheatsheet-data";
import TableOfContents from "@/components/TableOfContents";

const Index = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  // 全データを直接取得
  const cheatSheetData = bundledCheatSheetData;

  // スクロールボタンの表示制御
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setShowScrollButton(offset > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />

      {/* Main content section with Table of Contents */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto max-w-10xl flex gap-4">
          {/* Table of Contents Sidebar */}
          <TableOfContents className="hidden lg:block" />
          {/* Main Content Area */}
          <main className="flex-1">
            <div className="">
              {/* 全データを使ってセクションをレンダリング */}
              {cheatSheetData.map((sectionInfo) => (
                <CheatSheetSection
                  key={sectionInfo.id}
                  sectionData={sectionInfo}
                />
              ))}
            </div>
          </main>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 border-t border-border">
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
