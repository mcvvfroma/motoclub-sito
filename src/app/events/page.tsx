
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/hooks/use-admin';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Sun, CloudRain, Edit, Trash2, PlusCircle, Camera, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type Event = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    weatherLocation: string;
    mapUrl: string;
    description: string;
    photos: string[];
    type: 'Touring' | 'Endurance' | 'Track';
};

type WeatherData = {
    temperature: number;
    weathercode: number;
};

const EMPTY_FORM = {
    title: "", date: "", time: "", location: "", weatherLocation: "", mapUrl: "", description: "", photos: [], type: "Touring" as const
};

export default function EventsPage() {
    const { isAdmin } = useAdmin();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [weather, setWeather] = useState<Record<string, WeatherData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<Omit<Event, 'id'> | Event>(EMPTY_FORM);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "events"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
            setEvents(eventsData);
        } catch (error) {
            toast({ variant: "destructive", title: "Errore di caricamento", description: "Impossibile recuperare gli eventi." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const fetchWeather = useCallback(async (event: Event) => {
        if (!event.weatherLocation) return;
        try {
            const [lat, lon] = event.weatherLocation.split(',');
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            if (!response.ok) throw new Error('Risposta non valida dall\'API meteo');
            const data = await response.json();
            setWeather(prev => ({ ...prev, [event.id]: data.current_weather }));
        } catch (error) {
            console.error("Errore API Meteo:", error);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        events.forEach(event => {
            if (!weather[event.id]) fetchWeather(event);
        });
    }, [events, weather, fetchWeather]);

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setFormData(event);
        setIsAdding(true);
    };

    const handleCreate = () => {
        setEditingEvent(null);
        setFormData(EMPTY_FORM);
        setIsAdding(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Sei sicuro di voler eliminare l'evento "${title}"?`)) {
            try {
                await deleteDoc(doc(db, "events", id));
                toast({ title: "Evento Eliminato", description: "L'uscita è stata rimossa dal calendario." });
                fetchEvents();
            } catch (error) {
                toast({ variant: "destructive", title: "Errore", description: "Impossibile eliminare l'evento." });
            }
        }
    };

    const handleFormSubmit = async () => {
        try {
            if (editingEvent) {
                const eventRef = doc(db, "events", editingEvent.id);
                await updateDoc(eventRef, { ...formData });
                toast({ title: "Modifica Salvata", description: "L'uscita è stata aggiornata." });
            } else {
                await addDoc(collection(db, "events"), { ...formData, createdAt: new Date().toISOString() });
                toast({ title: "Uscita Creata", description: "La nuova uscita è stata salvata." });
            }
            setIsAdding(false);
            setEditingEvent(null);
            fetchEvents();
        } catch (error) {
            toast({ variant: "destructive", title: "Errore di Salvataggio", description: "Impossibile salvare i dati." });
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, type: value as Event['type'] }));
    };

    const handleAddPhoto = () => {
        toast({ title: "Funzione non disponibile", description: "L'aggiunta di foto sarà implementata in futuro." });
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">CALENDARIO USCITE</h1>
                    {isAdmin && (
                        <Button onClick={handleCreate} className="flex items-center space-x-2">
                            <PlusCircle className="h-5 w-5" />
                            <span>NUOVA USCITA</span>
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center bg-gray-900 rounded-lg p-12">
                        <Info className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-4 text-lg font-medium">Nessun evento in programma</h3>
                        <p className="mt-2 text-sm text-gray-400">Al momento non ci sono nuove uscite. Torna a trovarci presto!</p>
                         {isAdmin && <Button onClick={handleCreate} className="mt-6">CREA LA PRIMA USCITA</Button>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map(event => (
                            <Card key={event.id} className="bg-gray-900 border-gray-800 p-4 md:p-6 flex flex-col md:flex-row overflow-hidden">
                                <div className="w-full md:w-1/4 mb-4 md:mb-0">
                                    <img src={event.photos[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80'} alt={event.title} className="rounded-lg object-cover w-full h-48 md:h-full transition-transform duration-300 hover:scale-105" />
                                </div>
                                <div className="w-full md:w-3/4 md:pl-6">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                        <div>
                                          <p className="text-sm text-yellow-400 font-semibold">{format(new Date(event.date), 'EEEE dd MMMM yyyy', { locale: it })}</p>
                                          <h2 className="text-2xl font-bold text-white mt-1">{event.title}</h2>
                                        </div>
                                        {isAdmin && (
                                          <div className="flex items-center space-x-2 mt-2 sm:mt-0 flex-shrink-0">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(event)}><Edit className="h-4 w-4 mr-2"/>Modifica</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id, event.title)}><Trash2 className="h-4 w-4 mr-2"/>Elimina</Button>
                                          </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mt-4 text-gray-300">
                                        <div className="flex items-center"><Clock className="h-4 w-4 mr-2 text-yellow-400" /><span>{event.time}</span></div>
                                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-yellow-400" /><span>{event.location}</span></div>
                                        {weather[event.id] ? (
                                            <div className="flex items-center">
                                                {weather[event.id].weathercode < 3 ? <Sun className="h-4 w-4 mr-2 text-yellow-400"/> : <CloudRain className="h-4 w-4 mr-2 text-blue-400"/>}
                                                <span>{weather[event.id].temperature}°C</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Carico meteo...</div>
                                        )}
                                    </div>

                                    <p className="mt-4 text-gray-400 text-sm leading-relaxed">{event.description}</p>

                                    <div className="mt-4 flex items-center space-x-4">
                                        <Button variant="secondary" onClick={() => window.open(event.mapUrl, '_blank')}>VEDI MAPPA</Button>
                                        {isAdmin && (
                                          <Button variant="outline" onClick={handleAddPhoto}>
                                            <Camera className="h-4 w-4 mr-2"/>AGGIUNGI FOTO
                                          </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Modifica Uscita" : "Crea Nuova Uscita"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Titolo</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleFormChange} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Data</Label>
                            <Input id="date" name="date" type="date" value={formData.date} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Ora</Label>
                            <Input id="time" name="time" type="time" value={formData.time} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">Località</Label> 
                            <Input id="location" name="location" value={formData.location} onChange={handleFormChange} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weatherLocation" className="text-right">Lat/Lon Meteo</Label>
                            <Input id="weatherLocation" name="weatherLocation" value={formData.weatherLocation} onChange={handleFormChange} className="col-span-3" placeholder="Es: 41.8902,12.4922"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mapUrl" className="text-right">URL Mappa</Label>
                            <Input id="mapUrl" name="mapUrl" value={formData.mapUrl} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Tipo</Label>
                            <Select onValueChange={handleSelectChange} value={formData.type}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleziona il tipo di uscita" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Touring">Touring</SelectItem>
                                    <SelectItem value="Endurance">Endurance</SelectItem>
                                    <SelectItem value="Track">Track</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Descrizione</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Annulla</Button></DialogClose>
                        <Button onClick={handleFormSubmit}>Salva</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
