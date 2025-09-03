import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Medal, Award, Star, Search, Filter } from 'lucide-react';
import apiService from '../services/api';
import '../App.css';

const TopPerformers = () => {
  const [performers, setPerformers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    position: 'All Positions',
    limit: 20,
    season: '2023/2024'
  });

  // Carregar posições disponíveis
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const positionsData = await apiService.getPositions();
        setPositions(positionsData.positions || []);
      } catch (error) {
        console.error('Erro ao carregar posições:', error);
      }
    };

    loadPositions();
  }, []);

  // Carregar top performers
  useEffect(() => {
    const loadTopPerformers = async () => {
      try {
        setLoading(true);
        const performersData = await apiService.getTopPerformers(
          filters.position !== 'All Positions' ? filters.position : null,
          filters.limit,
          filters.season
        );

        setPerformers(performersData.top_performers || []);
      } catch (error) {
        console.error('Erro ao carregar top performers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopPerformers();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Filtrar performers por termo de busca
  const filteredPerformers = performers.filter(performer =>
    performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600 font-bold";
    if (score >= 75) return "text-blue-600 font-semibold";
    if (score >= 65) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Top Performers</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking dos melhores jogadores por performance mental
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Player</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Player or team name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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

            {/* Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit">Show Top</Label>
              <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Season */}
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select value={filters.season} onValueChange={(value) => handleFilterChange('season', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2022/2023">2022/2023</SelectItem>
                  <SelectItem value="2021/2022">2021/2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPerformers.length} of {performers.length} players
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading performers...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPerformers.map((performer) => (
                <div
                  key={`${performer.rank}-${performer.name}`}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                    performer.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center space-x-2">
                      {getRankIcon(performer.rank)}
                      <Badge variant={getRankBadgeVariant(performer.rank)} className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                        {performer.rank}
                      </Badge>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-semibold text-lg">{performer.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {performer.position}
                            </Badge>
                            <span>•</span>
                            <span>{performer.team}</span>
                            <span>•</span>
                            <span>{performer.nationality}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(performer.overall_score)}`}>
                      {performer.overall_score}%
                    </div>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                </div>
              ))}

              {filteredPerformers.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No performers found matching your criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            {performers.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {performers[0]?.overall_score}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {performers[0]?.name} ({performers[0]?.position})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            {performers.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(performers.reduce((sum, p) => sum + p.overall_score, 0) / performers.length).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Top {performers.length} players
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Best Position</CardTitle>
          </CardHeader>
          <CardContent>
            {performers.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {performers[0]?.position}
                </div>
                <p className="text-sm text-muted-foreground">
                  Leading position
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopPerformers;

