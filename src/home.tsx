import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
 

function home() {




   // GOOGLE AUTH
 const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173"
    }
  });
};

// USER
const [user, setUser] = useState<any>(null);
useEffect(() => {
  getUser();
}, []);

const getUser = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  setUser(user);
};

if (user) {
  console.log('user registered');
  location.replace('/dashboard')
}









  return (
    <div className='min-h-lvh lg:flex justify-between items-center mt-10 p-10'>
      <h1 className="text-6xl w-full max-w-4xl">Manage your invoices, clients, and bills in one place
        <button onClick={loginWithGoogle} className="text-xl rounded-full bg-green-500 px-10 py-5 text-black">Get Started</button>
      </h1>
      <div className='w-full max-w-4xl mt-10'><img src="/app.png" alt="app" width={1000}/></div>

    </div>
  )
}

export default home