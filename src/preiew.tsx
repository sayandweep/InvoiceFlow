import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./lib/supabase";
import jsPDF from "jspdf";

import { FileText, LogIn, LogOut, User} from 'lucide-react';

type Item = {
  name: string;
  price: number;
  quantity: number;
};

type Invoice = {
  id: string;
  client_name: string;
  client_mail: string;
  items: Item[];
  total: number;
  qr_url: string;
  invoice_number: string;
};

type InvoiceItem = {
  name: string;
  price: number;
  quantity: number;
};

export default function Preview() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);


  // GOOGLE AUTH
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://invoicefolio.sayandweep.in"
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





  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setInvoice(data);
  };

  const downloadPDF = () => {
    if (!invoice) return;
  
    const doc = new jsPDF();
  
    // ----- HEADER -----
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${invoice.invoice_number}`, 20, 20,);
  
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
  
    doc.text(`To: ${invoice.client_name}`, 20, 40);
    doc.text(`Mail: ${invoice.client_mail}`, 20, 45);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      20,
      25,
    );
  
    // ----- TABLE HEADER -----
    let y = 60;
  
    doc.setFont("helvetica", "bold");
  
    doc.text("Item", 20, y);
    doc.text("Price", 120, y, { align: "right" });
    doc.text("Quantity", 150, y, { align: "right" });
    doc.text("Total", 190, y, { align: "right" });
  
    doc.line(20, y + 2, 190, y + 2);
  
    doc.setFont("helvetica", "normal");
  
    // ----- ITEMS -----
    y += 10;
  
    invoice.items.forEach((item: any) => {
      const itemTotal =
        Number(item.price) * Number(item.quantity);
  
      doc.text(item.name, 20, y);
  
      doc.text(`${item.price}`, 120, y, { align: "right" });
      doc.text(`${item.quantity}`, 150, y, { align: "right" });
      doc.text(`${itemTotal}`, 190, y, { align: "right" });
  
      y += 8;
    });
  
    // ----- TOTAL -----
    y += 10;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Total:", 190, y, { align: "right" });

    y += 8;
    doc.setFontSize(20);
    doc.text(`${invoice.total} INR`, 190, y, { align: "right" });
  
    // ----- QR SECTION -----
    y += 20;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Scan to Pay:", 20, y);
  
    if (invoice.qr_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = invoice.qr_url;
  
      img.onload = () => {
        doc.addImage(img, "PNG", 20, y + 5, 100, 100);
        doc.save(`INV-${invoice.invoice_number}`);
      };
  
      img.onerror = () => {
        doc.save(`INV-${invoice.invoice_number}`);
      };
    } else {
      doc.save(`INV-${invoice.invoice_number}`);
    }
  };

  

  if (!invoice) {
    return (
      <div className="text-center mt-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black lg:flex justify-between w-full max-w-full lg:p-10 p-5">



        <div className="lg:w-full lg:max-w-50 lg:mr-5 mt-15 p-5 bg-mist-900 shadow-sm rounded-md hidden lg:block" id="sidebar">
        <a href="/dashboard"><div className="flex items-center gap-2"><FileText size={15}/>Dashboard</div></a>
        <a href="#"><div className="flex items-center gap-2"><User size={15}/>Clients</div></a>
        {user ? (<button onClick={logOut}><div className="flex items-center gap-2"><LogOut  size={15}/>Logout</div></button>) : (<button onClick={loginWithGoogle}><div className="flex items-center gap-2"><LogIn size={15}/>Signup</div></button>)}
        </div>



      <div className="max-w-8xl w-full bg-white text-black p-8 border rounded-lg shadow mt-15">
        <h1 className="text-2xl font-bold mb-6">
          {invoice.invoice_number}
        </h1>
        <p><b>Client Name:</b> {invoice.client_name}</p>
        <p><b>Client Mail:</b> {invoice.client_mail}</p>

        <hr className="my-4" />
            <table className="w-full text-black">
            <thead>
              <tr className="border-b text-stone-500 text-sm">
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Quantity</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: InvoiceItem, i: number) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 text-left">{item.name}</td>
                    <td className="py-2 text-right">{item.price}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{itemTotal} INR</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        <hr className="my-4" />

        <h2 className="text-lg font-semibold">
          Total: {invoice.total} INR
        </h2>

        {/* QR */}
        {invoice.qr_url && (
          <div className="mt-6">
            <p className="text-sm text-black">
              Scan to Pay
            </p>

            <img
              src={invoice.qr_url}
              className="w-40 mt-2 border p-2 rounded"
            />
          </div>
        )}

        {/* Button */}
        <button
          onClick={downloadPDF}
          className="mt-6 bg-black text-white px-6 py-3 rounded-md hover:opacity-90"
        >
          Download PDF
        </button>

      </div>
    </div>
  );
}