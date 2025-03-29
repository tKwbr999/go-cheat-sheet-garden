import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "./CodeBlock";
// 非同期ローダー関数と型をインポート
import { getCheatSheetSection } from "@/data/markdown-cheatsheet-loader";
import type { CheatSheetSection as SectionData, CodeExample } from "@/data/types"; // 型名を SectionData としてインポート

// Propsを更新: codeExamples を削除し、sectionId を追加
interface CheatSheetSectionProps {
  title: string;
  sectionId: string; // 追加
  className?: string;
}

const CheatSheetSection: React.FC<CheatSheetSectionProps> = ({
  title,
  sectionId, // sectionId を使用
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false); // セクション全体の表示アニメーション用
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]); // カード個別のアニメーション用
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 読み込んだセクションデータと状態管理用のstateを追加
  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // sectionId が変更されたらデータを非同期で読み込む
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setSectionData(null); // データリセット
      setVisibleCards([]); // カード表示状態リセット
      cardRefs.current = []; // refリセット
      try {
        const data = await getCheatSheetSection(sectionId);
        if (data) {
          setSectionData(data);
          // 読み込んだデータに基づいてカードの表示状態を初期化
          setVisibleCards(new Array(data.codeExamples.length).fill(false));
          cardRefs.current = new Array(data.codeExamples.length).fill(null);
        } else {
          setError(`Section data not found for ID: ${sectionId}`);
        }
      } catch (err) {
        console.error(`Failed to load section data for ${sectionId}:`, err);
        setError("Failed to load section data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sectionId]); // sectionId に依存

  // Intersection Observer (セクション全体とカード個別)
  useEffect(() => {
    // データロード後、または isVisible が true になった後にカード監視を開始
    if (isLoading || !sectionRef.current) return;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // セクションが見えたらアニメーション開始
          sectionObserver.unobserve(entry.target); // 一度表示したら監視解除
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 } // 10%見えたら
    );

    sectionObserver.observe(sectionRef.current);

    // カード個別の監視 (セクションが表示されてから開始)
    let cardObserver: IntersectionObserver | null = null;
    if (isVisible && sectionData) {
      cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = cardRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1 && entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[index] = true; // カードが見えたら表示状態をtrueに
                return newState;
              });
              cardObserver?.unobserve(entry.target); // 一度表示したら監視解除
            }
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.3 } // 30%見えたら
      );

      cardRefs.current.forEach((ref) => {
        if (ref) {
          cardObserver?.observe(ref);
        }
      });
    }

    // クリーンアップ関数
    const currentSectionRef = sectionRef.current; // unobserve用にrefをキャプチャ
    const currentCardRefs = [...cardRefs.current]; // unobserve用にref配列をキャプチャ
    return () => {
      if (currentSectionRef) {
        sectionObserver.unobserve(currentSectionRef);
      }
      currentCardRefs.forEach((ref) => {
        if (ref && cardObserver) {
          cardObserver.unobserve(ref);
        }
      });
    };
    // isVisible と sectionData の変更時にもeffectを再実行
  }, [isLoading, isVisible, sectionData]);

  return (
    <section
      ref={sectionRef}
      className={`mb-2 ${className} transition-opacity duration-500 ${ // アニメーションクラスを直接制御
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      // style={{ animationDelay: "0.2s" }} // animationDelay は不要に
    >
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-2">{title}</h2>
      </div>
      <div className="code-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px]"> {/* ローディング中に高さが潰れないように */}
        {isLoading && (
          <div className="col-span-full flex justify-center items-center">
             {/* ここにスピナーなどのローディング表示を追加 */}
             <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="col-span-full text-destructive">
            <p>{error}</p>
          </div>
        )}
        {/* データ読み込み後にカードを表示 */}
        {sectionData && sectionData.codeExamples.map((example, index) => (
          <div
            key={example.title + index} // より安定したキーに変更 (例)
            ref={(el) => (cardRefs.current[index] = el)}
            className={`transition-opacity duration-500 ${ // アニメーションクラスを直接制御
              visibleCards[index] ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: `${0.05 * index}s` }} // 遅延は transitionDelay で設定
          >
            <CodeBlock title={example.title} code={example.code} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CheatSheetSection;
