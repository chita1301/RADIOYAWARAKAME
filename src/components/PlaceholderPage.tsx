import Link from "next/link";

export function PlaceholderPage({
  title,
  phaseNote,
}: {
  title: string;
  phaseNote: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-50 to-amber-50 px-6 py-16 text-center">
      <h1 className="text-xl font-bold text-sky-900">{title}</h1>
      <p className="text-sm text-sky-700">{phaseNote}</p>
      <Link href="/home" className="text-sm font-medium text-sky-600 underline">
        ホームに戻る
      </Link>
    </div>
  );
}
