import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const STEPS = ["Repository", "Range", "Changelog"];

export default function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-mono font-medium border-2 transition-all ${
                i < step
                  ? "border-add bg-add text-bg"
                  : i === step
                    ? "border-add bg-transparent text-add"
                    : "border-line bg-transparent text-line"
              }`}
            >
              {i < step ? <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> : i + 1}
            </div>
            <span
              className={`text-[11px] font-mono whitespace-nowrap ${
                i === step ? "text-text" : i < step ? "text-add" : "text-line"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 h-px mb-5 mx-1 ${i < step ? "bg-add" : "bg-line"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
