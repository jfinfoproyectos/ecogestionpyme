"use client";

import { useState } from "react";

interface HelpModalProps {
  title: string;
  description: string;
  steps: { title: string; detail: string }[];
}

export default function HelpModal({ title, description, steps }: HelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-full transition-all text-xs font-bold uppercase tracking-widest border border-stone-200"
      >
        <span className="w-5 h-5 bg-stone-500 text-white rounded-full flex items-center justify-center font-serif text-[10px] italic">?</span>
        Guía de Uso
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white max-w-lg w-full rounded-[2rem] shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-stone-100 bg-stone-50 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-stone-900 mb-2">{title}</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-stone-400 hover:text-stone-900 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-md">
                {index + 1}
              </span>
              <div>
                <h4 className="font-bold text-stone-800 mb-1">{step.title}</h4>
                <p className="text-stone-600 text-sm leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-8 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
