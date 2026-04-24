import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";
import { FileText, User} from 'lucide-react';

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
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setInvoices(data || []);
    setInvoicesLoading(false);
  };









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
    if (!form.qrFile) return null;

    const fileName = Date.now() + "_" + form.qrFile.name;

    const { error } = await supabase.storage
      .from("qr-images")
      .upload(fileName, form.qrFile);

    if (error) {
      alert(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("qr-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const total = items.reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity),
      0
    );

    const qrUrl = await uploadQR();

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
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

  if (invoicesLoading) {
    return (
      <p className="text-center mt-10">Loading...</p>
    )
  }

  return (
    <div className="min-h-screen bg-black flex justify-around py-20 px-10">

      <div className="w-full max-w-50 mr-5 mt-5 p-5 bg-mist-950 shadow-sm rounded-md h-" id="sidebar">
        <a href="#"><div className="flex items-center gap-2"><FileText size={15}/>Invoices</div></a>
        <a href="#"><div className="flex items-center gap-2"><User size={15}/>Clients</div></a>
      </div>

      <div className="w-full max-w-4xl shadow-sm mt-10 mx-5" id="invoice creator">
  
        <h1 className="text-2xl font-semibold mb-6 leading-0">
          Create New Invoice
        </h1>
        <h3 className="opacity-50 mb-5">INV-{Date.now()}</h3>
  
        <div className="bg-mist-950 rounded-md p-10">
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
              className="p-3 rounded-md focus:outline-none border"
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
                  required
                />
  
                <input
                  type="number"
                  placeholder="Price"
                  min='0'
                  onChange={(e) =>
                    handleItemChange(i, "price", e.target.value)
                  }
                  className="border p-3 rounded-md"
                  required
                />
  
                <input
                  type="number"
                  placeholder="Qty"
                  min='0'
                  onChange={(e) =>
                    handleItemChange(i, "quantity", e.target.value)
                  }
                  className="border p-3 rounded-md"
                  required
                />
  
              </div>
            ))}
  
            <button
              type="button"
              onClick={addItem}
              className="text-sm bg-stone-950 border border-black px-3 py-2 rounded-md w-fit hover:bg-black hover:text-white transition"
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
              className="border p-2 rounded-md"
            />
          </div>
  
          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-800 text-white py-3 rounded-md hover:opacity-90 transition"
          >
            {submitting ? "Saving..." : "Create Invoice"}
          </button>
  
        </form>
        </div>
      </div>

      <div className="w-full max-w-xl p-8 shadow-sm mt-5 rounded-md bg-mist-950 ml-5" id="invoices">
        <table className="w-full text-left">

            <thead>
              <tr className="border-b text-stone-500 text-sm">
                <th className="py-3">Client</th>
                <th className="py-3">Items</th>
                <th className="py-3">Quantity</th>
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

                  <td className="py-4">
                    {invoice.items.map((item, i) => (
                      <p key={i}>{item.name}</p>
                    ))}
                  </td>

                  <td className="py-4">
                    {invoice.items.map((item, i) => (
                      <p key={i}>{item.quantity}</p>
                    ))}
                  </td>

                  <td className="py-4 font-medium">
                    ₹{invoice.total}
                  </td>

                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-sm border border-rose-950 text-rose-700 cursor-pointer">
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