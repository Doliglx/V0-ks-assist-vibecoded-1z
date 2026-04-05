"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Crosshair, Shield, Swords, Target, Users } from "lucide-react"

export function RatioCalculator() {
  const [total, setTotal] = useState(55000)
  const [percentages, setPercentages] = useState({
    inf: 50,
    cav: 20,
    arc: 30,
  })

  const presetRatios = [
    { label: "50/20/30", inf: 50, cav: 20, arc: 30 },
    { label: "50/25/25", inf: 50, cav: 25, arc: 25 },
    { label: "45/20/35", inf: 45, cav: 20, arc: 35 },
    { label: "10/10/80", inf: 10, cav: 10, arc: 80 },
    { label: "60/20/20", inf: 60, cav: 20, arc: 20 },
    { label: "60/40/0", inf: 60, cav: 40, arc: 0 },
  ]

  const results = useMemo(() => {
    const inf = Math.floor((total * percentages.inf) / 100)
    const cav = Math.floor((total * percentages.cav) / 100)
    const arc = total - inf - cav
    return { inf, cav, arc }
  }, [total, percentages])

  const totalPercentage = percentages.inf + percentages.cav + percentages.arc

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 space-y-2">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              Total de Troupes
            </Label>
            <Input
              type="number"
              value={total}
              onChange={(e) => setTotal(parseInt(e.target.value) || 0)}
              className="border-border/50 bg-input font-mono text-xl"
            />
          </div>

          <div className="mb-6 space-y-2">
            <Label className="text-xs text-muted-foreground">
              Ratios Prédéfinis (INF/CAV/ARC)
            </Label>
            <div className="flex flex-wrap gap-2">
              {presetRatios.map((preset) => (
                <Button
                  key={preset.label}
                  variant={
                    percentages.inf === preset.inf &&
                    percentages.cav === preset.cav &&
                    percentages.arc === preset.arc
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setPercentages({
                      inf: preset.inf,
                      cav: preset.cav,
                      arc: preset.arc,
                    })
                  }
                  className="font-mono text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-blue-400" />
                Infanterie %
              </Label>
              <Input
                type="number"
                value={percentages.inf}
                onChange={(e) =>
                  setPercentages((p) => ({
                    ...p,
                    inf: parseInt(e.target.value) || 0,
                  }))
                }
                className="border-border/50 bg-input font-mono"
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Swords className="h-4 w-4 text-red-400" />
                Cavalerie %
              </Label>
              <Input
                type="number"
                value={percentages.cav}
                onChange={(e) =>
                  setPercentages((p) => ({
                    ...p,
                    cav: parseInt(e.target.value) || 0,
                  }))
                }
                className="border-border/50 bg-input font-mono"
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-4 w-4 text-green-400" />
                Archers %
              </Label>
              <Input
                type="number"
                value={percentages.arc}
                onChange={(e) =>
                  setPercentages((p) => ({
                    ...p,
                    arc: parseInt(e.target.value) || 0,
                  }))
                }
                className="border-border/50 bg-input font-mono"
                min={0}
                max={100}
              />
            </div>
          </div>

          {totalPercentage !== 100 && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Total: {totalPercentage}% - doit être égal à 100%
            </div>
          )}

          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-4">
            <Crosshair className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Les valeurs se calculent automatiquement
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Répartition
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-border/30 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Infanterie</p>
                  <p className="text-xs text-muted-foreground">
                    {percentages.inf}% du total
                  </p>
                </div>
              </div>
              <span className="font-mono text-xl font-bold text-blue-400">
                {results.inf.toLocaleString("fr-FR")}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <Swords className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="font-medium">Cavalerie</p>
                  <p className="text-xs text-muted-foreground">
                    {percentages.cav}% du total
                  </p>
                </div>
              </div>
              <span className="font-mono text-xl font-bold text-red-400">
                {results.cav.toLocaleString("fr-FR")}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Archers</p>
                  <p className="text-xs text-muted-foreground">
                    {percentages.arc}% du total
                  </p>
                </div>
              </div>
              <span className="font-mono text-xl font-bold text-green-400">
                {results.arc.toLocaleString("fr-FR")}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total vérifié</span>
              <span className="font-mono text-lg font-bold text-accent">
                {(results.inf + results.cav + results.arc).toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
