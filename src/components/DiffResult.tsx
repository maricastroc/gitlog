import type { Commit, RepoInfo } from "@/types";
import { groupBy } from "@/lib/commitStats";
import { catStyle } from "@/lib/categoryStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

type Props = {
  commits: Commit[];
  baseline: Commit[];
  repoInfo: RepoInfo;
  baseFrom: string;
  baseTo: string;
};

function DiffCategoryCard({
  cat,
  curr,
  prev,
  currTotal,
  baseTotal,
}: {
  cat: string;
  curr: number;
  prev: number;
  currTotal: number;
  baseTotal: number;
}) {
  const delta = curr - prev;
  const pctCurr = Math.round((curr / currTotal) * 100);
  const pctPrev = Math.round((prev / baseTotal) * 100);
  const style = catStyle(cat);
  const deltaLabel = delta === 0 ? "=" : delta > 0 ? `+${delta}` : `${delta}`;
  const deltaColor = delta > 0 ? "text-add" : delta < 0 ? "text-fix" : "text-text-dim";
  const multiplier = prev > 0 ? (curr / prev).toFixed(1) : null;

  return (
    <div className={`rounded-lg border border-line bg-panel p-3 border-l-2 ${style.accent}`}>
      <p className={`text-[10px] uppercase tracking-widest mb-2 ${style.text}`}>{cat}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[28px] leading-none font-bold font-display ${style.text}`}>
          {curr}
        </span>
        <span className={`text-[12px] font-mono font-semibold ${deltaColor}`}>{deltaLabel}</span>
      </div>
      <div className="text-text-dim text-[10px] font-mono mt-1">
        {pctCurr}% vs {pctPrev}% before
      </div>
      {multiplier && prev > 0 && delta !== 0 && (
        <div className={`text-[10px] font-mono mt-1.5 ${delta > 0 ? "text-add" : "text-fix"}`}>
          {delta > 0 ? `${multiplier}× growth` : `${multiplier}× of before`}
        </div>
      )}
      <div className="mt-2 flex gap-0.5 h-1">
        <div className={`rounded-full ${style.bar} opacity-40`} style={{ width: `${pctPrev}%` }} />
        <div
          className={`rounded-full ${style.bar}`}
          style={{ width: `${Math.abs(pctCurr - pctPrev)}%` }}
        />
      </div>
    </div>
  );
}

export default function DiffResult({ commits, baseline, repoInfo, baseFrom, baseTo }: Props) {
  const currTotal = commits.length || 1;
  const baseTotal = baseline.length || 1;
  const currByCat = groupBy(commits, "category");
  const baseByCat = groupBy(baseline, "category");
  const allCats = [...new Set([...Object.keys(currByCat), ...Object.keys(baseByCat)])].sort();

  const arrow = <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5 inline mx-0.5" />;
  const currLabel = repoInfo.from ? (
    <>
      {repoInfo.from} {arrow} {repoInfo.to ?? "HEAD"}
    </>
  ) : (
    <>current</>
  );
  const baseLabel = baseFrom ? (
    <>
      {baseFrom} {arrow} {baseTo}
    </>
  ) : (
    <>baseline</>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-[10px] font-mono uppercase tracking-widest">
        <span className="text-add">
          ▪ {currLabel} ({commits.length} commits)
        </span>
        <span className="text-text-dim">
          ▪ {baseLabel} ({baseline.length} commits)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {allCats.map((cat) => (
          <DiffCategoryCard
            key={cat}
            cat={cat}
            curr={currByCat[cat] ?? 0}
            prev={baseByCat[cat] ?? 0}
            currTotal={currTotal}
            baseTotal={baseTotal}
          />
        ))}
      </div>
    </div>
  );
}
