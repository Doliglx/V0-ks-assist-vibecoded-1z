"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Eye, ScrollText, Hammer, BookOpen, Map, Gem, Package } from "lucide-react"

const RESOURCES = [
  { id: "v", name: "Vision", icon: Eye, color: "#ff6b35" },
  { id: "s", name: "Satin", icon: ScrollText, color: "#f1c40f" },
  { id: "f", name: "Forge", icon: Hammer, color: "#e67e22" },
  { id: "g", name: "Guides", icon: BookOpen, color: "#d35400" },
  { id: "p", name: "Plans", icon: Map, color: "#c0392b" },
  { id: "m", name: "Mithril", icon: Gem, color: "#f39c12" },
  { id: "h", name: "Héros", icon: Package, color: "#bdc3c7" },
]

type ResourceState = {
  need: number
  lot: number
  price: number
}

export function EventExchanger() {
  const [resources, setResources] = useState<Record<string, ResourceState>>(
    RESOURCES.reduce(
      (acc, r) => ({
        ...acc,
        [r.id]: { need: 0, lot: 0, price: 0 },
      }),
      {}
    )
  )

  const updateResource = (id: string, field: keyof ResourceState, value: number) => {
    setResources((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const costs = useMemo(() => {
    return RESOURCES.map((r) => {
      const { need, lot, price } = resources[r.id]
      const cost = need > 0 && lot > 0 ? Math.ceil(need / lot) * price : 0
      return { ...r, cost }
    })
  }, [resources])

  const grandTotal = costs.reduce((sum, r) => sum + r.cost, 0)

  const chartData = costs
    .filter((r) => r.cost > 0)
    .map((r) => ({
      name: r.name,
      value: r.cost,
      color: r.color,
    }))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((resource) => {
          const Icon = resource.icon
          const cost = costs.find((c) => c.id === resource.id)?.cost || 0

          return (
            <Card
              key={resource.id}
              className="border-border/30 bg-card/60 backdrop-blur transition-all hover:border-primary/30"
            >
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-5 w-5" style={{ color: resource.color }} />
                  <span className="font-semibold" style={{ color: resource.color }}>
                    {resource.name}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Besoin</Label>
                    <Input
                      type="number"
                      value={resources[resource.id].need || ""}
                      onChange={(e) =>
                        updateResource(
                          resource.id,
                          "need",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-9 border-border/50 bg-input font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Lot</Label>
                    <Input
                      type="number"
                      value={resources[resource.id].lot || ""}
                      onChange={(e) =>
                        updateResource(
                          resource.id,
                          "lot",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-9 border-border/50 bg-input font-mono"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Prix</Label>
                  <Input
                    type="number"
                    value={resources[resource.id].price || ""}
                    onChange={(e) =>
                      updateResource(
                        resource.id,
                        "price",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-9 border-border/50 bg-input font-mono"
                    placeholder="0"
                  />
                </div>

                <div
                  className="rounded-lg p-2 text-center text-xs font-bold"
                  style={{
                    backgroundColor: `${resource.color}15`,
                    color: resource.color,
                  }}
                >
                  {cost.toLocaleString("fr-FR")} jetons
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Coût Total
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 text-center">
            <p className="mb-2 text-xs uppercase text-muted-foreground">
              Jetons Requis
            </p>
            <p className="font-mono text-4xl font-bold text-accent">
              {grandTotal.toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="h-[250px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} minWidth={100}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `${value.toLocaleString("fr-FR")} jetons`
                    }
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Entrez des valeurs pour voir le graphique
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
