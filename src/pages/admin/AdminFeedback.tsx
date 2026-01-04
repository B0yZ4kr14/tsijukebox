import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from "@/components/ui/themed";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { MessageSquare, Star, Loader2 } from 'lucide-react';

export default function AdminFeedback() {
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.getFeedback(),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gold-neon">Feedback</h2>
          <p className="text-kiosk-text/90">Visualize as avaliações dos usuários</p>
        </div>

        <Card className="card-admin-extreme-3d">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Avaliações Recebidas</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {feedbacks?.length ?? 0} feedbacks registrados
            </p>
          
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin icon-neon-blue" />
              </div>
            ) : !feedbacks || feedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="w-12 h-12 icon-neon-blue mb-4" />
                <p className="text-kiosk-text/90">Nenhum feedback recebido</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div 
                    key={feedback.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {feedback.created_at}
                      </span>
                    </div>
                    <p className="text-sm">{feedback.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
