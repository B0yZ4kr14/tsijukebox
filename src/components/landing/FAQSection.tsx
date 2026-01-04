import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle, Music, Monitor, Globe, Shield, Cloud, Mic2, Smartphone, Settings } from "lucide-react";

const faqs = [
  {
    icon: Music,
    question: "O que é o TSiJUKEBOX?",
    answer: "O TSiJUKEBOX é um sistema de jukebox musical profissional projetado para estabelecimentos comerciais. Ele integra múltiplos provedores de música (Spotify, YouTube Music, arquivos locais), oferece modo kiosk dedicado, suporte completo a acessibilidade WCAG 2.1 AA, e interface moderna com temas neon personalizáveis.",
    category: "geral"
  },
  {
    icon: Monitor,
    question: "Quais provedores de música são suportados?",
    answer: "Atualmente suportamos Spotify (via Spotify Connect API), YouTube Music, e reprodução de arquivos locais (MP3, FLAC, WAV, OGG). A arquitetura modular permite adicionar novos provedores no futuro. Cada provedor tem configurações específicas de qualidade e buffer.",
    category: "recursos"
  },
  {
    icon: Settings,
    question: "Como funciona o modo Kiosk?",
    answer: "O modo Kiosk transforma qualquer tela em um terminal de música dedicado. Inclui tela de bloqueio com PIN, interface simplificada para clientes, controles de volume limitados, prevenção de navegação externa, e reinício automático em caso de falhas. Ideal para bares, restaurantes e lojas.",
    category: "recursos"
  },
  {
    icon: Shield,
    question: "O TSiJUKEBOX é acessível?",
    answer: "Sim! Seguimos rigorosamente as diretrizes WCAG 2.1 nível AA. Isso inclui navegação completa por teclado, suporte a leitores de tela (ARIA), contraste de cores adequado, textos redimensionáveis, e skip links para navegação rápida. Rodamos testes de acessibilidade automatizados com axe-core.",
    category: "acessibilidade"
  },
  {
    icon: Cloud,
    question: "Como fazer backup na nuvem?",
    answer: "Utilizamos o Storj DCS para backups criptografados na nuvem. Você pode configurar backups automáticos diários ou semanais de suas playlists, configurações e histórico de reprodução. A restauração é simples e pode ser feita a qualquer momento através das configurações.",
    category: "recursos"
  },
  {
    icon: Globe,
    question: "Quais idiomas são suportados?",
    answer: "O TSiJUKEBOX suporta Português (Brasil), English (US), e Español (ES). O sistema detecta automaticamente o idioma do navegador, mas você pode alterar manualmente nas configurações. Contribuições para novos idiomas são bem-vindas via GitHub.",
    category: "internacionalização"
  },
  {
    icon: Smartphone,
    question: "Preciso de internet para usar?",
    answer: "Depende do modo de uso. Para arquivos locais, o sistema funciona 100% offline. Para Spotify e YouTube Music, é necessária conexão com internet. O modo PWA permite instalação como app nativo e funcionalidade offline limitada com cache de metadados.",
    category: "técnico"
  },
  {
    icon: Mic2,
    question: "Como funciona o modo Karaoke?",
    answer: "O modo Karaoke exibe letras sincronizadas em tela cheia durante a reprodução. Suporta arquivos LRC para sincronização precisa, ou exibe letras estáticas quando disponíveis. Você pode ajustar o tamanho da fonte, cores, e efeito de rolagem para melhor visualização.",
    category: "recursos"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FAQSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Perguntas Frequentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">FAQ</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Respostas para as dúvidas mais comuns sobre o TSiJUKEBOX
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 overflow-hidden data-[state=open]:border-primary/50 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline py-4 gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <faq.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground leading-relaxed pl-14">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
