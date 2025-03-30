import React, { useState, useEffect, useRef } from 'react';
import CheatSheetSection from '@/components/CheatSheetSection';
import type { CheatSheetSection as CheatSheetSectionType } from '@/data/types';
// Skeleton はロード中には表示しないため削除しても良い
// import { Skeleton } from "@/components/ui/skeleton";

interface SectionLoaderProps {
  sectionId: string;
  measureRef: (element: HTMLDivElement | null) => void;
  // 仮想化アイテムのインデックスを受け取る (デバッグ用など)
  index: number;
}

const SectionLoaderComponent: React.FC<SectionLoaderProps> = ({ sectionId, measureRef, index }) => {
  const [sectionData, setSectionData] = useState<CheatSheetSectionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // measureRef を内部の ref と連携させる
  // データロード完了後、またはエラー表示後に高さを計測
  useEffect(() => {
    if (!isLoading && rootRef.current) {
      // console.log(`Measuring element ${index} after load/error`);
      measureRef(rootRef.current);
    }
    // isLoading が true の間は計測しない (estimateSize に任せる)
  }, [measureRef, isLoading]); // isLoading の変化時に measureRef を呼び出す

  useEffect(() => {
    let isMounted = true;
    const fetchSectionData = async () => {
      // console.log(`Fetching data for section ${sectionId} (index: ${index})`);
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      // フェッチ開始時にデータをクリアしない方が表示がスムーズになる場合がある
      // setSectionData(null);

      try {
        const response = await fetch(`/data/sections/${sectionId}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CheatSheetSectionType = await response.json();
        if (isMounted) {
          // console.log(`Data fetched for section ${sectionId}`);
          setSectionData(data);
        }
      } catch (e) {
        console.error(`Failed to fetch section data for ${sectionId}:`, e);
        if (isMounted) {
          setError(`Failed to load section: ${sectionId}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSectionData();

    return () => {
      // console.log(`Unmounting SectionLoader for index ${index}`);
      isMounted = false;
    };
  }, [sectionId]);

  // ルート div は常にレンダリングし、ref を設定
  return (
    <div ref={rootRef} data-section-id={sectionId} data-index={index}>
      {/* isLoading が true の間は最小限の高さの要素を表示 */}
      {isLoading && (
        <div style={{ height: '1px', visibility: 'hidden' }}>Loading...</div> // 高さをほぼ0にし、非表示にする
      )}
      {error && (
        <div className="p-4 border rounded mb-4 bg-destructive text-destructive-foreground">{error}</div>
      )}
      {/* データロード完了後に CheatSheetSection を表示 */}
      {!isLoading && !error && sectionData && (
        <CheatSheetSection sectionData={{ ...sectionData, id: sectionId }} />
      )}
       {/* データがない場合のエラー表示 */}
      {!isLoading && !error && !sectionData && (
         <div className="p-4 border rounded mb-4 bg-muted">セクションデータを表示できません。</div>
      )}
    </div>
  );
};

const SectionLoader = React.memo(SectionLoaderComponent);

export default SectionLoader;