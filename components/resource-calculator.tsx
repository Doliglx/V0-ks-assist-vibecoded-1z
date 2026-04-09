"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PieChart, Pie, Cell, Tooltip } from "recharts"
import { Scale, Wheat, TreePine, Mountain, Hammer } from "lucide-react"
import Image from "next/image"

const RSS_DATA = {
  n1: { bread: 10000, wood: 10000, stone: 2000, iron: 500 },
  n2: { bread: 100000, wood: 100000, stone: 20000, iron: 5000 },
  n3: { bread: 1000000, wood: 1000000, stone: 200000, iron: 50000 },
}

const COLORS = {
  bread: "#f59e0b",
  wood: "#8b5a2b",
  stone: "#6b7280",
  iron: "#a19d94",
}

type ResourceMode = "balance" | "bread" | "wood" | "stone" | "iron"

export function ResourceCalculator() {
  const [quantities, setQuantities] = useState({
    q1: 25537,
    q2: 37895,
    q3: 1304,
  })

  const [mode, setMode] = useState<ResourceMode>("balance")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const results = useMemo(() => {
    const q = [quantities.q1, quantities.q2, quantities.q3]
    let res = { bread: 0, wood: 0, stone: 0, iron: 0 }

    if (mode === "balance") {
      q.forEach((qty, idx) => {
        const v = RSS_DATA[`n${idx + 1}` as keyof typeof RSS_DATA]
        const share = Math.floor(qty / 4)
        const remainder = qty % 4
        let counts = { bread: share, wood: share, stone: share, iron: share }
        if (remainder >= 1) counts.iron++
        if (remainder >= 2) counts.stone++
        if (remainder >= 3) counts.wood++
        res.bread += counts.bread * v.bread
        res.wood += counts.wood * v.wood
        res.stone += counts.stone * v.stone
        res.iron += counts.iron * v.iron
      })
    } else {
      const key = mode as keyof typeof RSS_DATA.n1
      res[key] =
        q[0] * RSS_DATA.n1[key] + q[1] * RSS_DATA.n2[key] + q[2] * RSS_DATA.n3[key]
    }

    return res
  }, [quantities, mode])

  const total = results.bread + results.wood + results.stone + results.iron

  const chartData = [
    { name: "Pain", value: results.bread, color: COLORS.bread },
    { name: "Bois", value: results.wood, color: COLORS.wood },
    { name: "Pierre", value: results.stone, color: COLORS.stone },
    { name: "Fer", value: results.iron, color: COLORS.iron },
  ].filter((d) => d.value > 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Inventaire
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Niveau 1
              </Label>
              <Input
                type="number"
                value={quantities.q1}
                onChange={(e) =>
                  setQuantities((p) => ({ ...p, q1: parseInt(e.target.value) || 0 }))
                }
                className="border-border/50 bg-input font-mono text-lg"
              />
              <div className="flex justify-center pt-2">
                <Image
                  src="/images/chest-level1.png"
                  alt="Coffre de ressources niveau 1"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Niveau 2
              </Label>
              <Input
                type="number"
                value={quantities.q2}
                onChange={(e) =>
                  setQuantities((p) => ({ ...p, q2: parseInt(e.target.value) || 0 }))
                }
                className="border-border/50 bg-input font-mono text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Niveau 3
              </Label>
              <Input
                type="number"
                value={quantities.q3}
                onChange={(e) =>
                  setQuantities((p) => ({ ...p, q3: parseInt(e.target.value) || 0 }))
                }
                className="border-border/50 bg-input font-mono text-lg"
              />
              <div className="flex justify-center pt-2">
                <Image
                  src="/images/chest-level3.png"
                  alt="Coffre de ressources niveau 3"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <Button
              onClick={() => setMode("balance")}
              className={`w-full gap-2 ${
                mode === "balance"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Scale className="h-4 w-4" />
              Équilibrer
            </Button>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Button
                variant={mode === "bread" ? "default" : "outline"}
                onClick={() => setMode("bread")}
                className="gap-2"
              >
                <Wheat className="h-4 w-4" />
                Pain
              </Button>
              <Button
                variant={mode === "wood" ? "default" : "outline"}
                onClick={() => setMode("wood")}
                className="gap-2"
              >
                <TreePine className="h-4 w-4" />
                Bois
              </Button>
              <Button
                variant={mode === "stone" ? "default" : "outline"}
                onClick={() => setMode("stone")}
                className="gap-2"
              >
                <Mountain className="h-4 w-4" />
                Pierre
              </Button>
              <Button
                variant={mode === "iron" ? "default" : "outline"}
                onClick={() => setMode("iron")}
                className="gap-2"
              >
                <Hammer className="h-4 w-4" />
                Fer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <ResourceRow
              label="Pain"
              value={results.bread}
              icon={<Wheat className="h-4 w-4 text-amber-500" />}
            />
            <ResourceRow
              label="Bois"
              value={results.wood}
              icon={<TreePine className="h-4 w-4 text-amber-800" />}
            />
            <ResourceRow
              label="Pierre"
              value={results.stone}
              icon={<Mountain className="h-4 w-4 text-gray-500" />}
            />
            <ResourceRow
              label="Fer"
              value={results.iron}
              icon={<Hammer className="h-4 w-4 text-stone-400" />}
            />
          </div>

          <div className="mt-6 border-t-2 border-primary pt-4 text-center">
            <p className="text-xs uppercase text-muted-foreground">Total</p>
            <p className="font-mono text-3xl font-bold text-accent">
              {total.toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="mt-6 flex h-[180px] items-center justify-center">
            {mounted && chartData.length > 0 ? (
              <PieChart width={200} height={180}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString("fr-FR")}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            ) : (
              <div className="text-sm text-muted-foreground">Chargement...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResourceRow({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/30 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-mono text-lg font-bold">
        {value.toLocaleString("fr-FR")}
      </span>
    </div>
  )
}
