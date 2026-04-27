import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn, User, LogOut} from 'lucide-react';

type Item = {
  name: string;
  price: string;
  quantity: string;
};

type Invoice = {
  invoice_number: string;
  id: string;
  client_name: string;
  client_mail: string;
  items: {
    name: string;
    price: string;
    quantity: string;
  }[];
  total: number;
  status: string;
  created_at: string;
};

export default function Home() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const [form, setForm] = useState({
    client_name: "",
    client_mail: "",
    qrFile: null as File | null
  });

  const [items, setItems] = useState<Item[]>([
    { name: "", price: "", quantity: "" }
  ]);

  const [submitting, setSubmitting] = useState(false);






  // INVOICE NUMBER FOR PEOPLE
  const invoiceNumber = `INV-${Date.now()}`




  // FETCHING DATA
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
  
    if (!user) {
      setInvoices([]);
      setInvoicesLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setInvoices(data || []);
    setInvoicesLoading(false);
  };




  //  HANDLE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (
    i: number,
    field: keyof Item,
    value: string
  ) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: "", price: "", quantity: "" }]);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, qrFile: file });
  };

  
  
  const uploadQR = async () => {
    if (!form.qrFile) {
      alert("No file selected");
      return null;
    }
  
    const fileName = `${Date.now()}_${form.qrFile.name}`;
  
    console.log("Uploading file:", fileName);
  
    const { data, error } = await supabase.storage
      .from("qr-images")
      .upload(fileName, form.qrFile, {
        cacheControl: "3600",
        upsert: false,
      });
  
    console.log("UPLOAD RESULT:", data, error);
  
    if (error) {
      alert(error.message);
      console.error("Upload error:", error);
      return null;
    }
  
    const { data: publicUrlData } = supabase.storage
      .from("qr-images")
      .getPublicUrl(fileName);
  
    console.log("PUBLIC URL:", publicUrlData.publicUrl);
  
    return publicUrlData.publicUrl;
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const total = items.reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity),
      0
    );

    const qrUrl = await uploadQR();
    console.log("QR URL:", qrUrl);





    // REAL BAAL
    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          user_id: user?.id,
          invoice_number: invoiceNumber,
          client_name: form.client_name,
          client_mail: form.client_mail,
          items,
          total,
          qr_url: qrUrl
        }
      ])
      .select()
      .single();
    setSubmitting(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate(`/preview/${data.id}`);
  };


  // GOOGLE AUTH
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "/dashboard"
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

  const logOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }


  // INVOICE LOADING
  if (invoicesLoading) {
    return (
      <p className="text-center text-6xl mt-30">pls wait :)</p>
    )
  }

  // REDIRECT
  if (!user) {
    location.replace('/');
  }

  return (
    <div className="min-h-screen max-w-full w-full bg-black lg:flex justify-between py-15 lg:py-20 lg:px-10 px-5">



      {/* LARGE MENU */}
      <div className="lg:w-full lg:max-w-50 lg:mr-5 mt-5 p-5 bg-mist-900 shadow-sm rounded-md hidden lg:block" id="sidebar">
        <a href="/dashboard"><div className="flex items-center gap-2"><FileText size={15}/>Dashboard</div></a>
        <a href="#"><div className="flex items-center gap-2"><User size={15}/>Clients</div></a>
        {user ? (<button onClick={logOut}><div className="flex items-center gap-2"><LogOut  size={15}/>Logout</div></button>) : (<button onClick={loginWithGoogle}><div className="flex items-center gap-2"><LogIn size={15}/>Signup</div></button>)}
      </div>




      {/* INVOICE CREATOR */}
      <div className="lg:w-full lg:max-w-4xl max-w-full shadow-sm mt-10 lg:mx-5" id="invoice creator">
        <h1 className="text-2xl font-semibold mb-6 leading-0">
          Create New Invoice
        </h1>
        <h3 className="opacity-50 mb-5">INV-{Date.now()}</h3>
  
        <div className="bg-mist-900 rounded-md p-5 lg:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
  
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="client_name"
              placeholder="Client Name"
              onChange={handleChange}
              className="p-3 rounded-md focus:outline-none"
              required
            />
  
            <input
              name="client_mail"
              placeholder="Client Mail"
              onChange={handleChange}
              className="p-3 rounded-md focus:outline-none"
              required
            />
          </div>
  
          {/* Items Section */}
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-gray-700">Items</h2>
  
            {items.map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
  
                <input
                  placeholder="Item name"
                  onChange={(e) =>
                    handleItemChange(i, "name", e.target.value)
                  }
                  className="border p-3 rounded-md"
                  
                />
  
                <input
                  type="number"
                  placeholder="Price"
                  min='0'
                  onChange={(e) =>
                    handleItemChange(i, "price", e.target.value)
                  }
                  className="p-3 rounded-md"
                  
                />
  
                <input
                  type="number"
                  placeholder="Qty"
                  min='0'
                  onChange={(e) =>
                    handleItemChange(i, "quantity", e.target.value)
                  }
                  className="p-3 rounded-md"
                  
                />
  
              </div>
            ))}
  
            <button
              type="button"
              onClick={addItem}
              className="text-sm bg-mist-950 px-3 py-2 rounded-md w-fit hover:bg-black hover:text-white transition"
            >
              + Add Item
            </button>
          </div>
  
          {/* QR Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">
              Upload QR Code
            </label>
  
            <input
              type="file"
              onChange={handleFile}
              className="p-2 rounded-md"
            />
          </div>
  
          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-400 text-black py-3 rounded-md hover:opacity-90 transition"
          >
            {submitting ? "Saving..." : "Create Invoice"}
          </button>
  
        </form>
        </div>
      </div>


      {/* ALL INVOICES */}
      <div className="lg:w-full lg:max-w-xl lg:p-8 p-5 shadow-sm mt-5 rounded-md bg-mist-900 lg:ml-5" id="invoices">
        <table className="w-full text-left">

            <thead>
              <tr className="border-b text-stone-500 text-sm">
                <th className="py-3">Client</th>
                <th className="py-3 hidden lg:table-cell">Items</th>
                <th className="py-3 hidden lg:table-cell">Quantity</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-4">
                      {invoice.client_name}
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      {invoice.items.map((item, i) => (
                        <p key={i}>{item.name}</p>
                      ))}
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      {invoice.items.map((item, i) => (
                        <p key={i}>{item.quantity}</p>
                      ))}
                    </td>
                    <td className="py-4 font-medium">
                      ₹{invoice.total}
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-sm border border-rose-900 text-rose-700 cursor-pointer" onClick={() => {location.replace(`/preview/${invoice.id}`)}}>
                        {invoice.status || "unpaid"}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>

          </table>
      </div>
    </div>
  );
}