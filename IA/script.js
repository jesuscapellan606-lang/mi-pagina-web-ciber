const chatBox = document.getElementById('chatBox');

// Historial de conversación — persiste entre mensajes
let conversationHistory = [];

document.getElementById('userInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendMessage();
});

function appendMsg(text, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChat() {
  if (!confirm("¿Borrar todo el chat? Se perderá el historial de esta sesión.")) return;
  chatBox.innerHTML = '';
  conversationHistory = [];
  appendMsg("Chat borrado. ¿En qué área de ciberseguridad quieres profundizar?", 'bot');
}

function newChat() {
  if (!confirm("¿Iniciar un chat nuevo? Se perderá la conversación actual.")) return;
  chatBox.innerHTML = '';
  conversationHistory = [];
  appendMsg("¡Nueva sesión iniciada! Soy CyberGuard. ¿En qué puedo ayudarte hoy?", 'bot');
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const userText = input.value.trim();
  if (!userText) return;

  appendMsg(userText, 'user');
  input.value = '';
  appendMsg("Analizando riesgos digitales...", 'bot');

  conversationHistory.push({ role: "user", content: userText });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres CyberGuard, un experto en ciberseguridad con memoria de la conversación actual.
Reglas:
- Responde SIEMPRE de forma directa y concisa a la pregunta del usuario.
- Si el usuario hace referencia a algo mencionado antes en la conversación (una imagen analizada, un tema discutido), usa ese contexto para responder.
- Solo haz preguntas de diagnóstico si el usuario dice explícitamente que no sabe nada de ciberseguridad.
- Recomienda TryHackMe para práctica y VirusTotal para análisis de archivos cuando sea relevante.
- Usa lenguaje técnico pero accesible en español.`
          },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    chatBox.lastChild.innerText = botReply;
    conversationHistory.push({ role: "assistant", content: botReply });

  } catch (error) {
    chatBox.lastChild.innerText = "Error al conectar con la IA.";
    console.error(error);
  }
}

async function handleImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  appendMsg(`Analizando imagen: ${file.name}...`, 'bot');

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result.split(',')[1];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${file.type};base64,${base64}` }
                },
                {
                  type: "text",
                  text: "Analiza esta imagen desde una perspectiva de ciberseguridad. ¿Hay señales de phishing, malware, ingeniería social o contenido sospechoso? ¿Parece generada por IA? Sé específico y detallado."
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      chatBox.lastChild.innerText = botReply;
      conversationHistory.push({
        role: "assistant",
        content: `[Analicé una imagen llamada "${file.name}"] ${botReply}`
      });

    } catch (error) {
      chatBox.lastChild.innerText = "Error al analizar la imagen.";
      console.error(error);
    }
  };

  reader.readAsDataURL(file);
}

function startTest() {
  const question = "Iniciando diagnóstico de seguridad. ¿Usas la misma contraseña para múltiples cuentas?";
  appendMsg(question, 'bot');
  conversationHistory.push({ role: "assistant", content: question });
}