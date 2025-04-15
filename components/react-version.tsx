"use client"

import * as React from "react"

export function ReactVersion() {
  React.useEffect(() => {
    console.log("React version:", React.version)
  }, [])

  return <div className="text-xs text-muted-foreground">React version: {React.version}</div>
}
