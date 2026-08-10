"use client";

import { useActionState, useRef, useState } from "react";
import { saveCardLayoutAction, type CardLayoutFormState } from "@/app/admin/card/actions";

interface StampInfo {
  id: string;
  dayNumber: number;
  name: string;
  imageUrl: string | null;
}

interface PositionState {
  xPct: number;
  yPct: number;
  sizePct: number;
  rotation: number;
}

interface NamePositionState {
  xPct: number;
  yPct: number;
  fontSize: number;
  color: string;
}

const DEFAULT_STAMP_SIZE = 16;
const DEFAULT_NAME: NamePositionState = { xPct: 50, yPct: 6, fontSize: 16, color: "#1e293b" };

function defaultPositionFor(index: number): PositionState {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { xPct: 15 + col * 23, yPct: 25 + row * 30, sizePct: DEFAULT_STAMP_SIZE, rotation: 0 };
}

const initialState: CardLayoutFormState = { error: null };

export function CardLayoutEditor({
  backgroundImageUrl,
  stamps,
  initialPositions,
  initialNamePosition,
}: {
  backgroundImageUrl: string | null;
  stamps: StampInfo[];
  initialPositions: (PositionState & { stampId: string })[];
  initialNamePosition: NamePositionState | null;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState<Record<string, PositionState>>(() => {
    const map: Record<string, PositionState> = {};
    stamps.forEach((stamp, index) => {
      const saved = initialPositions.find((p) => p.stampId === stamp.id);
      map[stamp.id] = saved
        ? {
            xPct: saved.xPct,
            yPct: saved.yPct,
            sizePct: saved.sizePct,
            rotation: saved.rotation,
          }
        : defaultPositionFor(index);
    });
    return map;
  });

  const [namePos, setNamePos] = useState<NamePositionState>(initialNamePosition ?? DEFAULT_NAME);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(saveCardLayoutAction, initialState);

  function updateFromPointer(clientX: number, clientY: number, id: string) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));

    if (id === "name") {
      setNamePos((prev) => ({ ...prev, xPct, yPct }));
    } else {
      setPositions((prev) => ({ ...prev, [id]: { ...prev[id], xPct, yPct } }));
    }
  }

  function handlePointerDown(id: string) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      setSelected(id);
      setDragging(id);
      (e.target as Element).setPointerCapture(e.pointerId);
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY, dragging);
  }

  function handlePointerUp() {
    setDragging(null);
  }

  const selectedPosition: PositionState | NamePositionState | null =
    selected === "name" ? namePos : selected ? positions[selected] : null;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative aspect-[3/4] w-full max-w-sm touch-none overflow-hidden rounded-2xl border-2 border-slate-200 bg-amber-50 select-none"
        style={
          backgroundImageUrl
            ? {
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {stamps.map((stamp) => {
          const pos = positions[stamp.id];
          if (!pos) return null;
          return (
            <div
              key={stamp.id}
              onPointerDown={handlePointerDown(stamp.id)}
              className={`absolute flex aspect-square cursor-grab items-center justify-center overflow-hidden rounded-full border-2 bg-white/90 shadow ${
                selected === stamp.id ? "border-sky-500" : "border-white"
              }`}
              style={{
                left: `${pos.xPct}%`,
                top: `${pos.yPct}%`,
                width: `${pos.sizePct}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
              }}
            >
              {stamp.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storageの任意の公開URLを表示するため
                <img
                  src={stamp.imageUrl}
                  alt={stamp.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="text-xs text-slate-500">{stamp.dayNumber}</span>
              )}
            </div>
          );
        })}

        <div
          onPointerDown={handlePointerDown("name")}
          className={`absolute cursor-grab rounded px-2 py-1 whitespace-nowrap select-none ${
            selected === "name" ? "ring-2 ring-sky-500" : ""
          }`}
          style={{
            left: `${namePos.xPct}%`,
            top: `${namePos.yPct}%`,
            transform: "translate(-50%, -50%)",
            fontSize: `${namePos.fontSize}px`,
            color: namePos.color,
          }}
        >
          参加者名
        </div>
      </div>

      {selected && selectedPosition && (
        <SelectedControls
          isName={selected === "name"}
          position={selectedPosition}
          onChangePosition={(next) => {
            if (selected === "name") {
              setNamePos((prev) => ({ ...prev, ...next }));
            } else {
              setPositions((prev) => ({
                ...prev,
                [selected]: { ...prev[selected], ...next },
              }));
            }
          }}
        />
      )}

      <form
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set(
            "positions",
            JSON.stringify(stamps.map((stamp) => ({ stampId: stamp.id, ...positions[stamp.id] })))
          );
          fd.set("namePosition", JSON.stringify(namePos));
          formAction(fd);
        }}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          カード背景画像
          <input
            type="file"
            name="backgroundImage"
            accept="image/*"
            className="rounded border border-slate-300 p-2"
          />
        </label>

        {state.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-800 px-5 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}

function SelectedControls({
  isName,
  position,
  onChangePosition,
}: {
  isName: boolean;
  position: PositionState | NamePositionState;
  onChangePosition: (next: Partial<PositionState & NamePositionState>) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <p className="font-medium text-slate-700">
        {isName ? "ログイン名の設定" : "選択中のスタンプの設定"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="X (%)"
          value={position.xPct}
          onChange={(value) => onChangePosition({ xPct: value })}
        />
        <NumberField
          label="Y (%)"
          value={position.yPct}
          onChange={(value) => onChangePosition({ yPct: value })}
        />
        {isName ? (
          <>
            <NumberField
              label="文字サイズ"
              value={(position as NamePositionState).fontSize}
              onChange={(value) => onChangePosition({ fontSize: value })}
            />
            <label className="flex flex-col gap-1 text-slate-600">
              文字色
              <input
                type="color"
                value={(position as NamePositionState).color}
                onChange={(e) => onChangePosition({ color: e.target.value })}
                className="h-9 w-full rounded border border-slate-300"
              />
            </label>
          </>
        ) : (
          <>
            <NumberField
              label="サイズ (%)"
              value={(position as PositionState).sizePct}
              onChange={(value) => onChangePosition({ sizePct: value })}
            />
            <NumberField
              label="回転 (°)"
              value={(position as PositionState).rotation}
              onChange={(value) => onChangePosition({ rotation: value })}
            />
          </>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-slate-600">
      {label}
      <input
        type="number"
        value={Math.round(value * 10) / 10}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="rounded border border-slate-300 p-1"
      />
    </label>
  );
}
