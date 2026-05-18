"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Gift,
  Users,
  UserPlus,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ALLIANCE_MLF = [
  "179391846", "173207151", "177195550", "172404092", "172027390", "175976026", "170749008", "175795697",
  "171078552", "174697995", "175943106", "175107869", "176156042", "175041849", "177326858", "172502173",
  "172125743", "172109106", "172240245", "172438721", "179750839", "175501147", "174419913", "173059779",
  "172682916", "174878471", "175451875", "172273398", "174469006", "174173645", "172538798", "176025413",
  "172863144", "173026841", "173616555", "175943228", "172912140", "173371257", "173551337", "172666155",
  "174550398", "175615611", "174534267", "173747849", "174223212", "173993152", "174059134", "173420293",
  "175009392", "172109217", "173731642", "174501251", "172502160", "172486191", "175042166", "175484639",
  "175877573", "173944781", "173780832", "173649311", "173699030", "173371052", "174288288", "174779939",
  "173879125", "175287843", "174517399", "173616501", "175697536", "172207555", "174960053", "175386528",
  "175124151", "172043977", "172961000", "176156080", "176009100", "178670141", "175763011", "175369940",
  "175402643", "176107069", "173960561", "175533602", "174698011", "172092796", "202350224", "175828190",
  "175599031", "174009575", "174320845", "172699373", "180215916", "172617397", "198179671", "176587276"
]

const ALLIANCE_MMF = [
  "179111589", "227414610", "240384821", "207147484", "177506080", "243974270", "198179671", "191973767",
  "245621185", "179626737", "194642392", "245334261", "174779997", "186462623", "175468087",
  "186093895", "172650351", "239335667", "243950234", "174649082", "266176237", "174484959", "172341045",
  "289469882", "241694180", "288613487", "264909659", "173108469", "301953654", "192741316", "303464361",
  "243021597", "315551704", "189275913", "320002490", "282996204", "325293288", "251346973", "265501170",
  "189228955", "214097810", "239401818", "172371678", "190811213", "174239372", "311924988", "180262687",
  "173731419", "173764228", "312176189", "315312124", "175271685", "242809891", "174960333", "284732113",
  "174452448", "240990998", "295364867", "174091599", "172830003", "175582587", "208377288", "312192996",
  "300149010", "173911659", "326418714", "306471120", "319429044", "172076497", "293408501", "301884432",
  "245809899", "245334805"
]

type RedeemStatus = "pending" | "processing" | "success" | "already_redeemed" | "error" | "player_not_found" | "invalid_code"

interface RedeemResult {
  playerId: string
  status: RedeemStatus
  message: string
}

type AllianceMode = "manual" | "mlf" | "mmf"

