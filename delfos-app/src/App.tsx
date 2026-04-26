import React, { useState, useRef, useEffect } from 'react';
import { Menu, PieChart, Utensils, CreditCard, House, Car, Settings, Send, Moon } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  // 1. EL CEREBRO DE LA SPA: Esto decide qué se muestra en la parte superior derecha
  const [activeNav, setActiveNav] = useState('comida');
  const [chatInput, setChatInput] = useState('');
  

// 1. LA MEMORIA DEL CHAT: Guarda quién envió el mensaje y el texto
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 1, 
      role: 'delfos', 
      text: 'Hola Pedro, soy Delfos. ¿En qué te ayudo hoy?' 
    }
  ]);

    // 1. Creamos la referencia al final del chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

    // 2. Función para bajar suavemente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 3. El Efecto: Cada vez que chatHistory se actualiza, corremos la función
  useEffect(() => {
    scrollToBottom();
    }, [chatHistory]);


  // (Simulación rápida para modo oscuro)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 2. RENDERIZADO CONDICIONAL: Esta función escupe un diseño diferente según el botón que toques
  const renderTopContent = () => {
    if (activeNav === 'configuracion') {
      return (
        <div className="flex-1 p-10 flex flex-col items-center justify-center bg-neutral-100">
          <h2 className="text-4xl font-bold mb-8">Configuración de Delfos</h2>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition"
          >
            <Moon size={20} />
            {isDarkMode ? 'Desactivar Modo Oscuro' : 'Activar Modo Oscuro'}
          </button>
          <p className="mt-4 text-gray-500">Aquí irían las conexiones de bancos, perfil, etc.</p>
        </div>
      );
    }

    // Contenido por defecto (General, Comida, etc.)
    return (
      <div className="flex-1 p-10 overflow-y-auto bg-neutral-50 flex flex-col items-center justify-center">
        <h2 className="text-5xl font-bold text-black mb-4 capitalize">
          Sección: {activeNav}
        </h2>
        <p className="text-xl text-gray-500 mb-8">
          Aquí va el cuadro con las gráficas de Recharts para {activeNav}.
        </p>
        
        {/* Tu botón original simulado */}
        <button className="w-full max-w-2xl bg-white border border-gray-200 text-neutral-800 p-6 rounded-2xl text-lg font-semibold shadow-sm hover:bg-neutral-50 transition-colors">
          Dame recomendaciones para ahorrar en {activeNav}
        </button>
      </div>
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return; // No enviar mensajes vacíos

    // Agregamos el mensaje del usuario al historial
    const newMessage = { 
      id: Date.now(), 
      role: 'user', 
      text: chatInput 
    };
    
    // Actualizamos la memoria conservando lo anterior (...chatHistory)
    setChatHistory([...chatHistory, newMessage]);
    setChatInput(''); // Limpiamos la caja de texto


    // (Aquí es donde en el futuro llamarías a tu FastAPI, 
    // y luego harías otro setChatHistory con la respuesta de Delfos)
  };

  return (
    // Agregamos una clase condicional 'dark' si quieres implementar dark mode completo después
    <div className={cn("flex h-screen w-full font-sans overflow-hidden", isDarkMode ? "bg-neutral-900 text-white" : "bg-white text-black")}>
      
      {/* PANEL IZQUIERDO: Navegación (300px fijos) */}
      <aside className="w-[300px] bg-black text-white flex flex-col p-6 shadow-xl z-20">
        
        <div className="flex items-center gap-3 mb-10 pl-2">
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <Menu size={24} className="text-[#ff66c4]" />
          </button>
          <div className="text-3xl font-bold font-serif tracking-tight text-white">Delfos</div>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {[
            { id: 'general', icon: PieChart, label: 'General' },
            { id: 'comida', icon: Utensils, label: 'Comida' },
            { id: 'ocio', icon: CreditCard, label: 'Ocio' },
            { id: 'hogar', icon: House, label: 'Hogar' },
            { id: 'transporte', icon: Car, label: 'Transporte' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "w-full flex items-center space-x-4 p-4 rounded-2xl transition-all font-medium text-lg",
                activeNav === item.id 
                  ? "bg-neutral-800 text-white" 
                  : "text-gray-400 hover:bg-neutral-900 hover:text-white"
              )}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sección Inferior: Racha y Configuración */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="bg-gradient-to-r from-[#ff66c4] to-[#ffde59] p-4 rounded-2xl shadow-lg text-black">
            <p className="text-sm font-medium opacity-80">Racha de Ahorro</p>
            <p className="text-2xl font-bold">14 Días 🔥</p>
          </div>

          <button 
            onClick={() => setActiveNav('configuracion')}
            className={cn(
              "w-full flex items-center space-x-3 p-4 rounded-2xl transition-all text-gray-400 hover:bg-neutral-900 hover:text-white",
              activeNav === 'configuracion' && "bg-neutral-800 text-white"
            )}
          >
            <Settings size={22} />
            <span className="font-medium text-lg">Configuración</span>
          </button>
        </div>
      </aside>

      {/* PANEL DERECHO: 2 Secciones (Arriba: Dinámico, Abajo: Chat) */}
      <main className="flex-1 flex flex-col relative">
        
        {/* PARTE SUPERIOR DINÁMICA (Llama a la función que creamos arriba) */}
        {renderTopContent()}

      {/* PARTE INFERIOR: CHAT FIJO */}
        <div className="h-[300px] bg-white border-t border-gray-200 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
          
          {/* Historial del Chat Dinámico */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
            {chatHistory.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "p-4 rounded-2xl max-w-[80%] shadow-sm",
                  msg.role === 'delfos' 
                    ? "bg-neutral-100 text-neutral-800 rounded-tl-none self-start" // Estilo IA
                    : "bg-black text-white rounded-tr-none self-end" // Estilo Usuario
                )}
              >
                {msg.text}
              </div>
            ))}

            {/* Este div es la referencia para hacer scroll al final */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Control */}
          <div className="p-6 bg-white">
            <div className="flex items-center bg-neutral-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:ring-2 focus-within:ring-[#ff66c4] focus-within:border-transparent transition-all shadow-inner">
              <input 
                type="text" 
                placeholder="Escríbele a Delfos..." 
                className="flex-1 bg-transparent outline-none text-lg p-2"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // ¡Enviar con Enter!
              />
              <button 
                onClick={handleSendMessage}
                className="p-3 text-white bg-black rounded-xl hover:bg-neutral-800 transition-transform active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

export default App;