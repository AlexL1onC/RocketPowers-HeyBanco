import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Moon, Pizza, ShoppingCart, Car, Ticket, Pill, Smartphone, Package, Wallet } from 'lucide-react';
import { cn } from './lib/utils.ts';

// Recreación de los datos de tu imagen
const gastosData = [
  { id: 1, categoria: 'Restaurantes', monto: '$1,480', porcentaje: '24%', width: 'w-[24%]', color: 'bg-[#ff6b6b]', icon: Pizza },
  { id: 2, categoria: 'Súper / Despensa', monto: '$1,200', porcentaje: '20%', width: 'w-[20%]', color: 'bg-[#feca57]', icon: ShoppingCart },
  { id: 3, categoria: 'Transporte', monto: '$980', porcentaje: '16%', width: 'w-[16%]', color: 'bg-[#5f27cd]', icon: Car },
  { id: 4, categoria: 'Entretenimiento', monto: '$820', porcentaje: '13%', width: 'w-[13%]', color: 'bg-[#9b59b6]', icon: Ticket },
  { id: 5, categoria: 'Salud', monto: '$700', porcentaje: '12%', width: 'w-[12%]', color: 'bg-[#1dd1a1]', icon: Pill },
  { id: 6, categoria: 'Suscripciones', monto: '$580', porcentaje: '10%', width: 'w-[10%]', color: 'bg-[#54a0ff]', icon: Smartphone },
  { id: 7, categoria: 'Otros', monto: '$320', porcentaje: '5%', width: 'w-[5%]', color: 'bg-[#c8d6e5]', icon: Package },
];

function App() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 1, 
      role: 'delfos', 
      text: 'Hola Pedro, soy Delfos. Tienes un gasto alto en Restaurantes esta quincena. ¿Quieres que armemos un plan para reducirlo y proteger tu racha?' 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = { id: Date.now(), role: 'user', text: chatInput };
    setChatHistory([...chatHistory, newMessage]);
    setChatInput('');
  };

  return (
    // Contenedor principal: flex-col en celular, flex-row en computadora (md)
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0a0a0c] text-white font-sans overflow-hidden">
      
      {/* ---------------------------------------------------
          PANEL IZQUIERDO (O SUPERIOR EN MÓVIL): EL DASHBOARD
          --------------------------------------------------- */}
      <main className="w-full md:w-1/2 h-[50vh] md:h-screen p-4 md:p-8 overflow-y-auto flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/10">
        
        {/* Header Responsivo */}
        <header className="flex justify-between items-center mt-2 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff66c4]/10 rounded-xl">
              <Wallet className="text-[#ff66c4]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Delfos</h1>
              <p className="text-xs text-gray-400">Resumen de Gastos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-[#ffde59] uppercase tracking-wider">Racha</p>
              <p className="text-sm font-bold">14 Días 🔥</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition">
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Gráfica Recreada (Basada en tu imagen) */}
        <div className="flex-1 space-y-3 pb-4">
          {gastosData.map((item) => (
            <div key={item.id} className="bg-[#151518] p-4 rounded-2xl border border-white/5 hover:bg-[#1c1c21] transition-colors flex items-center gap-4">
              
              {/* Icono */}
              <div className="w-10 h-10 rounded-xl bg-[#232329] flex items-center justify-center shrink-0">
                <item.icon size={18} className="text-gray-300" />
              </div>
              
              {/* Contenido de la Barra */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span className="font-medium text-gray-200">{item.categoria}</span>
                  <div className="text-right">
                    <span className="font-bold block">{item.monto}</span>
                    <span className="text-xs text-gray-500">{item.porcentaje}</span>
                  </div>
                </div>
                {/* Track de la barra */}
                <div className="h-1.5 w-full bg-[#232329] rounded-full overflow-hidden">
                  {/* Fill de la barra */}
                  <div className={cn("h-full rounded-full", item.width, item.color)}></div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>

      {/* ---------------------------------------------------
          PANEL DERECHO (O INFERIOR EN MÓVIL): EL CHAT
          --------------------------------------------------- */}
      <aside className="w-full md:w-1/2 h-[50vh] md:h-screen bg-[#0f0f13] flex flex-col relative z-20 shadow-2xl">
        
        {/* Header del Chat */}
        <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-3 bg-[#0f0f13]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff66c4] animate-pulse shadow-[0_0_10px_#ff66c4]"></div>
          <h3 className="font-semibold text-lg">Tu Copiloto Financiero</h3>
        </div>

        {/* Historial de Chat */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "p-4 rounded-2xl max-w-[90%] md:max-w-[80%] text-sm shadow-md",
                msg.role === 'delfos' 
                  ? "bg-[#232329] text-gray-200 rounded-tl-none self-start border border-white/5" 
                  : "bg-gradient-to-br from-[#ff66c4] to-[#d647a5] text-white rounded-tr-none self-end" 
              )}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Control */}
        <div className="p-4 md:p-6 bg-[#0f0f13] border-t border-white/5">
          <div className="flex items-center bg-[#151518] rounded-xl pl-4 pr-2 py-2 border border-white/10 focus-within:border-[#ff66c4] transition-all">
            <input 
              type="text" 
              placeholder="Pregúntale a Delfos sobre tus gastos..." 
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="p-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-transform active:scale-95 ml-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </aside>

    </div>
  );
}

export default App;