import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import CheatSheetSection from "@/components/CheatSheetSection";
import GoLogo from "@/components/GoLogo";
import { ArrowUp } from "lucide-react";
// getCheatSheetData をインポート
import { getCheatSheetData } from "@/data/cheatsheet-loader";
// 必要であれば CheatSheetSection 型もインポート
// import type { CheatSheetSection as SectionData } from "@/data/types";

// SectionIndexItem 型は不要になったので削除

const Index = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  // getCheatSheetData を呼び出してセクションデータを取得
  // 型は getCheatSheetData の返り値 (CheatSheetSection & { id: string })[] になる
  const cheatSheetData = getCheatSheetData();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 500) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-background min-h-screen"> {/* Updated background */}
      <Header />

      {/* Hero Section - Consider adding content or styling later */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-5xl"> {/* Added max-w-5xl for consistency */}
          {/* Main Content */}
          <div className="mt-16">
            {/* cheatSheetData をループ */}
            {cheatSheetData.map((sectionInfo) => (
              <CheatSheetSection
                key={sectionInfo.id} // key は一意な id を使う
                title={sectionInfo.title}
                // codeExamples は渡さず、代わりに sectionId を渡す
                sectionId={sectionInfo.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 border-t border-border"> {/* Updated background and border */}
        <div className="container mx-auto max-w-5xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <GoLogo size={28} className="mr-3 text-muted-foreground" /> {/* Adjusted logo color */}
              <p className="text-muted-foreground"> {/* Updated text color */}
                Go Cheatsheet © {new Date().getFullYear()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm"> {/* Updated text color */}
                Go is an open source programming language supported by Google
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-gradient-primary text-primary-foreground p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${ // Updated background and text color, added hover/active effects
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