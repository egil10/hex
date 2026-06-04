"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The shared two-pane frame every mode renders into. On wide screens the
 * interactive "stage" sits on the left and feedback on the right, so a round
 * and its result are visible together without scrolling. On narrow screens it
 * stacks. While playing, the right pane shows a quiet placeholder so the layout
 * doesn't jump when feedback appears.
 */
export function RoundLayout({
  stage,
  feedback,
  footer,
}: {
  stage: ReactNode;
  feedback?: ReactNode;
  footer?: ReactNode;
}) {
  const hasResult = Boolean(feedback || footer);
  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <div className="min-w-0">{stage}</div>
      <div className={cn("min-w-0", hasResult ? "mt-5 lg:mt-0" : "hidden lg:block")}>
        {hasResult ? (
          <>
            {feedback}
            {footer ? <div className={feedback ? "mt-4" : ""}>{footer}</div> : null}
          </>
        ) : (
          <div className="flex min-h-[14rem] items-center justify-center rounded-xl border border-dashed border-border px-6 text-center text-sm text-muted">
            your result shows up here
          </div>
        )}
      </div>
    </div>
  );
}
