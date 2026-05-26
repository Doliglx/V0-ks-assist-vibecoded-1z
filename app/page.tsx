"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ResourceCalculator } from "@/components/resource-calculator"
import { EventExchanger } from "@/components/event-exchanger"
import { Frakinator } from "@/components/frakinator"
import { RatioCalculator } from "@/components/ratio-calculator"
import { BuffDebuffCalculator } from "@/components/buff-debuff-calculator"
import { GiftCodeRedeemer } from "@/components/gift-code-redeemer"
import { Package, Sparkles, Swords, Target, TrendingUp, Gift } from "lucide-react"

const TABS = [
  { id: "rss", label: "Coffres RSS", icon: Package },
  { id: "event", label: "Événements", icon: Sparkles },
  { id: "fraki", label: "Frakinator", icon: Swords },
  { id: "ratio", label: "Ratio Marche", icon: Target },
  { id: "buff", label: "Buff/Debuff", icon: TrendingUp },
  { id: "giftcode", label: "Codes Cadeaux", icon: Gift },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function KingshotHub() {
  const [activeTab, setActiveTab] = useState<TabId>("rss")

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background effect */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,107,53,0.08),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="sticky top-4 z-50 mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all duration-300 sm:px-5 sm:text-sm",
                  isActive
                    ? "border-primary/50 bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "border-border/50 bg-card/80 text-muted-foreground backdrop-blur hover:border-primary/30 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="bg-gradient-to-b from-foreground to-primary bg-clip-text text-3xl font-black uppercase tracking-tight text-transparent drop-shadow-[0_0_20px_rgba(255,107,53,0.3)] sm:text-4xl lg:text-5xl">
            {activeTab === "rss" && "Calcul des Ressources"}
            {activeTab === "event" && "Échangeur Pro"}
            {activeTab === "fraki" && "Frakinator System"}
            {activeTab === "ratio" && "Ratio de Marche"}
            {activeTab === "buff" && "Calculateur Buff/Debuff"}
            {activeTab === "giftcode" && "Codes Cadeaux"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeTab === "rss" && "Optimisez vos coffres de ressources"}
            {activeTab === "event" && "Calculez vos besoins en jetons"}
            {activeTab === "fraki" &&
              "Trouvez la composition optimale de troupes"}
            {activeTab === "ratio" && "Répartissez vos troupes efficacement"}
            {activeTab === "buff" && "Calculez vos statistiques après modificateur"}
            {activeTab === "giftcode" && "Récupérez vos récompenses automatiquement"}
          </p>
        </header>

        {/* Content */}
        <main className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "rss" && <ResourceCalculator />}
          {activeTab === "event" && <EventExchanger />}
          {activeTab === "fraki" && <Frakinator />}
          {activeTab === "ratio" && <RatioCalculator />}
          {activeTab === "buff" && <BuffDebuffCalculator />}
          {activeTab === "giftcode" && <GiftCodeRedeemer />}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-border/30 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            KingShot Assistant - #Doliprane - GLX
          </p>
        </footer>
      </div>
    </div>
  )
}
