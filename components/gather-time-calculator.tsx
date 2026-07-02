"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Timer,
  Gauge,
  Zap,
  Clock,
  CalendarClock,
  Play,
  Flag,
} from "lucide-react"

const STORAGE_KEY = "gather-current-speed"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

// Format a duration in seconds to "HHh MMm SSs"
function formatDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "--h --m --s"
  const s = Math.round(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${pad(h)}h ${pad(m)}m ${pad(sec)}s`
}

// Format an absolute timestamp (ms) to a readable local date/time
function formatClock(ms: number): string {
  if (!isFinite(ms)) return "--"
  const d = new Date(ms)
  return d.toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const SPEED_PRESETS = [5, 10, 15, 20, 25, 50]

export function GatherTimeCalculator() {
  const [h, setH] = useState(0)
  const [m, setM] = useState(0)
  const [s, setS] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [addedSpeed, setAddedSpeed] = useState(25)
  const [targetDate, setTargetDate] = useState("")
  const [loaded, setLoaded] = useState(false)

  // Load currentSpeed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const parsed = parseFloat(stored)
      if (!isNaN(parsed)) setCurrentSpeed(parsed)
    }
    setLoaded(true)
  }, [])

  // Save currentSpeed to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, String(currentSpeed))
    }
  }, [currentSpeed, loaded])

  const results = useMemo(() => {
    const sec = h * 3600 + m * 60 + s
    const mult1 = 1 + currentSpeed / 100
    const absTime = sec * mult1
    const mult2 = mult1 + addedSpeed / 100
    const newSec = mult2 > 0 ? absTime / mult2 : 0

    const now = Date.now()
    const hasTarget = targetDate.trim() !== ""
    const targetMs = hasTarget ? new Date(targetDate).getTime() : NaN

    return {
      sec,
      newSec,
      standardDuration: formatDuration(sec),
      buffedDuration: formatDuration(newSec),
      hasTarget,
      // Finish times (no target set)
      finishTime1: now + sec * 1000,
      finishTime2: now + newSec * 1000,
      // Start times (target set)
      startTime1: targetMs - sec * 1000,
      startTime2: targetMs - newSec * 1000,
      timeSaved: sec - newSec,
    }
  }, [h, m, s, currentSpeed, addedSpeed, targetDate])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Configuration */}
      <Card className="border-border/50 bg-card/80 backdrop-blur lg:col-span-2">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Timer className="h-4 w-4" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Duration Inputs */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                Temps de collecte affiché (0%)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    min={0}
                    value={h || ""}
                    onChange={(e) => setH(Math.max(0, parseInt(e.target.value) || 0))}
                    className="border-border/50 bg-input text-center font-mono text-xl"
                    placeholder="00"
                  />
                  <p className="mt-1 text-center text-[10px] uppercase text-muted-foreground">
                    Heures
                  </p>
                </div>
                <div>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={m || ""}
                    onChange={(e) => setM(Math.max(0, parseInt(e.target.value) || 0))}
                    className="border-border/50 bg-input text-center font-mono text-xl"
                    placeholder="00"
                  />
                  <p className="mt-1 text-center text-[10px] uppercase text-muted-foreground">
                    Minutes
                  </p>
                </div>
                <div>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={s || ""}
                    onChange={(e) => setS(Math.max(0, parseInt(e.target.value) || 0))}
                    className="border-border/50 bg-input text-center font-mono text-xl"
                    placeholder="00"
                  />
                  <p className="mt-1 text-center text-[10px] uppercase text-muted-foreground">
                    Secondes
                  </p>
                </div>
              </div>
            </div>

            {/* Speeds */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  Vitesse actuelle de collecte (%)
                  <span className="ml-auto text-[10px] text-primary">
                    Sauvegardé
                  </span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentSpeed || ""}
                  onChange={(e) =>
                    setCurrentSpeed(parseFloat(e.target.value) || 0)
                  }
                  className="border-border/50 bg-input font-mono text-xl"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  Bonus de vitesse à ajouter (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addedSpeed || ""}
                  onChange={(e) => setAddedSpeed(parseFloat(e.target.value) || 0)}
                  className="border-border/50 bg-input font-mono text-xl"
                  placeholder="25"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {SPEED_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAddedSpeed(preset)}
                      className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                        addedSpeed === preset
                          ? "border-primary/50 bg-primary text-primary-foreground"
                          : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      +{preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Target Date */}
          <div className="mt-6 space-y-2">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Date d&apos;arrivée cible (optionnel)
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="max-w-xs border-border/50 bg-input font-mono"
              />
              {targetDate && (
                <button
                  onClick={() => setTargetDate("")}
                  className="rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                >
                  Effacer
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {targetDate
                ? "Affiche l'heure de lancement pour arriver à la date cible."
                : "Vide : affiche l'heure de fin à partir de maintenant."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Standard Output */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Standard
            </span>
            <Badge className="bg-muted text-muted-foreground">0%</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-xl bg-secondary/40 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Durée
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">
              {results.standardDuration}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              {results.hasTarget ? (
                <Play className="h-5 w-5 text-blue-400" />
              ) : (
                <Flag className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {results.hasTarget ? "Heure de lancement" : "Heure de fin"}
              </p>
              <p className="truncate font-mono text-sm font-semibold text-foreground">
                {formatClock(
                  results.hasTarget ? results.startTime1 : results.finishTime1
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buffed Output */}
      <Card className="border-primary/40 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Boosté
            </span>
            <Badge className="bg-primary/20 text-primary">
              +{addedSpeed}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Durée
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-accent">
              {results.buffedDuration}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-background/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              {results.hasTarget ? (
                <Play className="h-5 w-5 text-primary" />
              ) : (
                <Flag className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {results.hasTarget ? "Heure de lancement" : "Heure de fin"}
              </p>
              <p className="truncate font-mono text-sm font-semibold text-foreground">
                {formatClock(
                  results.hasTarget ? results.startTime2 : results.finishTime2
                )}
              </p>
            </div>
          </div>
          {results.timeSaved > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-4 py-2">
              <span className="text-xs text-green-400">Temps gagné</span>
              <span className="font-mono text-sm font-bold text-green-400">
                {formatDuration(results.timeSaved)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
