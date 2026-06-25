"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TARGET_DATE = "26.06.2026";
const TOTAL_DURATION_MS = 32000;

const stages = [
  { threshold: 0, label: "ИНИЦИАЛИЗАЦИЯ", detail: "Проверка пользовательского профиля" },
  { threshold: 10, label: "БЛОКИРОВКА", detail: "Отключение внешних подключений" },
  { threshold: 23, label: "ИНДЕКСАЦИЯ", detail: "Сканирование локального хранилища" },
  { threshold: 39, label: "ОЧИСТКА", detail: "Удаление сообщений и вложений" },
  { threshold: 57, label: "ОЧИСТКА", detail: "Сброс журналов вызовов и контактов" },
  { threshold: 74, label: "ПЕРЕЗАПИСЬ", detail: "Перезапись пользовательских блоков" },
  { threshold: 91, label: "ФИНАЛИЗАЦИЯ", detail: "Проверка остаточных данных" },
  { threshold: 100, label: "ГОТОВО", detail: "Данные телефона очищены" },
];

const dataGroups = [
  { name: "Сообщения", threshold: 34 },
  { name: "Вложения", threshold: 46 },
  { name: "Журнал вызовов", threshold: 55 },
  { name: "Контакты", threshold: 63 },
  { name: "Фото и видео", threshold: 74 },
  { name: "Геолокации", threshold: 82 },
  { name: "Кеш приложений", threshold: 91 },
  { name: "Ключи доступа", threshold: 100 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatTime(totalSeconds: number) {
  const baseHour = 19;
  const baseMinute = 42;
  const minutes = baseMinute + Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hour = (baseHour + Math.floor(minutes / 60)) % 24;
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PhoneWipeInsertPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);

  const blocks = useMemo(() => Array.from({ length: 112 }, (_, index) => index), []);

  const activeStage = useMemo(() => {
    return [...stages].reverse().find((stage) => progress >= stage.threshold) ?? stages[0];
  }, [progress]);

  const wipedSize = useMemo(() => {
    const totalGb = 128;
    const erasedGb = (totalGb * progress) / 100;
    return `${erasedGb.toFixed(1)} ГБ / ${totalGb} ГБ`;
  }, [progress]);

  const currentTime = useMemo(() => formatTime(elapsed), [elapsed]);

  const restart = useCallback(() => {
    setProgress(0);
    setElapsed(0);
    setStarted(false);
    setFullscreenFailed(false);
  }, []);

  const startInsert = useCallback(async () => {
    try {
      const target = rootRef.current ?? document.documentElement;
      if (!document.fullscreenElement && target.requestFullscreen) {
        await target.requestFullscreen({ navigationUI: "hide" });
      }
    } catch {
      setFullscreenFailed(true);
    } finally {
      setProgress(0);
      setElapsed(0);
      setStarted(true);
    }
  }, []);

  useEffect(() => {
    if (!started) return;

    let animationFrame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const runtime = now - startedAt;
      const nextProgress = clamp((runtime / TOTAL_DURATION_MS) * 100, 0, 100);
      setProgress(nextProgress);
      setElapsed(Math.floor(runtime / 1000));

      if (nextProgress < 100) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [started]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === " " || key === "enter") {
        event.preventDefault();
        void startInsert();
      }
      if (key === "r") restart();
      if (key === "f") void startInsert();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [restart, startInsert]);

  const isComplete = progress >= 100;

  return (
    <main
      ref={rootRef}
      className="relative h-[100dvh] w-screen overflow-hidden bg-[#05080d] text-[#e7f0ff] selection:bg-cyan-300 selection:text-black"
      onDoubleClick={() => void startInsert()}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(38,113,255,0.22),transparent_38%),linear-gradient(180deg,#07111f_0%,#05080d_55%,#020305_100%)]" />
      <div className="wipe-grid absolute inset-0 opacity-40" />
      <div className="wipe-scan absolute inset-x-0 top-0 h-24 opacity-70" />

      <section className="relative z-10 mx-auto flex h-full w-full max-w-[460px] flex-col px-5 py-4 sm:px-7 sm:py-6">
        <header className="flex items-center justify-between text-[12px] font-medium tracking-[0.12em] text-cyan-100/85">
          <span>{currentTime}</span>
          <span className="rounded-full border border-cyan-200/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-cyan-100/75">
            {TARGET_DATE}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
            87%
          </span>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="space-y-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-cyan-200/70">
              SYSTEM WIPE
            </p>
            <h1 className="text-balance text-[34px] font-semibold leading-[0.95] tracking-[-0.08em] text-white sm:text-[42px]">
              Очистка данных
            </h1>
            <p className="mx-auto max-w-[310px] text-sm leading-6 text-slate-300/75">
              {activeStage.detail}
            </p>
          </div>

          <div className="relative mx-auto grid h-[228px] w-[228px] place-items-center rounded-full border border-cyan-200/15 bg-cyan-300/[0.03] shadow-[0_0_60px_rgba(34,211,238,0.14)]">
            <div className="wipe-ring absolute inset-3 rounded-full" />
            <div className="absolute inset-8 rounded-full border border-white/10 bg-[#07111f]/90 shadow-[inset_0_0_40px_rgba(0,0,0,0.65)]" />
            <div className="relative z-10 text-center">
              <div className="text-[58px] font-light tabular-nums tracking-[-0.08em] text-white">
                {Math.floor(progress)}
                <span className="text-2xl text-cyan-200/80">%</span>
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200/70">
                {activeStage.label}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#67e8f9,#ffffff)] shadow-[0_0_24px_rgba(103,232,249,0.65)] transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300/70">
              <span className="font-mono uppercase tracking-[0.18em]">{wipedSize}</span>
              <span className="font-mono uppercase tracking-[0.18em]">
                {isComplete ? "complete" : "secure erase"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {dataGroups.map((group) => {
              const done = progress >= group.threshold;
              return (
                <div
                  key={group.name}
                  className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-[12px] transition-all duration-300 ${
                    done
                      ? "border-cyan-200/25 bg-cyan-300/10 text-cyan-100"
                      : "border-white/[0.08] bg-white/[0.035] text-slate-400"
                  }`}
                >
                  <span>{group.name}</span>
                  <span className="font-mono text-[11px]">{done ? "OK" : "··"}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1 opacity-70" aria-hidden="true">
            {blocks.map((block) => {
              const lit = progress > (block / blocks.length) * 100;
              return (
                <span
                  key={block}
                  className={`h-1.5 rounded-full ${lit ? "bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.65)]" : "bg-white/10"}`}
                />
              );
            })}
          </div>
        </div>

        <footer className="pb-1 text-center text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Device ID: NK-2606 / Storage partition reset
        </footer>
      </section>

      {!started && (
        <button
          type="button"
          onClick={() => void startInsert()}
          className="absolute inset-0 z-20 grid place-items-center bg-[#05080d]/92 px-8 text-center backdrop-blur-md"
        >
          <span className="max-w-[330px] rounded-[32px] border border-cyan-200/20 bg-white/[0.08] px-7 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
              fullscreen insert
            </span>
            <span className="mt-3 block text-2xl font-semibold tracking-[-0.04em] text-white">
              Запустить очистку телефона
            </span>
            <span className="mt-3 block text-sm leading-6 text-slate-300/75">
              Нажми сюда перед дублем. Пробел/Enter — старт, R — сброс, F — полноэкранный режим.
            </span>
            {fullscreenFailed && (
              <span className="mt-3 block text-xs text-amber-200/80">
                Браузер не дал открыть fullscreen автоматически. Разверни страницу вручную.
              </span>
            )}
          </span>
        </button>
      )}

      {isComplete && (
        <div className="pointer-events-none absolute inset-x-5 bottom-16 z-20 mx-auto max-w-[420px] rounded-[28px] border border-emerald-200/20 bg-emerald-300/10 px-5 py-4 text-center text-sm text-emerald-100 shadow-[0_20px_70px_rgba(16,185,129,0.18)] backdrop-blur-xl">
          ДАННЫЕ УДАЛЕНЫ · УСТРОЙСТВО ГОТОВО К СБРОСУ
        </div>
      )}

      <style>{`
        .wipe-grid {
          background-image:
            linear-gradient(rgba(103, 232, 249, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(103, 232, 249, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at center, black 0%, transparent 74%);
        }

        .wipe-scan {
          background: linear-gradient(180deg, transparent, rgba(103, 232, 249, 0.16), transparent);
          animation: wipe-scanline 3.2s ease-in-out infinite;
        }

        .wipe-ring {
          background:
            conic-gradient(from 180deg, rgba(103, 232, 249, 0.05), rgba(103, 232, 249, 0.92), rgba(255, 255, 255, 0.95), rgba(103, 232, 249, 0.05));
          mask: radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px));
          animation: wipe-spin 2.4s linear infinite;
        }

        @keyframes wipe-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes wipe-scanline {
          0% { transform: translateY(-120%); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </main>
  );
}
