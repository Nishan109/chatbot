"use client"

import { useState, type React } from "react"
import { useAuth } from "./auth-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Loader2 } from "lucide-react"

export function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, signUp, loading, error } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      await signUp(email, password)
    } else {
      await signIn(email, password)
    }
  }

  return (
    <Card className="w-[350px] rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
        <CardDescription>
          {isSignUp ? "Create a new account" : "Enter your email and password to sign in"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-md"
            />
          </div>
          {error && (
            <Alert variant="destructive" className="rounded-md">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full rounded-md" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="w-full" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Button>
      </CardFooter>
    </Card>
  )
}
