import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Sparkles, Star, Wand2 } from "lucide-react";

export default function AssetsOssPage() {
  return (
    <div className="min-h-screen bg-[#1F232D] text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 pb-16 pt-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-[#C8A6FF]" />
            <span className="text-lg font-semibold tracking-tight">Kestra Assets</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Search or jump</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] uppercase text-foreground">
              Ctrl / Cmd + K
            </span>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#291749] via-[#1F232D] to-[#371E63] px-8 py-16 text-center shadow-[0_30px_80px_-40px_rgba(132,8,255,0.6)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(132,8,255,0.35),transparent_55%)]" />
          <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-6">
            <div className="relative flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                <Sparkles className="h-8 w-8 text-[#F6F3FF]" />
                <span className="absolute -right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl border border-primary/30 bg-primary/20" />
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-[#0F172A]/70 backdrop-blur">
                <Layers className="h-8 w-8 text-primary-foreground" />
                <span className="absolute -left-3 -bottom-3 h-12 w-12 rounded-full bg-primary/20 blur-lg" />
              </div>
            </div>
            <Badge className="border border-primary/40 bg-primary/20 text-[11px] uppercase tracking-[0.3em] text-primary-foreground">
              Enterprise Edition
            </Badge>
            <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Bring every dataset, service, and dependency into view.
            </h1>
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl">
          <Card className="overflow-hidden border border-white/10 bg-[#1A1F30] shadow-lg">
            <div className="aspect-video w-full">
              <iframe
                title="Kestra Assets Overview"
                src="https://www.youtube.com/embed/KwBO8mcS3kk?si=_p2jMLzfDXKdQ0Ug"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </Card>
        </section>

        <section className="space-y-6 text-center">
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Assets connects observability, lineage, and ownership metadata so platform teams can troubleshoot faster and deploy with confidence.
          </p>
          <Button
            asChild
            className="mx-auto inline-flex min-w-[180px] items-center justify-center gap-2 bg-[#7C3AED] text-primary-foreground shadow-[0_10px_30px_-15px_rgba(124,58,237,0.8)] hover:bg-[#6D28D9]"
          >
            <a href="https://kestra.io/demo" target="_blank" rel="noreferrer">
              <Wand2 className="h-4 w-4" />
              Get a Demo
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}
