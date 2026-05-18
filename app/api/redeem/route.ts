import { NextRequest, NextResponse } from "next/server"

const REDEEM_URL = "https://kingshot.net/api/gift-codes/redeem"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Content-Type": "application/json",
  Origin: "https://kingshot.net",
  Referer: "https://kingshot.net/gift-codes/redeem",
}

export async function POST(request: NextRequest) {
  try {
    const { playerId, giftCode } = await request.json()

    if (!playerId || !giftCode) {
      return NextResponse.json(
        { status: "error", message: "Missing playerId or giftCode" },
        { status: 400 }
      )
    }

    const response = await fetch(REDEEM_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ playerId: String(playerId), giftCode }),
    })

    const text = await response.text()
    const textLower = text.toLowerCase()

    let data: Record<string, unknown> = {}
    try {
      data = JSON.parse(text)
    } catch {
      // Not JSON, will parse from text
    }

    const status = data.status as string | undefined
    const meta = data.meta as { errorKey?: string } | undefined
    const errorKey = meta?.errorKey || ""

    // Success
    if (
      status === "success" ||
      textLower.includes("success") ||
      textLower.includes("successfully")
    ) {
      return NextResponse.json({ status: "success", message: "Code validé" })
    }

    // Already redeemed
    if (
      errorKey === "GIFT_CODE_ALREADY_REDEEMED" ||
      textLower.includes("already_redeemed") ||
      textLower.includes("already redeemed")
    ) {
      return NextResponse.json({
        status: "already_redeemed",
        message: "Déjà récupéré",
      })
    }

    // Invalid code
    if (
      errorKey === "GIFT_CODE_NOT_FOUND" ||
      textLower.includes("not_found") ||
      textLower.includes("invalid")
    ) {
      return NextResponse.json({
        status: "invalid_code",
        message: "Code invalide",
      })
    }

    // Player not found
    if (
      errorKey === "PLAYER_NOT_FOUND" ||
      textLower.includes("player") && textLower.includes("not found")
    ) {
      return NextResponse.json({
        status: "player_not_found",
        message: "Joueur introuvable",
      })
    }

    // Unknown status - retry needed
    return NextResponse.json({
      status: "unknown",
      message: "Statut inconnu, réessai nécessaire",
      raw: text,
    })
  } catch (error) {
    console.error("Redeem error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    )
  }
}
