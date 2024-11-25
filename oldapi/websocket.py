import asyncio
import websockets
import aioconsole
import json
from websockets.exceptions import ConnectionClosed

# ชุดของ client ที่เชื่อมต่ออยู่
connected_clients = set()

async def register(websocket):
    """เพิ่ม client ลงในชุดของ connected_clients"""
    connected_clients.add(websocket)
    print(f"Client connected. Total clients: {len(connected_clients)}")

async def unregister(websocket):
    """ลบ client ออกจากชุดของ connected_clients"""
    connected_clients.remove(websocket)
    print(f"Client disconnected. Total clients: {len(connected_clients)}")

async def handle_connection(websocket, path):
    """จัดการการเชื่อมต่อของ client แต่ละตัว"""
    await register(websocket)
    try:
        # รอจนกว่า connection จะถูกปิดจากฝั่ง client
        await websocket.wait_closed()
    finally:
        await unregister(websocket)

async def broadcast_messages():
    """รับ input จากผู้ใช้และส่งไปยังทุก client ที่เชื่อมต่ออยู่"""
    while True:
        user_input = await aioconsole.ainput("Enter message to send to TypeScript: ")
        if user_input.lower() == 'exit':
            print("Exiting server.")
            # ปิดการเชื่อมต่อกับทุก client
            for ws in connected_clients.copy():
                await ws.close()
            break
        # สร้างข้อความในรูปแบบ JSON
        message = user_input
        to_remove = set()
        for ws in connected_clients:
            try:
                await ws.send(message)
                print(f"Sent to a client: {message}")
            except ConnectionClosed:
                print("A client disconnected during send.")
                to_remove.add(ws)
        # ลบ client ที่ถูกตัดการเชื่อมต่อออกจากชุด
        connected_clients.difference_update(to_remove)

async def main():
    """เริ่ม WebSocket server และรัน broadcast_messages พร้อมกัน"""
    server = await websockets.serve(handle_connection, "localhost", 8765)
    print("WebSocket Server started on ws://localhost:8765")
    # รันทั้ง server และ broadcast_messages พร้อมกัน
    await asyncio.gather(
        server.wait_closed(),
        broadcast_messages(),
    )

if __name__ == "__main__":
    asyncio.run(main())
