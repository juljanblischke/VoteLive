import { useEffect, useRef } from "react"
import * as signalR from "@microsoft/signalr"
import { ResultsResponse } from "./api"

export function useSignalR(shareCode: string | undefined, onUpdate: (data: ResultsResponse) => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    if (!shareCode) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/poll")
      .withAutomaticReconnect()
      .build()

    connectionRef.current = connection

    connection.on("VoteUpdate", (data: ResultsResponse) => {
      onUpdate(data)
    })

    connection.start().then(() => {
      connection.invoke("JoinPoll", shareCode)
    })

    return () => {
      connection.invoke("LeavePoll", shareCode).catch(() => {})
      connection.stop()
    }
  }, [shareCode])
}
