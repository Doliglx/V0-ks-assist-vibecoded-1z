import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const playerId = searchParams.get("fid")
  const kingdomId = searchParams.get("kid")

  if (!playerId || !kingdomId) {
    return NextResponse.json(
      { error: "Missing fid or kid parameter" },
      { status: 400 }
    )
  }

  const url = `https://stratforge.tools/api/player-locate?fid=${playerId}&kid=${kingdomId}`

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
    Accept: "text/event-stream",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    pragma: "no-cache",
    "cache-control": "no-cache",
    "sec-ch-ua-platform": '"Android"',
    "sec-ch-ua":
      '"Chromium";v="148", "Brave";v="148", "Not/A)Brand";v="99"',
    dnt: "1",
    "sec-ch-ua-mobile": "?1",
    "sec-gpc": "1",
    "accept-language": "fr-FR,fr;q=0.6",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer: "https://stratforge.tools/dashboard/kingshot/tools/scout",
    priority: "u=1, i",
    Cookie:
      "__Host-authjs.csrf-token=ee814877beac86e2503e3d085ba9e4aed4226059de99f2ff21c3429fddc0595f%7Cda6ffee669cc6bae621beeba05be5be2dbe574f60c97da404e5813ce7a36ce10; __Secure-authjs.callback-url=https%3A%2F%2Fstratforge.tools%2Fdashboard; __Secure-authjs.session-token=4404390f-e146-423c-ba2f-7f87e23764cc",
  }

  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error: ${response.status}` },
        { status: response.status }
      )
    }

    const text = await response.text()
    const lines = text.split("\n")

    let result: {
      event: string
      data: Record<string, unknown>
    } | null = null

    let currentEvent: string | null = null

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith("event:")) {
        currentEvent = trimmedLine.split("event:")[1].trim()
      } else if (trimmedLine.startsWith("data:") && currentEvent) {
        const dataJsonStr = trimmedLine.split("data:")[1].trim()

        try {
          const data = JSON.parse(dataJsonStr)

          if (currentEvent === "found") {
            result = { event: "found", data }
            break
          } else if (currentEvent === "error") {
            result = { event: "error", data }
            break
          } else if (currentEvent === "progress") {
            // Continue to next event
            result = { event: "progress", data }
          }
        } catch {
          // JSON parse error, continue
        }
      }
    }

    if (result) {
      return NextResponse.json(result)
    }

    return NextResponse.json({ event: "not_found", data: { message: "Joueur non trouvé" } })
  } catch (error) {
    console.error("Locate player error:", error)
    return NextResponse.json(
      { error: "Failed to locate player" },
      { status: 500 }
    )
  }
}
