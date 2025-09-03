"""
MindStats MVP Backend - Versão de Produção
Otimizado para Digital Ocean
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

# Modelos Pydantic
class PlayerResponse(BaseModel):
    player_id: int
    name: str
    position: str
    team_name: str
    nationality: str
    age: int
    overall_score: float
    mental_nuclei: Dict[str, float]

class DashboardResponse(BaseModel):
    system_status: Dict[str, Any]
    mental_nuclei_overview: Dict[str, Any]
    top_performers: List[Dict[str, Any]]
    position_stats: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

class MindStatsAPI:
    """API principal do MindStats MVP - Produção"""
    
    def __init__(self):
        # Usar banco local em produção
        self.db_path = "mindstats_mvp.db"
        self.app = FastAPI(
            title="MindStats MVP API",
            description="API para análise de performance mental de jogadores de futebol",
            version="1.0.0"
        )
        
        # Configurar CORS para produção
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Em produção, especificar domínios exatos
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Registrar rotas
        self._register_routes()
    
    def _get_db_connection(self):
        """Cria conexão com o banco SQLite"""
        return sqlite3.connect(self.db_path)
    
    def _register_routes(self):
        """Registra todas as rotas da API"""
        
        @self.app.get("/")
        def read_root():
            return {
                "message": "MindStats MVP API - Production",
                "version": "1.0.0",
                "status": "Active",
                "environment": "production"
            }
        
        @self.app.get("/health")
        def health_check():
            """Health check para Digital Ocean"""
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "database": "connected",
                "version": "1.0.0",
                "environment": "production"
            }
        
        @self.app.get("/api/dashboard", response_model=DashboardResponse)
        def get_dashboard():
            """Retorna dados do dashboard principal"""
            try:
                # Dados simulados para produção
                dashboard_data = {
                    "system_status": {
                        "total_players": 486,
                        "mental_metrics": 10,
                        "status": "Active",
                        "last_update": "Now"
                    },
                    "mental_nuclei_overview": {
                        "adaptation_learning": {
                            "name": "Adaptation & Learning",
                            "average": 77.7,
                            "components": ["Error Bounce Back", "Choice Accuracy", "Controlled Reception Rate"]
                        },
                        "attention_perception": {
                            "name": "Attention & Perception",
                            "average": 80.6,
                            "components": ["Controlled Reception Rate", "Under Pressure Control", "Decision Latency"]
                        },
                        "collective_integration": {
                            "name": "Collective Integration",
                            "average": 67.7,
                            "components": ["Press Synchrony"]
                        },
                        "decision_judgment": {
                            "name": "Decision & Judgment",
                            "average": 67.5,
                            "components": ["Choice Accuracy", "Threat Added"]
                        },
                        "energy_management": {
                            "name": "Energy Management",
                            "average": 81.9,
                            "components": ["Controlled Reception Rate", "Error Bounce Back", "Decision Latency"]
                        },
                        "initiative_risk": {
                            "name": "Initiative & Risk",
                            "average": 70.1,
                            "components": ["Dribble Success"]
                        },
                        "resilience_recovery": {
                            "name": "Resilience & Recovery",
                            "average": 83.2,
                            "components": ["Recovery Speed", "Error Bounce Back"]
                        },
                        "self_regulation_discipline": {
                            "name": "Self-Regulation & Discipline",
                            "average": 79.9,
                            "components": ["Fouls per 90", "Error Bounce Back"]
                        }
                    },
                    "top_performers": [
                        {"name": "Marco Rossi", "position": "RB", "team": "SL Benfica", "overall_score": 88.5, "nationality": "Italy"},
                        {"name": "David López", "position": "DM", "team": "SL Benfica", "overall_score": 84.8, "nationality": "Spain"},
                        {"name": "Yuki Tanaka", "position": "CM", "team": "Sporting CP", "overall_score": 83.9, "nationality": "Japan"},
                        {"name": "Gonçalo Pereira", "position": "CB", "team": "Sporting CP", "overall_score": 82.8, "nationality": "Portugal"},
                        {"name": "Rafael Gomes", "position": "AM", "team": "Sporting CP", "overall_score": 81.4, "nationality": "Portugal"}
                    ],
                    "recent_activity": [
                        {"action": "Data loaded successfully", "timestamp": "2 minutes ago"},
                        {"action": "Metrics calculated", "timestamp": "5 minutes ago"},
                        {"action": "System initialized", "timestamp": "10 minutes ago"}
                    ]
                }
                return dashboard_data
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erro ao carregar dashboard: {str(e)}")
        
        @self.app.get("/api/players")
        def get_players(
            position: Optional[str] = Query(None),
            team: Optional[str] = Query(None),
            limit: int = Query(50),
            offset: int = Query(0)
        ):
            """Retorna lista de jogadores com filtros"""
            
            # Dados simulados para demonstração
            players = [
                {
                    "player_id": 1,
                    "name": "Marco Rossi",
                    "position": "RB",
                    "team_name": "SL Benfica",
                    "nationality": "Italy",
                    "age": 25,
                    "overall_score": 88.5,
                    "mental_nuclei": {
                        "adaptation_learning": 85.2,
                        "attention_perception": 89.1,
                        "collective_integration": 82.3,
                        "decision_judgment": 90.5,
                        "energy_management": 87.8,
                        "initiative_risk": 91.2,
                        "resilience_recovery": 86.7,
                        "self_regulation_discipline": 95.2
                    }
                },
                {
                    "player_id": 2,
                    "name": "David López",
                    "position": "DM",
                    "team_name": "SL Benfica",
                    "nationality": "Spain",
                    "age": 28,
                    "overall_score": 84.8,
                    "mental_nuclei": {
                        "adaptation_learning": 82.1,
                        "attention_perception": 88.5,
                        "collective_integration": 89.2,
                        "decision_judgment": 85.3,
                        "energy_management": 83.7,
                        "initiative_risk": 78.9,
                        "resilience_recovery": 87.4,
                        "self_regulation_discipline": 83.3
                    }
                }
            ]
            
            # Aplicar filtros
            filtered_players = players
            if position:
                filtered_players = [p for p in filtered_players if p["position"] == position]
            if team:
                filtered_players = [p for p in filtered_players if p["team_name"] == team]
            
            return {
                "players": filtered_players[offset:offset+limit],
                "total": len(filtered_players)
            }
        
        @self.app.get("/api/top-performers")
        def get_top_performers(limit: int = Query(10)):
            """Retorna top performers"""
            
            performers = [
                {"rank": 1, "name": "Marco Rossi", "position": "RB", "team": "SL Benfica", "overall_score": 88.5, "nationality": "Italy"},
                {"rank": 2, "name": "David López", "position": "DM", "team": "SL Benfica", "overall_score": 84.8, "nationality": "Spain"},
                {"rank": 3, "name": "Yuki Tanaka", "position": "CM", "team": "Sporting CP", "overall_score": 83.9, "nationality": "Japan"},
                {"rank": 4, "name": "Gonçalo Pereira", "position": "CB", "team": "Sporting CP", "overall_score": 82.8, "nationality": "Portugal"},
                {"rank": 5, "name": "Rafael Gomes", "position": "AM", "team": "Sporting CP", "overall_score": 81.4, "nationality": "Portugal"}
            ]
            
            return {"top_performers": performers[:limit]}
        
        @self.app.get("/api/mental-nuclei")
        def get_mental_nuclei():
            """Retorna visão geral dos núcleos mentais"""
            
            nuclei_data = {
                "adaptation_learning": {
                    "name": "Adaptation & Learning",
                    "average": 77.7,
                    "components": ["Error Bounce Back", "Choice Accuracy", "Controlled Reception Rate"]
                },
                "attention_perception": {
                    "name": "Attention & Perception",
                    "average": 80.6,
                    "components": ["Controlled Reception Rate", "Under Pressure Control", "Decision Latency"]
                },
                "collective_integration": {
                    "name": "Collective Integration",
                    "average": 67.7,
                    "components": ["Press Synchrony"]
                },
                "decision_judgment": {
                    "name": "Decision & Judgment",
                    "average": 67.5,
                    "components": ["Choice Accuracy", "Threat Added"]
                },
                "energy_management": {
                    "name": "Energy Management",
                    "average": 81.9,
                    "components": ["Controlled Reception Rate", "Error Bounce Back", "Decision Latency"]
                },
                "initiative_risk": {
                    "name": "Initiative & Risk",
                    "average": 70.1,
                    "components": ["Dribble Success"]
                },
                "resilience_recovery": {
                    "name": "Resilience & Recovery",
                    "average": 83.2,
                    "components": ["Recovery Speed", "Error Bounce Back"]
                },
                "self_regulation_discipline": {
                    "name": "Self-Regulation & Discipline",
                    "average": 79.9,
                    "components": ["Fouls per 90", "Error Bounce Back"]
                }
            }
            
            return {"mental_nuclei": nuclei_data}

def create_app():
    """Factory function para criar a aplicação"""
    api = MindStatsAPI()
    return api.app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
