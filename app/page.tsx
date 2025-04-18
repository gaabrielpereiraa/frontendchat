'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [usuarioId, setUsuarioId] = useState('');
  const router = useRouter();

  const entrar = () => {
    if (!usuarioId.trim()) return;
    router.push(`/chat?usuarioId=${usuarioId}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Escolha seu usuário</h1>
      <input
        placeholder="Digite o ID do usuário"
        value={usuarioId}
        onChange={(e) => setUsuarioId(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={entrar}>Entrar</button>
    </div>
  );
}
