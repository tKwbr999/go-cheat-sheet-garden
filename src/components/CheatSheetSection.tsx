import CodeBlock from "./CodeBlock";
import type { CheatSheetSection as SectionData } from "@/data/types";

interface CheatSheetSectionProps {
  sectionData: SectionData & { id: string }; // 完全なデータを受け取る
  className?: string;
}

const CheatSheetSection: React.FC<CheatSheetSectionProps> = ({
  sectionData, // Props からデータを受け取る
  className = "",
}) => {
  const { id: sectionId, title, codeExamples } = sectionData; // データからIDとタイトルを取得

  // isLoading や error、キャッシュ関連の state は不要

  return (
    <section
      id={sectionId} // id 属性は維持
      className={`mb-6 ${className}`}
      // minHeight は不要になる (データが最初からあるため)
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="code-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* データは常に存在するので、ローディングやエラー表示は不要 */}
        {codeExamples.length > 0 ? (
          codeExamples.map((example, index) => (
            <div key={example.title + index}>
              <CodeBlock
                title={example.title}
                code={example.code}
                description={example.description}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-muted-foreground">
            <p>No code examples available for this section.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CheatSheetSection;
