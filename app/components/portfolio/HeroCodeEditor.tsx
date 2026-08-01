"use client";

import { useEffect, useState } from "react";

const TYPE_INTERVAL_MS = 18;
const HOLD_INTERVAL_MS = 2200;

export const HERO_CODE_SAMPLE = `{{-- Reverb-powered Livewire dashboard --}}
<div
    x-data="{ connected: false }"
    x-init="
        Echo.private('dashboard.{{ auth()->id() }}')
            .listen('.StatsUpdated', (event) => {
                connected = true;
                $wire.refreshStats(event.stats);
            });
    "
    wire:poll.15s="refreshStats"
>
    <header class="realtime-status">
        <span>Reverb stream</span>
        <strong>{{ $activeUsers }} online</strong>
    </header>

    <livewire:stats-grid
        :stats="$stats"
        wire:key="realtime-stats"
    />
</div>`;

type CodeTokenKind = "plain" | "comment" | "blade" | "string" | "keyword";

export type CodeToken = {
  value: string;
  kind: CodeTokenKind;
};

export function getVisibleCode(source: string, characterCount: number) {
  return source.slice(0, Math.max(0, Math.min(characterCount, source.length)));
}

export function tokenizeBladeLine(line: string): CodeToken[] {
  const tokenPattern =
    /({{--.*?--}}|{{.*?}}|'[^']*'|"[^"]*"|\b(?:Echo|Livewire|Reverb)\b|\$wire|<\/?livewire:[^>]*>|(?:wire|x)[-:][\w.:-]+)/g;
  const tokens: CodeToken[] = [];
  let cursor = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({ value: line.slice(cursor, index), kind: "plain" });
    }

    const value = match[0];
    const kind: CodeTokenKind = value.startsWith("{{--")
      ? "comment"
      : value.startsWith("{{")
        ? "blade"
        : value.startsWith("'") || value.startsWith('"')
          ? "string"
          : "keyword";
    tokens.push({ value, kind });
    cursor = index + value.length;
  }

  if (cursor < line.length) {
    tokens.push({ value: line.slice(cursor), kind: "plain" });
  }

  return tokens.length > 0 ? tokens : [{ value: line, kind: "plain" }];
}

export function HeroCodeEditor() {
  const [characterCount, setCharacterCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setCharacterCount(HERO_CODE_SAMPLE.length);
    };

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const complete = characterCount >= HERO_CODE_SAMPLE.length;
    const timer = window.setTimeout(
      () => setCharacterCount(complete ? 0 : characterCount + 1),
      complete ? HOLD_INTERVAL_MS : TYPE_INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [characterCount, reducedMotion]);

  const visibleCode = getVisibleCode(HERO_CODE_SAMPLE, characterCount);
  const lines = visibleCode.split("\n");

  return (
    <div
      className="hero-code-editor"
      role="region"
      aria-label="Animated Laravel Blade code example"
      aria-live="off"
    >
      <div className="code-editor-toolbar">
        <div className="code-window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="code-editor-tab">
          <span aria-hidden="true">◆</span>
          realtime-dashboard.blade.php
        </div>
        <div className="code-editor-status">
          <span aria-hidden="true" />
          Reverb connected
        </div>
      </div>

      <div className="code-editor-body" aria-hidden="true">
        <ol className="code-lines">
          {lines.map((line, lineIndex) => (
            <li key={`${lineIndex}-${line}`}>
              <code>
                {tokenizeBladeLine(line).map((token, tokenIndex) => (
                  <span
                    className={`code-token code-token-${token.kind}`}
                    key={`${tokenIndex}-${token.value}`}
                  >
                    {token.value || " "}
                  </span>
                ))}
                {lineIndex === lines.length - 1 ? (
                  <span className="code-caret" aria-hidden="true" />
                ) : null}
              </code>
            </li>
          ))}
        </ol>
      </div>

      <div className="code-editor-footer">
        <span>Laravel 12</span>
        <span>Livewire 3</span>
        <span>Reverb</span>
        <span className="code-editor-channel">private channel</span>
      </div>
    </div>
  );
}
