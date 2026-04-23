import { useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";

type Item = {
  name: string;
  price: string;
  quantity: string;
};

export default function Home() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: "",
    issued_to: "",
    qrFile: null as File | null
  });

  const [items, setItems] = useState<Item[]>([
    { name: "", price: "", quantity: "" }
  ]);

  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const total = items.reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity),
      0
    );

    const qrUrl = await uploadQR();

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          user_name: form.user_name,
          issued_to: form.issued_to,
          items,
          total,
          qr_url: qrUrl
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate(`/preview/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-start py-10">
      <div className="w-full max-w-3xl p-8 rounded-xl shadow-sm border">
  
        <h1 className="text-2xl font-semibold mb-6">
          Create Invoice
        </h1>
  
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
  
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="user_name"
              placeholder="Your Name"
              onChange={handleChange}
              className="border p-3 rounded-md focus:outline-none"
              required
            />
  
            <input
              name="issued_to"
              placeholder="Issued To"
              onChange={handleChange}
              className="p-3 rounded-md focus:outline-none border"
              required
            />
          </div>
  
          {/* Items Section */}
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-gray-700">Items</h2>
  
            {items.map((item, i) => (
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
            disabled={loading}
            className="bg-stone-950 text-white py-3 rounded-md hover:opacity-90 transition"
          >
            {loading ? "Saving..." : "Create Invoice"}
          </button>
  
        </form>
      </div>
    </div>
  );
}