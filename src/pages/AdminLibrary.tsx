import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLibrary } from '@/hooks/useLibrary';
import { Music, Play, Trash2, Upload, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AdminLibrary() {
  const { tracks, isLoading, deleteTrack, playTrack, uploadFiles, isUploading } = useLibrary();
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(search.toLowerCase()) ||
    track.artist.toLowerCase().includes(search.toLowerCase()) ||
    track.album.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gold-neon">Biblioteca</h2>
          <p className="text-kiosk-text/90">Gerencie suas faixas de áudio</p>
        </div>

        {/* Upload Area */}
        <Card
          className={cn(
            "border-2 border-dashed transition-colors card-admin-extreme-3d",
            isDragging && "border-primary bg-primary/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-10 h-10 icon-neon-blue animate-spin mb-4" />
                  <p className="text-sm text-kiosk-text/90">Enviando arquivos...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 icon-neon-blue mb-4" />
                  <p className="text-sm font-medium mb-1">
                    Arraste arquivos MP3 aqui ou
                  </p>
                  <Button
                    variant="kiosk-outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Selecionar arquivos
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.flac,audio/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Library Table */}
        <Card className="card-admin-extreme-3d">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gold-neon">Faixas ({tracks.length})</CardTitle>
                <CardDescription className="text-kiosk-text/90">Lista de todas as músicas disponíveis</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin icon-neon-blue" />
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Music className="w-12 h-12 icon-neon-blue mb-4" />
                <p className="text-kiosk-text/90">
                  {search ? 'Nenhuma faixa encontrada' : 'Biblioteca vazia'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Artista</TableHead>
                    <TableHead>Álbum</TableHead>
                    <TableHead className="text-right">Duração</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-medium">{track.title}</TableCell>
                      <TableCell>{track.artist}</TableCell>
                      <TableCell>{track.album}</TableCell>
                      <TableCell className="text-right">{formatDuration(track.duration)}</TableCell>
                      <TableCell className="text-right">{track.plays}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => playTrack(track.id)}
                            className="h-8 w-8"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTrack(track.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
