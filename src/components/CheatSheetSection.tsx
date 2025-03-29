import React, { useEffect, useRef, useState, useCallback } from "react";
import CodeBlock from "./CodeBlock";
import { getCheatSheetSection } from "@/data/cheatsheet-loader";
import type { CheatSheetSection as SectionData, CodeExample } from "@/data/types";
import { Skeleton } from "@/components/ui/skeleton"; // スケルトンコンポーネントをインポート

interface CheatSheetSectionProps {
  title: string;
  sectionId: string;
  className?: string;
}

const CheatSheetSection: React.FC<CheatSheetSectionProps> = ({
  title,
  sectionId,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false); // セクション表示アニメーション用
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]); // カード個別アニメーション用
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 初期値は false
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false); // データ取得済みフラグ

  // データ読み込み関数
  const loadData = useCallback(async () => {
    if (isLoading) return; // ロード中なら何もしない

    setIsLoading(true);
    setError(null);
    try {
      const data = await getCheatSheetSection(sectionId);
      if (data) {
        setSectionData(data);
        // カード表示状態とrefを初期化
        setVisibleCards(new Array(data.codeExamples.length).fill(false));
        cardRefs.current = new Array(data.codeExamples.length).fill(null);
        setHasLoaded(true); // ロード完了
      } else {
        setError(`Section data not found for ID: ${sectionId}`);
        setHasLoaded(true); // データが見つからない場合もロード試行は完了
      }
    } catch (err) {
      console.error(`Failed to load section data for ${sectionId}:`, err);
      setError("Failed to load section data.");
      setHasLoaded(true); // エラーの場合もロード試行は完了
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, hasLoaded, isLoading]);

  // sectionId が変更されたら状態をリセット
  useEffect(() => {
    setSectionData(null);
    setVisibleCards([]);
    cardRefs.current = [];
    setIsLoading(false);
    setError(null);
    setHasLoaded(false);
    setIsVisible(false); // アニメーション状態もリセット
    // Intersection Observer の再設定が必要な場合があるため注意
    // (依存配列に loadData, hasLoaded があるため、通常は自動で再設定されるはず)
  }, [sectionId]);

  // Intersection Observer (セクション全体) - データロードのトリガー
  useEffect(() => {
    // sectionRef.current が存在し、まだロードされていない場合のみ監視
    if (!sectionRef.current || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // アニメーション開始
          loadData();       // データロード開始
          observer.unobserve(entry.target); // 一度ロードしたら監視解除
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1, // 10%表示されたらロード開始
      }
    );

    observer.observe(sectionRef.current);

    // クリーンアップ
    const currentRef = sectionRef.current;
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadData, hasLoaded]); // loadData と hasLoaded に依存

  // Intersection Observer (カード個別) - 表示アニメーション用
  useEffect(() => {
    // データがロードされ、セクションが表示状態になったらカードの監視を開始
    if (!sectionData || !isVisible) return;

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleCards((prev) => {
              if (prev[index]) return prev; // 既に表示済みなら更新しない
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
            cardObserver.unobserve(entry.target); // 一度表示したら監視解除
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.3, // 30%表示されたらアニメーション開始
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) {
        cardObserver.observe(ref);
      }
    });

    // クリーンアップ
    const currentCardRefs = [...cardRefs.current]; // キャプチャ
    return () => {
      currentCardRefs.forEach((ref) => {
        if (ref) {
          cardObserver.unobserve(ref);
        }
      });
    };
  }, [sectionData, isVisible]); // sectionData と isVisible に依存

  return (
    <section
      id={sectionId} // Add id attribute
      ref={sectionRef}
      className={`mb-12 ${className} transition-opacity duration-500 ${ // mb-2 から mb-12 に変更して間隔調整
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between mb-4"> {/* mb-2 から mb-4 に変更 */}
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="code-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[150px]"> {/* min-h を少し増やす */}
        {/* 初期状態 or ローディング中 */}
        {!hasLoaded || isLoading ? (
          // スケルトン表示 (3列分)
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[25px] w-[150px] rounded-md" /> {/* Title Skeleton */}
              <Skeleton className="h-[125px] w-full rounded-xl" /> {/* Code Area Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80%]" /> {/* Description Skeleton */}
                <Skeleton className="h-4 w-[60%]" /> {/* Description Skeleton */}
              </div>
            </div>
          ))
        ) : error ? (
          // エラー表示
          <div className="col-span-full text-destructive">
            <p>{error}</p>
          </div>
        ) : sectionData && sectionData.codeExamples.length > 0 ? (
          // データ表示
          sectionData.codeExamples.map((example, index) => (
            <div
              key={example.title + index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`transition-opacity duration-500 ${
                visibleCards[index] ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: `${0.05 * index}s` }}
            >
              <CodeBlock
                title={example.title}
                code={example.code}
                description={example.description}
              />
            </div>
          ))
        ) : (
           // データなし表示 (sectionData はあるが codeExamples が空)
           <div className="col-span-full text-muted-foreground">
             <p>No code examples available for this section.</p>
           </div>
        )}
      </div>
    </section>
  );
};

export default CheatSheetSection;
