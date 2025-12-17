import initSqlJs from 'sql.js';
import { ChatMessage } from '../types';

let db: any = null;
const DB_KEY = 'nomad_nantes_db_store_v1';

// Initialize the database
export const initDB = async (): Promise<void> => {
  if (db) return;

  const SQL = await initSqlJs({
    // Using cloudflare cdn for the wasm file matching version 1.8.0
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  const savedData = localStorage.getItem(DB_KEY);
  
  if (savedData) {
    try {
      const u8 = new Uint8Array(JSON.parse(savedData));
      db = new SQL.Database(u8);
    } catch (e) {
      console.error("Failed to load saved DB, creating new one", e);
      db = new SQL.Database();
      seedDB();
    }
  } else {
    db = new SQL.Database();
    seedDB();
  }
  
  saveDB(); // Ensure initial state is saved
};

const seedDB = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      sender TEXT,
      text TEXT,
      timestamp TEXT,
      isMe INTEGER,
      status TEXT
    );
  `);

  // Seed with initial mock data
  const stmt = db.prepare("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?)");
  const initialMessages = [
    ['1', 'chat_1', 'Lucia', 'Je suis partante !', '21:24', 0, 'read'],
    ['2', 'chat_1', 'Yassine', 'Parfait, à tout de suite 😉', '21:25', 0, 'read'],
    ['3', 'chat_1', 'Moi', "Je vais avoir 20/30 min de retard désolé", '21:26', 1, 'read'],
    ['4', 'chat_1', 'Yassine', 'Pas de souci', '22:11', 0, 'read']
  ];
  
  initialMessages.forEach(msg => stmt.run(msg));
  stmt.free();
};

export const saveDB = () => {
  if (!db) return;
  const data = db.export();
  // Convert Uint8Array to regular array for JSON storage
  const arr = Array.from(data);
  localStorage.setItem(DB_KEY, JSON.stringify(arr));
};

export const getMessages = (chatId: string): ChatMessage[] => {
  if (!db) return [];
  
  const stmt = db.prepare("SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC"); // Simple ordering, ideally use real date objects
  stmt.bind([chatId]);
  
  const messages: ChatMessage[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    messages.push({
      id: row.id as string,
      sender: row.sender as string,
      text: row.text as string,
      timestamp: row.timestamp as string,
      isMe: Boolean(row.isMe),
      status: row.status as 'read' | 'sent' | undefined
    });
  }
  stmt.free();
  return messages;
};

export const addMessage = (chatId: string, message: ChatMessage) => {
  if (!db) return;
  
  db.run("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?)", [
    message.id,
    chatId,
    message.sender,
    message.text,
    message.timestamp,
    message.isMe ? 1 : 0,
    message.status || 'sent'
  ]);
  
  saveDB();
};