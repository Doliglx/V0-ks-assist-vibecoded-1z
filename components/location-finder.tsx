"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Search,
  Loader2,
  Lock,
  CheckCircle2,
  XCircle,
  Target,
  Copy,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SECRET_CODE = "1203"

type LocateStatus = "idle" | "searching" | "found" | "not_found" | "error"

interface LocationResult {
  x: number
  y: number
  source: string
  durationMs: number
}

export function LocationFinder() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [secretInput, setSecretInput] = useState("")
  const [secretError, setSecretError] = useState(false)
  
  const [playerId, setPlayerId] = useState("")
  const [kingdomId, setKingdomId] = useState("")
  const [status, setStatus] = useState<LocateStatus>("idle")
  const [result, setResult] = useState<LocationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchHistory, setSearchHistory] = useState<Array<{
    playerId: string
    kingdomId: string
    result: LocationResult | null
    timestamp: Date
  }>>([])

  const handleSecretSubmit = useCallback(() => {
    if (secretInput === SECRET_CODE) {
      setIsUnlocked(true)
      setSecretError(false)
    } else {
      setSecretError(true)
      setSecretInput("")
    }
  }, [secretInput])

  const locatePlayer = async () => {
    if (!playerId.trim() || !kingdomId.trim()) return

    setStatus("searching")
    setResult(null)
    setErrorMessage("")

    try {
      const response = await fetch(
        `/api/locate-player?fid=${playerId.trim()}&kid=${kingdomId.trim()}`
      )
      
      const data = await response.json()

      if (data.event === "found") {
        const locationResult: LocationResult = {
          x: data.data.x,
          y: data.data.y,
          source: data.data.source,
          durationMs: data.data.durationMs,
        }
        setResult(locationResult)
        setStatus("found")
        
        // Add to history
        setSearchHistory(prev => [{
          playerId: playerId.trim(),
          kingdomId: kingdomId.trim(),
          result: locationResult,
          timestamp: new Date()
        }, ...prev.slice(0, 9)])
      } else if (data.event === "error") {
        setErrorMessage(data.data.message || "Erreur lors de la recherche")
        setStatus("error")
      } else {
        setErrorMessage("Joueur non trouvé sur la carte")
        setStatus("not_found")
      }
    } catch {
      setErrorMessage("Erreur de connexion au serveur")
      setStatus("error")
    }
  }

  const copyCoordinates = () => {
    if (result) {
      navigator.clipboard.writeText(`X:${result.x} Y:${result.y}`)
    }
  }

  const resetSearch = () => {
    setPlayerId("")
    setKingdomId("")
    setStatus("idle")
    setResult(null)
    setErrorMessage("")
  }

  const searchFromHistory = (historyItem: typeof searchHistory[0]) => {
    setPlayerId(historyItem.playerId)
    setKingdomId(historyItem.kingdomId)
  }

  // Secret code screen
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Accès restreint</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez le code secret pour accéder au Location Finder
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret" className="sr-only">
                Code secret
              </Label>
              <Input
                id="secret"
                type="password"
                placeholder="Code secret"
                value={secretInput}
                onChange={(e) => {
                  setSecretInput(e.target.value)
                  setSecretError(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSecretSubmit()
                }}
                className={cn(
                  "text-center text-lg tracking-widest border-border/50 bg-background/50",
                  secretError && "border-red-500 animate-shake"
                )}
              />
              {secretError && (
                <p className="text-center text-sm text-red-500">
                  Code incorrect
                </p>
              )}
            </div>
            <Button onClick={handleSecretSubmit} className="w-full gap-2">
              <Lock className="h-4 w-4" />
              Déverrouiller
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Search Panel */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Rechercher un joueur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player ID Input */}
          <div className="space-y-2">
            <Label htmlFor="playerId" className="text-sm font-medium">
              Player ID
            </Label>
            <Input
              id="playerId"
              type="text"
              placeholder="Ex: 326302855"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value.replace(/\D/g, ""))}
              className="border-border/50 bg-background/50 font-mono"
              disabled={status === "searching"}
            />
          </div>

          {/* Kingdom ID Input */}
          <div className="space-y-2">
            <Label htmlFor="kingdomId" className="text-sm font-medium">
              Kingdom ID
            </Label>
            <Input
              id="kingdomId"
              type="text"
              placeholder="Ex: 1203"
              value={kingdomId}
              onChange={(e) => setKingdomId(e.target.value.replace(/\D/g, ""))}
              className="border-border/50 bg-background/50 font-mono"
              disabled={status === "searching"}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={locatePlayer}
              disabled={!playerId.trim() || !kingdomId.trim() || status === "searching"}
              className="flex-1 gap-2"
            >
              {status === "searching" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Localiser
                </>
              )}
            </Button>
            <Button
              onClick={resetSearch}
              variant="outline"
              disabled={status === "searching"}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Historique récent
              </Label>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => searchFromHistory(item)}
                    className="flex w-full items-center justify-between rounded-md border border-border/30 bg-background/30 p-2 text-sm transition-colors hover:bg-background/50"
                  >
                    <span className="font-mono text-xs">
                      ID: {item.playerId} | K: {item.kingdomId}
                    </span>
                    {item.result && (
                      <Badge variant="secondary" className="text-xs">
                        X:{item.result.x} Y:{item.result.y}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Panel */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Résultat
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "idle" && (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <MapPin className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Entrez un Player ID et Kingdom ID pour localiser un joueur
              </p>
            </div>
          )}

          {status === "searching" && (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Recherche en cours...</p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Scan de la carte du royaume {kingdomId}
              </p>
            </div>
          )}

          {status === "found" && result && (
            <div className="space-y-6">
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h3 className="text-lg font-bold text-green-400">Joueur localisé</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border/30 bg-background/30 p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{result.x}</div>
                  <div className="mt-1 text-xs uppercase text-muted-foreground">
                    Coordonnée X
                  </div>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/30 p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{result.y}</div>
                  <div className="mt-1 text-xs uppercase text-muted-foreground">
                    Coordonnée Y
                  </div>
                </div>
              </div>

              <Button onClick={copyCoordinates} variant="outline" className="w-full gap-2">
                <Copy className="h-4 w-4" />
                Copier les coordonnées
              </Button>

              <div className="space-y-2 rounded-lg border border-border/30 bg-background/30 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Source</span>
                  <Badge variant="secondary">{result.source}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temps de recherche</span>
                  <span className="font-mono text-xs">{result.durationMs}ms</span>
                </div>
              </div>
            </div>
          )}

          {(status === "not_found" || status === "error") && (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <XCircle className="mb-4 h-12 w-12 text-red-500" />
              <h3 className="text-lg font-bold text-red-400">
                {status === "not_found" ? "Joueur non trouvé" : "Erreur"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
              <Button onClick={resetSearch} variant="outline" className="mt-4 gap-2">
                <RefreshCw className="h-4 w-4" />
                Nouvelle recherche
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
