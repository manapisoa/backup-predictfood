"use client"

import { useState, useEffect } from "react"
import { HandPlatter, Eye, EyeOff } from "lucide-react"
import Logo from "../../assets/logo.png"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [erreur, setErreur] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handlelogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setErreur("Veuillez compléter tous les champs")
      return
    }

    setIsLoading(true)
    setErreur("")

    try {
      const formData = new FormData()
      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch("http://localhost:8120/api/v1/auth/login", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.setItem("access_token", result.access_token)

        try {
          const userResponse = await fetch("http://localhost:8120/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${result.access_token}`,
            },
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            localStorage.setItem("user_data", JSON.stringify(userData))
          }
        } catch (userError) {
          console.warn("Erreur lors de la récupération des données utilisateur:", userError)
        }

        setErreur("Connexion réussie !")
        setTimeout(() => {
          navigate("/")
        }, 1500)
      } else {
        if (response.status === 401) {
          setErreur("Email ou mot de passe incorrect")
        } else if (response.status === 400) {
          if (result.detail === "Inactive user") {
            setErreur("Compte désactivé. Contactez l'administrateur.")
          } else {
            setErreur(result.detail || "Données invalides")
          }
        } else if (response.status === 422) {
          if (result.detail && Array.isArray(result.detail)) {
            const errors = result.detail.map((err) => err.msg).join(", ")
            setErreur(`Erreur de validation: ${errors}`)
          } else {
            setErreur("Données de connexion invalides")
          }
        } else {
          setErreur(result.detail || "Erreur de connexion")
        }
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setErreur("Impossible de se connecter au serveur. Vérifiez votre connexion.")
      } else {
        setErreur("Erreur du serveur. Veuillez réessayer.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      fetch("http://localhost:8120/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            navigate("/")
          } else {
            localStorage.removeItem("access_token")
            localStorage.removeItem("user_data")
          }
        })
        .catch(() => {
          localStorage.removeItem("access_token")
          localStorage.removeItem("user_data")
        })
    }
  }, [navigate])

  return (
    <div className="bg min-h-screen  w-screen p-4 sm:p-6 flex items-center justify-center ">
      <div className="w-full max-w-5xl h-4/5 bg-foreground/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Panel - Branding */}
        <div className="relative hidden md:block bg-slate-900 text-white p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(5,150,105,0.15),transparent_50%)]"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <img src={Logo || "/placeholder.svg"} alt="PredictFood Logo" className="h-10" />
              <span className="text-2xl font-semibold tracking-wide">PredictFood</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Cuisinez plus malin avec <span className="text-emerald-400">P</span>redict
                <span className="text-orange-400">F</span>ood !
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Connectez-vous pour découvrir des prévisions, recommandations et suivis personnalisés.
              </p>
            </div>

            <div className="text-sm text-slate-400">© {new Date().getFullYear()} PredictFood</div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col bg-white backdrop-blur-sm justify-center">
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden mx-auto mb-4 flex justify-center">
              <div className="p-2 rounded-xl bg-background text-foreground inline-flex items-center gap-2">
                <HandPlatter className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold">PredictFood</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 ">Bienvenue</h1>
            <p className="mt-2 text-slate-600">Connectez-vous pour continuer</p>
          </div>

          {erreur && (
            <Alert
              className={`mb-4 ${
                erreur === "Connexion réussie !"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-red-500 bg-red-50 text-red-800"
              }`}
            >
              <AlertDescription className="font-medium">{erreur}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-5" onSubmit={handlelogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">
                  Mot de passe
                </Label>
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 pr-10 text-background"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" disabled={isLoading} />
                <Label htmlFor="remember" className="text-sm text-slate-700 cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              <span className="text-xs text-slate-600">
                Besoin d'un compte ?{" "}
                <a href="/register" className="text-emerald-600 hover:underline font-medium">
                  Inscription
                </a>
              </span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 mt-6"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
