import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./lib/supabase";
import jsPDF from "jspdf";

type Item = {
  name: string;
  price: string;
  quantity: string;
};

type Invoice = {
  id: string;
  user_name: string;
  issued_to: string;
  items: Item[];
  total: number;
  qr_url: string;
};

export default function Preview() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

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
    doc.text("INVOICE", 190, 20, { align: "right" });
  
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
  
    doc.text(`From: ${invoice.user_name}`, 20, 30);
    doc.text(`To: ${invoice.issued_to}`, 20, 38);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      190,
      30,
      { align: "right" }
    );
  
    // ----- TABLE HEADER -----
    let y = 60;
  
    doc.setFont("helvetica", "bold");
  
    doc.text("Item", 20, y);
    doc.text("Price", 120, y, { align: "right" });
    doc.text("Qty", 150, y, { align: "right" });
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
  
    doc.text("Total:", 150, y, { align: "right" });
    doc.text(`${invoice.total} INR`, 190, y, { align: "right" });
  
    // ----- QR SECTION -----
    y += 20;
  
    doc.setFont("helvetica", "normal");
    doc.text("Scan to Pay:", 20, y);
  
    if (invoice.qr_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = invoice.qr_url;
  
      img.onload = () => {
        doc.addImage(img, "PNG", 20, y + 5, 50, 50);
        doc.save("invoice.pdf");
      };
  
      img.onerror = () => {
        doc.save("invoice.pdf");
      };
    } else {
      doc.save("invoice.pdf");
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
    <div className="min-h-screen bg-gray-50 py-10 text-black">

      <div className="max-w-2xl mx-auto bg-white p-8 border rounded-lg shadow">

        <h1 className="text-2xl font-bold mb-6">
          Invoice Preview
        </h1>

        <p><b>From:</b> {invoice.user_name}</p>
        <p><b>To:</b> {invoice.issued_to}</p>

        <hr className="my-4" />

        {/* Items */}
        {invoice.items.map((item, i) => {
          const itemTotal =
            Number(item.price) * Number(item.quantity);

          return (
            <div key={i} className="flex justify-between py-1 text-black">
              <span>{item.name}</span>
              <span>
                {item.price} × {item.quantity} = {itemTotal}
              </span>
            </div>
          );
        })}

        <hr className="my-4" />

        <h2 className="text-lg font-semibold">
          Total: {invoice.total}
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