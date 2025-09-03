import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import apiService from '../services/api';
import '../App.css';

const MentalNucleiOverview = () => {
  const [mentalNuclei, setMentalNuclei] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('2023/2024');

  // Carregar dados dos núcleos mentais
  useEffect(() => {
    const loadMentalNuclei = async () => {
      try {
        setLoading(true);
        const nucleiData = await apiService.getMentalNuclei(selectedSeason);
        setMentalNuclei(nucleiData.mental_nuclei);
      } catch (error) {
        console.error('Erro ao carregar núcleos mentais:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMentalNuclei();
  }, [selectedSeason]);

  // Preparar dados para gráficos
  const prepareBarChartData = () => {
    if (!mentalNuclei) return [];

    return Object.entries(mentalNuclei).map(([key, nucleus]) => ({
      name: nucleus.name.replace(' & ', ' &\n'),
      value: nucleus.average,
      fullName: nucleus.name
    }));
  };

  const prepareRadarChartData = () => {
    if (!mentalNuclei) return [];

    return Object.entries(mentalNuclei).map(([key, nucleus]) => ({
      subject: nucleus.name.split(' ')[0], // Primeira palavra para economizar espaço
      A: nucleus.average,
      fullName: nucleus.name
    }));
  };

  const getTrendIcon = (value) => {
    if (value >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value >= 70) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Mental Performance Nuclei Overview</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Análise detalhada dos 8 núcleos mentais dos jogadores
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="season">Season:</Label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023/2024">2023/24</SelectItem>
                  <SelectItem value="2022/2023">2022/23</SelectItem>
                  <SelectItem value="2021/2022">2021/22</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading mental nuclei data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cards dos Núcleos Mentais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentalNuclei && Object.entries(mentalNuclei).map(([key, nucleus]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium leading-tight">
                      {nucleus.name}
                    </CardTitle>
                    {getTrendIcon(nucleus.average)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={`text-2xl font-bold ${getScoreColor(nucleus.average)}`}>
                      {nucleus.average}%
                    </div>
                    
                    <Progress 
                      value={nucleus.average} 
                      className="h-2"
                    />
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Composed of:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {nucleus.components.map((component, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Mental Nuclei Performance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comparação dos 8 núcleos mentais
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}%`,
                          props.payload.fullName
                        ]}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Mental Profile Radar</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Perfil mental geral dos jogadores
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={prepareRadarChartData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 8 }}
                      />
                      <Radar
                        name="Average"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}%`,
                          props.payload.fullName
                        ]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análise Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Detailed Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mentalNuclei && (
                <div className="space-y-6">
                  {/* Melhores e Piores Núcleos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3">Strongest Nuclei</h4>
                      <div className="space-y-2">
                        {Object.entries(mentalNuclei)
                          .sort(([,a], [,b]) => b.average - a.average)
                          .slice(0, 3)
                          .map(([key, nucleus], index) => (
                            <div key={key} className="flex items-center justify-between p-2 rounded bg-green-50">
                              <span className="text-sm font-medium">{nucleus.name}</span>
                              <Badge variant="default" className="bg-green-500">
                                {nucleus.average}%
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-3">Areas for Improvement</h4>
                      <div className="space-y-2">
                        {Object.entries(mentalNuclei)
                          .sort(([,a], [,b]) => a.average - b.average)
                          .slice(0, 3)
                          .map(([key, nucleus], index) => (
                            <div key={key} className="flex items-center justify-between p-2 rounded bg-red-50">
                              <span className="text-sm font-medium">{nucleus.name}</span>
                              <Badge variant="destructive">
                                {nucleus.average}%
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Key Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 rounded bg-blue-50">
                        <p className="font-medium text-blue-800">Overall Average</p>
                        <p className="text-blue-600">
                          {Object.values(mentalNuclei).reduce((sum, n) => sum + n.average, 0) / Object.keys(mentalNuclei).length}%
                        </p>
                      </div>
                      <div className="p-3 rounded bg-purple-50">
                        <p className="font-medium text-purple-800">Performance Range</p>
                        <p className="text-purple-600">
                          {Math.max(...Object.values(mentalNuclei).map(n => n.average)) - 
                           Math.min(...Object.values(mentalNuclei).map(n => n.average))}% spread
                        </p>
                      </div>
                      <div className="p-3 rounded bg-orange-50">
                        <p className="font-medium text-orange-800">Season</p>
                        <p className="text-orange-600">{selectedSeason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MentalNucleiOverview;

