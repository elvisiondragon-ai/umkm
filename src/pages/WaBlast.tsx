import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Upload, Clock, List, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SUPABASE_WEBHOOK_URL = "https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/webhook_wa";
const API_KEY = "23b62c4255c43489f55fa84693dc0451d89ea5a5c9ec00021a7b77287cdce0b8";

interface LogEntry {
    number: string;
    status: 'pending' | 'success' | 'failed';
    message: string;
    timestamp: string;
}

export function WaBlast() {
    const [numbers, setNumbers] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [delay, setDelay] = useState<number>(5); // in minutes
    const [senderInfo] = useState({ name: "Renata", number: "62895325633487" });
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLocal, setIsLocal] = useState(false);
    const stopRef = useRef(false);

    useEffect(() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            setIsLocal(true);
        }
    }, []);

    if (!isLocal) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
                <Card className="p-8 max-w-md shadow-xl border-red-100">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-600">Route ini hanya tersedia untuk pengujian di lingkungan Localhost.</p>
                </Card>
            </div>
        );
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

            // Basic CSV parsing: assuming first line might be header or directly numbers
            // We'll clean numbers to be numeric only
            const cleaned = lines.map(line => line.replace(/\D/g, '')).filter(num => num.length >= 10);
            setNumbers(cleaned.join("\n"));
            toast.success(`${cleaned.length} nomor berhasil diimpor.`);
        };
        reader.readAsText(file);
    };

    const sendBlast = async () => {
        const numberList = numbers.split(/\r?\n/).map(n => n.trim()).filter(n => n !== "");
        if (numberList.length === 0) return toast.error("Masukkan minimal 1 nomor.");
        if (!message) return toast.error("Masukkan pesan.");

        setIsSending(true);
        stopRef.current = false;
        setProgress({ current: 0, total: numberList.length });
        setLogs([]);

        for (let i = 0; i < numberList.length; i++) {
            if (stopRef.current) break;

            const targetNumber = numberList[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));

            const newLog: LogEntry = {
                number: targetNumber,
                status: 'pending',
                message: 'Mengirim...',
                timestamp: new Date().toLocaleTimeString()
            };
            setLogs(prev => [newLog, ...prev]);

            try {
                const response = await fetch(SUPABASE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: targetNumber,
                        message: message,
                        key: API_KEY
                    })
                });

                const result = await response.json();

                if (response.ok && result.success === true) {
                    setLogs(prev => prev.map((log, idx) => 
                        idx === 0 ? { ...log, status: 'success', message: 'Terkirim' } : log
                    ));
                } else {
                    throw new Error(result.error || `Error ${response.status}`);
                }
            } catch (error: any) {
                setLogs(prev => prev.map((log, idx) => 
                    idx === 0 ? { ...log, status: 'failed', message: error.message } : log
                ));
            }

            // Delay logic (except for the last one)
            if (i < numberList.length - 1 && !stopRef.current) {
                const waitMs = delay * 60 * 1000;
                await new Promise(resolve => setTimeout(resolve, waitMs));
            }
        }

        setIsSending(false);
        toast.success("Blast selesai.");
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
                        <Send className="text-primary w-8 h-8" /> WA Blast System (Local Only)
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="bg-white border rounded-full px-4 py-2 flex items-center gap-3 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">R</div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Nomor Pengirim</p>
                                <p className="text-sm font-bold text-slate-700">{senderInfo.name} ({senderInfo.number})</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-500 mt-2">Kirim pesan massal dengan jeda otomatis untuk menghindari blokir.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Side */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold flex items-center gap-2"><List className="w-4 h-4" /> Daftar Nomor (Baris baru)</label>
                                <label className="cursor-pointer text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hover:bg-primary/20 flex items-center gap-1">
                                    <Upload className="w-3 h-3" /> Import CSV
                                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                            <Textarea 
                                placeholder="628123xxx&#10;628999xxx" 
                                className="h-40 font-mono text-sm leading-relaxed"
                                value={numbers}
                                onChange={(e) => setNumbers(e.target.value)}
                                disabled={isSending}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Jeda Antar Pesan (Menit)</label>
                                <Input 
                                    type="number" 
                                    value={delay} 
                                    onChange={(e) => setDelay(Number(e.target.value))} 
                                    min={1} 
                                    disabled={isSending}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Pesan WhatsApp</label>
                                <Textarea 
                                    placeholder="Halo kak, ini pesan otomatis..." 
                                    className="h-32"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={isSending}
                                />
                            </div>

                            <Button 
                                className="w-full h-12 text-lg font-bold" 
                                onClick={sendBlast} 
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Mengirim {progress.current}/{progress.total}
                                    </>
                                ) : (
                                    "Mulai Blast Sekarang"
                                )}
                            </Button>

                            {isSending && (
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center gap-2 animate-pulse">
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">☁️ Server Side Active</p>
                                    <p className="text-[13px] font-medium text-blue-600 leading-relaxed">
                                        Proses ini Berjalan di cloud silahkan tinggalkan karena ini terus berjalan meski anda offline
                                    </p>
                                </div>
                            )}

                            {isSending && (
                                <Button variant="destructive" className="w-full" onClick={() => stopRef.current = true}>
                                    Hentikan Proses
                                </Button>
                            )}
                        </Card>
                    </div>

                    {/* Status Side */}
                    <div className="space-y-6">
                        <Card className="p-6 h-[600px] flex flex-col">
                            <h3 className="font-bold border-b pb-4 mb-4 flex items-center justify-between">
                                Log Aktivitas
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest font-black">
                                    {progress.current}/{progress.total}
                                </span>
                            </h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                {logs.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                                        <List className="w-12 h-12 mb-2" />
                                        <p>Belum ada aktivitas</p>
                                    </div>
                                )}
                                {logs.map((log, idx) => (
                                    <div key={idx} className="p-3 rounded-xl border bg-white flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            {log.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            {log.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                                            {log.status === 'pending' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{log.number}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">{log.timestamp}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                            log.status === 'success' ? 'bg-green-100 text-green-700' :
                                            log.status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WaBlast;
