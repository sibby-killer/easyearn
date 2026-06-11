"use client";
import { useEffect, useState } from "react";

const TESTIMONIALS = [
  { name: "Carlos M.", country: "Mexico", amount: 25, method: "PayPal" },
  { name: "Priya K.", country: "India", amount: 50, method: "PayPal" },
  { name: "James T.", country: "USA", amount: 15, method: "Amazon Gift Card" },
  { name: "Aisha B.", country: "Nigeria", amount: 10, method: "Mobile Top-Up" },
  { name: "Liam O.", country: "Ireland", amount: 75, method: "PayPal" },
  { name: "Sofia R.", country: "Brazil", amount: 30, method: "Google Play Code" },
  { name: "Wei Z.", country: "China", amount: 100, method: "PayPal" },
  { name: "Fatima E.", country: "Morocco", amount: 20, method: "Amazon Gift Card" },
  { name: "Dmitry P.", country: "Russia", amount: 45, method: "Bitcoin" },
  { name: "Emma S.", country: "UK", amount: 60, method: "PayPal" },
  { name: "Juan D.", country: "Colombia", amount: 12, method: "Mobile Top-Up" },
  { name: "Maya L.", country: "Philippines", amount: 35, method: "PayPal" },
  { name: "Ahmed H.", country: "Egypt", amount: 8, method: "Amazon Gift Card" },
  { name: "Laura W.", country: "Canada", amount: 90, method: "PayPal" },
  { name: "Koji T.", country: "Japan", amount: 150, method: "Bitcoin" },
  { name: "Maria F.", country: "Argentina", amount: 18, method: "Google Play Code" },
  { name: "Olga S.", country: "Ukraine", amount: 40, method: "Walmart Gift Card" },
  { name: "Ryan C.", country: "Australia", amount: 55, method: "PayPal" },
  { name: "Hassan M.", country: "Pakistan", amount: 5, method: "Mobile Top-Up" },
  { name: "Isabella N.", country: "Italy", amount: 80, method: "PayPal" },
  { name: "Kwame O.", country: "Ghana", amount: 22, method: "Amazon Gift Card" },
  { name: "Lin W.", country: "Taiwan", amount: 120, method: "PayPal" },
  { name: "Pedro G.", country: "Peru", amount: 15, method: "Google Play Code" },
  { name: "Zara K.", country: "Turkey", amount: 65, method: "PayPal" },
  { name: "Erik J.", country: "Sweden", amount: 95, method: "Bitcoin" },
  { name: "Nadia A.", country: "Algeria", amount: 7, method: "Mobile Top-Up" },
  { name: "Tom B.", country: "Germany", amount: 110, method: "PayPal" },
  { name: "Rosa L.", country: "Spain", amount: 28, method: "Walmart Gift Card" },
  { name: "Viktor I.", country: "Poland", amount: 42, method: "Amazon Gift Card" },
  { name: "Mira C.", country: "Vietnam", amount: 33, method: "PayPal" },
  { name: "Omar F.", country: "Kenya", amount: 6, method: "Mobile Top-Up" },
  { name: "Chloe D.", country: "France", amount: 70, method: "PayPal" },
  { name: "Diego R.", country: "Chile", amount: 48, method: "Google Play Code" },
  { name: "Amara K.", country: "South Africa", amount: 14, method: "Amazon Gift Card" },
  { name: "Yuki T.", country: "Japan", amount: 85, method: "PayPal" },
  { name: "Alex P.", country: "Romania", amount: 38, method: "Mobile Top-Up" },
];

interface ToastItem {
  id: number;
  name: string;
  country: string;
  amount: number;
  method: string;
}

export default function TestimonialsPopup() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const count = Math.floor(Math.random() * 8) + 2;
    const shuffled = [...TESTIMONIALS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const timers: ReturnType<typeof setTimeout>[] = [];

    selected.forEach((item, i) => {
      const delay = 60000 + i * 60000;
      timers.push(setTimeout(() => {
        const toast: ToastItem = { ...item, id: Date.now() + i };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 5000);
      }, delay));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-slide-in {
          animation: slideInRight 0.4s ease-out;
        }
      `}</style>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-slide-in bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm text-text"
          >
            🎉 {toast.name} from {toast.country} just withdrew ${toast.amount} via {toast.method}!
          </div>
        ))}
      </div>
    </>
  );
}