export function GiftCodeRedeemer() {
  const [giftCode, setGiftCode] = useState("")
  const [manualIds, setManualIds] = useState("")
  const [mode, setMode] = useState<AllianceMode>("manual")
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<RedeemResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const abortRef = useRef(false)

  const getPlayerIds = useCallback((): string[] => {
    switch (mode) {
      case "mlf":
        return ALLIANCE_MLF
      case "mmf":
        return ALLIANCE_MMF
      case "manual":
      default:
        return manualIds
          .replace(/,/g, " ")
          .split(/\s+/)
          .filter((id) => id.trim() !== "")
    }
  }, [mode, manualIds])

  const redeemForPlayer = async (
    playerId: string,
    code: string,
    retries = 3
  ): Promise<RedeemResult> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch("/api/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, giftCode: code }),
        })

        const data = await response.json()

        if (data.status === "unknown" && attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }

        return {
          playerId,
          status: data.status as RedeemStatus,
          message: data.message,
        }
      } catch {
        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }
        return {
          playerId,
          status: "error",
          message: "Erreur de connexion",
        }
      }
    }

    return {
      playerId,
      status: "error",
      message: "Échec après plusieurs tentatives",
    }
  }

  const startRedemption = async () => {
    const playerIds = getPlayerIds()
    if (!giftCode.trim() || playerIds.length === 0) return

    setIsRunning(true)
    abortRef.current = false
    setResults([])
    setCurrentIndex(0)

    const code = giftCode.trim().toUpperCase()

    // Initialize all as pending
    setResults(
      playerIds.map((id) => ({
        playerId: id,
        status: "pending" as RedeemStatus,
        message: "En attente",
      }))
    )

    for (let i = 0; i < playerIds.length; i++) {
      if (abortRef.current) break

      setCurrentIndex(i)
      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "processing", message: "En cours..." } : r
        )
      )

      const result = await redeemForPlayer(playerIds[i], code)

      setResults((prev) =>
        prev.map((r, idx) => (idx === i ? result : r))
      )

      // Small delay between requests
      if (i < playerIds.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, 700))
      }
    }

    setIsRunning(false)
  }

  const stopRedemption = () => {
    abortRef.current = true
    setIsRunning(false)
  }

  const clearResults = () => {
    setResults([])
    setCurrentIndex(0)
  }

  const playerIds = getPlayerIds()
  const successCount = results.filter((r) => r.status === "success").length
  const alreadyRedeemedCount = results.filter(
    (r) => r.status === "already_redeemed"
  ).length
  const errorCount = results.filter(
    (r) => r.status === "error" || r.status === "player_not_found" || r.status === "invalid_code"
  ).length

  const getStatusIcon = (status: RedeemStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "already_redeemed":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case "error":
      case "player_not_found":
      case "invalid_code":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />
    }
  }

  const getStatusBadge = (status: RedeemStatus) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-400">Succès</Badge>
      case "already_redeemed":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Déjà utilisé</Badge>
      case "processing":
        return <Badge className="bg-primary/20 text-primary">En cours</Badge>
      case "error":
        return <Badge className="bg-red-500/20 text-red-400">Erreur</Badge>
      case "player_not_found":
        return <Badge className="bg-red-500/20 text-red-400">Joueur introuvable</Badge>
      case "invalid_code":
        return <Badge className="bg-red-500/20 text-red-400">Code invalide</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">En attente</Badge>
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Configuration Panel */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gift Code Input */}
          <div className="space-y-2">
            <Label htmlFor="giftCode" className="text-sm font-medium">
              Code Cadeau
            </Label>
            <Input
              id="giftCode"
              type="text"
              placeholder="Ex: KINGSHOT2024"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
              className="border-border/50 bg-background/50 font-mono uppercase"
              disabled={isRunning}
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Mode de sélection</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={mode === "manual" ? "default" : "outline"}
                onClick={() => setMode("manual")}
                disabled={isRunning}
                className={cn(
                  "flex flex-col gap-1 h-auto py-3",
                  mode === "manual" && "border-primary"
                )}
              >
                <UserPlus className="h-4 w-4" />
                <span className="text-xs">Manuel</span>
              </Button>
              <Button
                variant={mode === "mlf" ? "default" : "outline"}
                onClick={() => setMode("mlf")}
                disabled={isRunning}
                className={cn(
                  "flex flex-col gap-1 h-auto py-3",
                  mode === "mlf" && "border-primary"
                )}
              >
                <Users className="h-4 w-4" />
                <span className="text-xs">MLF</span>
              </Button>
              <Button
                variant={mode === "mmf" ? "default" : "outline"}
                onClick={() => setMode("mmf")}
                disabled={isRunning}
                className={cn(
                  "flex flex-col gap-1 h-auto py-3",
                  mode === "mmf" && "border-primary"
                )}
              >
                <Users className="h-4 w-4" />
                <span className="text-xs">MMF</span>
              </Button>
            </div>
          </div>

          {/* Manual IDs Input */}
          {mode === "manual" && (
            <div className="space-y-2">
              <Label htmlFor="manualIds" className="text-sm font-medium">
                IDs des joueurs (séparés par virgule ou espace)
              </Label>
              <Input
                id="manualIds"
                type="text"
                placeholder="123456789, 987654321, ..."
                value={manualIds}
                onChange={(e) => setManualIds(e.target.value)}
                className="border-border/50 bg-background/50 font-mono"
                disabled={isRunning}
              />
            </div>
          )}

          {/* Player Count Info */}
          <div className="rounded-lg border border-border/30 bg-background/30 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Joueurs sélectionnés</span>
              <Badge variant="secondary" className="font-mono">
                {playerIds.length}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={startRedemption}
                disabled={!giftCode.trim() || playerIds.length === 0}
                className="flex-1 gap-2"
              >
                <Play className="h-4 w-4" />
                Lancer
              </Button>
            ) : (
              <Button
                onClick={stopRedemption}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <Square className="h-4 w-4" />
                Arrêter
              </Button>
            )}
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isRunning || results.length === 0}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Résultats
            </span>
            {results.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {currentIndex + 1} / {results.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Summary */}
          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-center">
                <div className="text-lg font-bold text-green-400">{successCount}</div>
                <div className="text-xs text-green-400/70">Succès</div>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-center">
                <div className="text-lg font-bold text-yellow-400">{alreadyRedeemedCount}</div>
                <div className="text-xs text-yellow-400/70">Déjà utilisé</div>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-center">
                <div className="text-lg font-bold text-red-400">{errorCount}</div>
                <div className="text-xs text-red-400/70">Erreurs</div>
              </div>
            </div>
          )}

          {/* Results List */}
          <ScrollArea className="h-[320px] rounded-lg border border-border/30 bg-background/30">
            {results.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
                Les résultats apparaîtront ici une fois le processus lancé
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {results.map((result, idx) => (
                  <div
                    key={result.playerId}
                    className={cn(
                      "flex items-center justify-between rounded-md p-2 text-sm transition-colors",
                      idx === currentIndex && isRunning && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-mono text-xs">{result.playerId}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
