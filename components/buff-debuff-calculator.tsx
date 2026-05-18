"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, TrendingDown, Percent, Calculator } from "lucide-react"

export function BuffDebuffCalculator() {
  const [initialStat, setInitialStat] = useState(0)
  const [modType, setModType] = useState<"buff" | "debuff">("buff")
  const [modValue, setModValue] = useState(0)

  const results = useMemo(() => {
    let m = modValue
    if (modType === "debuff") {
      m = -m
    }

    const facteurInitial = 1 + initialStat / 100
    const facteurMod = 1 + m / 100
    const facteurFinal = facteurInitial * facteurMod

    const sf = (facteurFinal - 1) * 100
    const variation = sf - initialStat

    return {
      finalStat: sf,
      variation: variation,
    }
  }, [initialStat, modType, modValue])

  const presetBuffs = [
    { label: "+5%", value: 5 },
    { label: "+7.5%", value: 7.5 },
    { label: "+10%", value: 10 },
    { label: "+15%", value: 15 },
    { label: "+20%", value: 20 },
    { label: "+25%", value: 25 },
  ]

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
              <Percent className="h-4 w-4" />
              Statistique initiale affichee (%)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={initialStat || ""}
              onChange={(e) => setInitialStat(parseFloat(e.target.value) || 0)}
              className="border-border/50 bg-input font-mono text-xl"
              placeholder="0"
            />
          </div>

          <div className="mb-6 space-y-2">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calculator className="h-4 w-4" />
              Type de modificateur
            </Label>
            <Select
              value={modType}
              onValueChange={(value: "buff" | "debuff") => setModType(value)}
            >
              <SelectTrigger className="border-border/50 bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buff">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Buff (Widget / Competence)
                  </span>
                </SelectItem>
                <SelectItem value="debuff">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    Debuff (Malus)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6 space-y-2">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              {modType === "buff" ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              Valeur du modificateur (%)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={modValue || ""}
              onChange={(e) => setModValue(parseFloat(e.target.value) || 0)}
              className="border-border/50 bg-input font-mono text-xl"
              placeholder="0"
            />
          </div>

          <div className="mb-6 space-y-2">
            <Label className="text-xs text-muted-foreground">
              Modificateurs rapides
            </Label>
            <div className="flex flex-wrap gap-2">
              {presetBuffs.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setModValue(preset.value)}
                  className={`rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
                    modValue === preset.value
                      ? "border-primary/50 bg-primary text-primary-foreground"
                      : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-4">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Calcul base sur le facteur global multiplicatif (1 + Stat/100)
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
            Resultats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-border/30 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <Percent className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Stat initiale</p>
                  <p className="text-xs text-muted-foreground">Valeur de depart</p>
                </div>
              </div>
              <span className="font-mono text-xl font-bold text-blue-400">
                {initialStat.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    modType === "buff" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}
                >
                  {modType === "buff" ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {modType === "buff" ? "Buff applique" : "Debuff applique"}
                  </p>
                  <p className="text-xs text-muted-foreground">Modificateur</p>
                </div>
              </div>
              <span
                className={`font-mono text-xl font-bold ${
                  modType === "buff" ? "text-green-400" : "text-red-400"
                }`}
              >
                {modType === "buff" ? "+" : "-"}
                {modValue.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    results.variation >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                  }`}
                >
                  {results.variation >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Variation brute</p>
                  <p className="text-xs text-muted-foreground">
                    Difference de statistique
                  </p>
                </div>
              </div>
              <span
                className={`font-mono text-xl font-bold ${
                  results.variation >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {results.variation >= 0 ? "+" : ""}
                {results.variation.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Statistique finale
              </span>
              <span className="font-mono text-2xl font-bold text-accent">
                {results.finalStat.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
