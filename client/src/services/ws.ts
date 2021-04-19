async function createConnection() {
  const ws = (await import('@adonisjs/websocket-client')).default(
    `ws://localhost:3333`
  );
  return ws;
}

export default createConnection;
