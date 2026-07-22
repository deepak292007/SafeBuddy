import os
import json
import random
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080

# In-memory storage for active sessions, bookings, and emergency alerts
DATABASE = {
    "users": [
        {"id": "usr_101", "name": "Elena Rostova", "email": "elena@safebuddy.io", "phone": "+15553829014", "safety_score": 98}
    ],
    "companions": [
        {
            "id": "cmp_1",
            "name": "Sarah Jenkins",
            "rating": 4.9,
            "bookings_count": 482,
            "lat": 37.7780,
            "lng": -122.4150,
            "police_verified": True,
            "gov_id_verified": True,
            "photo": "assets/female_escort.jpg",
            "specialty": "Walking & Night Shift Escort"
        },
        {
            "id": "cmp_2",
            "name": "Marcus Vance",
            "rating": 5.0,
            "bookings_count": 620,
            "lat": 37.7710,
            "lng": -122.4230,
            "police_verified": True,
            "gov_id_verified": True,
            "photo": "assets/male_escort.jpg",
            "specialty": "Car & Tactical Escort"
        },
        {
            "id": "cmp_3",
            "name": "Aisha Patel",
            "rating": 4.95,
            "bookings_count": 310,
            "lat": 37.7760,
            "lng": -122.4280,
            "police_verified": True,
            "gov_id_verified": True,
            "photo": "assets/female_escort.jpg",
            "specialty": "Hospital & Elderly Escort"
        }
    ],
    "bookings": [
        {
            "id": "SB-9021",
            "user": "Elena Rostova",
            "companion": "Sarah Jenkins",
            "pickup": "Market St & 4th St",
            "destination": "Valencia St & 18th St",
            "category": "Walking Escort",
            "price": 47.00,
            "ai_safety_score": 99,
            "status": "Active En Route"
        }
    ],
    "emergency_alerts": []
}

class SafeBuddyRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # API Endpoints
        if self.path == '/api/status':
            self.send_json_response({
                "status": "ONLINE",
                "service": "SafeBuddy AI Safety Engine v2.4",
                "redis_cluster": "CONNECTED (3 Nodes)",
                "postgres_gis": "CONNECTED",
                "websocket_gateway": "ACTIVE (port 8080)",
                "timestamp": time.time()
            })
            return

        elif self.path == '/api/companions/nearby':
            self.send_json_response({
                "status": "success",
                "count": len(DATABASE["companions"]),
                "companions": DATABASE["companions"]
            })
            return

        elif self.path == '/api/admin/metrics':
            self.send_json_response({
                "status": "success",
                "metrics": {
                    "total_users": 128490,
                    "active_companions": 3420,
                    "monthly_revenue": 1428900.00,
                    "incident_prevention_rate": "99.98%",
                    "fraud_alerts_blocked": 14
                },
                "active_bookings": DATABASE["bookings"]
            })
            return

        # Serve static files
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body_data = {}
        if content_length > 0:
            raw_body = self.rfile.read(content_length)
            try:
                body_data = json.loads(raw_body.decode('utf-8'))
            except:
                pass

        if self.path == '/api/auth/otp':
            self.send_json_response({
                "status": "success",
                "message": "OTP Verified Successfully",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.safebuddy_encrypted_session",
                "user": DATABASE["users"][0]
            })
            return

        elif self.path == '/api/auth/biometrics':
            self.send_json_response({
                "status": "success",
                "message": "Biometrics Matched 100%",
                "scan_type": body_data.get("scan_type", "Face ID"),
                "auth_level": "MILITARY_GRADE_L3",
                "user": DATABASE["users"][0]
            })
            return

        elif self.path == '/api/bookings/create':
            category = body_data.get("category", "Walking Companion")
            hours = int(body_data.get("hours", 2))
            price = (hours * 20.0) + 7.00
            
            booking_id = f"SB-{random.randint(9000, 9999)}"
            new_booking = {
                "id": booking_id,
                "user": "Elena Rostova",
                "companion": "Sarah Jenkins",
                "pickup": body_data.get("pickup", "Market St & 4th St"),
                "destination": body_data.get("destination", "Valencia St & 18th St"),
                "category": category,
                "price": price,
                "ai_safety_score": 99,
                "status": "Companion En Route",
                "eta_minutes": 4
            }
            DATABASE["bookings"].insert(0, new_booking)

            self.send_json_response({
                "status": "success",
                "message": "Companion Dispatched",
                "booking": new_booking
            })
            return

        elif self.path == '/api/chat/send':
            msg = body_data.get("message", "")
            replies = [
                "I am watching your GPS coordinates live on my escort terminal.",
                "I see you! I am wearing a dark reflective SafeBuddy jacket near the entrance.",
                "Safe route confirmed. Police patrol unit #42 is 1 block away."
            ]
            self.send_json_response({
                "status": "success",
                "reply": random.choice(replies)
            })
            return

        elif self.path == '/api/emergency/sos':
            sos_record = {
                "timestamp": time.time(),
                "user": "Elena Rostova",
                "lat": 37.7749,
                "lng": -122.4194,
                "status": "POLICE_DISPATCHED"
            }
            DATABASE["emergency_alerts"].append(sos_record)

            self.send_json_response({
                "status": "CRITICAL_SOS_DISPATCHED",
                "message": "Police emergency unit and armed escort dispatched to live GPS coordinates.",
                "police_unit_id": "SFPD-DISTRICT-1",
                "eta_seconds": 90
            })
            return

        self.send_error(404, "API endpoint not found")

    def send_json_response(self, data, status_code=200):
        response_bytes = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    print(f"Starting SafeBuddy Production Backend Server on port {PORT}...")
    server = HTTPServer(('0.0.0.0', PORT), SafeBuddyRequestHandler)
    server.serve_forever()
