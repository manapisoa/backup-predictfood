import React, { useState } from "react";
import { HandPlatter, Eye, EyeOff } from "lucide-react";
import Logo from "../../assets/logo.png";
const Register = () => {
  const [erreur, setErreur] = useState("");
    const [name,setName] = useState("")
  const [siret,setSiret] = useState()
  const [restaurant_type,setRestauraunt_type] = useState("")
  const [email,setEmail] = useState("")
  const [phone,setPhone] = useState()
  const [address,setAddress] = useState("")
  const [capacity,setCapacity] = useState()
  const [owner_name,setOwner_name] = useState("")
  const [owner_email,setOwner_email] = useState("")
  const [owner_password,setOwner_password] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleregister = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!name || !email || !phone || !siret || !owner_name || !owner_email || !owner_password) {
      setErreur("Tous les champs sont obligatoires");
      return;
    }
    
    const url = "http://localhost:8120/api/v1/auth/register";
    const data = {
      restaurant_data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        siret: siret.trim(),
        settings: {}
      },
      owner_email: owner_email.trim(),
      owner_name: owner_name.trim(),
      owner_password: owner_password
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.error?.message || 
                           result.message || 
                           'Une erreur est survenue lors de l\'inscription';
        throw new Error(errorMessage);
      }

      console.log('Inscription réussie:', result);
      
    } catch (error) {
      console.error('Erreur:', error);
      setErreur(error.message || 'Une erreur est survenue lors de l\'inscription');
    }
  };
  return (
    <div className="bg min-h-screen w-screen  p-4 sm:p-6 md:p-8 grid place-items-center">
      <div className="w-full max-w-5xl bg-white/40  backdrop-blur rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="relative hidden md:block bg-slate-950/90 backdrop-blur  text-white p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.25),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.25),transparent_40%)]"></div>
          <div className="relative z-10 h-full grid content-between">
            <div className="flex items-center ">
              <img
                src={Logo}
                alt=""
                className="h-10 border-none bg-transparent"
              />
              <span className="text-2xl font-semibold tracking-wide">
                PredictFood
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                Cuisinez plus malin avec{" "}
                <span className="text-emerald-400">P</span>redict
                <span className="text-[#F28D35]">F</span>ood !
              </h2>
              <p className="text-white/80 leading-relaxed">
                Inscrivez-vous pour explorer des prévisions, recommandations et
                suivis sur mesure !
              </p>
            </div>

            <div className="text-sm text-white/70">
              {new Date().getFullYear()} PredictFood .
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 grid content-center">
          <div className="mb-2 text-center md:text-left">
            <div className="md:hidden mx-auto mb-4 flex justify-center">
              <div className="p-2 rounded-xl bg-slate-900 text-white inline-flex items-center gap-2">
                <HandPlatter className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold">PredictFood</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl  font-bold text-slate-900">
              Inscription
            </h1>
            <p className="mt-2 text-slate-600">Créez votre compte restaurant</p>
          </div>
          <div className="text-red-500 rounded flex  justify-center text-center">
            {erreur}
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Nom du restaurant
              </label>
              <input
                id="name"
                type="text"
                placeholder="Brasserie du Port"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="siret"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                SIRET
              </label>
              <input
                id="siret"
                type="text"
                placeholder="12345678901234"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setSiret(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="restaurant_type"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Type de restaurant
              </label>
              <select
                id="restaurant_type"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setRestauraunt_type(e.target.value)}
              >
                <option value="brasserie">Brasserie</option>
                <option value="restaurant">Restaurant</option>
                <option value="fast-food">Fast-food</option>
                <option value="pizzeria">Pizzeria</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="phone"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="0556789012"
                className="w-full rounded-lg bg-white px-4 py-3 
                     text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="restau@exemple.com"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="capacity"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Capacité
              </label>
              <input
                id="capacity"
                type="number"
                min="1"
                placeholder="80"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>

            <div className="grid  gap-2">
              <label
                htmlFor="address"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Adresse
              </label>
              <div className="col-span-2">
              <input
                id="address"
                type="text"
                placeholder="123 Rue du Port, 33120 Arcachon"
                className="w-full col-span-2 rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setAddress(e.target.value)}
              />
              </div>
            </div>
            

            <div className="md:col-span-2 pt-2 border-t border-slate-200"></div>

            <div className="grid gap-2">
              <label
                htmlFor="owner_name"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                Nom du propriétaire
              </label>
              <input
                id="owner_name"
                type="text"
                placeholder="Marie Dupont"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setOwner_name(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="owner_email"
                className="text-sm mx-3 font-medium text-slate-700"
              >
                E-mail du propriétaire
              </label>
              <input
                id="owner_email"
                type="email"
                placeholder="marie@brasserie-port.fr"
                className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                onChange={(e) => setOwner_email(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 grid gap-2">
              <div className="flex items-center justify-between mx-3">
                <label
                  htmlFor="owner_password"
                  className="text-sm font-medium text-slate-700"
                >
                  Mot de pass
                </label>
              </div>
              <div className="relative">
                <input
                  id="owner_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                  onChange={(e) => setOwner_password(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <span className="text-xs m-3 text-end text-slate-600">
                Déjà un compte ?{" "}
                <a href="/login" className="text-[#134d11] hover:underline">
                  Se Connecter
                </a>
              </span>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-[#055902] px-4 py-3 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition"
                onClick={handleregister}
              >
                Créer le compte
              </button>
            </div>
          </form>

          {/* Boutons sociaux supprimés */}
        </div>
      </div>
    </div>
  );
};

export default Register;
