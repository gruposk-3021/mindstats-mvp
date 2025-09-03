import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, User, TrendingUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import apiService from '../services/api';
import '../App.css';

const PlayerAnalysis = () => {
  const [leagues, setLeagues] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetail, setPlayerDetail] = useState(null);
  const [positionComparison, setPositionComparison] = useState(null);
  
  const [filters, setFilters] = useState({
    league: 'All Leagues',
    position: 'All Positions',
    team: 'All Teams',
    player: 'Select Player'
  });

  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [leaguesData, positionsData, teamsData] = await Promise.all([
          apiService.getLeagues(),
          apiService.getPositions(),
          apiService.getTeams()
        ]);

        setLeagues(leaguesData.leagues || []);
        setPositions(positionsData.positions || []);
        setTeams(teamsData.teams || []);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };

    loadInitialData();
  }, []);

  // Carregar jogadores quando filtros mudarem
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const playersData = await apiService.getPlayers({
          position: filters.position !== 'All Positions' ? filters.position : null,
          team: filters.team !== 'All Teams' ? filters.team : null,
          limit: 100
        });

        setPlayers(playersData.players || []);
        
        // Reset player selection when filters change
        setSelectedPlayer(null);
        setPlayerDetail(null);
        setPositionComparison(null);
        setFilters(prev => ({ ...prev, player: 'Select Player' }));
      } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [filters.league, filters.position, filters.team]);

  // Carregar detalhes do jogador selecionado
  useEffect(() => {
    const loadPlayerDetail = async () => {
      if (!selectedPlayer) return;

      try {
        setLoading(true);
        const [detail, comparison] = await Promise.all([
          apiService.getPlayerDetail(selectedPlayer.player_id),
          apiService.getPositionComparison(selectedPlayer.position)
        ]);

        setPlayerDetail(detail);
        setPositionComparison(comparison);
      } catch (error) {
        console.error('Erro ao carregar detalhes do jogador:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerDetail();
  }, [selectedPlayer]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handlePlayerSelect = (playerId) => {
    const player = players.find(p => p.player_id === parseInt(playerId));
    setSelectedPlayer(player);
    setFilters(prev => ({ ...prev, player: player?.name || 'Select Player' }));
  };

  // Preparar dados para o gráfico radar
  const prepareRadarData = (mentalNuclei) => {
    if (!mentalNuclei) return [];

    return [
      { subject: 'Adaptation & Learning', A: mentalNuclei.adaptation_learning, fullMark: 100 },
      { subject: 'Attention & Perception', A: mentalNuclei.attention_perception, fullMark: 100 },
      { subject: 'Collective Integration', A: mentalNuclei.collective_integration, fullMark: 100 },
      { subject: 'Decision & Judgment', A: mentalNuclei.decision_judgment, fullMark: 100 },
      { subject: 'Energy Management', A: mentalNuclei.energy_management, fullMark: 100 },
      { subject: 'Initiative & Risk', A: mentalNuclei.initiative_risk, fullMark: 100 },
      { subject: 'Resilience & Recovery', A: mentalNuclei.resilience_recovery, fullMark: 100 },
      { subject: 'Self-Regulation', A: mentalNuclei.self_regulation_discipline, fullMark: 100 }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Individual Player Analysis (Nuclei)</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a player to analyze their mental performance nuclei
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* League Filter */}
            <div className="space-y-2">
              <Label htmlFor="league">League</Label>
              <Select value={filters.league} onValueChange={(value) => handleFilterChange('league', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Leagues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Leagues">All Leagues</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league.id} value={league.name}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position Filter */}
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={filters.position} onValueChange={(value) => handleFilterChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Positions">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position.code} value={position.code}>
                      {position.code} - {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Filter */}
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select value={filters.team} onValueChange={(value) => handleFilterChange('team', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Teams">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.team_id} value={team.team_name}>
                      {team.team_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player Filter */}
            <div className="space-y-2">
              <Label htmlFor="player">Player</Label>
              <Select value={selectedPlayer?.player_id?.toString() || ''} onValueChange={handlePlayerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.player_id} value={player.player_id.toString()}>
                      {player.name} ({player.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Adjust
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Análise do Jogador */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Player Nuclei Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlayer && playerDetail ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{playerDetail.basic_info.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {playerDetail.basic_info.position} - {playerDetail.basic_info.team_name}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Overall Score: {playerDetail.mental_nuclei.overall_score}%
                  </Badge>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={prepareRadarData(playerDetail.mental_nuclei)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 8 }}
                      />
                      <Radar
                        name="Mental Nuclei"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Select a player to see nuclei radar chart
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparação por Posição */}
        <Card>
          <CardHeader>
            <CardTitle>Position Comparison</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Adjust
              </Button>
              <Badge variant="outline">Same League</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {selectedPlayer && positionComparison ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {selectedPlayer.position} Position Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comparing with {positionComparison.total_players} players
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                    <span className="font-medium">Selected Player</span>
                    <Badge variant="default">
                      {playerDetail.mental_nuclei.overall_score}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">Position Average</span>
                    <Badge variant="secondary">
                      {positionComparison.position_average.overall_score}%
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Top Players in Position:</h4>
                    <div className="space-y-2">
                      {positionComparison.players.slice(0, 5).map((player, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className={player.name === selectedPlayer.name ? 'font-bold text-primary' : ''}>
                            {index + 1}. {player.name} ({player.team})
                          </span>
                          <span className={player.name === selectedPlayer.name ? 'font-bold text-primary' : ''}>
                            {player.overall_score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Select a player to see position comparison
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Jogador */}
      {playerDetail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Player Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-3">
                <h4 className="font-semibold">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span>{playerDetail.basic_info.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nationality:</span>
                    <span>{playerDetail.basic_info.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span>{playerDetail.basic_info.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span>{playerDetail.basic_info.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preferred Foot:</span>
                    <span>{playerDetail.basic_info.preferred_foot}</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas da Temporada */}
              <div className="space-y-3">
                <h4 className="font-semibold">Season Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span>{playerDetail.season_stats.matches_played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minutes:</span>
                    <span>{playerDetail.season_stats.minutes_played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span>{playerDetail.season_stats.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assists:</span>
                    <span>{playerDetail.season_stats.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yellow Cards:</span>
                    <span>{playerDetail.season_stats.yellow_cards}</span>
                  </div>
                </div>
              </div>

              {/* Métricas Mentais */}
              <div className="space-y-3">
                <h4 className="font-semibold">Mental Nuclei Scores</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(playerDetail.mental_nuclei).map(([key, value]) => {
                    if (key === 'overall_score') return null;
                    const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between">
                        <span>{displayName}:</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerAnalysis;

