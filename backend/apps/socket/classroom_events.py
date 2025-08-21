import asyncio
import json
from typing import Dict, Set
from datetime import datetime

class ClassroomEventManager:
    def __init__(self):
        self.classroom_connections: Dict[str, Set[str]] = {}
        self.user_classrooms: Dict[str, str] = {}
    
    async def join_classroom(self, sid: str, classroom_id: str):
        if classroom_id not in self.classroom_connections:
            self.classroom_connections[classroom_id] = set()
        
        self.classroom_connections[classroom_id].add(sid)
        self.user_classrooms[sid] = classroom_id
        
        return {"status": "joined", "classroom_id": classroom_id}
    
    async def leave_classroom(self, sid: str):
        if sid in self.user_classrooms:
            classroom_id = self.user_classrooms[sid]
            if classroom_id in self.classroom_connections:
                self.classroom_connections[classroom_id].discard(sid)
                if not self.classroom_connections[classroom_id]:
                    del self.classroom_connections[classroom_id]
            del self.user_classrooms[sid]
    
    async def broadcast_donation(self, classroom_id: str, donation_data: dict):
        if classroom_id in self.classroom_connections:
            return {
                "event": "donation-received",
                "room": classroom_id,
                "data": {
                    "classroomId": classroom_id,
                    "donorName": donation_data.get("donor_name", "Anonymous"),
                    "amount": donation_data.get("amount", 0),
                    "message": donation_data.get("message", ""),
                    "itemsFunded": donation_data.get("items_funded", []),
                    "timestamp": datetime.now().isoformat()
                }
            }
        return None
    
    async def broadcast_item_update(self, classroom_id: str, item_id: str, new_state: str, funded_by: str = None):
        if classroom_id in self.classroom_connections:
            return {
                "event": "classroom-update",
                "room": classroom_id,
                "data": {
                    "classroomId": classroom_id,
                    "itemId": item_id,
                    "newState": new_state,
                    "fundedBy": funded_by,
                    "timestamp": datetime.now().isoformat()
                }
            }
        return None
    
    def get_classroom_users(self, classroom_id: str) -> Set[str]:
        return self.classroom_connections.get(classroom_id, set())
    
    def get_user_classroom(self, sid: str) -> str:
        return self.user_classrooms.get(sid)

classroom_manager = ClassroomEventManager()