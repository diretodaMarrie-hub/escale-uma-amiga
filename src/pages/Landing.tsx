import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Copy, Share2, Check, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const formSchema = z.object({
  participant_name: z.string().min(2, 'Nome é obrigatório'),
  participant_email: z.string().email('E-mail inválido'),
  participant_phone: z.string().min(10, 'WhatsApp é obrigatório'),
  participant_city: z.string().min(2, 'Cidade é obrigatória'),
  participant_state: z.string().length(2, 'Use a sigla do estado (Ex: SP)'),
  friend_name: z.string().min(2, 'Nome da amiga é obrigatório'),
  friend_phone: z.string().min(10, 'WhatsApp da amiga é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

export default function Landing() {
  const [step, setStep] = useState<'initial' | 'form' | 'success'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('participants').insert([
        {
          ...data,
          campaign: 'Escale uma Amiga',
          status: 'Novo',
        },
      ]);

      if (error) throw error;
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao salvar. Verifique se o Supabase está configurado corretamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('https://marrieforbabies.com.br/discount/ESCALACAO-4-3-3');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const url = "https://api.whatsapp.com/send/?text=Amiga%21%20%E2%9A%BD%0A%0AAcabei%20de%20participar%20da%20campanha%20%22Escale%20uma%20Amiga%22%20da%20Marrie%20for%20Babies%20e%20consegui%20um%20cupom%20de%2020%25%20OFF%20pra%20voc%C3%AA%21%20%F0%9F%8E%89%0A%0A%F0%9F%91%89%20Usa%20meu%20link%20e%20aproveita%20o%20desconto%3A%0Ahttps%3A%2F%2Fmarrieforbabies.com.br%2Fdiscount%2FESCALADA-4-3-3-CM26X2FUTT1%0A%0ACorre%2C%20vale%20muito%20a%20pena%21%20%F0%9F%92%9B%F0%9F%8D%BC&type=custom_url&app_absent=0";
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-800 font-sans selection:bg-emerald-200">
      <div className="max-w-xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        
        {/* Header / Logo space */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo} 
            alt="Marrie for Babies" 
            className="h-32 w-auto object-contain animate-fade-in"
          />
        </div>

        <main className="flex-1 flex flex-col justify-center">
          {step === 'initial' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
                <span className="text-3xl">⚽</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
                Escale uma Amiga
              </h1>
              <p className="text-lg text-neutral-600 mb-10 max-w-md mx-auto leading-relaxed">
                Convide uma amiga para participar da campanha e garanta seu cupom exclusivo.
              </p>
              <button
                onClick={() => setStep('form')}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-medium text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Quero Participar
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'form' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 p-6 md:p-10 border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-6 text-neutral-900">Preencha seus dados</h2>
              
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Seus Dados</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nome completo</label>
                    <input
                      {...register('participant_name')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      placeholder="Maria Silva"
                    />
                    {errors.participant_name && <p className="text-red-500 text-xs mt-1">{errors.participant_name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
                      <input
                        {...register('participant_email')}
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                        placeholder="maria@exemplo.com"
                      />
                      {errors.participant_email && <p className="text-red-500 text-xs mt-1">{errors.participant_email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp</label>
                      <input
                        {...register('participant_phone')}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                        placeholder="(11) 99999-9999"
                      />
                      {errors.participant_phone && <p className="text-red-500 text-xs mt-1">{errors.participant_phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Cidade</label>
                      <input
                        {...register('participant_city')}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                        placeholder="São Paulo"
                      />
                      {errors.participant_city && <p className="text-red-500 text-xs mt-1">{errors.participant_city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
                      <input
                        {...register('participant_state')}
                        maxLength={2}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none uppercase"
                        placeholder="SP"
                      />
                      {errors.participant_state && <p className="text-red-500 text-xs mt-1">{errors.participant_state.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 space-y-4">
                  <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Dados da Amiga</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nome da amiga</label>
                    <input
                      {...register('friend_name')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      placeholder="Ana Santos"
                    />
                    {errors.friend_name && <p className="text-red-500 text-xs mt-1">{errors.friend_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp da amiga</label>
                    <input
                      {...register('friend_phone')}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      placeholder="(11) 99999-9999"
                    />
                    {errors.friend_phone && <p className="text-red-500 text-xs mt-1">{errors.friend_phone.message}</p>}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center bg-white rounded-3xl shadow-xl shadow-neutral-200/50 p-8 md:p-12 border border-neutral-100 animate-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Parabéns!</h2>
              <p className="text-lg text-neutral-600 mb-10">
                Seu cupom já está liberado.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleCopyCoupon}
                  className="w-full flex items-center justify-center px-6 py-4 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 rounded-xl font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2 text-emerald-600" />
                      Link copiado.
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copiar Cupom
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-medium transition-colors shadow-lg shadow-[#25D366]/20"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Compartilhar com amiga no Wpp
                </button>
              </div>
            </div>
          )}
        </main>
        
        <footer className="text-center text-neutral-400 text-sm mt-12">
          &copy; {new Date().getFullYear()} Marrie for Babies. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
