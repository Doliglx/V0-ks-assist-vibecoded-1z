"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts"
import { Rocket, Shield, Swords, Target } from "lucide-react"

export function Frakinator() {
  const [stats, setStats] = useState({
    attackInf: 609,
    leaderInf: 498,
    attackCav: 530,
    leaderCav: 450,
    attackArc: 574,
    leaderArc: 529,
  })
  const [tierBonus, setTierBonus] = useState("1.1")
  const [calculated, setCalculated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { best, chartPoints } = useMemo(() => {
    const getMultiplier = (attack: number, leader: number) =>
      (1 + attack / 100) * (1 + leader / 100)

    const Ai = getMultiplier(stats.attackInf, stats.leaderInf)
    const Ac = getMultiplier(stats.attackCav, stats.leaderCav)
    const Aa = getMultiplier(stats.attackArc, stats.leaderArc)
    const t = parseFloat(tierBonus)

    let best = { score: 0, inf: 0, cav: 0, arc: 0 }
    const points: { x: number; y: number }[] = []

    for (let i = 0; i <= 100; i += 2) {
      for (let c = 0; c <= 100 - i; c += 2) {
        const a = 100 - i - c
        const score =
          (1 / 3) * Ai * Math.sqrt(i / 100) +
          Ac * Math.sqrt(c / 100) +
          (4 / 3) * Aa * Math.sqrt(a / 100) * 1.1 * t

        if (score > best.score) {
          best = { score, inf: i, cav: c, arc: a }
        }

        if (i === 10) {
          points.push({ x: a, y: score })
        }
      }
    }

    return { best, chartPoints: points }
  }, [stats, tierBonus])

  const handleCalculate = () => {
    setCalculated(true)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Statistiques Leader :
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 grid gap-6 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                <Shield className="h-4 w-4" />
                Infanterie
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Attaque %</Label>
                <Input
                  type="number"
                  value={stats.attackInf}
                  onChange={(e) =>
                    setStats((p) => ({
                      ...p,
                      attackInf: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="border-border/50 bg-input font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Létalité %</Label>
                <Input
                  type="number"
                  value={stats.leaderInf}
                  onChange={(e) =>
                    setStats((p) => ({
                      ...p,
                      leaderInf: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="border-border/50 bg-input font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                <Swords className="h-4 w-4" />
                Cavalerie
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Attaque %</Label>
                <Input
                  type="number"
                  value={stats.attackCav}
                  onChange={(e) =>
                    setStats((p) => ({
                      ...p,
                      attackCav: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="border-border/50 bg-input font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Létalité %</Label>
                <Input
                  type="number"
                  value={stats.leaderCav}
                  onChange={(e) =>
                    setStats((p) => ({
                      ...p,
                      leaderCav: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="border-border/50 bg-input font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <Target className="h-4 w-4" />
                Archers
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Attaque %</Label>
                <Input
                  type="number"
                  value={stats.attackArc}
                  onChange={(e) =>
                    setStats((p) => ({
                      ...p,
                      attackArc: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="border-border/50 bg-input font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Létalité %</Label>
                <Input
                  type="number"
                  value={stats.leaderArc}
                  onChange={(e) =>
                    setStats((p) => ({
                      ...p,
                      leaderArc: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="border-border/50 bg-input font-mono"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <Label className="text-xs text-muted-foreground">Tier TG3+</Label>
            <Select value={tierBonus} onValueChange={setTierBonus}>
              <SelectTrigger className="border-border/50 bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.1">Activé</SelectItem>
                <SelectItem value="1.0">Désactivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Rocket className="h-4 w-4" />
            Optimiser
          </Button>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Résultats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 rounded-xl bg-black/30 p-4 font-mono">
            {calculated ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Optimum:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-400">
                    INF: {best.inf}%
                  </span>
                  <span className="rounded bg-red-500/20 px-2 py-1 text-red-400">
                    CAV: {best.cav}%
                  </span>
                  <span className="rounded bg-green-500/20 px-2 py-1 text-green-400">
                    ARC: {best.arc}%
                  </span>
                </div>
                <p className="mt-3 text-lg">
                  Score:{" "}
                  <span className="font-bold text-accent">
                    {best.score.toFixed(3)}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {"Cliquez sur Optimiser pour calculer..."}
              </p>
            )}
          </div>

          <div className="flex h-[200px] items-center justify-center">
            {mounted && calculated && chartPoints.length > 0 ? (
              <AreaChart width={320} height={200} data={chartPoints}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="x"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={{ stroke: "#374151" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "#374151" }}
                />
                <Tooltip
                  formatter={(value: number) => value.toFixed(3)}
                  labelFormatter={(label) => `Arc: ${label}%`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#ff6b35"
                  strokeWidth={2}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            ) : (
              <div className="text-sm text-muted-foreground">
                Les résultats apparaîtront ici
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
