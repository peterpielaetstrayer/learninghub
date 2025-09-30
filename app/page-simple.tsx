"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleDashboard() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Learning Hub - Simple Test</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Learning Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a simplified version to test if the basic setup works.
              </p>
              <Button onClick={() => setCount(count + 1)}>
                Click me! Count: {count}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Test if the API is working.
              </p>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/vercel-test')
                    const data = await response.json()
                    alert(JSON.stringify(data, null, 2))
                  } catch (error) {
                    alert('API Error: ' + error.message)
                  }
                }}
              >
                Test API
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <p>✅ React is working</p>
            <p>✅ Tailwind CSS is working</p>
            <p>✅ Components are working</p>
            <p>⏳ Testing API connection...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
