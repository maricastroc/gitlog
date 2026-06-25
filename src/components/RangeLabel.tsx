import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

type Props = { from?: string; to?: string };

export default function RangeLabel({ from, to }: Props) {
  if (!from) return <>HEAD</>;
  return (
    <>
      {from} <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5 inline" /> {to ?? "HEAD"}
    </>
  );
}
