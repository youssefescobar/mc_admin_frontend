"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Trash, Plus } from "lucide-react"

export default function SettingsPage() {
    const [ethnicities, setEthnicities] = useState<string[]>([])
    const [languages, setLanguages] = useState<{code: string, label: string}[]>([])
    const [loading, setLoading] = useState(true)

    // Temporary states for new entries
    const [newEthnicity, setNewEthnicity] = useState("")
    const [newLangCode, setNewLangCode] = useState("")
    const [newLangLabel, setNewLangLabel] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await api.get('/platform-settings')
            if (res.data.success) {
                setEthnicities(res.data.settings.pilgrim_ethnicities || [])
                setLanguages(res.data.settings.pilgrim_languages || [])
            }
        } catch (error) {
            toast.error("Failed to load platform settings")
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async (newEthnicities: string[], newLanguages: any[]) => {
        try {
            const res = await api.put('/platform-settings', {
                pilgrim_ethnicities: newEthnicities,
                pilgrim_languages: newLanguages
            })
            if (res.data.success) {
                toast.success("Settings updated successfully")
                setEthnicities(newEthnicities)
                setLanguages(newLanguages)
            }
        } catch (error) {
            toast.error("Failed to update settings")
        }
    }

    const addEthnicity = () => {
        if (!newEthnicity.trim()) return
        if (ethnicities.includes(newEthnicity.trim())) {
            toast.error("Ethnicity already exists")
            return
        }
        const updated = [...ethnicities, newEthnicity.trim()]
        setNewEthnicity("")
        saveSettings(updated, languages)
    }

    const removeEthnicity = (eth: string) => {
        const updated = ethnicities.filter(e => e !== eth)
        saveSettings(updated, languages)
    }

    const addLanguage = () => {
        if (!newLangCode.trim() || !newLangLabel.trim()) return
        if (languages.find(l => l.code === newLangCode.trim())) {
            toast.error("Language code already exists")
            return
        }
        const updated = [...languages, { code: newLangCode.trim(), label: newLangLabel.trim() }]
        setNewLangCode("")
        setNewLangLabel("")
        saveSettings(ethnicities, updated)
    }

    const removeLanguage = (code: string) => {
        const updated = languages.filter(l => l.code !== code)
        saveSettings(ethnicities, updated)
    }

    if (loading) return <div className="p-10">Loading settings...</div>

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pilgrim Ethnicities</CardTitle>
                    <CardDescription>Manage the allowed list of ethnicities for pilgrims.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g. Arab, South Asian" 
                            value={newEthnicity} 
                            onChange={e => setNewEthnicity(e.target.value)} 
                        />
                        <Button onClick={addEthnicity}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ethnicities.map((eth, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded-md bg-secondary/50">
                                <span className="text-sm">{eth}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeEthnicity(eth)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {ethnicities.length === 0 && <span className="text-sm text-muted-foreground">No ethnicities configured.</span>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>App Languages</CardTitle>
                    <CardDescription>Manage the languages officially supported/listed on the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Code (e.g. en)" 
                            value={newLangCode} 
                            className="w-32"
                            onChange={e => setNewLangCode(e.target.value)} 
                        />
                        <Input 
                            placeholder="Label (e.g. English)" 
                            value={newLangLabel} 
                            onChange={e => setNewLangLabel(e.target.value)} 
                        />
                        <Button onClick={addLanguage}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {languages.map((lang, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded-md bg-secondary/50">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-bold bg-secondary px-2 py-1 rounded">{lang.code}</span>
                                    <span>{lang.label}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeLanguage(lang.code)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {languages.length === 0 && <span className="text-sm text-muted-foreground">No languages configured.</span>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}