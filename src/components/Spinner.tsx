type Props = { color?: string; size?: string };

export default function Spinner({ color = "border-text-dim", size = "w-3 h-3" }: Props) {
  return (
    <span
      className={`${size} border ${color} border-t-transparent rounded-full animate-spin shrink-0`}
    />
  );
}
