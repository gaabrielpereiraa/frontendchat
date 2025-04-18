'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chatserver');

export default function Chat() {
  const searchParams = useSearchParams();
  const usuarioId = searchParams.get('usuarioId') || '';

  const [chats, setChats] = useState<any[]>([]);
  const [chatSelecionado, setChatSelecionado] = useState<any>(null);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    if (!usuarioId) return;

    fetch(`http://localhost:3000/chat/usuario/${usuarioId}`)
      .then((res) => res.json())
      .then((data) => {setChats(data); console.log(data)});

      fetch(`http://localhost:3000/usuario/${usuarioId}`)
      .then((res) => res.json())
        .then((data) => {
            if (data?.nome) {
                setNomeUsuario(data.nome);
            }
        }) 
  }, [usuarioId]);
  
    

  useEffect(() => {
    if (!chatSelecionado) return;

    socket.emit('joinChat', chatSelecionado.id.toString());
    socket.emit('getMessages', chatSelecionado.id.toString());

    socket.on('messageHistory', (msgs) => setMensagens(msgs));
    socket.on('newMessage', (msg) => setMensagens((prev) => [...prev, msg]));

    return () => {
      socket.off('messageHistory');
      socket.off('newMessage');
    };
  }, [chatSelecionado]);

  const enviarMensagem = () => {
    if (!mensagem.trim() || !chatSelecionado) return;
    socket.emit('sendMessage', {
      chatId: chatSelecionado.id,
      autorId: usuarioId,
      conteudo: mensagem,
    });
    setMensagem('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar de chats */}
      <div style={{ width: 300, borderRight: '1px solid #ccc', padding: 20 }}>
        <h2>Usuário {nomeUsuario}</h2>
        <h3>Seus Chats</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => setChatSelecionado(chat)}
                style={{
                  background: chatSelecionado?.id === chat.id ? 'green' : 'red',
                  border: '1px solid #ccc',
                  marginBottom: 5,
                  width: '100%',
                  textAlign: 'left',
                  padding: 10,
                }}
              >
                {chat.paciente?.usuario?.nome || 'Paciente'} x {chat.medico?.usuario?.nome || 'Médico'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Área de chat */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
        {chatSelecionado ? (
          <>
            <h3>Chat ID #{chatSelecionado.id}</h3>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                border: '1px solid #ccc',
                padding: 10,
                marginBottom: 10,
              }}
            >
              {mensagens.map((msg, index) => (
                <div key={index} style={{ marginBottom: 5 }}>
                  <strong>{msg.autor?.nome || 'Usuário'}:</strong> {msg.conteudo}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                style={{ flex: 1, marginRight: 10 }}
              />
              <button onClick={enviarMensagem}>Enviar</button>
            </div>
          </>
        ) : (
          <p>Selecione um chat à esquerda.</p>
        )}
      </div>
    </div>
  );
}
